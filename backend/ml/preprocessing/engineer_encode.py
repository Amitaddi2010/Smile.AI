"""
Step 3: Feature Engineering — Create predictive composite features.
Step 4: Categorical Encoding — Transform categorical variables for ML.
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
import logging

log = logging.getLogger("smile.preprocessing")


# ═══════════════════════════════════════════════════════════════════
#  STEP 3 — FEATURE ENGINEERING
# ═══════════════════════════════════════════════════════════════════

class FeatureEngineer:
    """
    Creates domain-specific composite features from raw columns.

    Each engineered feature is designed based on clinical/behavioral
    research linking lifestyle patterns to mental health outcomes.
    """

    @staticmethod
    def create_all(df: pd.DataFrame) -> pd.DataFrame:
        """Apply all applicable feature engineering transforms."""
        df = FeatureEngineer.sleep_quality_index(df)
        df = FeatureEngineer.gaming_intensity_score(df)
        df = FeatureEngineer.social_media_exposure(df)
        df = FeatureEngineer.lifestyle_health_index(df)
        df = FeatureEngineer.academic_risk_score(df)
        df = FeatureEngineer.interaction_features(df)
        return df

    @staticmethod
    def sleep_quality_index(df: pd.DataFrame) -> pd.DataFrame:
        """
        Sleep Quality Index (0–1 scale).
        WHY: Sleep under 6h or over 10h strongly correlates with depression.
        Combines duration with disruption when available.
        """
        sleep_cols = [c for c in df.columns if "sleep" in c.lower() and "hour" in c.lower()
                      or c.lower() in ("sleep_duration", "sleep_hours", "sleep_hours_night",
                                       "sleep_hours_per_night")]
        if sleep_cols:
            col = sleep_cols[0]
            optimal = 7.5
            # Distance from optimal sleep (0=optimal, 1=worst)
            df["sleep_quality_idx"] = 1.0 - np.clip(np.abs(df[col] - optimal) / 4.5, 0, 1)
            log.info(f"Created sleep_quality_idx from '{col}'")
        return df

    @staticmethod
    def gaming_intensity_score(df: pd.DataFrame) -> pd.DataFrame:
        """
        Gaming Intensity Score (0–1 scale).
        WHY: Daily hours + addiction indicators compound mental health risk.
        High gaming hours alone aren't harmful; intensity+disruption is.
        """
        gaming_col = next((c for c in df.columns if "gaming_hour" in c.lower()
                           or c.lower() == "daily_gaming_hours"), None)
        if gaming_col:
            max_val = max(df[gaming_col].max(), 1)
            df["gaming_intensity"] = np.clip(df[gaming_col] / max_val, 0, 1)

            # Compound with addiction level if present
            addiction = next((c for c in df.columns if "addiction" in c.lower()
                              and "level" in c.lower()), None)
            if addiction:
                add_max = max(df[addiction].max(), 1)
                df["gaming_intensity"] = (df["gaming_intensity"] + df[addiction] / add_max) / 2
            log.info(f"Created gaming_intensity from '{gaming_col}'")
        return df

    @staticmethod
    def social_media_exposure(df: pd.DataFrame) -> pd.DataFrame:
        """
        Social Media Exposure Score (0–1 scale).
        WHY: Screen time + late-night usage + social comparison triggers
        are stronger predictors than screen time alone.
        """
        sm_col = next((c for c in df.columns if "social_media" in c.lower()
                       and "hour" in c.lower()), None)
        screen_col = next((c for c in df.columns if "screen_time" in c.lower()
                           or c.lower() == "daily_screen_time_hours"), None)
        if sm_col or screen_col:
            base_col = sm_col or screen_col
            max_val = max(df[base_col].max(), 1)
            df["sm_exposure"] = np.clip(df[base_col] / max_val, 0, 1)

            # Boost if late-night usage is flagged
            late_col = next((c for c in df.columns if "late_night" in c.lower()), None)
            if late_col:
                df["sm_exposure"] = np.clip(df["sm_exposure"] + df[late_col] * 0.2, 0, 1)
            log.info(f"Created sm_exposure from '{base_col}'")
        return df

    @staticmethod
    def lifestyle_health_index(df: pd.DataFrame) -> pd.DataFrame:
        """
        Composite Lifestyle Health Index (0–1 scale).
        WHY: Combines sleep + exercise + stress into a single health proxy.
        Multicollinearity between these is reduced into one robust signal.
        """
        components = []
        # Sleep component
        if "sleep_quality_idx" in df.columns:
            components.append(df["sleep_quality_idx"])

        # Exercise component
        exercise_col = next((c for c in df.columns if "exercise" in c.lower()
                             or c.lower() == "physical_activity"), None)
        if exercise_col:
            ex_max = max(df[exercise_col].max(), 1)
            components.append(np.clip(df[exercise_col] / ex_max, 0, 1))

        # Stress inverse (low stress = better health)
        stress_col = next((c for c in df.columns if c.lower() in
                           ("stress_level", "work_stress_level", "stress_level_self_report")), None)
        if stress_col:
            st_max = max(df[stress_col].max(), 1)
            components.append(1.0 - np.clip(df[stress_col] / st_max, 0, 1))

        if len(components) >= 2:
            df["lifestyle_health_idx"] = sum(components) / len(components)
            log.info(f"Created lifestyle_health_idx from {len(components)} components")
        return df

    @staticmethod
    def academic_risk_score(df: pd.DataFrame) -> pd.DataFrame:
        """
        Academic Risk Score (0–1 scale).
        WHY: Low GPA + high study hours = pressure-driven academic risk.
        """
        gpa_col = next((c for c in df.columns if c.lower() in ("cgpa", "grades_gpa", "gpa")), None)
        study_col = next((c for c in df.columns if c.lower() in ("study_hours",)), None)
        if gpa_col and study_col:
            gpa_max = max(df[gpa_col].max(), 1)
            study_max = max(df[study_col].max(), 1)
            gpa_risk = 1.0 - np.clip(df[gpa_col] / gpa_max, 0, 1)
            study_pressure = np.clip(df[study_col] / study_max, 0, 1)
            df["academic_risk"] = (gpa_risk + study_pressure) / 2
            log.info(f"Created academic_risk from '{gpa_col}' + '{study_col}'")
        return df

    @staticmethod
    def interaction_features(df: pd.DataFrame) -> pd.DataFrame:
        """Create pairwise interactions between key numeric features."""
        stress_col = next((c for c in df.columns if c.lower() == "stress_level"), None)
        sleep_col = next((c for c in df.columns if c.lower() in
                          ("sleep_duration", "sleep_hours")), None)
        if stress_col and sleep_col:
            df["stress_x_sleep_deficit"] = df[stress_col] * (8.0 - df[sleep_col]).clip(lower=0)
            log.info("Created stress_x_sleep_deficit interaction")
        return df


# ═══════════════════════════════════════════════════════════════════
#  STEP 4 — CATEGORICAL ENCODING
# ═══════════════════════════════════════════════════════════════════

class CategoricalEncoder:
    """
    Encodes categorical variables for ML.

    Encoding Strategy:
    ─────────────────────────────────────────────────────────────
    Method          │ When to use                   │ Example
    ─────────────────────────────────────────────────────────────
    Label Encoding  │ Ordinal or binary categories  │ Gender, Yes/No
    One-Hot         │ Nominal, ≤10 unique values    │ Department, Platform
    Target Encoding │ High-cardinality nominal      │ Country (100+ values)
    ─────────────────────────────────────────────────────────────

    Why these choices:
    - Label encoding preserves memory for binary/ordinal features.
    - One-hot avoids false ordinal relationships in nominal data.
    - Target encoding prevents dimensionality explosion for high-cardinality.
    """

    def __init__(self):
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.onehot_encoder: Optional[OneHotEncoder] = None
        self.target_means: Dict[str, Dict] = {}

    def fit_transform(self, df: pd.DataFrame, target_col: Optional[str] = None,
                      binary_cols: Optional[List[str]] = None,
                      onehot_cols: Optional[List[str]] = None,
                      target_encode_cols: Optional[List[str]] = None) -> pd.DataFrame:
        """Apply encoding strategy to all categorical columns."""

        # Auto-detect if not specified
        if binary_cols is None:
            binary_cols = [c for c in df.select_dtypes("object").columns
                          if df[c].nunique() <= 2 and c != target_col]
        if onehot_cols is None:
            onehot_cols = [c for c in df.select_dtypes("object").columns
                          if 2 < df[c].nunique() <= 10 and c != target_col]
        if target_encode_cols is None:
            target_encode_cols = [c for c in df.select_dtypes("object").columns
                                 if df[c].nunique() > 10 and c != target_col]

        # Label encoding for binary
        for col in binary_cols:
            if col not in df.columns:
                continue
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            self.label_encoders[col] = le
            log.info(f"Label-encoded '{col}' ({len(le.classes_)} classes)")

        # One-hot encoding for low-cardinality nominal
        for col in onehot_cols:
            if col not in df.columns:
                continue
            dummies = pd.get_dummies(df[col], prefix=col, drop_first=True, dtype=int)
            df = pd.concat([df.drop(col, axis=1), dummies], axis=1)
            log.info(f"One-hot encoded '{col}' → {dummies.shape[1]} columns")

        # Target encoding for high-cardinality
        if target_col and target_col in df.columns:
            for col in target_encode_cols:
                if col not in df.columns:
                    continue
                means = df.groupby(col)[target_col].mean()
                self.target_means[col] = means.to_dict()
                global_mean = df[target_col].mean()
                df[col] = df[col].map(means).fillna(global_mean)
                log.info(f"Target-encoded '{col}' ({len(means)} unique)")

        return df
