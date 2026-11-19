"""
Model Training and Evaluation Pipeline.
Trains Baseline TF-IDF, Logistic Regression, Random Forest, and Semantic models
on genuine question-pair datasets with strict train/test split and leak prevention.
Calculates and records actual evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix).
"""
import time
import json
import logging
import os
import shutil
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

from backend.database.db import get_db_connection
from backend.ml.feature_extractor import PairFeatureExtractor, FEATURE_NAMES

logger = logging.getLogger(__name__)

_bundled_models_dir = Path(__file__).resolve().parent / "saved_models"
SAVED_MODELS_DIR = Path(os.environ.get("QUERYSENSE_MODEL_DIR", _bundled_models_dir)).expanduser()
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
if SAVED_MODELS_DIR != _bundled_models_dir:
    for _model_file in _bundled_models_dir.glob("*.joblib"):
        _destination = SAVED_MODELS_DIR / _model_file.name
        if not _destination.exists():
            shutil.copy2(_model_file, _destination)


class TrainingPipeline:
    """Manages model training, evaluation, persistence, and version registry."""

    def __init__(self):
        self.feature_extractor: Optional[PairFeatureExtractor] = None
        self.models: Dict[str, Any] = {}
        self.model_metrics: Dict[str, Dict[str, Any]] = {}
        self.active_model_name: str = "Logistic Regression Classifier"

    def load_dataset_pairs_from_db(self, dataset_ids: Optional[List[int]] = None) -> Tuple[List[Tuple[str, str]], List[int], List[str]]:
        """Loads question pairs from database, tracking dataset names."""
        conn = get_db_connection()
        cursor = conn.cursor()

        if dataset_ids:
            placeholders = ",".join(["?"] * len(dataset_ids))
            query = f"""
            SELECT p.question1, p.question2, p.is_duplicate, d.name as dataset_name
            FROM question_pairs p
            JOIN datasets d ON p.dataset_id = d.id
            WHERE p.dataset_id IN ({placeholders})
            """
            rows = cursor.execute(query, dataset_ids).fetchall()
        else:
            query = """
            SELECT p.question1, p.question2, p.is_duplicate, d.name as dataset_name
            FROM question_pairs p
            JOIN datasets d ON p.dataset_id = d.id
            """
            rows = cursor.execute(query).fetchall()

        conn.close()

        pairs = []
        labels = []
        dataset_names = set()
        for r in rows:
            q1 = r["question1"].strip()
            q2 = r["question2"].strip()
            if q1 and q2:
                pairs.append((q1, q2))
                labels.append(int(r["is_duplicate"]))
                dataset_names.add(r["dataset_name"])

        # Add cross-domain non-duplicate pairs from distinct categories to ensure balanced negative sampling
        if not dataset_ids:
            try:
                conn_cat = get_db_connection()
                q_rows = conn_cat.execute("SELECT question, category FROM questions;").fetchall()
                conn_cat.close()
                by_cat: Dict[str, List[str]] = {}
                for r in q_rows:
                    by_cat.setdefault(r["category"], []).append(r["question"])
                cats = sorted(list(by_cat.keys()))
                for i in range(len(cats)):
                    c1 = cats[i]
                    c2 = cats[(i + 1) % len(cats)]
                    for q1_text in by_cat[c1][:2]:
                        for q2_text in by_cat[c2][:2]:
                            pairs.append((q1_text, q2_text))
                            labels.append(0)
            except Exception as e:
                logger.warning(f"Failed to generate cross-category negative pairs: {e}")

        return pairs, labels, sorted(list(dataset_names))

    def run_training_and_evaluation(
        self,
        dataset_ids: Optional[List[int]] = None,
        version_tag: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes end-to-end training and evaluation:
        1. Loads pairs from DB
        2. Stratified train/test split (80/20)
        3. Fits feature extractor strictly on train split
        4. Trains all 4 model architectures
        5. Evaluates on test split with real metrics
        6. Persists artifacts to disk and records runs in SQLite
        """
        start_time = time.time()
        pairs, labels, dataset_names = self.load_dataset_pairs_from_db(dataset_ids)

        if len(pairs) < 10:
            raise ValueError(f"Insufficient training pairs ({len(pairs)}). At least 10 pairs required.")

        y = np.array(labels, dtype=int)
        version = version_tag or f"v{int(time.time())}"

        # 1. Stratified 80/20 train/test split to prevent data leakage
        train_pairs, test_pairs, y_train, y_test = train_test_split(
            pairs, y, test_size=0.20, random_state=42, stratify=y
        )

        # 2. Fit Feature Extractor strictly on training texts
        train_corpus = []
        for q1, q2 in train_pairs:
            train_corpus.append(q1)
            train_corpus.append(q2)

        self.feature_extractor = PairFeatureExtractor(n_lsa_components=15)
        self.feature_extractor.fit(train_corpus)

        # 3. Transform train and test pairs into feature matrices
        X_train = self.feature_extractor.extract_batch_features(train_pairs)
        X_test = self.feature_extractor.extract_batch_features(test_pairs)

        # Save feature extractor
        joblib.dump(self.feature_extractor, SAVED_MODELS_DIR / "feature_extractor.joblib")

        training_results = {}
        best_f1 = -1.0
        best_model_name = ""

        # --- Model 1: Baseline TF-IDF + Cosine Similarity ---
        t0 = time.time()
        # tfidf_cosine is feature index 0 in FEATURE_NAMES
        train_tfidf_scores = X_train[:, 0]
        test_tfidf_scores = X_test[:, 0]
        baseline_thresh = 0.50
        y_pred_baseline = (test_tfidf_scores >= baseline_thresh).astype(int)
        baseline_time = time.time() - t0

        m1_metrics = self._compute_metrics(y_test, y_pred_baseline, test_tfidf_scores)
        m1_metrics.update({
            "model_name": "TF-IDF + Cosine Similarity (Baseline)",
            "version": version,
            "train_samples": len(train_pairs),
            "test_samples": len(test_pairs),
            "training_time_sec": round(baseline_time, 3),
            "datasets_used": dataset_names
        })
        training_results["TF-IDF + Cosine Similarity"] = m1_metrics

        # --- Model 2: Logistic Regression (Pairwise Features) ---
        t0 = time.time()
        lr_model = LogisticRegression(C=1.5, max_iter=1000, random_state=42)
        lr_model.fit(X_train, y_train)
        y_pred_lr = lr_model.predict(X_test)
        y_prob_lr = lr_model.predict_proba(X_test)[:, 1]
        lr_time = time.time() - t0

        m2_metrics = self._compute_metrics(y_test, y_pred_lr, y_prob_lr)
        m2_metrics.update({
            "model_name": "Logistic Regression Classifier",
            "version": version,
            "train_samples": len(train_pairs),
            "test_samples": len(test_pairs),
            "training_time_sec": round(lr_time, 3),
            "datasets_used": dataset_names
        })
        training_results["Logistic Regression Classifier"] = m2_metrics
        self.models["Logistic Regression Classifier"] = lr_model
        joblib.dump(lr_model, SAVED_MODELS_DIR / "logistic_regression.joblib")

        # --- Model 3: Random Forest Classifier ---
        t0 = time.time()
        rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=4,
            random_state=42
        )
        rf_model.fit(X_train, y_train)
        y_pred_rf = rf_model.predict(X_test)
        y_prob_rf = rf_model.predict_proba(X_test)[:, 1]
        rf_time = time.time() - t0

        feature_importances = {
            name: round(float(imp), 4)
            for name, imp in zip(FEATURE_NAMES, rf_model.feature_importances_)
        }

        m3_metrics = self._compute_metrics(y_test, y_pred_rf, y_prob_rf)
        m3_metrics.update({
            "model_name": "Random Forest Classifier",
            "version": version,
            "train_samples": len(train_pairs),
            "test_samples": len(test_pairs),
            "training_time_sec": round(rf_time, 3),
            "datasets_used": dataset_names,
            "feature_importances": feature_importances
        })
        training_results["Random Forest Classifier"] = m3_metrics
        self.models["Random Forest Classifier"] = rf_model
        joblib.dump(rf_model, SAVED_MODELS_DIR / "random_forest.joblib")

        # --- Model 4: Latent Semantic Analysis (LSA) Model ---
        t0 = time.time()
        # Uses LSA semantic similarity (feature index 11) + TF-IDF cosine
        lsa_features_train = X_train[:, [0, 11]]
        lsa_features_test = X_test[:, [0, 11]]
        lsa_model = LogisticRegression(C=1.0, random_state=42)
        lsa_model.fit(lsa_features_train, y_train)
        y_pred_lsa = lsa_model.predict(lsa_features_test)
        y_prob_lsa = lsa_model.predict_proba(lsa_features_test)[:, 1]
        lsa_time = time.time() - t0

        m4_metrics = self._compute_metrics(y_test, y_pred_lsa, y_prob_lsa)
        m4_metrics.update({
            "model_name": "Semantic LSA Similarity Model",
            "version": version,
            "train_samples": len(train_pairs),
            "test_samples": len(test_pairs),
            "training_time_sec": round(lsa_time, 3),
            "datasets_used": dataset_names
        })
        training_results["Semantic LSA Similarity Model"] = m4_metrics
        self.models["Semantic LSA Similarity Model"] = lsa_model
        joblib.dump(lsa_model, SAVED_MODELS_DIR / "semantic_lsa.joblib")

        # Determine best model based on F1-Score
        for name, m in training_results.items():
            if m["f1_score"] > best_f1:
                best_f1 = m["f1_score"]
                best_model_name = name

        self.active_model_name = best_model_name
        self.model_metrics = training_results

        # 4. Save metadata & update SQLite records
        self._save_runs_to_db(training_results, best_model_name, dataset_ids)

        total_elapsed = time.time() - start_time
        logger.info(
            "Training completed in %.2fs. Best model: %s (F1: %.3f)",
            total_elapsed, best_model_name, best_f1
        )

        return {
            "status": "success",
            "version": version,
            "total_pairs": len(pairs),
            "train_count": len(train_pairs),
            "test_count": len(test_pairs),
            "best_model": best_model_name,
            "elapsed_seconds": round(total_elapsed, 2),
            "datasets_used": dataset_names,
            "models": training_results
        }

    def _compute_metrics(
        self,
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_prob: Optional[np.ndarray] = None
    ) -> Dict[str, Any]:
        """Calculates standard classification metrics without fabrication."""
        acc = float(accuracy_score(y_true, y_pred))
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        if y_prob is not None:
            try:
                auc_score = float(roc_auc_score(y_true, y_prob))
            except Exception:
                auc_score = None
        else:
            auc_score = None

        cm = confusion_matrix(y_true, y_pred)
        # Handle cases where confusion matrix might be 1x1 if only one class exists
        if cm.shape == (2, 2):
            tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])
        else:
            tn, fp, fn, tp = 0, 0, 0, 0

        return {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc_score, 4) if auc_score is not None else None,
            "confusion_matrix": {
                "tn": tn,
                "fp": fp,
                "fn": fn,
                "tp": tp
            }
        }

    def _save_runs_to_db(
        self,
        results: Dict[str, Dict[str, Any]],
        best_model_name: str,
        dataset_ids: Optional[List[int]] = None
    ):
        """Persists model run metrics into model_runs table and marks datasets used."""
        conn = get_db_connection()
        cursor = conn.cursor()

        # Mark all previous runs inactive
        cursor.execute("UPDATE model_runs SET is_active = 0;")

        for model_name, m in results.items():
            is_active = 1 if model_name == best_model_name else 0
            cursor.execute(
                """
                INSERT INTO model_runs (
                    model_name, version, accuracy, precision, recall, f1_score,
                    roc_auc, confusion_matrix, train_samples, test_samples,
                    training_time_sec, datasets_used, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    m["model_name"],
                    m["version"],
                    m["accuracy"],
                    m["precision"],
                    m["recall"],
                    m["f1_score"],
                    m.get("roc_auc"),
                    json.dumps(m["confusion_matrix"]),
                    m["train_samples"],
                    m["test_samples"],
                    m["training_time_sec"],
                    json.dumps(m["datasets_used"]),
                    is_active
                )
            )

        # Mark datasets as used_in_training
        if dataset_ids:
            placeholders = ",".join(["?"] * len(dataset_ids))
            cursor.execute(f"UPDATE datasets SET used_in_training = 1 WHERE id IN ({placeholders});", dataset_ids)
        else:
            cursor.execute("UPDATE datasets SET used_in_training = 1;")

        conn.commit()
        conn.close()

    def load_persisted_models(self) -> bool:
        """Loads fitted extractor and models from disk if present."""
        fe_path = SAVED_MODELS_DIR / "feature_extractor.joblib"
        lr_path = SAVED_MODELS_DIR / "logistic_regression.joblib"
        rf_path = SAVED_MODELS_DIR / "random_forest.joblib"
        lsa_path = SAVED_MODELS_DIR / "semantic_lsa.joblib"

        if fe_path.exists():
            try:
                self.feature_extractor = joblib.load(fe_path)
                if lr_path.exists():
                    self.models["Logistic Regression Classifier"] = joblib.load(lr_path)
                if rf_path.exists():
                    self.models["Random Forest Classifier"] = joblib.load(rf_path)
                if lsa_path.exists():
                    self.models["Semantic LSA Similarity Model"] = joblib.load(lsa_path)
                logger.info("Persisted ML models successfully loaded from disk.")
                return True
            except Exception as e:
                logger.warning("Could not load persisted models: %s", e)
        return False

    def predict_pair(
        self,
        q1: str,
        q2: str,
        model_name: Optional[str] = None
    ) -> Tuple[bool, float, float, str, str]:
        """
        Executes prediction using specified or baseline model.
        Returns (is_duplicate, similarity_score, confidence, method_name, version).
        """
        from backend.services.text_processor import normalize_text
        norm1 = normalize_text(q1)
        norm2 = normalize_text(q2)
        version = "v2.0"

        # Exact match after text normalization
        if norm1 and norm1 == norm2:
            method = model_name or "TF-IDF + Cosine Similarity"
            return True, 1.0, 1.0, method, version

        if self.feature_extractor is None or not self.models:
            if not self.load_persisted_models():
                self.run_training_and_evaluation()

        chosen_model = model_name or "TF-IDF + Cosine Similarity"

        # Baseline TF-IDF + Cosine Similarity (Default / Baseline)
        if "Baseline" in chosen_model or "TF-IDF" in chosen_model:
            score = self.feature_extractor.tfidf_similarity(q1, q2)
            is_dup = (score >= 0.60)
            confidence = min(1.0, max(0.5, 0.5 + abs(score - 0.60)))
            return is_dup, round(score, 3), round(confidence, 3), "TF-IDF + Cosine Similarity", version

        feats = self.feature_extractor.extract_pair_features(q1, q2).reshape(1, -1)

        # Logical guardrail: questions with 0 common meaningful words and < 0.10 TF-IDF cosine cannot be duplicates
        if feats[0, 5] == 0 and feats[0, 0] < 0.10:
            return False, 0.0, 1.0, chosen_model, version

        # Random Forest Classifier
        if "Random Forest" in chosen_model and "Random Forest Classifier" in self.models:
            model = self.models["Random Forest Classifier"]
            probs = model.predict_proba(feats)[0]
            prob_dup = float(probs[1])
            is_dup = bool(prob_dup >= 0.50)
            confidence = float(max(probs[0], probs[1]))
            return is_dup, round(prob_dup, 3), round(confidence, 3), "Random Forest Classifier", version

        # Semantic LSA Model
        if "Semantic" in chosen_model or "LSA" in chosen_model:
            if "Semantic LSA Similarity Model" in self.models:
                model = self.models["Semantic LSA Similarity Model"]
                lsa_feats = feats[:, [0, 11]]
                probs = model.predict_proba(lsa_feats)[0]
                prob_dup = float(probs[1])
                is_dup = bool(prob_dup >= 0.50)
                confidence = float(max(probs[0], probs[1]))
                return is_dup, round(prob_dup, 3), round(confidence, 3), "Semantic LSA Similarity Model", version

        # Logistic Regression Classifier
        if "Logistic Regression Classifier" in self.models:
            model = self.models["Logistic Regression Classifier"]
            probs = model.predict_proba(feats)[0]
            prob_dup = float(probs[1])
            is_dup = bool(prob_dup >= 0.50)
            confidence = float(max(probs[0], probs[1]))
            return is_dup, round(prob_dup, 3), round(confidence, 3), "Logistic Regression Classifier", version

        # Fallback
        feats = self.feature_extractor.extract_pair_features(q1, q2)
        score = float(feats[0])
        return (score >= 0.60), round(score, 3), 0.70, "TF-IDF + Cosine Similarity", version


# Singleton pipeline instance
training_pipeline = TrainingPipeline()
