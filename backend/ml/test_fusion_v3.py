import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.fusion import SmileRiskFusion

def test_fusion():
    print("Initializing SMILE-AI Risk Fusion Engine v3...")
    fusion = SmileRiskFusion()
    
    status = fusion.get_status()
    print(f"Loaded Models: {status['models_loaded']}")
    
    # ── Test 1: High Risk Scenario ────────────────
    print("\n--- Test 1: High Risk Student ---")
    text_input = "I've been feeling extremely overwhelmed lately, nothing seems to matter anymore and I just want to disappear forever."
    
    lifestyle_input = {
        "Daily_Screen_Time_Hours": 10.0,
        "Sleep_Duration_Hours": 4.0,
        "Late_Night_Usage": 1,
        "Social_Comparison_Trigger": 1,
        "PHQ_9_Score": 18,
        "GAD_7_Score": 16
    }
    
    behavioral_input = {
        "Work_Stress_Level": 9,
        "Sleep_Hours_Night": 4.0,
        "Family_History_Mental_Illness": "Yes",
        "Trauma_History": "Yes"
    }

    result = fusion.fuse(text=text_input, lifestyle=lifestyle_input, behavioral=behavioral_input)
    print(f"SMILE Risk Index: {result['smile_risk_index']}")
    print(f"Risk Level:       {result['risk_level']}")
    print(f"Crisis Alert:     {result['is_crisis']}")
    print(f"Component Scores: {result['component_scores']}")
    
    
    # ── Test 2: Low Risk Scenario ────────────────
    print("\n--- Test 2: Low Risk Student ---")
    text_input2 = "Had a great day at the park today with friends, feeling refreshed and ready for tomorrow's classes!"
    
    lifestyle_input2 = {
        "Daily_Screen_Time_Hours": 3.0,
        "Sleep_Duration_Hours": 8.0,
        "Late_Night_Usage": 0,
        "Social_Comparison_Trigger": 0,
        "PHQ_9_Score": 2,
        "GAD_7_Score": 1
    }
    
    behavioral_input2 = {
        "Work_Stress_Level": 3,
        "Sleep_Hours_Night": 8.0,
        "Family_History_Mental_Illness": "No",
        "Trauma_History": "No"
    }

    result2 = fusion.fuse(text=text_input2, lifestyle=lifestyle_input2, behavioral=behavioral_input2)
    print(f"SMILE Risk Index: {result2['smile_risk_index']}")
    print(f"Risk Level:       {result2['risk_level']}")
    print(f"Crisis Alert:     {result2['is_crisis']}")
    print(f"Component Scores: {result2['component_scores']}")

if __name__ == "__main__":
    test_fusion()
