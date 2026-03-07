import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.services.prediction_service import prediction_service

def validate():
    # User provided multidimensional student profile
    profile = {
        'age': 20, 
        'gender': 'Male', 
        'department': 'Engineering', 
        
        # Academic Rigor
        'cgpa': 3.0, 
        'study_hours': 5.0, 
        'academic_workload': 5,
        'exam_anxiety': 4,
        'peer_pressure': 3,
        
        # Digital Habits
        'gaming_behavior_score': 1,
        'social_media_addiction': 1,
        
        # Lifestyle Matrix
        'sleep_duration': 7.0, 
        'social_media_hours': 3.0, # Digital Exposure
        'physical_activity': 60, 
        'gaming_hours': 1.0,
        'stress_level': 5,
        
        # Other assumed defaults if not provided explicitly in prompt
        'financial_stress': 5, 
        'academic_pressure': 5,
        'family_history': 'No',
        'screen_time': 3.0
    }

    print("--- USER PROVIDED PROFILE ---")
    res = prediction_service.predict(profile)
    print(f"Risk Score: {res['risk_score']}")
    print(f"Risk Level: {res['risk_level']}")
    print(f"Depression Prob: {res['depression_probability']}")
    print(f"Top Factors: {[f['feature'] for f in res['top_factors']]}\\n")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    validate()
