import os, pickle
from pathlib import Path

p = Path('c:/Users/Dell/Desktop/Edumate/edumate-backend/app/ml_models')
print('MODEL_DIR_EXISTS', p.exists())
print('MODEL_DIR_FILES', sorted([x.name for x in p.iterdir()]) if p.exists() else [])

for name in ['decision_tree_risk.pkl', 'model_metadata.pkl']:
    fp = p / name
    print('\nFILE:', name)
    print('exists:', fp.exists(), 'size_bytes:', fp.stat().st_size if fp.exists() else None)
    if fp.exists():
        try:
            with open(fp, 'rb') as f:
                obj = pickle.load(f)
            print('TYPE:', type(obj).__name__)
            if isinstance(obj, dict):
                print('KEYS:', list(obj.keys())[:30])
                for k in ['trained_at','total_samples','train_size','test_size','accuracy','feature_cols','label_map','label_distribution','feature_importances','confusion_matrix','classification_report']:
                    if k in obj:
                        print(f'  {k}:', obj[k])
            else:
                print('N_FEATURES_IN:', getattr(obj, 'n_features_in_', None))
                print('FEATURE_NAMES_IN:', getattr(obj, 'feature_names_in_', None))
                print('CLASSES:', getattr(obj, 'classes_', None))
                print('PARAMS:', obj.get_params())
        except Exception as e:
            print('LOAD_ERROR:', type(e).__name__, str(e))

print('\n--- PREDICTIVE CHECK ---')
try:
    with open(p / 'decision_tree_risk.pkl', 'rb') as f:
        model = pickle.load(f)
    X = [[85.0, 90.0, 80.0], [30.0, 50.0, 40.0], [75.0, 80.0, 90.0]]
    preds = model.predict(X)
    print('sample_predictions:', preds.tolist())
except Exception as e:
    print('PREDICT_CHECK_ERROR:', type(e).__name__, str(e))
