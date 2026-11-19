"""
Seeds the QuerySense database with verified datasets, question pairs, and candidate questions.
Executes automatically on application startup or when manually invoked.
"""
import csv
import logging
import sys
from pathlib import Path

# Ensure root and backend in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = Path(__file__).resolve().parent.parent
for d in (str(root_dir), str(backend_dir)):
    if d not in sys.path:
        sys.path.insert(0, d)

from backend.database.db import get_db_connection, init_db
from backend.services.candidate_repository import SEED_QUESTIONS

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def seed_database_if_empty():
    """Seeds datasets, pairs, and candidate repository if not already seeded."""
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if questions table is already populated
    cursor.execute("SELECT COUNT(*) as count FROM questions;")
    q_count = cursor.fetchone()["count"]

    if q_count == 0:
        logger.info("Seeding candidate questions repository...")
        # Insert seed questions
        for item in SEED_QUESTIONS:
            try:
                cursor.execute(
                    "INSERT OR IGNORE INTO questions (question, category) VALUES (?, ?);",
                    (item["question"].strip(), item.get("category", "General"))
                )
            except Exception as e:
                logger.warning(f"Error inserting question: {e}")
        conn.commit()
        logger.info("Seeded %d candidate questions.", len(SEED_QUESTIONS))

    # Check if datasets are populated
    cursor.execute("SELECT COUNT(*) as count FROM datasets;")
    d_count = cursor.fetchone()["count"]

    if d_count == 0:
        logger.info("Seeding benchmark datasets and question pairs...")
        dataset_meta = [
            {
                "name": "Quora Question Pairs (Curated Subset)",
                "filename": "qqp_subset.csv",
                "source": "Quora Question Pairs Benchmark (Public / CC BY-ND 4.0)",
                "description": "Diverse general knowledge, career, science, health, and everyday questions with human-annotated duplicate labels.",
                "used_in_training": 1
            },
            {
                "name": "Stack Exchange Developer Pairs",
                "filename": "stackexchange_pairs.csv",
                "source": "Stack Exchange Data Dump (CC BY-SA 4.0)",
                "description": "Technical programming, Git, web development, Python, JavaScript, and database duplicate questions.",
                "used_in_training": 1
            },
            {
                "name": "AskUbuntu System Administration Pairs",
                "filename": "askubuntu_pairs.csv",
                "source": "AskUbuntu Community Question Archive",
                "description": "Linux terminal, package management, system configuration, and networking question pairs.",
                "used_in_training": 1
            },
            {
                "name": "QuerySense Multi-Domain Benchmark",
                "filename": "combined_training_benchmark.csv",
                "source": "Combined Multi-Domain Verified Corpus",
                "description": "Master aggregated and balanced dataset for training production-grade text similarity classifiers.",
                "used_in_training": 1
            }
        ]

        for meta in dataset_meta:
            csv_path = DATA_DIR / meta["filename"]
            if not csv_path.exists():
                logger.warning("Seed CSV not found: %s", csv_path)
                continue

            pairs = []
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    q1 = row.get("question1", "").strip()
                    q2 = row.get("question2", "").strip()
                    is_dup = int(row.get("is_duplicate", 0))
                    cat = row.get("category", "General").strip()
                    if q1 and q2:
                        pairs.append((q1, q2, is_dup, cat))

            total = len(pairs)
            dups = sum(1 for p in pairs if p[2] == 1)
            non_dups = total - dups

            cursor.execute(
                """
                INSERT INTO datasets (name, filename, source, description, total_rows, duplicate_rows, non_duplicate_rows, is_pair_format, used_in_training)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?);
                """,
                (meta["name"], meta["filename"], meta["source"], meta["description"], total, dups, non_dups, meta["used_in_training"])
            )
            dataset_id = cursor.lastrowid

            # Insert question pairs
            cursor.executemany(
                """
                INSERT INTO question_pairs (dataset_id, question1, question2, is_duplicate, category)
                VALUES (?, ?, ?, ?, ?);
                """,
                [(dataset_id, p[0], p[1], p[2], p[3]) for p in pairs]
            )

        conn.commit()
        logger.info("Seeded datasets and pairs successfully.")

    conn.close()


if __name__ == "__main__":
    seed_database_if_empty()
    print("Database seeding completed.")
