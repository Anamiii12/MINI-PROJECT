"""
Automatic Question Categorization Engine.
Classifies input queries into domain categories using text classification.
"""
from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

CATEGORIES = [
    "Programming",
    "Technology",
    "Education",
    "Career",
    "Science",
    "Money & Finance",
    "Health & Fitness",
    "Travel",
    "Food & Cooking",
    "Productivity",
    "General Knowledge"
]

CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "Programming": ["python", "code", "programming", "java", "javascript", "react", "git", "github", "bug", "sql", "database", "function", "array", "algorithm", "variable", "api", "html", "css", "django", "flask"],
    "Technology": ["computer", "cloud", "ai", "machine learning", "internet", "software", "hardware", "phone", "laptop", "linux", "ubuntu", "server", "security", "network", "wifi", "app", "operating system"],
    "Education": ["study", "exam", "college", "university", "course", "degree", "school", "lecture", "student", "learn", "math", "revision", "syllabus", "test", "homework"],
    "Career": ["job", "interview", "resume", "career", "salary", "promotion", "cv", "hire", "recruiter", "internship", "profession", "boss", "workplace", "mentor"],
    "Science": ["physics", "chemistry", "biology", "space", "earth", "planet", "gravity", "water", "atom", "molecule", "energy", "sunlight", "plants", "cells", "universe"],
    "Money & Finance": ["money", "invest", "wealth", "wealthy", "rich", "stock", "shares", "crypto", "budget", "financial", "credit card", "bank", "fund", "interest", "tax"],
    "Health & Fitness": ["health", "fitness", "workout", "exercise", "weight", "diet", "gym", "sleep", "muscle", "healthy", "food", "nutrition", "running", "fat"],
    "Travel": ["travel", "flight", "trip", "hotel", "tourist", "vacation", "backpack", "destination", "country", "city", "passport", "visa"],
    "Food & Cooking": ["cook", "cooking", "recipe", "bake", "baking", "food", "rice", "bread", "meal", "kitchen", "ingredient", "dish"],
    "Productivity": ["productivity", "time", "procrastinate", "focus", "habit", "routine", "goal", "morning", "schedule", "organize"],
    "General Knowledge": ["history", "world", "country", "continent", "election", "government", "currency", "culture", "geography"]
}


class QuestionCategorizer:
    def __init__(self):
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.classifier: Optional[MultinomialNB] = None
        self.is_trained = False

    def train_on_corpus(self, questions_with_categories: List[Dict[str, str]]):
        """Trains MultinomialNB classifier on categorized question corpus."""
        if not questions_with_categories:
            return

        texts = [q["question"] for q in questions_with_categories if q.get("question")]
        labels = [q.get("category", "General Knowledge") for q in questions_with_categories if q.get("question")]

        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        X = self.vectorizer.fit_transform(texts)
        self.classifier = MultinomialNB()
        self.classifier.fit(X, labels)
        self.is_trained = True

    def predict_category(self, question: str) -> str:
        """Predicts the category of a question using ML model with keyword fallback."""
        lowered = question.lower()

        # 1. High-confidence keyword matching
        for cat, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if f" {kw} " in f" {lowered} " or lowered.startswith(f"{kw} ") or lowered.endswith(f" {kw}"):
                    return cat

        # 2. ML classifier inference
        if self.is_trained and self.classifier and self.vectorizer:
            try:
                vec = self.vectorizer.transform([question])
                pred = self.classifier.predict(vec)[0]
                return str(pred)
            except Exception:
                pass

        return "General Knowledge"


categorizer = QuestionCategorizer()
