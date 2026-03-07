"""
SMILE-AI Model Training Script
Trains an XGBoost classifier on the student_lifestyle_100k dataset
to predict depression risk based on lifestyle factors.
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from xgboost import XGBClassifier
import warnings
warnings.filterwarnings('ignore')

DATASET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'Dataset')
MODEL_DIR = os.path.dirname(__file__)

def load_and_prepare_data():
    """Load student_lifestyle_100k and prepare features."""
    df = pd.read_csv(os.path.join(DATASET_DIR, 'student_lifestyle_100k.csv'))
    
    # Convert target to binary
    df['Depression'] = df['Depression'].map({'True': 1, 'False': 0, True: 1, False: 0})
    
    # Encode categorical features
    label_encoders = {}
    categorical_cols = ['Gender', 'Department']
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Drop ID
    df = df.drop('Student_ID', axis=1)
    
    feature_cols = ['Age', 'Gender', 'Department', 'CGPA', 'Sleep_Duration',
                    'Study_Hours', 'Social_Media_Hours', 'Physical_Activity', 'Stress_Level']
    
    X = df[feature_cols]
    y = df['Depression']
    
    return X, y, feature_cols, label_encoders


def train_model():
    """Train XGBoost model and save artifacts."""
    print("=" * 60)
    print("SMILE-AI Model Training")
    print("=" * 60)
    
    print("\n[1/5] Loading dataset...")
    X, y, feature_cols, label_encoders = load_and_prepare_data()
    print(f"  Dataset shape: {X.shape}")
    print(f"  Target distribution: {dict(y.value_counts())}")
    
    print("\n[2/5] Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("\n[3/5] Training XGBoost model...")
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=len(y_train[y_train == 0]) / max(len(y_train[y_train == 1]), 1),
        random_state=42,
        eval_metric='logloss',
        use_label_encoder=False
    )
    model.fit(X_train_scaled, y_train)
    
    print("\n[4/5] Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    print(f"  Accuracy: {accuracy:.4f}")
    print(f"  AUC-ROC:  {auc:.4f}")
    print(f"\n{classification_report(y_test, y_pred)}")
    
    # Feature importance
    importances = dict(zip(feature_cols, model.feature_importances_.tolist()))
    sorted_imp = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
    print("  Feature Importances:")
    for feat, imp in sorted_imp.items():
        bar = '█' * int(imp * 50)
        print(f"    {feat:25s} {imp:.4f} {bar}")
    
    print("\n[5/5] Saving model artifacts...")
    
    # Save model
    with open(os.path.join(MODEL_DIR, 'model.pkl'), 'wb') as f:
        pickle.dump(model, f)
    
    # Save scaler
    with open(os.path.join(MODEL_DIR, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save label encoders
    with open(os.path.join(MODEL_DIR, 'label_encoders.pkl'), 'wb') as f:
        pickle.dump(label_encoders, f)
    
    # Save metadata
    metadata = {
        'feature_columns': feature_cols,
        'categorical_columns': list(label_encoders.keys()),
        'model_type': 'XGBClassifier',
        'accuracy': float(accuracy),
        'auc_roc': float(auc),
        'feature_importances': {k: float(v) for k, v in sorted_imp.items()},
        'classification_report': report,
        'target_classes': ['No Depression', 'Depression'],
        'dataset': 'student_lifestyle_100k.csv',
        'n_train_samples': int(X_train.shape[0]),
        'n_test_samples': int(X_test.shape[0]),
    }
    
    with open(os.path.join(MODEL_DIR, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"  Saved: model.pkl, scaler.pkl, label_encoders.pkl, model_metadata.json")
    print(f"\n{'=' * 60}")
    print("Training complete!")
    print(f"{'=' * 60}")
    
    return model, scaler, label_encoders, metadata


if __name__ == '__main__':
    train_model()
