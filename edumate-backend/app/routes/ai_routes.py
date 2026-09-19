from flask import Blueprint, jsonify, request
from sqlalchemy import text
from .. import db
from ..services.decision_tree_service import (
    train_model,
    predict_student_risk,
    predict_all_students,
    get_model_status,
    notify_high_risk_state_change,
)

ai_bp = Blueprint('ai', __name__)


# ─────────────────────────────────────────────────────────────────
#  POST /api/ai/train
#  Train the Decision Tree on student_performance data
#  30% train | 70% test as per Group 13 Proposal Report
# ─────────────────────────────────────────────────────────────────
@ai_bp.route('/train', methods=['POST'])
def train():
    payload = request.get_json(silent=True) or {}
    overwrite = bool(payload.get('overwrite', False))
    try:
        results = train_model(overwrite=overwrite)
        if overwrite:
            message = 'Official Colab model was replaced successfully.'
        else:
            message = 'Manual training completed without modifying the official Colab model.'
        return jsonify({
            'message': message,
            'overwrite': overwrite,
            'status': results.get('status'),
            'total_samples': results.get('total_samples'),
            'training_samples': results.get('training_samples'),
            'testing_samples': results.get('testing_samples'),
            'accuracy': results.get('accuracy'),
            'accuracy_percent': results.get('accuracy_percent'),
            'model_path': results.get('model_path'),
            'metadata_path': results.get('metadata_path'),
            'classification_report': results.get('classification_report'),
            'tree_rules': results.get('tree_rules'),
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Training failed: {str(e)}'}), 500


# ─────────────────────────────────────────────────────────────────
#  GET /api/ai/status
#  Return current model status and last training metadata
# ─────────────────────────────────────────────────────────────────
@ai_bp.route('/status', methods=['GET'])
def status():
    try:
        info = get_model_status()
        return jsonify(info), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  GET /api/ai/predict/<student_id>
#  Predict at-risk level for one student
# ─────────────────────────────────────────────────────────────────
@ai_bp.route('/predict/<int:student_id>', methods=['GET'])
def predict_one(student_id):
    try:
        result = predict_student_risk(student_id)
        if result.get('error'):
            return jsonify(result), 404
        return jsonify(result), 200
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


# ─────────────────────────────────────────────────────────────────
#  GET /api/ai/predict-all
#  Predict at-risk levels for all students with performance data
# ─────────────────────────────────────────────────────────────────
@ai_bp.route('/predict-all', methods=['GET'])
def predict_all():
    try:
        tutor_id = request.args.get('tutor_id', type=int)
        results = predict_all_students(tutor_id)
        summary = {'Low': 0, 'Medium': 0, 'High': 0}
        for r in results:
            risk = r.get('predicted_risk')
            if risk in summary:
                summary[risk] += 1
        return jsonify({
            'total_students': len(results),
            'risk_summary':   summary,
            'predictions':    results,
        }), 200
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 503
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@ai_bp.route('/risk-state/<int:student_id>', methods=['POST'])
def update_risk_state(student_id):
    """Explicitly persist a model result and notify only on a state transition."""
    try:
        result = predict_student_risk(student_id)
        if result.get('error'):
            return jsonify(result), 404
        row = db.session.execute(text("""
            SELECT performance_id, risk_level
            FROM student_performance
            WHERE student_id = :student_id
            ORDER BY performance_id DESC
            LIMIT 1
        """), {'student_id': student_id}).mappings().first()
        if not row:
            return jsonify({'error': 'No stored risk state found for this student'}), 404
        previous_risk = row['risk_level']
        current_risk = result['predicted_risk']
        if previous_risk != current_risk:
            db.session.execute(text("""
                UPDATE student_performance
                SET risk_level = :risk_level
                WHERE performance_id = :performance_id
            """), {'risk_level': current_risk, 'performance_id': row['performance_id']})
            db.session.commit()
            notified = notify_high_risk_state_change(student_id, current_risk)
        else:
            notified = False
        return jsonify({**result, 'previous_risk': previous_risk, 'state_changed': previous_risk != current_risk, 'notification_created': notified}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Risk state update failed: {str(e)}'}), 500
