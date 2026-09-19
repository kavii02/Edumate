"""Official Decision Tree risk-service for the EduMate Flask backend.

This module loads the Google Colab-trained model artifact and uses the exact
three features required by that model:
    - quiz_score
    - attendance_percentage
    - assignment_score
The model predicts string labels directly (High/Low/Medium), so the legacy
numeric label mapping is intentionally not used here.
"""

import logging
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from sqlalchemy import text

from .. import db

HERE = Path(__file__).resolve().parent
MODEL_DIR = HERE.parent / "ml_models"
MODEL_PATH = MODEL_DIR / "decision_tree_risk.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.pkl"

logger = logging.getLogger(__name__)

FEATURE_COLS = ["quiz_score", "attendance_percentage", "assignment_score"]


def _load_metadata():
    if not METADATA_PATH.exists():
        return {}
    try:
        return joblib.load(METADATA_PATH)
    except Exception as exc:
        logger.warning("Could not load metadata: %s", exc)
        return {}


def _load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Official Colab model not found. Expected file: "
            f"{MODEL_PATH}."
        )
    try:
        model = joblib.load(MODEL_PATH)
    except Exception as exc:
        raise RuntimeError(f"Failed to load official model from {MODEL_PATH}: {exc}") from exc
    return model


def _validate_feature_values(row, student_id):
    missing = [column for column in FEATURE_COLS if row.get(column) is None]
    if missing:
        raise ValueError(
            f"Missing required student performance values for student_id={student_id}: {missing}"
        )

    numeric_values = {}
    for column in FEATURE_COLS:
        try:
            value = float(row[column])
        except (TypeError, ValueError):
            raise ValueError(
                f"Invalid numeric value for {column} on student_id={student_id}: {row.get(column)}"
            ) from None
        if pd.isna(value):
            raise ValueError(
                f"NaN numeric value for {column} on student_id={student_id}"
            )
        numeric_values[column] = value
    return numeric_values


def _predict_from_values(model, feature_values, student_id=None):
    expected = list(getattr(model, "feature_names_in_", FEATURE_COLS))
    if expected != FEATURE_COLS:
        raise ValueError(
            f"Model feature mismatch: expected {expected}, application requires {FEATURE_COLS}."
        )

    input_df = pd.DataFrame(
        [
            [
                float(feature_values["quiz_score"]),
                float(feature_values["attendance_percentage"]),
                float(feature_values["assignment_score"]),
            ]
        ],
        columns=FEATURE_COLS,
    )

    prediction = model.predict(input_df)[0]
    prediction = str(prediction)
    confidence = None
    probabilities = {}

    if hasattr(model, "predict_proba"):
        classes = [str(label) for label in model.classes_]
        prob_values = model.predict_proba(input_df)[0]
        probabilities = {
            label: round(float(prob), 4)
            for label, prob in zip(classes, prob_values)
        }
        confidence = round(float(max(prob_values)), 4)

    return {
        "student_id": student_id,
        "predicted_risk": prediction,
        "confidence": confidence,
        "probabilities": probabilities,
        "input_features": {
            "quiz_score": float(feature_values["quiz_score"]),
            "attendance_percentage": float(feature_values["attendance_percentage"]),
            "assignment_score": float(feature_values["assignment_score"]),
        },
    }


def notify_high_risk_state_change(student_id, predicted_risk):
    if predicted_risk != "High":
        return False
    from .notification_service import create_notification

    created = False
    rows = db.session.execute(text("""
        SELECT DISTINCT c.course_id, c.course_title, c.tutor_id,
               s.first_name, s.last_name
        FROM courses c
        JOIN students s ON s.student_id = :student_id
        LEFT JOIN enrollments e ON e.course_id = c.course_id AND e.student_id = :student_id
        LEFT JOIN attendance a ON a.course_id = c.course_id AND a.student_id = :student_id
        WHERE c.tutor_id IS NOT NULL AND (e.student_id IS NOT NULL OR a.student_id IS NOT NULL)
    """), {"student_id": student_id}).mappings().all()
    for row in rows:
        dedupe_key = f"high-risk:{student_id}:{row['course_id']}"
        existing = db.session.execute(text("""
            SELECT notification_id FROM notifications WHERE dedupe_key = :dedupe_key LIMIT 1
        """), {"dedupe_key": dedupe_key}).first()
        if existing:
            continue
        create_notification(
            tutor_id=row["tutor_id"],
            recipient_role="tutor",
            sender_id=student_id,
            sender_role="system",
            title="High-Risk Student Detected",
            message=(
                f"{row['first_name']} {row['last_name']} has been classified as High Risk "
                f"in {row['course_title']}. Review the student's performance."
            ),
            notification_type="Risk",
            related_entity_id=student_id,
            related_entity_type="student",
            dedupe_key=dedupe_key,
        )
        created = True
    if rows:
        db.session.commit()
    return created


def load_training_data():
    query = text("""
        SELECT
            sp.student_id,
            sp.quiz_score,
            sp.attendance_percentage,
            sp.assignment_score,
            sp.risk_level
        FROM student_performance sp
        WHERE
            sp.quiz_score IS NOT NULL
            AND sp.attendance_percentage IS NOT NULL
            AND sp.assignment_score IS NOT NULL
            AND sp.risk_level IS NOT NULL
        ORDER BY sp.student_id
    """)
    rows = db.session.execute(query).mappings().all()
    if not rows:
        raise ValueError(
            "No records found in student_performance table. "
            "Please import the dataset first."
        )
    return pd.DataFrame([dict(row) for row in rows])


def prepare_features(df):
    X = df[FEATURE_COLS].astype(float)
    y = df["risk_level"].astype(str)
    return X, y


def train_model(overwrite=False):
    """Manual retraining entrypoint.

    By default this does not overwrite the official Colab artifact. To replace the
    official model, call the route with JSON {'overwrite': true}.
    """
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
    from sklearn.model_selection import train_test_split
    from sklearn.tree import DecisionTreeClassifier, export_text

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model_target = MODEL_PATH if overwrite else MODEL_DIR / "decision_tree_risk_manual.pkl"
    metadata_target = MODEL_DIR / "model_metadata_manual.pkl" if not overwrite else METADATA_PATH

    df = load_training_data()
    total = len(df)
    X, y = prepare_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.70, train_size=0.30, random_state=42, stratify=y
    )

    clf = DecisionTreeClassifier(
        criterion="gini",
        max_depth=5,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    target_names = ["High", "Low", "Medium"]
    report_dict = classification_report(
        y_test, y_pred, target_names=target_names, output_dict=True, zero_division=0
    )
    confusion = confusion_matrix(y_test, y_pred, labels=["High", "Low", "Medium"])
    rules = export_text(clf, feature_names=FEATURE_COLS, max_depth=5)
    joblib.dump(clf, model_target)

    metadata = {
        "trained_at": datetime.utcnow().isoformat(),
        "total_samples": total,
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
        "train_percentage": 30,
        "test_percentage": 70,
        "algorithm": "Decision Tree Classifier",
        "criterion": "gini",
        "max_depth": 5,
        "random_state": 42,
        "class_weight": "balanced",
        "features": FEATURE_COLS,
        "target": "risk_level",
        "classes": ["High", "Low", "Medium"],
        "accuracy": float(accuracy),
        "classification_report": report_dict,
        "confusion_matrix": confusion.tolist(),
        "tree_rules": rules,
    }
    joblib.dump(metadata, metadata_target)

    logger.info("[DT] Manual training complete. Model saved to %s", model_target)
    return {
        "status": "success",
        "model_path": str(model_target),
        "metadata_path": str(metadata_target),
        "total_samples": total,
        "training_samples": len(X_train),
        "testing_samples": len(X_test),
        "accuracy": float(accuracy),
        "accuracy_percent": f"{accuracy * 100:.2f}%",
        "classification_report": report_dict,
        "tree_rules": rules,
        "overwrite": overwrite,
    }


def predict_student_risk(student_id):
    model = _load_model()
    query = text("""
        SELECT student_id, quiz_score, attendance_percentage, assignment_score
        FROM student_performance
        WHERE student_id = :student_id
        ORDER BY performance_id DESC
        LIMIT 1
    """)
    row = db.session.execute(query, {"student_id": student_id}).mappings().first()
    if row is None:
        return {
            "student_id": student_id,
            "error": "No performance data found for this student.",
            "predicted_risk": None,
        }

    feature_values = _validate_feature_values(dict(row), student_id)
    result = _predict_from_values(model, feature_values, student_id)
    return result


def predict_all_students(tutor_id=None):
    model = _load_model()
    tutor_filter = ""
    params = {}
    if tutor_id is not None:
        tutor_filter = """
            AND EXISTS (
                SELECT 1
                FROM attendance a
                INNER JOIN courses c ON c.course_id = a.course_id
                WHERE a.student_id = sp.student_id AND c.tutor_id = :tutor_id
            )
        """
        params["tutor_id"] = tutor_id

    query = text("""
        SELECT
            sp.student_id,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            sp.quiz_score,
            sp.attendance_percentage,
            sp.assignment_score,
            sp.risk_level AS actual_risk
        FROM student_performance sp
        JOIN students s ON sp.student_id = s.student_id
        WHERE
            sp.quiz_score IS NOT NULL
            AND sp.attendance_percentage IS NOT NULL
            AND sp.assignment_score IS NOT NULL
            {tutor_filter}
        ORDER BY sp.student_id
    """.format(tutor_filter=tutor_filter))

    rows = db.session.execute(query, params).mappings().all()
    results = []
    for row in rows:
        try:
            feature_values = _validate_feature_values(dict(row), row["student_id"])
            result = _predict_from_values(model, feature_values, row["student_id"])
            results.append({
                "student_id": row["student_id"],
                "student_name": row["student_name"],
                "predicted_risk": result["predicted_risk"],
                "actual_risk": row["actual_risk"],
                "confidence": result["confidence"],
                "probabilities": result["probabilities"],
                "quiz_score": float(feature_values["quiz_score"]),
                "attendance_pct": float(feature_values["attendance_percentage"]),
                "assignment_score": float(feature_values["assignment_score"]),
            })
        except ValueError as exc:
            logger.warning("Skipping prediction for student %s: %s", row.get("student_id"), exc)
    return results


def get_model_status():
    model_file_exists = MODEL_PATH.exists()
    metadata_available = METADATA_PATH.exists()
    if not model_file_exists:
        return {
            "status": "missing",
            "trained": False,
            "model_file_exists": False,
            "model_loadable": False,
            "prediction_works": False,
            "message": "Official model file not found.",
            "model_path": str(MODEL_PATH),
        }

    model = None
    try:
        model = _load_model()
    except Exception as exc:
        return {
            "status": "load_error",
            "trained": False,
            "model_file_exists": True,
            "model_loadable": False,
            "prediction_works": False,
            "message": str(exc),
            "model_path": str(MODEL_PATH),
        }

    metadata = _load_metadata() if metadata_available else {}
    model_feature_names = list(getattr(model, "feature_names_in_", FEATURE_COLS))
    model_classes = [str(label) for label in getattr(model, "classes_", [])]

    prediction_works = False
    try:
        probe = db.session.execute(text("""
            SELECT quiz_score, attendance_percentage, assignment_score
            FROM student_performance
            WHERE quiz_score IS NOT NULL
              AND attendance_percentage IS NOT NULL
              AND assignment_score IS NOT NULL
            ORDER BY student_id
            LIMIT 1
        """)).mappings().first()
        if probe:
            probe_values = _validate_feature_values(dict(probe), probe.get("student_id"))
            _predict_from_values(model, probe_values, probe.get("student_id"))
            prediction_works = True
    except Exception as exc:
        logger.warning("Model verification probe failed: %s", exc)

    return {
        "status": "loaded",
        "trained": prediction_works,
        "model_file_exists": True,
        "metadata_available": metadata_available,
        "model_loadable": True,
        "prediction_works": prediction_works,
        "model_path": str(MODEL_PATH),
        "model_type": type(model).__name__,
        "algorithm": metadata.get("algorithm") or type(model).__name__,
        "feature_names": model_feature_names,
        "features": metadata.get("features") or model_feature_names,
        "classes": model_classes or metadata.get("classes") or [],
        "total_samples": metadata.get("total_samples"),
        "training_samples": metadata.get("training_samples"),
        "testing_samples": metadata.get("testing_samples"),
        "train_percentage": metadata.get("train_percentage"),
        "test_percentage": metadata.get("test_percentage"),
        "accuracy": metadata.get("accuracy"),
        "accuracy_percent": (
            f"{metadata.get('accuracy', 0) * 100:.2f}%"
            if metadata.get("accuracy") is not None else None
        ),
        "current_sklearn_version": sklearn.__version__,
        "model_sklearn_version": metadata.get("sklearn_version") or metadata.get("scikit_learn_version"),
        "target": metadata.get("target") or "risk_level",
        "model_parameters": model.get_params() if hasattr(model, "get_params") else None,
    }


# Keep names used elsewhere in the project stable.
MODEL_FILE_PATH = MODEL_PATH
METADATA_FILE_PATH = METADATA_PATH

