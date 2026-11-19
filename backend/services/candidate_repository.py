"""
Seed repository of candidate/benchmark questions for the QuerySense Duplicate Finder.
Populated with high-quality domain-diverse seed questions (15 categories).
"""
from typing import List, Dict, Optional


SEED_QUESTIONS: List[Dict[str, str]] = [
    # Programming
    {"question": "What is the best way to learn Python?", "category": "Programming"},
    {"question": "How should a beginner start learning Python?", "category": "Programming"},
    {"question": "How can I start learning Python?", "category": "Programming"},
    {"question": "How do I install Python on Windows?", "category": "Programming"},
    {"question": "How can I learn Java programming?", "category": "Programming"},
    {"question": "How do I connect React to an API?", "category": "Programming"},

    # Education
    {"question": "How can I study more effectively?", "category": "Education"},
    {"question": "What is the best way to prepare for exams?", "category": "Education"},
    {"question": "How can I improve my concentration while studying?", "category": "Education"},
    {"question": "How can I remember what I study?", "category": "Education"},
    {"question": "How should I manage my study time?", "category": "Education"},
    {"question": "How can I improve my study routine for exams?", "category": "Education"},

    # Career
    {"question": "How can I get a good job?", "category": "Career"},
    {"question": "What skills can help me get a better job?", "category": "Career"},
    {"question": "How can I improve my career?", "category": "Career"},
    {"question": "What skills are important for career growth?", "category": "Career"},
    {"question": "How can I change careers without experience?", "category": "Career"},
    {"question": "How can I find a mentor for my career?", "category": "Career"},

    # Money & Finance
    {"question": "How can I become wealthy?", "category": "Money & Finance"},
    {"question": "What are some ways to build wealth?", "category": "Money & Finance"},
    {"question": "How can I become financially successful?", "category": "Money & Finance"},
    {"question": "What are good ways to make more money?", "category": "Money & Finance"},
    {"question": "How can I improve my financial future?", "category": "Money & Finance"},
    {"question": "How can I start investing for the future?", "category": "Money & Finance"},

    # Technology
    {"question": "What is cloud computing?", "category": "Technology"},
    {"question": "What are the advantages of cloud computing?", "category": "Technology"},
    {"question": "What is machine learning?", "category": "Technology"},
    {"question": "How does artificial intelligence differ from machine learning?", "category": "Technology"},
    {"question": "How can I protect my online accounts?", "category": "Technology"},
    {"question": "What should I consider before buying a laptop?", "category": "Technology"},

    # Health & Fitness
    {"question": "How can I lose weight?", "category": "Health & Fitness"},
    {"question": "What are healthy ways to lose weight?", "category": "Health & Fitness"},
    {"question": "How can I become more physically fit?", "category": "Health & Fitness"},
    {"question": "What exercises are good for beginners?", "category": "Health & Fitness"},
    {"question": "How can I improve my sleep?", "category": "Health & Fitness"},
    {"question": "How can I build a regular fitness routine?", "category": "Health & Fitness"},

    # Travel
    {"question": "How can I travel on a low budget?", "category": "Travel"},
    {"question": "What are some ways to save money while travelling?", "category": "Travel"},
    {"question": "How should I plan my first international trip?", "category": "Travel"},
    {"question": "What should I pack for a long trip?", "category": "Travel"},
    {"question": "How can I find cheap flights?", "category": "Travel"},
    {"question": "How can I spend less money on travel?", "category": "Travel"},

    # Food & Cooking
    {"question": "How can I cook rice without making it sticky?", "category": "Food & Cooking"},
    {"question": "What are easy meals for beginner cooks?", "category": "Food & Cooking"},
    {"question": "How can I bake bread at home?", "category": "Food & Cooking"},
    {"question": "How can I keep vegetables fresh for longer?", "category": "Food & Cooking"},
    {"question": "What can I use instead of eggs when baking?", "category": "Food & Cooking"},
    {"question": "How can I prepare healthy meals on a budget?", "category": "Food & Cooking"},

    # Productivity
    {"question": "How can I manage my time better?", "category": "Productivity"},
    {"question": "How can I stop procrastinating?", "category": "Productivity"},
    {"question": "How can I stay focused while working?", "category": "Productivity"},
    {"question": "How should I prioritize my daily tasks?", "category": "Productivity"},
    {"question": "How can I reduce distractions from my phone?", "category": "Productivity"},
    {"question": "How can I plan a productive week?", "category": "Productivity"},

    # General Knowledge
    {"question": "How do elections work in a democracy?", "category": "General Knowledge"},
    {"question": "Why do countries use different currencies?", "category": "General Knowledge"},
    {"question": "How did the printing press change education?", "category": "General Knowledge"},
    {"question": "What is the difference between a continent and a country?", "category": "General Knowledge"},
    {"question": "Why do we use different time zones?", "category": "General Knowledge"},
    {"question": "How are world heritage sites selected?", "category": "General Knowledge"},

    # Communication & English
    {"question": "How can I improve my spoken English?", "category": "Communication & English"},
    {"question": "How can I speak confidently in public?", "category": "Communication & English"},
    {"question": "What are good ways to expand my vocabulary?", "category": "Communication & English"},
    {"question": "How can I write a clear professional email?", "category": "Communication & English"},
    {"question": "How can I become a better listener?", "category": "Communication & English"},
    {"question": "How can I practice English pronunciation?", "category": "Communication & English"},

    # Science
    {"question": "Why do objects fall toward the ground?", "category": "Science"},
    {"question": "How do plants use sunlight to grow?", "category": "Science"},
    {"question": "What causes the ocean tides?", "category": "Science"},
    {"question": "How does electricity flow through a circuit?", "category": "Science"},
    {"question": "Why does water expand when it freezes?", "category": "Science"},
    {"question": "How does the human heart pump blood?", "category": "Science"},

    # College & Students
    {"question": "How can I choose a suitable college course?", "category": "College & Students"},
    {"question": "How should I plan my final year project?", "category": "College & Students"},
    {"question": "How can students balance study and part-time work?", "category": "College & Students"},
    {"question": "How can I find scholarships for college?", "category": "College & Students"},
    {"question": "How can I make friends during my first year at college?", "category": "College & Students"},
    {"question": "What should I include in a college project report?", "category": "College & Students"},

    # Jobs & Interviews
    {"question": "How should I prepare for a job interview?", "category": "Jobs & Interviews"},
    {"question": "How can I write a resume with no work experience?", "category": "Jobs & Interviews"},
    {"question": "What questions should I ask during an interview?", "category": "Jobs & Interviews"},
    {"question": "How can I prepare for a technical interview?", "category": "Jobs & Interviews"},
    {"question": "How should I explain a gap in my employment?", "category": "Jobs & Interviews"},
    {"question": "How can I find an internship as a student?", "category": "Jobs & Interviews"},

    # Everyday Life
    {"question": "How can I wake up early?", "category": "Everyday Life"},
    {"question": "How can I build better habits?", "category": "Everyday Life"},
    {"question": "How can I become more confident?", "category": "Everyday Life"},
    {"question": "How can I organize a small room?", "category": "Everyday Life"},
    {"question": "What should I check before buying a used car?", "category": "Everyday Life"},
    {"question": "How can I reduce my household electricity bill?", "category": "Everyday Life"}
]


class CandidateRepository:
    """
    In-memory repository managing candidate questions for duplicate search.
    Can be loaded, extended, or swapped with a database layer.
    """
    def __init__(self, initial_data: Optional[List[Dict[str, str]]] = None):
        self._candidates: List[Dict[str, str]] = list(initial_data) if initial_data is not None else list(SEED_QUESTIONS)

    def get_all(self) -> List[Dict[str, str]]:
        return self._candidates

    def get_questions_text(self) -> List[str]:
        return [c["question"] for c in self._candidates]

    def add_candidate(self, question: str, category: Optional[str] = None):
        self._candidates.append({"question": question, "category": category or "General"})

    def count(self) -> int:
        return len(self._candidates)


# Singleton candidate repository instance
candidate_repository = CandidateRepository()
