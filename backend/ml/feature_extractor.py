"""
Feature Extraction Engine for Question Pair Similarity Classification.
Computes multi-dimensional lexical, statistical, syntactic, and latent semantic features.
"""
import re
import math
from typing import List, Dict, Tuple, Set, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

try:
    from backend.services.text_processor import (
        normalize_text,
        tokenize,
        extract_meaningful_tokens,
        preprocess_for_tfidf,
        STOPWORDS
    )
except ImportError:
    from services.text_processor import (
        normalize_text,
        tokenize,
        extract_meaningful_tokens,
        preprocess_for_tfidf,
        STOPWORDS
    )


FEATURE_NAMES = [
    "tfidf_cosine",
    "token_jaccard",
    "token_dice",
    "char_length_diff_ratio",
    "token_count_diff_ratio",
    "common_token_count",
    "common_token_ratio_min",
    "common_token_ratio_max",
    "char_trigram_jaccard",
    "first_word_match",
    "longest_common_substring_ratio",
    "lsa_semantic_similarity"
]


class PairFeatureExtractor:
    """
    Extracts numerical feature vectors from pairs of questions.
    Fitted on training corpus to maintain consistent TF-IDF and SVD spaces.
    """
    def __init__(self, n_lsa_components: int = 20):
        self.n_lsa_components = n_lsa_components
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.svd: Optional[TruncatedSVD] = None
        self.is_fitted = False

    def fit(self, all_texts: List[str]):
        """Fits TF-IDF and TruncatedSVD on the corpus of questions."""
        cleaned = [preprocess_for_tfidf(t) for t in all_texts if t and t.strip()]
        if not cleaned:
            cleaned = ["example question learning python"]

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=2500,
            token_pattern=r"(?u)\b\w+\b"
        )
        tfidf_mat = self.vectorizer.fit_transform(cleaned)

        n_comp = min(self.n_lsa_components, max(2, tfidf_mat.shape[1] - 1), tfidf_mat.shape[0] - 1)
        self.svd = TruncatedSVD(n_components=n_comp, random_state=42)
        self.svd.fit(tfidf_mat)
        self.is_fitted = True

    def _get_char_ngrams(self, text: str, n: int = 3) -> Set[str]:
        cleaned = normalize_text(text)
        if len(cleaned) < n:
            return {cleaned} if cleaned else set()
        return {cleaned[i:i+n] for i in range(len(cleaned) - n + 1)}

    def _longest_common_substring(self, s1: str, s2: str) -> int:
        """Finds length of longest common contiguous substring."""
        if not s1 or not s2:
            return 0
        m = len(s1)
        n = len(s2)
        dp = [0] * (n + 1)
        max_len = 0
        for i in range(1, m + 1):
            cur = [0] * (n + 1)
            for j in range(1, n + 1):
                if s1[i - 1] == s2[j - 1]:
                    cur[j] = dp[j - 1] + 1
                    if cur[j] > max_len:
                        max_len = cur[j]
                else:
                    cur[j] = 0
            dp = cur
        return max_len

    def extract_pair_features(self, q1: str, q2: str) -> np.ndarray:
        """Extracts 1D feature vector for a pair of questions."""
        norm1 = normalize_text(q1)
        norm2 = normalize_text(q2)

        tokens1 = tokenize(norm1)
        tokens2 = tokenize(norm2)

        set1 = set(tokens1)
        set2 = set(tokens2)

        meaningful1 = set(extract_meaningful_tokens(norm1))
        meaningful2 = set(extract_meaningful_tokens(norm2))

        # 1. TF-IDF Cosine
        clean1 = preprocess_for_tfidf(q1)
        clean2 = preprocess_for_tfidf(q2)
        if not clean1 or not clean2:
            tfidf_cosine = 0.0
        elif self.is_fitted and self.vectorizer is not None:
            v = self.vectorizer.transform([clean1, clean2])
            sim = cosine_similarity(v[0], v[1])[0][0]
            tfidf_cosine = float(max(0.0, min(1.0, sim)))
        else:
            local_vec = TfidfVectorizer(ngram_range=(1, 2))
            try:
                v = local_vec.fit_transform([clean1, clean2])
                tfidf_cosine = float(cosine_similarity(v[0], v[1])[0][0])
            except Exception:
                tfidf_cosine = 0.0

        # 2. Token Jaccard
        union_tokens = set1.union(set2)
        inter_tokens = set1.intersection(set2)
        token_jaccard = len(inter_tokens) / len(union_tokens) if union_tokens else 0.0

        # 3. Token Dice
        total_tokens = len(tokens1) + len(tokens2)
        token_dice = (2.0 * len(inter_tokens)) / total_tokens if total_tokens else 0.0

        # 4. Char length difference ratio
        len1 = len(norm1)
        len2 = len(norm2)
        max_char_len = max(len1, len2)
        char_len_diff = abs(len1 - len2) / max_char_len if max_char_len > 0 else 0.0

        # 5. Token count difference ratio
        tc1 = len(tokens1)
        tc2 = len(tokens2)
        max_tc = max(tc1, tc2)
        token_count_diff = abs(tc1 - tc2) / max_tc if max_tc > 0 else 0.0

        # 6. Common meaningful tokens
        common_meaningful = meaningful1.intersection(meaningful2)
        common_count = len(common_meaningful)

        # 7. Common token ratios
        min_meaningful = min(len(meaningful1), len(meaningful2))
        max_meaningful = max(len(meaningful1), len(meaningful2))
        common_ratio_min = common_count / min_meaningful if min_meaningful > 0 else 0.0
        common_ratio_max = common_count / max_meaningful if max_meaningful > 0 else 0.0

        # 8. Character trigram Jaccard
        tri1 = self._get_char_ngrams(norm1, 3)
        tri2 = self._get_char_ngrams(norm2, 3)
        tri_union = tri1.union(tri2)
        tri_inter = tri1.intersection(tri2)
        tri_jaccard = len(tri_inter) / len(tri_union) if tri_union else 0.0

        # 9. First word match (indicates question intent e.g., how vs what vs why)
        first1 = tokens1[0] if tokens1 else ""
        first2 = tokens2[0] if tokens2 else ""
        first_match = 1.0 if (first1 and first1 == first2) else 0.0

        # 10. Longest common substring ratio
        lcs = self._longest_common_substring(norm1, norm2)
        avg_len = (len1 + len2) / 2.0 if (len1 + len2) > 0 else 1.0
        lcs_ratio = min(1.0, lcs / avg_len)

        # 11. Latent Semantic Analysis (LSA) Cosine
        if common_count == 0 and tfidf_cosine == 0.0:
            lsa_semantic_similarity = 0.0
        elif self.is_fitted and self.svd is not None and self.vectorizer is not None:
            tfidf_mat = self.vectorizer.transform([norm1, norm2])
            if tfidf_mat[0].nnz > 0 and tfidf_mat[1].nnz > 0:
                lsa_vecs = self.svd.transform(tfidf_mat)
                lsa_norm1 = np.linalg.norm(lsa_vecs[0])
                lsa_norm2 = np.linalg.norm(lsa_vecs[1])
                if lsa_norm1 > 1e-9 and lsa_norm2 > 1e-9:
                    lsa_sim = float(np.dot(lsa_vecs[0], lsa_vecs[1]) / (lsa_norm1 * lsa_norm2))
                    lsa_semantic_similarity = float(max(0.0, min(1.0, (lsa_sim + 1.0) / 2.0)))
                else:
                    lsa_semantic_similarity = tfidf_cosine
            else:
                lsa_semantic_similarity = 0.0
        else:
            lsa_semantic_similarity = tfidf_cosine

        features = [
            tfidf_cosine,
            token_jaccard,
            token_dice,
            char_len_diff,
            token_count_diff,
            float(common_count),
            common_ratio_min,
            common_ratio_max,
            tri_jaccard,
            first_match,
            lcs_ratio,
            lsa_semantic_similarity
        ]
        return np.array(features, dtype=np.float32)

    def extract_batch_features(self, pairs: List[Tuple[str, str]]) -> np.ndarray:
        """Extracts 2D feature matrix for list of question pairs."""
        matrix = []
        for q1, q2 in pairs:
            matrix.append(self.extract_pair_features(q1, q2))
        return np.vstack(matrix) if matrix else np.empty((0, len(FEATURE_NAMES)))
