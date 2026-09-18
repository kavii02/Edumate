from flask import Blueprint, jsonify, request
from .. import db
from ..services.decision_tree_service import (
    train_model,
    predict_student_risk,
    predict_all_students,
    get_model_status,
)

ai_bp = Blueprint('ai', __name__)


# ─────────────────────────────────────────────────────────────────
#  POST /api/ai/train
#  Train the Decision Tree on student_performance data
#  30% train | 70% test as per Group 13 Proposal Report
# ─────────────────────────────────────────────────────────────────
@ai_bp.route('/train', methods=['POST'])
def train():
    try:
        results = train_model()
        return jsonify({
            'message':          'Decision Tree model trained successfully.',
            'total_samples':    results['total_samples'],
            'train_size':       results['train_size'],
            'test_size':        results['test_size'],
            'accuracy':         results['accuracy'],
            'accuracy_percent': results['accuracy_percent'],
            'trained_at':       results['trained_at'],
            'label_distribution': results['label_distribution'],
            'feature_importances': results['feature_importances'],
            'confusion_matrix':    results['confusion_matrix'],
            'confusion_matrix_labels': results['confusion_matrix_labels'],
            'classification_report':   results['classification_report'],
            'tree_rules':              results['tree_rules'],
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
