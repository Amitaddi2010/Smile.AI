import sys
import os

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.prediction_service import prediction_service
import json

def test_model():
    print("Testing ML Model Evaluated Clinical Risk...\n")
    
    # Low Risk Case
    low_risk = {
        'age': 20, 
        'gender': 'Female', 
        'department': 'Computer Science', 
        'cgpa': 3.8, 
        'sleep_duration': 8.0, 
        'study_hours': 5.0, 
        'social_media_hours': 2.0, 
        'physical_activity': 150, 
        'stress_level': 2, 
        'academic_pressure': 2, 
        'financial_stress': 1, 
        'peer_pressure': 1, 
        'exam_anxiety': 1, 
        'social_media_addiction': 0, 
        'gaming_behavior_score': 0, 
        'academic_workload': 2
    }
    
    # Moderate Risk Case
    moderate_risk = {
        'age': 21, 
        'gender': 'Male', 
        'department': 'Engineering', 
        'cgpa': 2.9, 
        'sleep_duration': 6.0, 
        'study_hours': 8.0, 
        'social_media_hours': 4.0, 
        'physical_activity': 30, 
        'stress_level': 6, 
        'academic_pressure': 7, 
        'financial_stress': 5, 
        'peer_pressure': 4, 
        'exam_anxiety': 6, 
        'social_media_addiction': 3, 
        'gaming_behavior_score': 2, 
        'academic_workload': 7
    }

    # High Risk Case
    high_risk = {
        'age': 22, 
        'gender': 'Other', 
        'department': 'Business', 
        'cgpa': 2.1, 
        'sleep_duration': 4.0, 
        'study_hours': 2.0, 
        'social_media_hours': 8.0, 
        'physical_activity': 0, 
        'stress_level': 9, 
        'academic_pressure': 9, 
        'financial_stress': 8, 
        'peer_pressure': 8, 
        'exam_anxiety': 10, 
        'social_media_addiction': 9, 
        'gaming_behavior_score': 8, 
        'academic_workload': 9
    }

    print("--- LOW RISK PROFILE ---")
    res1 = prediction_service.predict(low_risk)
    print(f"Risk Score: {res1['risk_score']}")
    print(f"Risk Level: {res1['risk_level']}")
    print(f"Depression Prob: {res1['depression_probability']}")
    print(f"Top Factors: {[f['feature'] for f in res1['top_factors']]}\n")

    print("--- MODERATE RISK PROFILE ---")
    res2 = prediction_service.predict(moderate_risk)
    print(f"Risk Score: {res2['risk_score']}")
    print(f"Risk Level: {res2['risk_level']}")
    print(f"Depression Prob: {res2['depression_probability']}")
    print(f"Top Factors: {[f['feature'] for f in res2['top_factors']]}\n")

    print("--- HIGH RISK PROFILE ---")
    res3 = prediction_service.predict(high_risk)
    print(f"Risk Score: {res3['risk_score']}")
    print(f"Risk Level: {res3['risk_level']}")
    print(f"Depression Prob: {res3['depression_probability']}")
    print(f"Top Factors: {[f['feature'] for f in res3['top_factors']]}\n")

if __name__ == '__main__':
    test_model()
