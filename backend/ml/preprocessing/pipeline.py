"""
Step 10: Unified Preprocessing Pipeline Orchestrator
=====================================================
Composes all 9 steps into a single, reproducible, configurable pipeline.
"""
import pandas as pd
import numpy as np
import os
import pickle
import json
import logging
from typing import Dict, List, Optional, Tuple

from .inspect_clean import DataInspector, DataCleaner
from .engineer_encode import FeatureEngineer, CategoricalEncoder
from .text_processor import TextPreprocessor
from .transform import ImbalanceHandler, FeatureScaler, FeatureSelector, DataSplitter

log = logging.getLogger("smile.preprocessing")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")


class SmilePreprocessingPipeline:
    """
    Production-grade, modular preprocessing pipeline for SMILE-AI.

    Usage:
        pipe = SmilePreprocessingPipeline(
            target_col="status",
            dataset_type="text",       # or "structured"
            scaler_method="standard",
        )
        train, val, test = pipe.run("path/to/data.csv")
        pipe.save_artifacts("path/to/output/")

    Pipeline Flow:
    ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────┐
    │ Inspect  │→│  Clean  │→│ Engineer │→│ Encode │→│ Text │
    └──────────┘ └─────────┘ └──────────┘ └────────┘ └──────┘
         ↓
    ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐
    │  Scale   │→│ Select  │→│  Split   │→│Balance │
    └──────────┘ └─────────┘ └──────────┘ └────────┘
    """

    def __init__(
        self,
        target_col: str = "status",
        dataset_type: str = "auto",       # auto | structured | text
        text_col: Optional[str] = None,   # override auto-detection
        scaler_method: str = "standard",  # standard | minmax | robust
        balance_method: str = "weights",  # weights | smote | undersample | oversample | none
        max_tfidf_features: int = 10000,
        top_k_features: Optional[int] = None,  # None = keep all
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        drop_cols: Optional[List[str]] = None,
        seed: int = 42,
    ):
        self.target_col = target_col
        self.dataset_type = dataset_type
        self.text_col = text_col
        self.scaler_method = scaler_method
        self.balance_method = balance_method
        self.max_tfidf_features = max_tfidf_features
        self.top_k_features = top_k_features
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.drop_cols = drop_cols or []
        self.seed = seed

        # Components (initialized during run)
        self.encoder = CategoricalEncoder()
        self.text_processor = TextPreprocessor(max_features=max_tfidf_features)
        self.scaler = FeatureScaler(method=scaler_method)
        self.inspection_report: Dict = {}
        self.class_weights: Dict = {}
        self.selected_features: List[str] = []

    def run(self, data_path: str) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Execute the full preprocessing pipeline."""
        log.info(f"{'='*60}")
        log.info(f"SMILE-AI Preprocessing Pipeline")
        log.info(f"{'='*60}")

        # ── 1. LOAD & INSPECT ─────────────────────────────────
        log.info("\n[1/10] Loading & inspecting data...")
        df = pd.read_csv(data_path)
        self.inspection_report = DataInspector.inspect(df, self.target_col)
        col_types = DataInspector.detect_column_types(df)

        # Auto-detect dataset type
        if self.dataset_type == "auto":
            if col_types["text_cols"]:
                self.dataset_type = "text"
                if not self.text_col:
                    self.text_col = col_types["text_cols"][0]
            else:
                self.dataset_type = "structured"
            log.info(f"Auto-detected type: {self.dataset_type}")

        # ── 2. CLEAN ──────────────────────────────────────────
        log.info("\n[2/10] Cleaning data...")
        df = DataCleaner.drop_irrelevant(df, self.drop_cols + col_types["id_cols"])
        df = DataCleaner.remove_duplicates(df)
        df = DataCleaner.normalize_labels(df, self.target_col)
        df = DataCleaner.handle_missing(df)

        # ── 3. FEATURE ENGINEERING ────────────────────────────
        log.info("\n[3/10] Engineering features...")
        if self.dataset_type == "structured":
            df = FeatureEngineer.create_all(df)

        # ── 4. ENCODE ─────────────────────────────────────────
        log.info("\n[4/10] Encoding categoricals...")
        # Encode target first
        from sklearn.preprocessing import LabelEncoder
        target_le = LabelEncoder()
        df[self.target_col] = target_le.fit_transform(df[self.target_col])
        self.target_classes = list(target_le.classes_)
        log.info(f"Target classes: {self.target_classes}")

        if self.dataset_type == "structured":
            df = self.encoder.fit_transform(df, target_col=self.target_col)

        # ── 5. TEXT PREPROCESSING ─────────────────────────────
        if self.dataset_type == "text" and self.text_col:
            log.info(f"\n[5/10] Text preprocessing on '{self.text_col}'...")
            df = self.text_processor.fit_transform(df, self.text_col)
        else:
            log.info("\n[5/10] Skipped (structured dataset)")

        # ── 6. SPLIT (before scaling/balancing to prevent leakage)
        log.info("\n[9/10] Splitting data (before scale/balance to prevent leakage)...")
        train_df, val_df, test_df = DataSplitter.split(
            df, self.target_col,
            self.train_ratio, self.val_ratio, self.test_ratio, self.seed
        )

        # ── 7. SCALE (fit on train only) ──────────────────────
        log.info(f"\n[7/10] Scaling features ({self.scaler_method})...")
        train_df = self.scaler.fit_transform(train_df, exclude=[self.target_col])
        val_df = self.scaler.transform(val_df)
        test_df = self.scaler.transform(test_df)

        # ── 8. FEATURE SELECTION ──────────────────────────────
        log.info("\n[8/10] Selecting features...")
        train_df = FeatureSelector.variance_filter(train_df)
        # Skip correlation filter for text datasets — TF-IDF features are
        # inherently sparse/uncorrelated and corr matrix is O(n^2) on 5K+ cols
        if self.dataset_type != "text":
            train_df = FeatureSelector.correlation_filter(train_df)

        if self.top_k_features:
            X_train = train_df.drop(columns=[self.target_col])
            y_train = train_df[self.target_col]
            self.selected_features = FeatureSelector.mutual_info_select(
                X_train, y_train, top_k=self.top_k_features
            )
            keep = self.selected_features + [self.target_col]
            train_df = train_df[[c for c in keep if c in train_df.columns]]
            val_df = val_df[[c for c in keep if c in val_df.columns]]
            test_df = test_df[[c for c in keep if c in test_df.columns]]

        # Align val/test columns to train
        train_cols = train_df.columns.tolist()
        for split_name, split_df in [("val", val_df), ("test", test_df)]:
            missing = set(train_cols) - set(split_df.columns)
            for col in missing:
                split_df[col] = 0
        val_df = val_df[train_cols]
        test_df = test_df[train_cols]

        # ── 9. CLASS IMBALANCE (train only) ───────────────────
        log.info(f"\n[6/10] Handling class imbalance ({self.balance_method})...")
        self.class_weights = ImbalanceHandler.compute_class_weights(train_df[self.target_col])

        if self.balance_method == "undersample":
            train_df = ImbalanceHandler.undersample(train_df, self.target_col, self.seed)
        elif self.balance_method == "oversample":
            train_df = ImbalanceHandler.oversample(train_df, self.target_col, self.seed)
        elif self.balance_method == "smote":
            X = train_df.drop(columns=[self.target_col]).values
            y = train_df[self.target_col].values
            X_res, y_res = ImbalanceHandler.smote_oversample(X, y, self.seed)
            feat_cols = [c for c in train_df.columns if c != self.target_col]
            train_df = pd.DataFrame(X_res, columns=feat_cols)
            train_df[self.target_col] = y_res

        # ── 10. FINAL REPORT ──────────────────────────────────
        log.info(f"\n[10/10] Pipeline complete!")
        log.info(f"  Train: {train_df.shape} | Val: {val_df.shape} | Test: {test_df.shape}")
        log.info(f"  Features: {train_df.shape[1] - 1}")
        log.info(f"  Target classes: {self.target_classes}")
        log.info(f"{'='*60}")

        return train_df, val_df, test_df

    def save_artifacts(self, output_dir: str):
        """Save pipeline artifacts for reproducibility."""
        os.makedirs(output_dir, exist_ok=True)

        # Save scaler
        with open(os.path.join(output_dir, "scaler.pkl"), "wb") as f:
            pickle.dump(self.scaler.scaler, f)

        # Save text vectorizer if used
        if self.text_processor.vectorizer:
            with open(os.path.join(output_dir, "tfidf_vectorizer.pkl"), "wb") as f:
                pickle.dump(self.text_processor.vectorizer, f)

        # Save encoder
        with open(os.path.join(output_dir, "encoder.pkl"), "wb") as f:
            pickle.dump(self.encoder, f)

        # Save metadata
        meta = {
            "target_col": self.target_col,
            "target_classes": self.target_classes,
            "dataset_type": self.dataset_type,
            "scaler_method": self.scaler_method,
            "balance_method": self.balance_method,
            "class_weights": {str(k): v for k, v in self.class_weights.items()},
            "selected_features": self.selected_features,
            "inspection_report": {
                "shape": self.inspection_report.get("shape"),
                "duplicates": self.inspection_report.get("duplicates"),
                "imbalance_ratio": self.inspection_report.get("imbalance_ratio"),
            },
        }
        with open(os.path.join(output_dir, "pipeline_metadata.json"), "w") as f:
            json.dump(meta, f, indent=2, default=str)

        log.info(f"Artifacts saved to {output_dir}")


# ═══════════════════════════════════════════════════════════════════
#  CLI ENTRY POINT
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python -m preprocessing.pipeline <csv_path> [target_col]")
        sys.exit(1)

    csv_path = sys.argv[1]
    target = sys.argv[2] if len(sys.argv) > 2 else "status"

    pipe = SmilePreprocessingPipeline(target_col=target)
    train, val, test = pipe.run(csv_path)

    out_dir = os.path.join(os.path.dirname(csv_path), "preprocessed")
    train.to_csv(os.path.join(out_dir, "train.csv"), index=False)
    val.to_csv(os.path.join(out_dir, "val.csv"), index=False)
    test.to_csv(os.path.join(out_dir, "test.csv"), index=False)
    pipe.save_artifacts(out_dir)
    print(f"\nML-ready datasets saved to {out_dir}")
