"""
Step 6: Class Imbalance Handling
Step 7: Feature Scaling
Step 8: Feature Selection
Step 9: Data Splitting
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
from sklearn.feature_selection import mutual_info_classif, VarianceThreshold
import logging

log = logging.getLogger("smile.preprocessing")


# ═══════════════════════════════════════════════════════════════════
#  STEP 6 — CLASS IMBALANCE
# ═══════════════════════════════════════════════════════════════════

class ImbalanceHandler:
    """
    Handles class imbalance for classification tasks.

    Strategy Guide:
    ─────────────────────────────────────────────────────────────
    Method          │ When to use                     │ Risk
    ─────────────────────────────────────────────────────────────
    class_weights   │ Always safe; first choice       │ None
    SMOTE           │ Moderate imbalance (3:1–10:1)   │ Overfitting on minority
    undersample     │ Very large dataset (1M+ rows)   │ Loses majority info
    oversample      │ Small dataset (<5K rows)        │ Duplicates → overfitting
    ─────────────────────────────────────────────────────────────

    SMOTE creates synthetic samples by interpolating between minority neighbors.
    Class weights adjust loss function penalty — no data modification needed.
    """

    @staticmethod
    def compute_class_weights(y: pd.Series) -> Dict:
        """Compute inverse-frequency class weights for loss functions."""
        counts = y.value_counts()
        total = len(y)
        weights = {cls: total / (len(counts) * count) for cls, count in counts.items()}
        log.info(f"Class weights: {weights}")
        return weights

    @staticmethod
    def undersample(df: pd.DataFrame, target_col: str, seed: int = 42) -> pd.DataFrame:
        """
        Random undersample majority to match minority count.
        Best for: Large datasets (1M+ rows) where losing data is acceptable.
        """
        min_count = df[target_col].value_counts().min()
        balanced = df.groupby(target_col).apply(
            lambda x: x.sample(n=min_count, random_state=seed)
        ).reset_index(drop=True)
        log.info(f"Undersampled: {len(df):,} → {len(balanced):,}")
        return balanced

    @staticmethod
    def oversample(df: pd.DataFrame, target_col: str, seed: int = 42) -> pd.DataFrame:
        """
        Random oversample minority to match majority count.
        Best for: Small datasets; risk of duplicate overfitting.
        """
        max_count = df[target_col].value_counts().max()
        frames = []
        for cls in df[target_col].unique():
            subset = df[df[target_col] == cls]
            if len(subset) < max_count:
                subset = subset.sample(n=max_count, replace=True, random_state=seed)
            frames.append(subset)
        balanced = pd.concat(frames).reset_index(drop=True)
        log.info(f"Oversampled: {len(df):,} → {len(balanced):,}")
        return balanced

    @staticmethod
    def smote_oversample(X: np.ndarray, y: np.ndarray, seed: int = 42):
        """
        SMOTE: Synthetic Minority Over-sampling.
        Creates new synthetic points between nearest neighbors.
        Best for: Moderate imbalance (3:1 to 10:1) with enough features.
        WARNING: Apply ONLY to training data, never to validation/test.
        """
        try:
            from imblearn.over_sampling import SMOTE
            sm = SMOTE(random_state=seed)
            X_res, y_res = sm.fit_resample(X, y)
            log.info(f"SMOTE: {len(X):,} → {len(X_res):,}")
            return X_res, y_res
        except ImportError:
            log.warning("imblearn not installed, returning original data. "
                        "Install: pip install imbalanced-learn")
            return X, y


# ═══════════════════════════════════════════════════════════════════
#  STEP 7 — FEATURE SCALING
# ═══════════════════════════════════════════════════════════════════

class FeatureScaler:
    """
    Scales numeric features for ML models.

    When scaling IS needed:
    - Distance-based: KNN, SVM, K-Means
    - Gradient-based: Logistic Regression, Neural Networks
    - Regularized: Lasso, Ridge, ElasticNet

    When scaling is NOT needed:
    - Tree-based: XGBoost, Random Forest, LightGBM (split-based, scale-invariant)

    Scaler choices:
    ─────────────────────────────────────────────────────────────
    StandardScaler  │ ~Normal dist, no extreme outliers
    MinMaxScaler    │ Bounded [0,1], neural networks, known min/max
    RobustScaler    │ Data with outliers (uses median/IQR)
    ─────────────────────────────────────────────────────────────
    """

    SCALERS = {
        "standard": StandardScaler,
        "minmax": MinMaxScaler,
        "robust": RobustScaler,
    }

    def __init__(self, method: str = "standard"):
        assert method in self.SCALERS, f"Unknown scaler: {method}"
        self.method = method
        self.scaler = self.SCALERS[method]()
        self.feature_names: List[str] = []

    def fit_transform(self, df: pd.DataFrame, exclude: Optional[List[str]] = None) -> pd.DataFrame:
        """Scale numeric columns, leaving excluded columns untouched."""
        exclude = exclude or []
        num_cols = [c for c in df.select_dtypes(include=["int64", "float64"]).columns
                    if c not in exclude]
        self.feature_names = num_cols

        if num_cols:
            df[num_cols] = self.scaler.fit_transform(df[num_cols])
            log.info(f"Scaled {len(num_cols)} features with {self.method}")
        return df

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform new data using fitted scaler."""
        cols = [c for c in self.feature_names if c in df.columns]
        if cols:
            df[cols] = self.scaler.transform(df[cols])
        return df


# ═══════════════════════════════════════════════════════════════════
#  STEP 8 — FEATURE SELECTION
# ═══════════════════════════════════════════════════════════════════

class FeatureSelector:
    """
    Select the most predictive features, removing noise.

    Methods:
    - Variance Threshold: removes near-constant features (zero information)  
    - Correlation Filter: removes highly correlated pairs (redundancy)
    - Mutual Information: measures nonlinear dependency with target
    - Tree Importance: XGBoost feature_importances_ (post-training)
    """

    @staticmethod
    def variance_filter(df: pd.DataFrame, threshold: float = 0.01) -> pd.DataFrame:
        """Remove features with near-zero variance."""
        num_cols = df.select_dtypes(include=["int64", "float64"]).columns
        if len(num_cols) == 0:
            return df
        selector = VarianceThreshold(threshold=threshold)
        mask = selector.fit(df[num_cols]).get_support()
        dropped = [c for c, keep in zip(num_cols, mask) if not keep]
        if dropped:
            df = df.drop(columns=dropped)
            log.info(f"Variance filter dropped: {dropped}")
        return df

    @staticmethod
    def correlation_filter(df: pd.DataFrame, threshold: float = 0.95) -> pd.DataFrame:
        """Remove one of each pair of highly correlated features."""
        num_df = df.select_dtypes(include=["int64", "float64"])
        if len(num_df.columns) < 2:
            return df
        corr = num_df.corr().abs()
        upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))
        to_drop = [col for col in upper.columns if any(upper[col] > threshold)]
        if to_drop:
            df = df.drop(columns=to_drop)
            log.info(f"Correlation filter dropped: {to_drop}")
        return df

    @staticmethod
    def mutual_info_select(X: pd.DataFrame, y: pd.Series,
                           top_k: int = 50) -> List[str]:
        """Select top-k features by mutual information with target."""
        num_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
        if len(num_cols) == 0:
            return []
        mi = mutual_info_classif(X[num_cols].fillna(0), y, random_state=42)
        scores = pd.Series(mi, index=num_cols).sort_values(ascending=False)
        selected = scores.head(top_k).index.tolist()
        log.info(f"MI selected {len(selected)}/{len(num_cols)} features")
        return selected


# ═══════════════════════════════════════════════════════════════════
#  STEP 9 — DATA SPLITTING
# ═══════════════════════════════════════════════════════════════════

class DataSplitter:
    """
    Stratified train/validation/test splitting.

    Stratification ensures each split preserves the target class distribution,
    which is critical for imbalanced mental health datasets.

    Default ratio: 70% train / 15% validation / 15% test
    """

    @staticmethod
    def split(df: pd.DataFrame, target_col: str,
              train_ratio: float = 0.70,
              val_ratio: float = 0.15,
              test_ratio: float = 0.15,
              seed: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Stratified 3-way split."""
        assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-5

        # First split: train vs (val+test)
        train_df, temp_df = train_test_split(
            df, train_size=train_ratio, random_state=seed,
            stratify=df[target_col]
        )

        # Second split: val vs test
        relative_val = val_ratio / (val_ratio + test_ratio)
        val_df, test_df = train_test_split(
            temp_df, train_size=relative_val, random_state=seed,
            stratify=temp_df[target_col]
        )

        log.info(f"Split: train={len(train_df):,} | val={len(val_df):,} | test={len(test_df):,}")

        # Verify stratification
        for name, subset in [("train", train_df), ("val", val_df), ("test", test_df)]:
            dist = subset[target_col].value_counts(normalize=True)
            log.info(f"  {name} distribution: {dist.to_dict()}")

        return train_df, val_df, test_df
