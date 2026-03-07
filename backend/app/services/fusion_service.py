"""
SMILE-AI Fusion API Service
Wraps the SmileRiskFusion engine for the web application.
"""
import json
from ml.fusion import SmileRiskFusion

class FusionService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self.engine = SmileRiskFusion()
        self._initialized = True
        
    def analyze_journal(self, text: str, user_assessment: dict = None) -> dict:
        """
        Run fusion engine on journal text.
        Optionally uses the user's most recent structured assessment for context.
        """
        lifestyle_features = None
        behavioral_features = None
        
        if user_assessment:
            # Map DB Assessment model properties to expected dict features
            lifestyle_features = {
                "Daily_Screen_Time_Hours": float(user_assessment.get("screen_time") or 5.0),
                "Sleep_Duration_Hours": float(user_assessment.get("sleep_duration") or 7.0),
                "Late_Night_Usage": 1 if float(user_assessment.get("sleep_duration") or 7.0) < 6 else 0,
                "Social_Comparison_Trigger": 1 if float(user_assessment.get("social_media_hours") or 2.0) > 4 else 0,
                "PHQ_9_Score": float(user_assessment.get("stress_level", 5) * 2),  # Proxy if real test missing
                "GAD_7_Score": float(user_assessment.get("academic_pressure", 5) * 2)  # Proxy if real test missing
            }
            
            behavioral_features = {
                "Work_Stress_Level": float(user_assessment.get("academic_pressure", 5)),
                "Sleep_Hours_Night": float(user_assessment.get("sleep_duration", 7.0)),
                "Family_History_Mental_Illness": "Yes" if user_assessment.get("family_history") else "No",
                "Trauma_History": "No" # Hard to proxy, defaulting to No
            }
            
        return self.engine.fuse(
            text=text,
            lifestyle=lifestyle_features,
            behavioral=behavioral_features
        )

# Singleton instance
fusion_service = FusionService()
