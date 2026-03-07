"""
SMILE-AI Model 2 — Lifestyle Risk Predictor (v2: HIGH ACCURACY)
================================================================
Uses social_media_mental_health.csv with real PHQ-9/GAD-7 clinical scores.
Predicts depression severity from social media + lifestyle features.

Key improvements:
  - Real clinical labels (PHQ-9 severity scores)
  - Meaningful feature correlations with target
  - XGBoost ensemble for structured clinical data
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
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, VotingClassifier
import warnings
warnings.filterwarnings("ignore")

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "Dataset")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def train():
    os.makedirs(MODEL_DIR, exist_ok=True)
    t0 = time.time()

    print("=" * 60)
    print("MODEL 2 v2 — Lifestyle Risk (Social Media + Clinical)")
    print("=" * 60)

    # ── 1. Load ────────────────────────────────────────────
    print("\n[1/6] Loading social_media_mental_health.csv...")
    df = pd.read_csv(os.path.join(DATASET_DIR, "social_media_mental_health.csv"))
    df = df.drop("User_ID", axis=1, errors="ignore")
    print(f"  Loaded: {len(df):,} rows × {df.shape[1]} cols")

    # Target: PHQ_9_Severity → binary (at risk vs not)
    severity_map = {
        "None-Minimal": 0,  # not at risk
        "Mild": 0,          # not at risk
        "Moderate": 1,      # at risk
        "Moderately Severe": 1,  # at risk
        "Severe": 1,        # at risk
    }
    df["at_risk"] = df["PHQ_9_Severity"].map(severity_map)
    print(f"  Target dist: {dict(df['at_risk'].value_counts())}")

    # ── 2. Feature Engineering ─────────────────────────────
    print("\n[2/6] Engineering features...")

    # Use GAD-7 score as a feature (anxiety predicts depression)
    # Screen time risk
    df["screen_risk"] = np.clip(df["Daily_Screen_Time_Hours"] / 12, 0, 1)
    # Sleep deficit
    df["sleep_deficit"] = np.clip((8 - df["Sleep_Duration_Hours"]) / 4, 0, 1)
    # Late night + social comparison compound
    df["digital_stress"] = (df["Late_Night_Usage"] + df["Social_Comparison_Trigger"]) / 2
    # GAD-7 normalized (strong predictor of PHQ-9)
    df["gad_normalized"] = df["GAD_7_Score"] / 21.0
    # Interaction: screen time × late night
    df["screen_x_latenight"] = df["Daily_Screen_Time_Hours"] * df["Late_Night_Usage"]

    print(f"  Created 5 engineered features")

    # ── 3. Encode Categoricals ─────────────────────────────
    print("\n[3/6] Encoding categoricals...")
    label_encoders = {}
    cat_cols = ["Gender", "User_Archetype", "Primary_Platform",
                "Dominant_Content_Type", "Activity_Type"]
    for col in cat_cols:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
            print(f"  {col}: {len(le.classes_)} classes")

    # ── 4. Split ───────────────────────────────────────────
    drop_cols = ["PHQ_9_Severity", "PHQ_9_Score", "GAD_7_Severity", "at_risk"]
    feature_cols = [c for c in df.columns if c not in drop_cols]
    X = df[feature_cols]
    y = df["at_risk"]

    print(f"\n[4/6] Splitting (80/10/10)...")
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    print(f"  Train: {len(X_train):,} | Val: {len(X_val):,} | Test: {len(X_test):,}")

    # ── 5. Train Ensemble ──────────────────────────────────
    print("\n[5/6] Training ensemble (GBM + RF + LightGBM)...")
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
        n_estimators=300, max_depth=8, class_weight="balanced",
        random_state=42, n_jobs=-1,
    )

    estimators = [("gbm", gbm), ("rf", rf)]
    if lgbm:
        estimators.append(("lgbm", lgbm))

    model = VotingClassifier(estimators=estimators, voting="soft")
    model.fit(X_train, y_train)
    print(f"  Ensemble trained with {len(estimators)} models")

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
    print(f"\n{classification_report(y_test, test_pred, target_names=['Low Risk','At Risk'])}")

    # Save
    print("Saving artifacts...")
    with open(os.path.join(MODEL_DIR, "lifestyle_model.pkl"), "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join(MODEL_DIR, "lifestyle_encoders.pkl"), "wb") as f:
        pickle.dump(label_encoders, f)

    metadata = {
        "model_name": "Model 2 v2 — Lifestyle Risk (Clinical PHQ-9)",
        "model_type": "VotingEnsemble(GBM+RF+LightGBM)",
        "dataset": "social_media_mental_health.csv",
        "feature_columns": feature_cols,
        "n_train": int(len(X_train)),
        "n_test": int(len(X_test)),
        "val_accuracy": float(val_acc),
        "val_f1": float(val_f1),
        "val_auc": float(val_auc),
        "test_accuracy": float(test_acc),
        "test_f1": float(test_f1),
        "test_auc": float(test_auc),
        "training_time_sec": round(time.time() - t0, 1),
    }
    with open(os.path.join(MODEL_DIR, "lifestyle_model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"Model 2 v2 complete in {elapsed:.1f}s")
    print(f"  Test Accuracy: {test_acc:.4f}  F1: {test_f1:.4f}  AUC: {test_auc:.4f}")
    print(f"{'='*60}")
    return model, metadata


if __name__ == "__main__":
    train()
