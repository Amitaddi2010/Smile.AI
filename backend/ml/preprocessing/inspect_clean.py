"""
Step 1: Data Inspector — Profile datasets, detect issues, report statistics.
Step 2: Data Cleaner  — Remove duplicates, fix types, handle missing values.
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import logging

log = logging.getLogger("smile.preprocessing")


# ═══════════════════════════════════════════════════════════════════
#  STEP 1 — DATA INSPECTION
# ═══════════════════════════════════════════════════════════════════

class DataInspector:
    """
    Profiles a DataFrame: shape, dtypes, missing values, duplicates,
    categorical vs numeric detection, and class imbalance check.
    """

    @staticmethod
    def inspect(df: pd.DataFrame, target_col: Optional[str] = None) -> Dict:
        """Full inspection report for a DataFrame."""
        report = {
            "shape": df.shape,
            "columns": list(df.columns),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "numeric_cols": list(df.select_dtypes(include=["int64", "float64"]).columns),
            "categorical_cols": list(df.select_dtypes(include=["object", "bool", "category"]).columns),
            "missing": df.isnull().sum().to_dict(),
            "missing_pct": (df.isnull().mean() * 100).round(2).to_dict(),
            "duplicates": int(df.duplicated().sum()),
            "duplicate_pct": round(df.duplicated().mean() * 100, 2),
            "memory_mb": round(df.memory_usage(deep=True).sum() / 1024**2, 2),
        }

        # Class imbalance check
        if target_col and target_col in df.columns:
            vc = df[target_col].value_counts()
            report["target_distribution"] = vc.to_dict()
            majority = vc.iloc[0]
            minority = vc.iloc[-1]
            report["imbalance_ratio"] = round(majority / max(minority, 1), 2)
            report["is_imbalanced"] = report["imbalance_ratio"] > 3.0

        # Numeric stats summary
        num_df = df.select_dtypes(include=["int64", "float64"])
        if len(num_df.columns) > 0:
            report["numeric_summary"] = num_df.describe().round(2).to_dict()

        log.info(f"Inspected: {df.shape[0]:,} rows × {df.shape[1]} cols | "
                 f"{report['duplicates']} dupes | "
                 f"{sum(v > 0 for v in report['missing'].values())} cols with nulls")
        return report

    @staticmethod
    def detect_column_types(df: pd.DataFrame) -> Dict[str, List[str]]:
        """Classify columns into semantic types."""
        types = {
            "id_cols": [],
            "numeric_continuous": [],
            "numeric_discrete": [],
            "categorical_low": [],   # ≤10 unique
            "categorical_high": [],  # >10 unique
            "text_cols": [],
            "boolean_cols": [],
            "datetime_cols": [],
        }
        for col in df.columns:
            nunique = df[col].nunique()
            dtype = df[col].dtype

            if col.lower().endswith("_id") or col.lower() in ("id", "record_id", "unique_id", "index"):
                types["id_cols"].append(col)
            elif dtype == "bool" or (nunique == 2 and dtype == "object"):
                types["boolean_cols"].append(col)
            elif dtype in ("float64",):
                if df[col].dropna().str.len().mean() > 50 if dtype == "object" else False:
                    types["text_cols"].append(col)
                else:
                    types["numeric_continuous"].append(col)
            elif dtype in ("int64",):
                if nunique <= 15:
                    types["numeric_discrete"].append(col)
                else:
                    types["numeric_continuous"].append(col)
            elif dtype == "object":
                avg_len = df[col].dropna().astype(str).str.len().mean()
                if avg_len > 50:
                    types["text_cols"].append(col)
                elif nunique <= 10:
                    types["categorical_low"].append(col)
                else:
                    types["categorical_high"].append(col)

        return types


# ═══════════════════════════════════════════════════════════════════
#  STEP 2 — DATA CLEANING
# ═══════════════════════════════════════════════════════════════════

class DataCleaner:
    """
    Cleans DataFrames: deduplication, missing values, type fixes,
    irrelevant column removal, and label normalization.

    Why each step matters:
    - Duplicates inflate metrics and cause data leakage between splits.
    - Missing values break most ML algorithms; strategy depends on mechanism.
    - Inconsistent labels (e.g. "Anxiety" vs "anxiety") fracture classes.
    - ID/timestamp columns add noise; they must be dropped before modeling.
    """

    @staticmethod
    def remove_duplicates(df: pd.DataFrame, subset: Optional[List[str]] = None) -> pd.DataFrame:
        """Remove exact duplicates. Use subset for content-based dedup."""
        before = len(df)
        df = df.drop_duplicates(subset=subset).reset_index(drop=True)
        log.info(f"Dedup: {before:,} → {len(df):,} (removed {before - len(df):,})")
        return df

    @staticmethod
    def drop_irrelevant(df: pd.DataFrame, cols: Optional[List[str]] = None) -> pd.DataFrame:
        """Drop ID, unnamed, and user-specified columns."""
        auto_drop = [c for c in df.columns if c.startswith("Unnamed") or
                     c.lower() in ("record_id", "unique_id", "user_id", "patient_id")]
        to_drop = list(set((cols or []) + auto_drop)) 
        existing = [c for c in to_drop if c in df.columns]
        if existing:
            df = df.drop(columns=existing)
            log.info(f"Dropped columns: {existing}")
        return df

    @staticmethod
    def fix_types(df: pd.DataFrame, type_map: Optional[Dict[str, str]] = None) -> pd.DataFrame:
        """Cast columns to correct types."""
        if type_map:
            for col, dtype in type_map.items():
                if col in df.columns:
                    df[col] = df[col].astype(dtype)
        return df

    @staticmethod
    def normalize_labels(df: pd.DataFrame, target_col: str) -> pd.DataFrame:
        """Lowercase and strip target labels for consistency."""
        if target_col in df.columns:
            df[target_col] = df[target_col].astype(str).str.strip().str.lower()
            log.info(f"Normalized '{target_col}': {df[target_col].nunique()} classes → {list(df[target_col].unique())}")
        return df

    @staticmethod
    def handle_missing(
        df: pd.DataFrame,
        numeric_strategy: str = "median",   # mean | median | zero | drop
        categorical_strategy: str = "mode",  # mode | unknown | drop
        drop_threshold: float = 0.5          # drop cols with >50% missing
    ) -> pd.DataFrame:
        """
        Handle missing values with configurable strategies.

        - median: robust to outliers (preferred for health data)
        - mean: when data is normally distributed
        - mode: most common value for categorical
        - drop_threshold: columns with extreme missingness are removed entirely
        """
        # Drop columns that are mostly missing
        miss_pct = df.isnull().mean()
        high_miss = miss_pct[miss_pct > drop_threshold].index.tolist()
        if high_miss:
            df = df.drop(columns=high_miss)
            log.info(f"Dropped {len(high_miss)} cols with >{drop_threshold*100}% missing: {high_miss}")

        # Numeric columns
        num_cols = df.select_dtypes(include=["int64", "float64"]).columns
        for col in num_cols:
            if df[col].isnull().any():
                if numeric_strategy == "median":
                    df[col] = df[col].fillna(df[col].median())
                elif numeric_strategy == "mean":
                    df[col] = df[col].fillna(df[col].mean())
                elif numeric_strategy == "zero":
                    df[col] = df[col].fillna(0)

        # Categorical columns
        cat_cols = df.select_dtypes(include=["object", "category"]).columns
        for col in cat_cols:
            if df[col].isnull().any():
                if categorical_strategy == "mode":
                    df[col] = df[col].fillna(df[col].mode().iloc[0] if len(df[col].mode()) > 0 else "unknown")
                elif categorical_strategy == "unknown":
                    df[col] = df[col].fillna("unknown")

        remaining = df.isnull().sum().sum()
        if remaining > 0:
            df = df.dropna()
            log.info(f"Dropped {remaining} remaining null rows")

        return df
