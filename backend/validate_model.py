import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.services.prediction_service import prediction_service

def validate():
    # Load model context
    metadata = prediction_service.metadata
    print(f"Model Type: {metadata['model_type']}")
    print(f"Dataset Size: {metadata['n_train_samples'] + metadata['n_test_samples']} rows")
    print(f"Accuracy: {metadata['accuracy'] * 100:.1f}%\n")
    
    print("Top 3 Feature Importances:")
    importances = list(metadata['feature_importances'].items())[:3]
    for feat, imp in importances:
        print(f" - {feat}: {imp*100:.1f}%")
    print()

    profiles = {
        "High Risk True Positive (Model Correctly Identifies Risk)": {
            'age': 18, 'gender': 'Male', 'department': 'Science', 
            'cgpa': 2.14, 'sleep_duration': 4.4, 'study_hours': 4.0, 
            'social_media_hours': 3.1, 'physical_activity': 73, 'stress_level': 8
        },
        "Low Risk True Negative (Model Correctly Identifies Healthy)": {
            'age': 22, 'gender': 'Female', 'department': 'Science', 
            'cgpa': 3.5, 'sleep_duration': 7.3, 'study_hours': 3.3, 
            'social_media_hours': 3.4, 'physical_activity': 114, 'stress_level': 5
        },
        "Failing Grades + High Stress (Theoretical Edge Case)": {
            'age': 20, 'gender': 'Male', 'department': 'Engineering', 
            'cgpa': 1.8, 'sleep_duration': 5.0, 'study_hours': 2.0, 
            'social_media_hours': 6.0, 'physical_activity': 30, 'stress_level': 10
        },
        "Perfect Grades + Low Stress (Theoretical Edge Case)": {
            'age': 21, 'gender': 'Female', 'department': 'Medical', 
            'cgpa': 4.0, 'sleep_duration': 8.5, 'study_hours': 6.0, 
            'social_media_hours': 1.0, 'physical_activity': 150, 'stress_level': 1
        }
    }

    print("--- VALIDATION TESTS ---\n")
    for name, profile in profiles.items():
        print(f"[{name}]")
        res = prediction_service.predict(profile)
        print(f"Risk Score: {res['risk_score']}%")
        print(f"Risk Level: {res['risk_level'].upper()}")
        print(f"Top Extracted Factors: {[f['feature'] for f in res['top_factors']]}\n")

if __name__ == "__main__":
    validate()
