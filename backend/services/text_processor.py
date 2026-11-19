import re
from typing import List, Set

# Comprehensive English stop words set, incorporating standard scikit-learn stop words
# and standard question/conversational filler words.
STOPWORDS: Set[str] = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}

PUNCTUATION_PATTERN = re.compile(r"[^\w\s]", re.UNICODE)
WHITESPACE_PATTERN = re.compile(r"\s+")


def normalize_text(text: str) -> str:
    """
    Standardize text using lowercasing, punctuation stripping,
    and whitespace normalization.
    """
    if not text:
        return ""
    # Lowercase
    lowered = text.lower()
    # Strip punctuation (replace with single space)
    no_punct = PUNCTUATION_PATTERN.sub(" ", lowered)
    # Collapse multiple whitespace
    normalized = WHITESPACE_PATTERN.sub(" ", no_punct).strip()
    return normalized


def tokenize(text: str) -> List[str]:
    """
    Tokenizes normalized text into words.
    """
    normalized = normalize_text(text)
    if not normalized:
        return []
    return normalized.split()


def extract_meaningful_tokens(text: str) -> List[str]:
    """
    Extracts meaningful tokens after stopword removal.
    """
    tokens = tokenize(text)
    return [token for token in tokens if token not in STOPWORDS and len(token) > 1]


def preprocess_for_tfidf(text: str) -> str:
    """
    Cleans, strips punctuation, and removes stopwords for TF-IDF processing.
    If stopword removal empties the string, falls back to the normalized string.
    """
    meaningful = extract_meaningful_tokens(text)
    if meaningful:
        return " ".join(meaningful)
    # Fallback to normalized text if all words were stopwords
    return normalize_text(text)


def extract_matched_terms(text1: str, text2: str) -> List[str]:
    """
    Finds unique meaningful terms that occur in both text inputs,
    preserving the order of first appearance in text1.
    """
    tokens1 = extract_meaningful_tokens(text1)
    tokens2_set = set(extract_meaningful_tokens(text2))

    seen = set()
    matched = []
    for token in tokens1:
        if token in tokens2_set and token not in seen:
            seen.add(token)
            matched.append(token)
    return matched
