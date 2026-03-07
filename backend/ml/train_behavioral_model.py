"""
SMILE-AI Model 3 — Behavioral Risk Predictor (v2: HIGH ACCURACY)
================================================================
Uses mental_health.csv with 51 detailed behavioral/workplace survey features.
Predicts Has_Mental_Health_Issue from behavioral/lifestyle indicators.

Key improvements:
  - Real survey data with 51 meaningful features
  - Actual mental health issue label (not derived)
  - Ensemble voting for robust prediction
"""
import pandas as pd
import numpy as np
import pickle
import json
import os
import time
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (classification_report, accuracy_score,
                             f1_score, roc_auc_score)
from sklearn.ensemble import (GradientBoostingClassifier,
                              RandomForestClassifier, VotingClassifier)
import warnings
warnings.filterwarnings("ignore")

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "Dataset")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def train():
    os.makedirs(MODEL_DIR, exist_ok=True)
    t0 = time.time()

    print("=" * 60)
    print("MODEL 3 v2 — Behavioral Risk (Survey + Ensemble)")
    print("=" * 60)

    # ── 1. Load ────────────────────────────────────────────
    print("\n[1/6] Loading mental_health.csv...")
    df = pd.read_csv(os.path.join(DATASET_DIR, "mental_health.csv"))
    print(f"  Loaded: {len(df):,} rows × {df.shape[1]} cols")

    # Check target column
    target_col = None
    for candidate in ["Has_Mental_Health_Issue", "mental_health_status",
                      "Depression", "depression"]:
        if candidate in df.columns:
            target_col = candidate
            break

    if target_col is None:
        # Use last column or find binary column
        for c in df.columns:
            if df[c].nunique() == 2:
                target_col = c
                break

    print(f"  Target: '{target_col}'")
    print(f"  Target dist: {dict(df[target_col].value_counts())}")

    # Binary encode target
    target_le = LabelEncoder()
    df["target"] = target_le.fit_transform(df[target_col].astype(str))
    print(f"  Classes: {list(target_le.classes_)}")

    # ── 2. Feature Engineering ─────────────────────────────
    print("\n[2/6] Engineering features...")
    # Numerical interaction features
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    num_cols = [c for c in num_cols if c not in ["target"]]

    # Stress-sleep interaction
    stress_col = next((c for c in num_cols if "stress" in c.lower()), None)
    sleep_col = next((c for c in num_cols if "sleep" in c.lower()), None)
    if stress_col and sleep_col:
        df["stress_x_sleep"] = df[stress_col] * df[sleep_col]
        print(f"  Created stress_x_sleep from {stress_col} × {sleep_col}")

    # Work-life balance
    work_col = next((c for c in num_cols if "work" in c.lower() and "hour" in c.lower()), None)
    if work_col:
        df["overwork_flag"] = (df[work_col] > df[work_col].quantile(0.75)).astype(int)
        print(f"  Created overwork_flag from {work_col}")

    # ── 3. Encode Categoricals ─────────────────────────────
    print("\n[3/6] Encoding categoricals...")
    label_encoders = {}
    cat_cols = df.select_dtypes(include=["object"]).columns.tolist()
    cat_cols = [c for c in cat_cols if c != target_col]
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
    print(f"  Encoded {len(cat_cols)} categorical columns")

    # ── 4. Split ───────────────────────────────────────────
    feature_cols = [c for c in df.columns if c not in ["target", target_col]]
    X = df[feature_cols]
    y = df["target"]

    print(f"\n[4/6] Splitting (80/10/10)... Features: {len(feature_cols)}")
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    print(f"  Train: {len(X_train):,} | Val: {len(X_val):,} | Test: {len(X_test):,}")

    # ── 5. Train Ensemble ──────────────────────────────────
    print("\n[5/6] Training ensemble...")
    try:
        import lightgbm as lgb
        lgbm = lgb.LGBMClassifier(
            n_estimators=300, max_depth=6, learning_rate=0.05,
            is_unbalance=True, random_state=42, verbose=-1, n_jobs=-1,
        )
    except ImportError:
        lgbm = None

    gbm = GradientBoostingClassifier(
        n_estimators=200, max_depth=5, learning_rate=0.1,
        random_state=42,
    )
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=10, class_weight="balanced",
        random_state=42, n_jobs=-1,
    )

    estimators = [("gbm", gbm), ("rf", rf)]
    if lgbm:
        estimators.append(("lgbm", lgbm))

    model = VotingClassifier(estimators=estimators, voting="soft")
    model.fit(X_train, y_train)
    print(f"  Ensemble: {len(estimators)} models")

    # ── 6. Evaluate ────────────────────────────────────────
    print("\n[6/6] Evaluation...")
    val_pred = model.predict(X_val)
    val_proba = model.predict_proba(X_val)[:, 1]
    val_acc = accuracy_score(y_val, val_pred)
    val_f1 = f1_score(y_val, val_pred)
    val_auc = roc_auc_score(y_val, val_proba)

    test_pred = model.predict(X_test)
    test_proba = model.predict_proba(X_test)[:, 1]
    test_acc = accuracy_score(y_test, test_pred)
    test_f1 = f1_score(y_test, test_pred)
    test_auc = roc_auc_score(y_test, test_proba)

    print(f"\n  Validation:  Acc={val_acc:.4f}  F1={val_f1:.4f}  AUC={val_auc:.4f}")
    print(f"  Test:        Acc={test_acc:.4f}  F1={test_f1:.4f}  AUC={test_auc:.4f}")
    print(f"\n{classification_report(y_test, test_pred, target_names=list(target_le.classes_))}")

    # Feature importance from RF
    rf_fitted = model.named_estimators_["rf"]
    importances = dict(zip(feature_cols, rf_fitted.feature_importances_.tolist()))
    sorted_imp = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
    print("  Top Feature Importances:")
    for feat, imp in list(sorted_imp.items())[:10]:
        bar = "█" * int(imp / max(sorted_imp.values()) * 30)
        print(f"    {feat:35s} {imp:.4f} {bar}")

    # Save
    print("\nSaving artifacts...")
    with open(os.path.join(MODEL_DIR, "behavioral_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join(MODEL_DIR, "behavioral_encoders.pkl"), "wb") as f:
        pickle.dump(label_encoders, f)

    metadata = {
        "model_name": "Model 3 v2 — Behavioral Risk (Survey + Ensemble)",
        "model_type": "VotingEnsemble(GBM+RF+LightGBM)",
        "dataset": "mental_health.csv",
        "target_column": target_col,
        "target_classes": list(target_le.classes_),
        "feature_columns": feature_cols,
        "n_features": len(feature_cols),
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "val_accuracy": float(val_acc),
        "val_f1": float(val_f1),
        "val_auc": float(val_auc),
        "test_accuracy": float(test_acc),
        "test_f1": float(test_f1),
        "test_auc": float(test_auc),
        "top_features": {k: float(v) for k, v in list(sorted_imp.items())[:15]},
        "training_time_sec": round(time.time() - t0, 1),
    }
    with open(os.path.join(MODEL_DIR, "behavioral_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"Model 3 v2 complete in {elapsed:.1f}s")
    print(f"  Test Accuracy: {test_acc:.4f}  F1: {test_f1:.4f}  AUC: {test_auc:.4f}")
    print(f"{'='*60}")
    return model, metadata


if __name__ == "__main__":
    train()
