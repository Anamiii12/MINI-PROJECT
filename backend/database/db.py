"""
QuerySense Database Layer (SQLite)
Manages connection, schema initialization, migrations, and CRUD operations.
Thread-safe and persistent across application sessions.
"""
import os
import sqlite3
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

DB_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("QUERYSENSE_DB_PATH", DB_DIR / "querysense.db")).expanduser()
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with dict-like row factory and WAL mode."""
    conn = sqlite3.connect(str(DB_PATH), timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    conn.execute("PRAGMA busy_timeout=30000;")
    return conn


def init_db():
    """Initializes tables and indexes if they do not exist."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        filename TEXT,
        source TEXT,
        description TEXT,
        total_rows INTEGER DEFAULT 0,
        duplicate_rows INTEGER DEFAULT 0,
        non_duplicate_rows INTEGER DEFAULT 0,
        is_pair_format BOOLEAN DEFAULT 1,
        used_in_training BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL UNIQUE,
        category TEXT DEFAULT 'General',
        source_dataset_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

    CREATE TABLE IF NOT EXISTS question_pairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dataset_id INTEGER NOT NULL,
        question1 TEXT NOT NULL,
        question2 TEXT NOT NULL,
        is_duplicate INTEGER NOT NULL,
        category TEXT DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_pairs_dataset ON question_pairs(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_pairs_is_dup ON question_pairs(is_duplicate);

    CREATE TABLE IF NOT EXISTS model_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL,
        version TEXT NOT NULL,
        accuracy REAL NOT NULL,
        precision REAL NOT NULL,
        recall REAL NOT NULL,
        f1_score REAL NOT NULL,
        roc_auc REAL,
        confusion_matrix TEXT NOT NULL,
        train_samples INTEGER NOT NULL,
        test_samples INTEGER NOT NULL,
        training_time_sec REAL NOT NULL,
        datasets_used TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question1 TEXT NOT NULL,
        question2 TEXT NOT NULL,
        model_name TEXT NOT NULL,
        similarity_score REAL NOT NULL,
        is_duplicate BOOLEAN NOT NULL,
        confidence REAL NOT NULL,
        feedback TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_history_created ON prediction_history(created_at DESC);

    CREATE TABLE IF NOT EXISTS finder_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_question TEXT NOT NULL,
        top_match TEXT,
        similarity_score REAL,
        category TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    logger.info("Database schema verified at %s", DB_PATH)
