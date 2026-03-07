"""
Step 5: Text Preprocessing — NLP pipeline for text-based mental health datasets.
"""
import pandas as pd
import numpy as np
import re
from typing import Optional
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

log = logging.getLogger("smile.preprocessing")


class TextPreprocessor:
    """
    Full NLP preprocessing pipeline for mental health text data.

    Pipeline Order:
    1. Lowercase → consistent token matching
    2. URL/HTML removal → noise reduction
    3. Punctuation removal → cleaner tokens
    4. Stopword removal → reduce dimensionality
    5. Lemmatization → normalize word forms ("running" → "run")
    6. TF-IDF Vectorization → convert text to numeric features

    Why TF-IDF over raw embeddings:
    - Lightweight (no GPU required)
    - Interpretable (feature names are actual words)
    - Effective for classification with LogisticRegression/XGBoost
    - ~10K feature limit prevents memory explosion on 100K+ rows
    """

    # Common English stopwords (subset — avoids nltk dependency)
    STOPWORDS = set("""
        i me my myself we our ours ourselves you your yours yourself yourselves
        he him his himself she her hers herself it its itself they them their
        theirs themselves what which who whom this that these those am is are
        was were be been being have has had having do does did doing a an the
        and but if or because as until while of at by for with about against
        between through during before after above below to from up down in out
        on off over under again further then once here there when where why how
        all both each few more most other some such no nor not only own same so
        than too very s t can will just don should now d ll m o re ve y ain
        aren couldn didn doesn hadn hasn haven isn ma mightn mustn needn shan
        shouldn wasn weren won wouldn
    """.split())

    def __init__(self, max_features: int = 10000, ngram_range=(1, 2)):
        self.max_features = max_features
        self.ngram_range = ngram_range
        self.vectorizer: Optional[TfidfVectorizer] = None

    def clean_text(self, text: str) -> str:
        """Apply all text cleaning steps."""
        if not isinstance(text, str):
            return ""
        # 1. Lowercase
        text = text.lower()
        # 2. Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        # 3. Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # 4. Remove special chars & punctuation (keep alphanumeric + spaces)
        text = re.sub(r'[^a-z\s]', '', text)
        # 5. Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # 6. Remove stopwords
        tokens = text.split()
        tokens = [t for t in tokens if t not in self.STOPWORDS and len(t) > 2]
        # 7. Basic lemmatization (suffix stripping — avoids nltk/spacy dep)
        tokens = [self._simple_lemma(t) for t in tokens]
        return ' '.join(tokens)

    @staticmethod
    def _simple_lemma(word: str) -> str:
        """Lightweight suffix-based lemmatization (no external deps)."""
        for suffix in ["ingly", "edly", "ness", "ment", "tion", "sion",
                       "ally", "ful", "less", "ing", "ous", "ive", "ity",
                       "ied", "ies", "ers", "est", "ble", "ly", "ed", "er"]:
            if word.endswith(suffix) and len(word) - len(suffix) >= 3:
                return word[:-len(suffix)]
                break
        return word

    def fit_transform(self, df: pd.DataFrame, text_col: str) -> pd.DataFrame:
        """
        Clean text and vectorize to TF-IDF features.
        Returns DataFrame with tfidf_ prefixed columns appended.
        """
        log.info(f"Text preprocessing: '{text_col}' ({len(df):,} rows)")

        # Clean all text
        df["_clean_text"] = df[text_col].apply(self.clean_text)

        # Vectorize
        self.vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            ngram_range=self.ngram_range,
            min_df=5,       # ignore very rare terms
            max_df=0.95,    # ignore terms in >95% of docs
            sublinear_tf=True,  # apply log scaling to TF
        )
        tfidf_matrix = self.vectorizer.fit_transform(df["_clean_text"])
        feature_names = [f"tfidf_{name}" for name in self.vectorizer.get_feature_names_out()]

        log.info(f"TF-IDF: {tfidf_matrix.shape[1]:,} features from {len(df):,} docs")

        # Convert sparse matrix to DataFrame
        tfidf_df = pd.DataFrame(
            tfidf_matrix.toarray(),
            columns=feature_names,
            index=df.index
        )

        # Drop original text column, keep clean version for reference
        result = pd.concat([df.drop(columns=[text_col, "_clean_text"]), tfidf_df], axis=1)
        return result

    def transform(self, df: pd.DataFrame, text_col: str) -> pd.DataFrame:
        """Transform new data using fitted vectorizer (for test sets)."""
        if self.vectorizer is None:
            raise ValueError("Call fit_transform first")
        df["_clean_text"] = df[text_col].apply(self.clean_text)
        tfidf_matrix = self.vectorizer.transform(df["_clean_text"])
        feature_names = [f"tfidf_{name}" for name in self.vectorizer.get_feature_names_out()]
        tfidf_df = pd.DataFrame(tfidf_matrix.toarray(), columns=feature_names, index=df.index)
        return pd.concat([df.drop(columns=[text_col, "_clean_text"]), tfidf_df], axis=1)
