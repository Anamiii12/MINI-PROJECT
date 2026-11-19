"""
Explainability Engine for Question Pair Similarity.
Generates human-readable, evidence-based reasoning, highlighted tokens,
syntactic signals, and confidence metrics for predictions.
"""
from typing import Dict, List, Any, Set
import numpy as np

try:
    from backend.services.text_processor import (
        normalize_text,
        tokenize,
        extract_meaningful_tokens,
        extract_matched_terms,
        STOPWORDS
    )
except ImportError:
    from services.text_processor import (
        normalize_text,
        tokenize,
        extract_meaningful_tokens,
        extract_matched_terms,
        STOPWORDS
    )


def explain_prediction(
    q1: str,
    q2: str,
    is_duplicate: bool,
    similarity_score: float,
    confidence: float,
    method_name: str,
    model_version: str = "v2.0-prod"
) -> Dict[str, Any]:
    """
    Constructs a comprehensive, transparent explanation dictionary for UI rendering.
    """
    norm1 = normalize_text(q1)
    norm2 = normalize_text(q2)

    tokens1 = tokenize(norm1)
    tokens2 = tokenize(norm2)

    meaningful1 = extract_meaningful_tokens(norm1)
    meaningful2 = extract_meaningful_tokens(norm2)

    set_m1 = set(meaningful1)
    set_m2 = set(meaningful2)

    matched_tokens = extract_matched_terms(norm1, norm2)
    unique_to_q1 = [t for t in meaningful1 if t not in set_m2]
    unique_to_q2 = [t for t in meaningful2 if t not in set_m1]

    # Shared phrase search (bigrams)
    def get_bigrams(tok_list):
        return [f"{tok_list[i]} {tok_list[i+1]}" for i in range(len(tok_list) - 1)]

    bigrams1 = set(get_bigrams(meaningful1))
    bigrams2 = set(get_bigrams(meaningful2))
    matched_phrases = list(bigrams1.intersection(bigrams2))

    # Identify question intent / first words
    first1 = tokens1[0] if tokens1 else "Unknown"
    first2 = tokens2[0] if tokens2 else "Unknown"
    same_question_intent = (first1.lower() == first2.lower())

    # Build evidence bullet points
    reasons = []
    if is_duplicate:
        if matched_tokens:
            reasons.append(
                f"Shared {len(matched_tokens)} core topical keyword{'s' if len(matched_tokens) > 1 else ''}: {', '.join(matched_tokens[:5])}."
            )
        if matched_phrases:
            reasons.append(
                f"Matching key phrase structure: '{matched_phrases[0]}'."
            )
        if same_question_intent:
            reasons.append(
                f"Both questions share the same interrogative framing ('{first1.title()}...')."
            )
        if similarity_score >= 0.80:
            reasons.append(
                "High semantic overlap indicates virtually identical inquiry goals."
            )
        else:
            reasons.append(
                "Model detected sufficient contextual similarity despite minor phrasing variations."
            )
    else:
        if unique_to_q1 or unique_to_q2:
            key_diff1 = ", ".join(unique_to_q1[:3]) if unique_to_q1 else "none"
            key_diff2 = ", ".join(unique_to_q2[:3]) if unique_to_q2 else "none"
            reasons.append(
                f"Distinct focal concepts detected: Q1 focuses on [{key_diff1}], while Q2 specifies [{key_diff2}]."
            )
        if not same_question_intent and first1 != first2:
            reasons.append(
                f"Different inquiry intents: Q1 asks '{first1.title()}', whereas Q2 asks '{first2.title()}'."
            )
        reasons.append(
            f"Similarity score ({(similarity_score * 100):.1f}%) is below the duplicate threshold."
        )

    # Simple plain-language summary for "Understand the Prediction"
    if is_duplicate:
        summary_text = (
            f"These questions ask for essentially the same information. "
            f"Even if phrased differently, the central subject and intention align strongly."
        )
    else:
        summary_text = (
            f"These questions are about related topics but have distinct objectives or specific scopes. "
            f"An answer to one question would not fully answer the other."
        )

    return {
        "summary": summary_text,
        "is_duplicate": is_duplicate,
        "similarity_score": round(float(similarity_score), 3),
        "similarity_percentage": round(float(similarity_score * 100), 1),
        "confidence": round(float(confidence), 3),
        "confidence_percentage": round(float(confidence * 100), 1),
        "matched_words": matched_tokens,
        "matched_phrases": matched_phrases,
        "unique_to_question1": unique_to_q1,
        "unique_to_question2": unique_to_q2,
        "shared_token_count": len(matched_tokens),
        "q1_token_count": len(meaningful1),
        "q2_token_count": len(meaningful2),
        "same_intent": same_question_intent,
        "reasons": reasons,
        "method": method_name,
        "model_version": model_version,
        "is_calibrated": ("Classifier" in method_name or "Logistic" in method_name or "Forest" in method_name)
    }
