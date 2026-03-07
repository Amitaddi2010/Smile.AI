"""
SMILE-AI Preprocessing Pipeline
================================
A modular, production-grade ML preprocessing pipeline for mental health datasets.

Modules:
    inspector    — Data inspection & profiling
    cleaner      — Data cleaning & deduplication
    engineer     — Feature engineering
    encoder      — Categorical encoding
    text_processor — NLP text preprocessing
    balancer     — Class imbalance handling
    scaler       — Feature scaling
    selector     — Feature selection
    splitter     — Train/val/test splitting
    pipeline     — Unified pipeline orchestrator
"""

from .pipeline import SmilePreprocessingPipeline

__all__ = ["SmilePreprocessingPipeline"]
