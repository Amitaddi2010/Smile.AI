"""
SMILE-AI ML Prediction Service
Loads the trained model and provides prediction capabilities.
"""
import pickle
import json
import numpy as np
import pandas as pd
import os
from typing import Dict, List, Tuple
from ..config import settings


class PredictionService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self._load_model()
        self._initialized = True
    
    def _load_model(self):
        """Load all model artifacts."""
        with open(settings.MODEL_PATH, 'rb') as f:
            self.model = pickle.load(f)
        with open(settings.SCALER_PATH, 'rb') as f:
            self.scaler = pickle.load(f)
        with open(settings.ENCODERS_PATH, 'rb') as f:
            self.label_encoders = pickle.load(f)
        with open(settings.METADATA_PATH, 'r') as f:
            self.metadata = json.load(f)
        
        self.feature_columns = self.metadata['feature_columns']
        self.feature_importances = self.metadata['feature_importances']
    
    def predict(self, input_data: dict) -> dict:
        """
        Run prediction on input features.
        Returns risk_score, risk_level, depression_probability, and top factors.
        """
        from .fusion_service import fusion_service
        
        # Map advanced assessment inputs to clinical model expectations
        if input_data.get('academic_pressure') is None:
            input_data['academic_pressure'] = (input_data.get('academic_workload', 5) + input_data.get('exam_anxiety', 5)) / 2.0
        if input_data.get('screen_time') is None:
            input_data['screen_time'] = input_data.get('social_media_hours', 3.0) + input_data.get('gaming_hours', 1.0)
            
        # Run standard behavioral & lifestyle models (bypassing the legacy XGBClassifier payload limitations)
        result = fusion_service.analyze_journal(text=None, user_assessment=input_data)
        
        if result and "error" not in result:
            risk_score = result.get("smile_risk_index", 0.0)
            probability = risk_score / 100.0
            risk_level = result.get("risk_level", "low")
            if risk_level == "critical": risk_level = "high" # Remap fusion level to standard DB schema
        else:
            # Fallback legacy formula
            features = self._prepare_features(input_data)
            features_scaled = self.scaler.transform(features)
            probability = float(self.model.predict_proba(features_scaled)[0][1])
            risk_score = round(probability * 100, 1)
            risk_level = self._get_risk_level(risk_score)
        
        # Get top contributing factors
        top_factors = self._get_top_factors(input_data, probability)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(input_data, top_factors)
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "depression_probability": round(probability, 4),
            "top_factors": top_factors,
            "recommendations": recommendations
        }
    
    def _prepare_features(self, input_data: dict) -> np.ndarray:
        """Prepare input features for prediction."""
        row = {}
        for col in self.feature_columns:
            key = col.lower() if col.lower() in input_data else col
            # Try matching
            val = input_data.get(key) or input_data.get(col)
            
            if col in self.label_encoders:
                le = self.label_encoders[col]
                if val in le.classes_:
                    val = le.transform([val])[0]
                else:
                    val = 0  # default
            row[col] = val
        
        df = pd.DataFrame([row], columns=self.feature_columns)
        return df.values
    
    def _get_risk_level(self, risk_score: float) -> str:
        if risk_score < 30:
            return "low"
        elif risk_score < 60:
            return "moderate"
        else:
            return "high"
    
    def _get_top_factors(self, input_data: dict, probability: float) -> list:
        """Identify top factors contributing to the risk."""
        factors = []
        
        thresholds = {
            'sleep_duration': {'low': 5.0, 'desc': 'Sleep duration is below recommended levels', 'feature': 'Sleep Duration'},
            'stress_level': {'high': 7, 'desc': 'High stress levels detected', 'feature': 'Stress Level'},
            'cgpa': {'low': 2.5, 'desc': 'Academic performance may be a concern', 'feature': 'CGPA'},
            'social_media_hours': {'high': 5.0, 'desc': 'Excessive social media usage', 'feature': 'Social Media Hours'},
            'study_hours': {'high': 10.0, 'desc': 'Excessive study hours may indicate pressure', 'feature': 'Study Hours'},
            'physical_activity': {'low': 30, 'desc': 'Low physical activity levels', 'feature': 'Physical Activity'},
        }
        
        for key, config in thresholds.items():
            val = input_data.get(key)
            if val is None:
                continue
            
            importance = self.feature_importances.get(
                key.replace('_', ' ').title().replace(' ', '_'),
                self.feature_importances.get(key, 0.05)
            )
            
            impact = "low"
            triggered = False
            
            if 'high' in config and val >= config['high']:
                impact = "high" if importance > 0.15 else "medium"
                triggered = True
            elif 'low' in config and val <= config['low']:
                impact = "high" if importance > 0.15 else "medium"
                triggered = True
            
            if triggered:
                factors.append({
                    "feature": config['feature'],
                    "value": float(val),
                    "impact": impact,
                    "description": config['desc']
                })
        
        # Sort by impact importance
        impact_order = {"high": 0, "medium": 1, "low": 2}
        factors.sort(key=lambda x: impact_order.get(x['impact'], 3))
        
        return factors[:5]
    
    def _generate_recommendations(self, input_data: dict, factors: list) -> list:
        """Generate personalized recommendations."""
        recs = []
        
        factor_features = [f['feature'] for f in factors]
        
        if 'Sleep Duration' in factor_features:
            recs.append("Aim for 7-9 hours of sleep per night. Establish a consistent sleep schedule.")
        
        if 'Stress Level' in factor_features:
            recs.append("Practice stress-reduction techniques: meditation, deep breathing, or yoga.")
        
        if 'CGPA' in factor_features:
            recs.append("Consider academic tutoring or study groups to improve academic performance.")
        
        if 'Social Media Hours' in factor_features:
            recs.append("Set daily screen time limits. Try digital detox periods during study time.")
        
        if 'Physical Activity' in factor_features:
            recs.append("Increase physical activity to at least 150 minutes per week.")
        
        if 'Study Hours' in factor_features:
            recs.append("Take regular breaks using the Pomodoro technique. Quality over quantity.")
        
        # Always include general recs
        if len(recs) == 0:
            recs.append("Continue maintaining your healthy lifestyle habits.")
        
        recs.append("Reach out to friends, family, or a counselor if you're feeling overwhelmed.")
        recs.append("Contact your university's mental health services for professional support.")
        
        return recs
    
    def get_model_info(self) -> dict:
        return self.metadata


# Singleton instance
prediction_service = PredictionService()
