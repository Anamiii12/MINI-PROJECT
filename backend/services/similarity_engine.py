"""
Enhanced Similarity Engine for QuerySense.
Integrates ML pipelines, Database persistence, Explainability, Semantic Search,
Category Filtering, and Cluster Grouping.
"""
import os
import logging
from typing import List, Dict, Tuple, Optional, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.database.db import get_db_connection
from backend.services.text_processor import (
    preprocess_for_tfidf,
    extract_matched_terms,
    normalize_text,
    tokenize
)
from backend.services.categorizer import categorizer
from backend.ml.trainer import training_pipeline
from backend.ml.explainer import explain_prediction

logger = logging.getLogger(__name__)

DUPLICATE_THRESHOLD = 0.50


class SimilarityEngine:
    def __init__(self):
        self.method_name = "TF-IDF + Cosine Similarity"
        self.candidate_items: List[Dict[str, Any]] = []
        self.candidate_texts: List[str] = []
        self.candidate_preprocessed: List[str] = []
        self.corpus_vectorizer: Optional[TfidfVectorizer] = None
        self.candidate_matrix = None
        self.is_warmed_up = False

    def warm_up(self):
        """Pre-loads models and vectorizes candidate database from SQLite."""
        # 1. Warm up training pipeline
        if not training_pipeline.load_persisted_models():
            try:
                training_pipeline.run_training_and_evaluation()
            except Exception as e:
                logger.warning(f"Initial model training failed: {e}")

        # 2. Load questions from SQLite
        conn = get_db_connection()
        cursor = conn.cursor()
        rows = cursor.execute("SELECT id, question, category FROM questions ORDER BY id ASC;").fetchall()
        conn.close()

        self.candidate_items = [
            {"id": r["id"], "question": r["question"], "category": r["category"]}
            for r in rows
        ]

        if not self.candidate_items:
            # Fallback seed if DB not yet filled
            from backend.services.candidate_repository import SEED_QUESTIONS
            self.candidate_items = [
                {"id": idx + 1, "question": q["question"], "category": q["category"]}
                for idx, q in enumerate(SEED_QUESTIONS)
            ]

        self.candidate_texts = [item["question"] for item in self.candidate_items]
        self.candidate_preprocessed = [preprocess_for_tfidf(q) for q in self.candidate_texts]

        # 3. Fit corpus vectorizer
        self.corpus_vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
        self.candidate_matrix = self.corpus_vectorizer.fit_transform(self.candidate_preprocessed)

        # 4. Train categorizer on questions corpus
        categorizer.train_on_corpus(self.candidate_items)

        self.is_warmed_up = True
        logger.info(f"SimilarityEngine ready with {len(self.candidate_items)} questions and active ML model.")

    def reload_candidates(self):
        """Refreshes candidates cache after dataset uploads or deletions."""
        self.is_warmed_up = False
        self.warm_up()

    def compare_pair_full(
        self,
        q1: str,
        q2: str,
        model_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comprehensive comparison of two questions.
        Uses selected ML model, calculates confidence, and generates transparent explanation.
        """
        if not self.is_warmed_up:
            self.warm_up()

        q1 = q1.strip()
        q2 = q2.strip()

        # Run model inference
        is_dup, score, confidence, method_used, version = training_pipeline.predict_pair(
            q1, q2, model_name=model_name
        )

        # Generate explanation
        explanation = explain_prediction(
            q1=q1,
            q2=q2,
            is_duplicate=is_dup,
            similarity_score=score,
            confidence=confidence,
            method_name=method_used,
            model_version=version
        )

        label = "Duplicate" if is_dup else "Non-Duplicate"

        # Record into prediction_history
        try:
            conn = get_db_connection()
            conn.execute(
                """
                INSERT INTO prediction_history (question1, question2, model_name, similarity_score, is_duplicate, confidence)
                VALUES (?, ?, ?, ?, ?, ?);
                """,
                (q1, q2, method_used, score, 1 if is_dup else 0, confidence)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.warning(f"Failed to record prediction history: {e}")

        return {
            "is_duplicate": is_dup,
            "similarity_score": score,
            "confidence": confidence,
            "label": label,
            "method": method_used,
            "model_version": version,
            "explanation": explanation
        }

    def compute_pair_similarity(self, q1: str, q2: str) -> Tuple[float, str]:
        """Backward-compatible endpoint method for existing tests/routes."""
        res = self.compare_pair_full(q1, q2)
        return res["similarity_score"], res["method"]

    def find_similar(
        self,
        question: str,
        limit: int = 10,
        category: Optional[str] = None,
        threshold: float = 0.0,
        sort_by: str = "highest",
        page: int = 1,
        page_size: int = 10
    ) -> Tuple[List[Dict[str, Any]], str, int]:
        """
        Searches candidate question database, filtering and ranking top results.
        Returns (matches, method_name, total_matches).
        """
        if not self.is_warmed_up:
            self.warm_up()

        clean_query = preprocess_for_tfidf(question)
        if not clean_query or not self.candidate_items:
            return [], "TF-IDF + ML Reranking", 0

        # Vector retrieval
        q_vec = self.corpus_vectorizer.transform([clean_query])
        raw_scores = cosine_similarity(q_vec, self.candidate_matrix)[0]

        filtered_results = []
        for idx, item in enumerate(self.candidate_items):
            cand_cat = item.get("category", "General")
            if category and category != "All" and cand_cat.lower() != category.lower():
                continue

            tfidf_sim = float(raw_scores[idx])
            cand_q = item["question"]

            # If tfidf_sim has sufficient baseline signal, rerank with ML model
            if tfidf_sim > 0.05:
                # Pairwise prediction
                is_dup, final_score, conf, method, _ = training_pipeline.predict_pair(question, cand_q)
            else:
                final_score = round(tfidf_sim, 3)
                is_dup = False
                conf = 0.50

            if final_score > 0 and final_score >= threshold:
                matched_terms = extract_matched_terms(question, cand_q)
                filtered_results.append({
                    "id": item.get("id", idx + 1),
                    "original_question": question,
                    "question": cand_q,
                    "similarity_score": round(final_score, 3),
                    "is_duplicate": is_dup,
                    "confidence": round(conf, 3),
                    "category": cand_cat,
                    "matched_terms": matched_terms,
                    "explanation": f"Shared keywords: {', '.join(matched_terms[:4])}" if matched_terms else "Lexical/semantic match"
                })

        # Sort
        if sort_by == "highest":
            filtered_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        elif sort_by == "lowest":
            filtered_results.sort(key=lambda x: x["similarity_score"])

        total_matches = len(filtered_results)

        # Pagination
        start_idx = (page - 1) * page_size
        paginated_matches = filtered_results[start_idx : start_idx + page_size]
        paginated_matches = paginated_matches[:limit]

        # Record in finder_history
        if paginated_matches:
            top_match = paginated_matches[0]
            try:
                conn = get_db_connection()
                conn.execute(
                    """
                    INSERT INTO finder_history (query_question, top_match, similarity_score, category)
                    VALUES (?, ?, ?, ?);
                    """,
                    (question, top_match["question"], top_match["similarity_score"], top_match["category"])
                )
                conn.commit()
                conn.close()
            except Exception as e:
                logger.warning(f"Failed to record finder history: {e}")

        return paginated_matches, "TF-IDF Retrieval + ML Reranking", total_matches

    def suggest_questions(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Fast autocomplete suggestions as user types."""
        if not query or len(query.strip()) < 2:
            return []
        if not self.is_warmed_up:
            self.warm_up()

        q_lower = query.lower().strip()
        suggestions = []

        # 1. Prefix matches
        for item in self.candidate_items:
            cand = item["question"]
            if cand.lower().startswith(q_lower):
                suggestions.append({"question": cand, "category": item.get("category", "General")})
                if len(suggestions) >= limit:
                    return suggestions

        # 2. Substring matches
        for item in self.candidate_items:
            cand = item["question"]
            if q_lower in cand.lower() and cand not in [s["question"] for s in suggestions]:
                suggestions.append({"question": cand, "category": item.get("category", "General")})
                if len(suggestions) >= limit:
                    return suggestions

        return suggestions

    def get_duplicate_clusters(self, min_similarity: float = 0.55) -> List[Dict[str, Any]]:
        """Groups candidate questions into connected duplicate clusters for explorer view."""
        if not self.is_warmed_up:
            self.warm_up()

        n = min(len(self.candidate_items), 80)
        subset = self.candidate_items[:n]
        sub_matrix = self.candidate_matrix[:n]
        sim_mat = cosine_similarity(sub_matrix, sub_matrix)

        # Connected components / simple cluster graph
        visited = set()
        clusters = []

        for i in range(n):
            if i in visited:
                continue
            group = [subset[i]]
            visited.add(i)
            for j in range(i + 1, n):
                if j not in visited and sim_mat[i][j] >= min_similarity:
                    group.append(subset[j])
                    visited.add(j)

            if len(group) > 1:
                clusters.append({
                    "cluster_id": len(clusters) + 1,
                    "primary_question": group[0]["question"],
                    "category": group[0].get("category", "General"),
                    "question_count": len(group),
                    "questions": [g["question"] for g in group]
                })

        return clusters

    def analyze_dataset(
        self,
        questions: List[str],
        threshold: float = 0.5
    ) -> Tuple[int, int, float, List[Dict[str, Any]], str]:
        """Batch comparison for CSV question lists."""
        if not self.is_warmed_up:
            self.warm_up()

        total_questions = len(questions)
        max_eval = min(total_questions, 100)
        analysed = questions[:max_eval]
        analysed_count = len(analysed)

        if analysed_count < 2:
            return total_questions, analysed_count, 0.0, [], "Pairwise ML Classifier"

        clean_questions = [preprocess_for_tfidf(q) for q in analysed]
        vec = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
        transformed = vec.fit_transform(clean_questions)
        sim_matrix = cosine_similarity(transformed, transformed)

        pairs = []
        highest_similarity = 0.0

        for i in range(analysed_count):
            for j in range(i + 1, analysed_count):
                raw_score = float(sim_matrix[i][j])
                score = max(0.0, min(1.0, round(raw_score, 3)))

                if score > highest_similarity:
                    highest_similarity = score

                if score >= threshold:
                    is_dup, ml_score, conf, _, _ = training_pipeline.predict_pair(analysed[i], analysed[j])
                    cat = categorizer.predict_category(analysed[i])
                    pairs.append({
                        "row1": i + 1,
                        "row2": j + 1,
                        "question1": analysed[i],
                        "question2": analysed[j],
                        "similarity_score": score,
                        "ml_score": ml_score,
                        "is_duplicate": is_dup,
                        "confidence": conf,
                        "category": cat
                    })

        pairs.sort(key=lambda p: p["similarity_score"], reverse=True)
        highest_similarity = max(0.0, min(1.0, round(highest_similarity, 3)))

        return total_questions, analysed_count, highest_similarity, pairs, "Pairwise ML Classifier"


# Singleton instance
similarity_engine = SimilarityEngine()
