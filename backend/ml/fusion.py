"""
SMILE-AI Risk Fusion Engine
============================
Combines outputs from 3 specialized models into a single SMILE Risk Index (0-100).

Model 1: Text Mental Health Classifier  → text_risk_score
Model 2: Lifestyle Risk Predictor       → lifestyle_risk_score
Model 3: Behavioral Risk Predictor      → behavior_risk_score

Fusion Formula:
    SMILE Risk = 0.40 × text_risk + 0.35 × lifestyle_risk + 0.25 × behavior_risk
    Scaled to 0–100

Graceful Degradation:
    If only some models have input, weights are re-normalized to sum to 1.0
"""
import pickle
import json
import os
import re
import numpy as np
from typing import Dict, Optional
import logging

log = logging.getLogger("smile.fusion")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


class SmileRiskFusion:
    """
    Loads all 3 models and produces a unified SMILE Risk Index.
    Supports graceful degradation when not all inputs are available.
    """

    WEIGHTS = {
        "text": 0.40,
        "lifestyle": 0.35,
        "behavior": 0.25,
    }

    # ── Stopwords for text cleaning ────────────────────────
    STOPWORDS = set("""
        i me my myself we our ours ourselves you your yours yourself yourselves
        he him his himself she her hers herself it its itself they them their
        theirs themselves what which who whom this that these those am is are
        was were be been being have has had having do does did doing a an the
        and but if or because as until while of at by for with about against
        between through during before after above below to from up down in out
        on off over under again further then once here there when where why how
        all both each few more most other some such no nor not only own same so
        than too very s t can will just don should now d ll m o re ve y
    """.split())

    def __init__(self):
        self.text_model = None
        self.text_vectorizer = None
        self.lifestyle_model = None
        self.lifestyle_encoders = None
        self.behavioral_model = None
        self.models_loaded = {}
        self._load_all()

    def _load_all(self):
        """Load all available model artifacts."""
        # Model 1 — Text
        try:
            with open(os.path.join(MODEL_DIR, "text_model.pkl"), "rb") as f:
                self.text_model = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"), "rb") as f:
                self.text_vectorizer = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "text_model_metadata.json")) as f:
                self.text_meta = json.load(f)
            self.models_loaded["text"] = True
            log.info("Model 1 (Text) loaded")
        except FileNotFoundError:
            self.models_loaded["text"] = False
            log.warning("Model 1 (Text) not found")

        # Model 2 — Lifestyle
        try:
            with open(os.path.join(MODEL_DIR, "lifestyle_model.pkl"), "rb") as f:
                self.lifestyle_model = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "lifestyle_encoders.pkl"), "rb") as f:
                self.lifestyle_encoders = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "lifestyle_model_metadata.json")) as f:
                self.lifestyle_meta = json.load(f)
            self.models_loaded["lifestyle"] = True
            log.info("Model 2 (Lifestyle) loaded")
        except FileNotFoundError:
            self.models_loaded["lifestyle"] = False
            log.warning("Model 2 (Lifestyle) not found")

        # Model 3 — Behavioral
        try:
            with open(os.path.join(MODEL_DIR, "behavioral_model.pkl"), "rb") as f:
                self.behavioral_model = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "behavioral_encoders.pkl"), "rb") as f:
                self.behavioral_encoders = pickle.load(f)
            with open(os.path.join(MODEL_DIR, "behavioral_model_metadata.json")) as f:
                self.behavioral_meta = json.load(f)
            self.models_loaded["behavior"] = True
            log.info("Model 3 (Behavioral) loaded")
        except FileNotFoundError:
            self.models_loaded["behavior"] = False
            log.warning("Model 3 (Behavioral) not found")

    def _clean_text(self, text: str) -> str:
        """Clean text for Model 1."""
        text = text.lower()
        text = re.sub(r"https?://\S+|www\.\S+", "", text)
        text = re.sub(r"<[^>]+>", "", text)
        text = re.sub(r"[^a-z\s]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        tokens = [t for t in text.split() if t not in self.STOPWORDS and len(t) > 2]
        return " ".join(tokens)

    def predict_text(self, text: str) -> Dict:
        """Model 1: Classify text and return risk probabilities."""
        if not self.models_loaded.get("text"):
            return None
        clean = self._clean_text(text)
        vec = self.text_vectorizer.transform([clean])
        proba = self.text_model.predict_proba(vec)[0]
        classes = self.text_model.classes_
        pred_class = classes[np.argmax(proba)]

        # Risk score: weighted by severity
        severity = {
            "suicidal": 1.0, "depression": 0.8, "bipolar": 0.7,
            "personality_disorder": 0.65, "anxiety": 0.5,
            "stress": 0.3, "normal": 0.0,
        }
        risk = sum(proba[i] * severity.get(c, 0.5) for i, c in enumerate(classes))

        return {
            "predicted_condition": pred_class,
            "confidence": float(np.max(proba)),
            "risk_score": float(np.clip(risk, 0, 1)),
            "probabilities": {c: float(p) for c, p in zip(classes, proba)},
            "is_crisis": pred_class == "suicidal" and np.max(proba) > 0.4,
        }

    def predict_lifestyle(self, features: Dict) -> Dict:
        """Model 2: Predict depression risk from lifestyle features."""
        if not self.models_loaded.get("lifestyle"):
            return None
        import pandas as pd

        # Engineer features (matching Model 2 v3)
        row = dict(features)
        
        # New features expected by Model 2 v3
        ds_hours = float(row.get("Daily_Screen_Time_Hours", 5.0))
        sleep_hours = float(row.get("Sleep_Duration_Hours", 7.0))
        late_night = float(row.get("Late_Night_Usage", 0))
        social_comp = float(row.get("Social_Comparison_Trigger", 0))
        phq9 = float(row.get("PHQ_9_Score", 0))
        gad7 = float(row.get("GAD_7_Score", 0))

        row["screen_risk"] = float(np.clip(ds_hours / 12.0, 0, 1))
        row["sleep_deficit"] = float(np.clip((8.0 - sleep_hours) / 4.0, 0, 1))
        row["digital_stress"] = (late_night + social_comp) / 2.0
        row["phq_gad_compound"] = (phq9 * gad7) / 441.0
        row["screen_x_latenight"] = ds_hours * late_night

        # Encode categoricals
        for col, le in self.lifestyle_encoders.items():
            val = str(row.get(col, le.classes_[0]))
            if val in le.classes_:
                row[col] = le.transform([val])[0]
            else:
                row[col] = 0

        df = pd.DataFrame([row])
        # Align columns
        expected = self.lifestyle_meta.get("feature_columns", [])
        for c in expected:
            if c not in df.columns:
                df[c] = 0.0
        df = df[expected].astype(float)

        proba = self.lifestyle_model.predict_proba(df)[0][1]
        return {
            "risk_score": float(proba),
            "risk_level": "high" if proba > 0.6 else "moderate" if proba > 0.3 else "low",
        }

    def predict_behavioral(self, features: Dict) -> Dict:
        """Model 3: Predict behavioral risk from gaming/screen features."""
        if not self.models_loaded.get("behavior"):
            return None
        import pandas as pd

        row = dict(features)
        # Engineer features (matching Model 3 v3)
        stress = float(row.get("Work_Stress_Level", 5.0))
        sleep = float(row.get("Sleep_Hours_Night", 7.0))
        
        row["stress_x_sleep"] = stress * sleep

        # Encode categoricals
        if hasattr(self, "behavioral_encoders") and self.behavioral_encoders:
            for col, le in self.behavioral_encoders.items():
                val = str(row.get(col, le.classes_[0]))
                if val in le.classes_:
                    row[col] = float(le.transform([val])[0])
                else:
                    row[col] = 0.0

        # Safety catch: convert any remaining strings to 0.0
        for k, v in row.items():
            if isinstance(v, str):
                try:
                    row[k] = float(v)
                except ValueError:
                    row[k] = 0.0

        df = pd.DataFrame([row])
        expected = self.behavioral_meta.get("feature_columns", [])
        for c in expected:
            if c not in df.columns:
                df[c] = 0.0
        df = df[expected].astype(float)

        proba = self.behavioral_model.predict_proba(df)[0][1]
        return {
            "risk_score": float(proba),
            "risk_level": "high" if proba > 0.6 else "moderate" if proba > 0.3 else "low",
        }

    def fuse(
        self,
        text: Optional[str] = None,
        lifestyle: Optional[Dict] = None,
        behavioral: Optional[Dict] = None,
    ) -> Dict:
        """
        Combine all available model predictions into the SMILE Risk Index.
        Supports graceful degradation when inputs are partially available.
        """
        scores = {}
        details = {}

        # Run each model if input available
        if text and self.models_loaded.get("text"):
            result = self.predict_text(text)
            if result:
                scores["text"] = result["risk_score"]
                details["text_analysis"] = result

        if lifestyle and self.models_loaded.get("lifestyle"):
            result = self.predict_lifestyle(lifestyle)
            if result:
                scores["lifestyle"] = result["risk_score"]
                details["lifestyle_analysis"] = result

        if behavioral and self.models_loaded.get("behavior"):
            result = self.predict_behavioral(behavioral)
            if result:
                scores["behavior"] = result["risk_score"]
                details["behavioral_analysis"] = result

        if not scores:
            return {"smile_risk_index": 0, "error": "No valid inputs provided"}

        # Weighted fusion with re-normalization
        active_weights = {k: self.WEIGHTS[k] for k in scores}
        total_weight = sum(active_weights.values())
        normalized = {k: v / total_weight for k, v in active_weights.items()}

        raw_score = sum(scores[k] * normalized[k] for k in scores)
        smile_index = round(float(np.clip(raw_score * 100, 0, 100)), 1)

        # Risk level
        if smile_index >= 70:
            level = "critical"
        elif smile_index >= 50:
            level = "high"
        elif smile_index >= 30:
            level = "moderate"
        else:
            level = "low"

        # Crisis detection
        is_crisis = details.get("text_analysis", {}).get("is_crisis", False)

        return {
            "smile_risk_index": smile_index,
            "risk_level": level,
            "is_crisis": is_crisis,
            "component_scores": {k: round(v * 100, 1) for k, v in scores.items()},
            "weights_used": {k: round(v, 3) for k, v in normalized.items()},
            "models_active": list(scores.keys()),
            "details": details,
        }

    def get_status(self) -> Dict:
        """Return which models are loaded and ready."""
        return {
            "models_loaded": self.models_loaded,
            "fusion_weights": self.WEIGHTS,
        }
