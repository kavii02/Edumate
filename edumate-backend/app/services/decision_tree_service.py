"""
EduMate At-Risk Prediction - Decision Tree Service
===================================================
Proposal Reference:
    Module: AI-Powered Personalized Learning & Prediction
    Model:  Decision Tree Classifier (scikit-learn)
    Target: student_performance.risk_level  (Low / Medium / High)
    Split:  30% training | 70% testing  (as per project proposal)

Features used (from student_performance table):
    - quiz_score           : average quiz percentage across all attempts
    - attendance_percentage: percentage of sessions attended
    - assignment_score     : assignment completion/score percentage

Encoding:
    - risk_level -> label encoded: Low=0, Medium=1, High=2
"""

import os
import pickle
import logging
from datetime import datetime

import numpy as np
import pandas as pd
import sklearn
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)

from .. import db
from sqlalchemy import text

# Paths
_HERE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(_HERE, '..', 'ml_models')
MODEL_PATH = os.path.join(MODEL_DIR, 'decision_tree_risk.pkl')
METADATA_PATH = os.path.join(MODEL_DIR, 'model_metadata.pkl')

logger = logging.getLogger(__name__)

FEATURE_COLS = ['quiz_score', 'attendance_percentage', 'assignment_score']
LABEL_COL    = 'risk_level'
LABEL_MAP     = {'Low': 0, 'Medium': 1, 'High': 2}
LABEL_MAP_INV = {v: k for k, v in LABEL_MAP.items()}


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
    result = db.session.execute(query)
    rows = result.mappings().all()
    if not rows:
        raise ValueError(
            "No records found in student_performance table. "
            "Please import the synthetic dataset first."
        )
    df = pd.DataFrame([dict(r) for r in rows])
    logger.info(f"[DT] Loaded {len(df)} records from student_performance.")
    return df


def prepare_features(df):
    X = df[FEATURE_COLS].astype(float)
    y = df[LABEL_COL].map(LABEL_MAP)
    if y.isnull().any():
        unknown = df.loc[y.isnull(), LABEL_COL].unique().tolist()
        raise ValueError(f"Unknown risk_level values found: {unknown}")
    y = y.astype(int)
    return X, y


def train_model():
    """
    Full training pipeline:
      1. Load data from DB
      2. Prepare features
      3. Split 30% train / 70% test (proposal requirement)
      4. Fit Decision Tree
      5. Evaluate on test set
      6. Persist model + metadata to disk
      7. Return comprehensive results dict
    """
    os.makedirs(MODEL_DIR, exist_ok=True)

    df = load_training_data()
    total = len(df)
    X, y = prepare_features(df)
    label_counts = df[LABEL_COL].value_counts().to_dict()

    # 30% TRAIN | 70% TEST as per proposal
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.70,
        train_size=0.30,
        random_state=42,
        stratify=y
    )

    train_size = len(X_train)
    test_size  = len(X_test)

    clf = DecisionTreeClassifier(
        criterion='gini',
        max_depth=5,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    )
    clf.fit(X_train, y_train)
    logger.info("[DT] Model training complete.")

    y_pred       = clf.predict(X_test)
    accuracy     = accuracy_score(y_test, y_pred)
    target_names = ['Low', 'Medium', 'High']

    report_dict = classification_report(
        y_test, y_pred, target_names=target_names,
        output_dict=True, zero_division=0
    )
    report_str = classification_report(
        y_test, y_pred, target_names=target_names, zero_division=0
    )

    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2])

    importances = {
        col: float(round(imp, 4))
        for col, imp in zip(FEATURE_COLS, clf.feature_importances_)
    }

    tree_rules = export_text(clf, feature_names=FEATURE_COLS, max_depth=5)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(clf, f)

    metadata = {
        'trained_at':            datetime.utcnow().isoformat(),
        'total_samples':         total,
        'train_size':            train_size,
        'test_size':             test_size,
        'accuracy':              round(accuracy, 4),
        'feature_cols':          FEATURE_COLS,
        'label_map':             LABEL_MAP,
        'label_distribution':    label_counts,
        'feature_importances':   importances,
        'tree_rules':            tree_rules,
        'confusion_matrix':      cm.tolist(),
        'classification_report': report_dict,
    }
    with open(METADATA_PATH, 'wb') as f:
        pickle.dump(metadata, f)

    logger.info(f"[DT] Model saved. Test Accuracy: {accuracy:.4f}")

    return {
        'status':                    'success',
        'total_samples':             total,
        'train_size':                train_size,
        'test_size':                 test_size,
        'accuracy':                  round(accuracy, 4),
        'accuracy_percent':          f"{accuracy * 100:.2f}%",
        'classification_report':     report_dict,
        'classification_report_text': report_str,
        'confusion_matrix':          cm.tolist(),
        'confusion_matrix_labels':   target_names,
        'feature_importances':       importances,
        'tree_rules':                tree_rules,
        'label_distribution':        label_counts,
        'trained_at':                metadata['trained_at'],
        'model_path':                MODEL_PATH,
    }


def _load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Trained model not found. "
            "Please call /api/ai/train first to train the model."
        )
    with open(MODEL_PATH, 'rb') as f:
        return pickle.load(f)


def predict_student_risk(student_id):
    clf = _load_model()
    query = text("""
        SELECT quiz_score, attendance_percentage, assignment_score
        FROM student_performance
        WHERE student_id = :sid
        ORDER BY performance_id DESC
        LIMIT 1
    """)
    row = db.session.execute(query, {'sid': student_id}).mappings().first()
    if row is None:
        return {
            'student_id': student_id,
            'error': 'No performance data found for this student.',
            'predicted_risk': None,
        }

    features   = np.array([[
        float(row['quiz_score']),
        float(row['attendance_percentage']),
        float(row['assignment_score']),
    ]])
    pred_label = int(clf.predict(features)[0])
    pred_proba = clf.predict_proba(features)[0]
    confidence = float(round(max(pred_proba), 4))
    risk_level = LABEL_MAP_INV[pred_label]

    return {
        'student_id':     student_id,
        'predicted_risk': risk_level,
        'confidence':     confidence,
        'probabilities':  {
            'Low':    float(round(pred_proba[0], 4)),
            'Medium': float(round(pred_proba[1], 4)),
            'High':   float(round(pred_proba[2], 4)),
        },
        'input_features': {
            'quiz_score':            float(row['quiz_score']),
            'attendance_percentage': float(row['attendance_percentage']),
            'assignment_score':      float(row['assignment_score']),
        },
    }


def predict_all_students(tutor_id=None):
    clf = _load_model()
    tutor_filter = ""
    params = {}
    if tutor_id is not None:
        # enrollments table is empty; filter via attendance→courses instead
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
        features   = np.array([[
            float(row['quiz_score']),
            float(row['attendance_percentage']),
            float(row['assignment_score']),
        ]])
        pred_label = int(clf.predict(features)[0])
        pred_proba = clf.predict_proba(features)[0]
        confidence = float(round(max(pred_proba), 4))
        results.append({
            'student_id':       row['student_id'],
            'student_name':     row['student_name'],
            'predicted_risk':   LABEL_MAP_INV[pred_label],
            'actual_risk':      row['actual_risk'],
            'confidence':       confidence,
            'quiz_score':       float(row['quiz_score']),
            'attendance_pct':   float(row['attendance_percentage']),
            'assignment_score': float(row['assignment_score']),
        })
    return results


def get_model_status():
    model_file_exists = os.path.exists(MODEL_PATH)
    metadata_available = os.path.exists(METADATA_PATH)
    if not model_file_exists:
        return {
            'trained': False,
            'model_file_exists': False,
            'model_loadable': False,
            'estimator_fitted': False,
            'prediction_works': False,
            'message': 'Model not yet trained.',
        }

    meta = {}
    if metadata_available:
        with open(METADATA_PATH, 'rb') as f:
            meta = pickle.load(f)

    model_loadable = False
    estimator_fitted = False
    prediction_works = False
    verification_error = None
    model = None
    try:
        model = _load_model()
        model_loadable = True
        estimator_fitted = all(
            hasattr(model, attr)
            for attr in ('tree_', 'n_features_in_', 'classes_', 'feature_importances_')
        )
        if estimator_fitted:
            probe = db.session.execute(text(f"""
                SELECT {', '.join(FEATURE_COLS)}
                FROM student_performance
                WHERE {FEATURE_COLS[0]} IS NOT NULL
                  AND {FEATURE_COLS[1]} IS NOT NULL
                  AND {FEATURE_COLS[2]} IS NOT NULL
                ORDER BY student_id
                LIMIT 1
            """)).mappings().first()
            if probe:
                probe_frame = pd.DataFrame(
                    [[float(probe[col]) for col in FEATURE_COLS]],
                    columns=FEATURE_COLS,
                )
                model.predict(probe_frame)
                prediction_works = True
    except Exception as exc:
        verification_error = str(exc)

    model_version = meta.get('scikit_learn_version') or meta.get('sklearn_version')
    if model_version:
        compatibility_status = 'matching' if model_version == sklearn.__version__ else 'version mismatch'
    else:
        compatibility_status = 'model version not recorded'

    return {
        'trained':               model_loadable and estimator_fitted and prediction_works,
        'model_file_exists':     model_file_exists,
        'metadata_available':    metadata_available,
        'model_loadable':        model_loadable,
        'estimator_fitted':      estimator_fitted,
        'prediction_works':      prediction_works,
        'verification_error':    verification_error,
        'model_type':            type(model).__name__ if model is not None else None,
        'n_features_in':         getattr(model, 'n_features_in_', None),
        'feature_names':         getattr(model, 'feature_names_in_', FEATURE_COLS).tolist(),
        'classes':               getattr(model, 'classes_', []).tolist(),
        'model_parameters':      model.get_params() if model is not None else None,
        'current_sklearn_version': sklearn.__version__,
        'model_sklearn_version': model_version,
        'compatibility_status':  compatibility_status,
        'trained_at':            meta.get('trained_at'),
        'total_samples':         meta.get('total_samples'),
        'train_size':            meta.get('train_size'),
        'test_size':             meta.get('test_size'),
        'accuracy':              meta.get('accuracy'),
        'accuracy_percent':      f"{meta.get('accuracy', 0) * 100:.2f}%" if meta.get('accuracy') is not None else None,
        'feature_importances':   meta.get('feature_importances'),
        'label_map':             meta.get('label_map'),
        'label_distribution':    meta.get('label_distribution'),
        'confusion_matrix':      meta.get('confusion_matrix'),
        'classification_report': meta.get('classification_report'),
        'tree_rules':            meta.get('tree_rules'),
    }
