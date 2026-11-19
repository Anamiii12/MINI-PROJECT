import json
from datetime import datetime
from fastapi import APIRouter, status
from fastapi.responses import Response

from backend.database.db import get_db_connection
from backend.api.schemas import (
    DashboardStatsResponse,
    ActivityItem,
    CategoryCount
)

router = APIRouter(prefix="/api/v1", tags=["Analytics & Dashboard"])


@router.get("/dashboard/stats", response_model=DashboardStatsResponse, status_code=status.HTTP_200_OK)
async def get_dashboard_statistics() -> DashboardStatsResponse:
    """
    Computes all dashboard metrics directly from live SQLite data:
    - Questions count
    - Duplicate pairs count
    - Datasets count
    - Real model accuracy and F1-score from latest active model run
    - Category distribution
    - Recent detection activities
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total questions
    cursor.execute("SELECT COUNT(*) as count FROM questions;")
    total_q = cursor.fetchone()["count"]

    # Total unique question texts
    cursor.execute("SELECT COUNT(DISTINCT question) as count FROM questions;")
    unique_q = cursor.fetchone()["count"]

    # Datasets count
    cursor.execute("SELECT COUNT(*) as count FROM datasets;")
    total_datasets = cursor.fetchone()["count"]

    # Duplicate vs Non-Duplicate pairs count
    cursor.execute(
        """
        SELECT
            SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicates,
            SUM(CASE WHEN is_duplicate = 0 THEN 1 ELSE 0 END) as non_duplicates
        FROM question_pairs;
        """
    )
    pair_counts = cursor.fetchone()
    dup_pairs = pair_counts["duplicates"] or 0
    non_dup_pairs = pair_counts["non_duplicates"] or 0

    # Average similarity score from prediction history
    cursor.execute("SELECT AVG(similarity_score) as avg_score FROM prediction_history;")
    avg_score_row = cursor.fetchone()
    avg_sim = round(float(avg_score_row["avg_score"] or 0.0), 3)

    # Active model performance from model_runs
    cursor.execute(
        """
        SELECT model_name, version, accuracy, precision, recall, f1_score
        FROM model_runs
        WHERE is_active = 1
        ORDER BY id DESC
        LIMIT 1;
        """
    )
    active_run = cursor.fetchone()
    if not active_run:
        # Fallback to most recent run
        cursor.execute("SELECT model_name, version, accuracy, precision, recall, f1_score FROM model_runs ORDER BY id DESC LIMIT 1;")
        active_run = cursor.fetchone()

    if active_run:
        model_name = active_run["model_name"]
        version = active_run["version"]
        acc = round(float(active_run["accuracy"]), 3)
        prec = round(float(active_run["precision"]), 3)
        rec = round(float(active_run["recall"]), 3)
        f1 = round(float(active_run["f1_score"]), 3)
    else:
        model_name = "No evaluated model"
        version = ""
        acc, prec, rec, f1 = 0.0, 0.0, 0.0, 0.0

    # Category distribution
    cursor.execute(
        """
        SELECT category, COUNT(*) as count
        FROM questions
        GROUP BY category
        ORDER BY count DESC;
        """
    )
    cat_rows = cursor.fetchall()
    categories = [CategoryCount(category=r["category"], count=r["count"]) for r in cat_rows]

    # Recent activity feed
    cursor.execute(
        """
        SELECT 'prediction' as type, question1 as title,
               'Compared with: ' || question2 || ' (' || CASE WHEN is_duplicate = 1 THEN 'Duplicate' ELSE 'Non-Duplicate' END || ')' as details,
               similarity_score as score, created_at
        FROM prediction_history
        ORDER BY id DESC
        LIMIT 6;
        """
    )
    pred_activities = cursor.fetchall()

    activities = []
    for r in pred_activities:
        activities.append(ActivityItem(
            type="compare",
            title=r["title"][:70] + ("..." if len(r["title"]) > 70 else ""),
            details=r["details"],
            score=round(float(r["score"]), 3) if r["score"] else None,
            timestamp=str(r["created_at"])
        ))

    conn.close()

    return DashboardStatsResponse(
        total_questions=total_q,
        total_duplicate_pairs=dup_pairs,
        total_datasets=total_datasets,
        unique_questions=unique_q,
        average_similarity_score=avg_sim,
        model_accuracy=acc,
        model_f1_score=f1,
        model_precision=prec,
        model_recall=rec,
        active_model_name=model_name,
        model_version=version,
        recent_activities=activities,
        category_distribution=categories,
        duplicate_vs_non_duplicate={
            "duplicates": dup_pairs,
            "non_duplicates": non_dup_pairs
        }
    )


@router.get("/analytics/report")
async def generate_viva_report():
    """
    Generates a comprehensive project evaluation report in Markdown format.
    Suitable for college evaluation, project submission, and viva preparation.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch stats
    total_q = cursor.execute("SELECT COUNT(*) FROM questions;").fetchone()[0]
    total_pairs = cursor.execute("SELECT COUNT(*) FROM question_pairs;").fetchone()[0]
    datasets = cursor.execute("SELECT name, total_rows, duplicate_rows, source FROM datasets;").fetchall()
    models = cursor.execute(
        "SELECT model_name, accuracy, precision, recall, f1_score, roc_auc, training_time_sec, is_active FROM model_runs ORDER BY id DESC LIMIT 4;"
    ).fetchall()
    history_count = cursor.execute("SELECT COUNT(*) FROM prediction_history;").fetchone()[0]
    conn.close()

    md = f"""# QuerySense Project Report: Intelligent Duplicate Question Detection
**Generated Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**System:** QuerySense duplicate-question analysis service

---

## 1. Executive Summary
QuerySense compares question text using TF-IDF, token and character overlap features, a truncated-SVD representation, and supervised classifiers trained from registered question-pair datasets.

---

## 2. Dataset Corpus Summary
- **Total Candidate Questions Stored:** {total_q}
- **Total Labeled Question Pairs:** {total_pairs}
- **Comparison Queries Executed:** {history_count}

### Active Datasets
| Dataset Name | Total Pairs / Rows | Duplicate Count | License / Source |
| :--- | :--- | :--- | :--- |
"""
    for d in datasets:
        md += f"| {d['name']} | {d['total_rows']} | {d['duplicate_rows']} | {d['source']} |\n"

    md += """
---

## 3. Model Performance Evaluation
All models are evaluated on a held-out test split (20% stratified) without data leakage.

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for m in models:
        active_label = "Active (Best)" if m["is_active"] else "Benchmark"
        auc_str = f"{m['roc_auc']:.3f}" if m['roc_auc'] else "N/A"
        md += f"| {m['model_name']} | {m['accuracy']*100:.1f}% | {m['precision']*100:.1f}% | {m['recall']*100:.1f}% | {m['f1_score']*100:.1f}% | {auc_str} | {active_label} |\n"

    md += """
---

## 4. Interpretation
The TF-IDF baseline reports cosine similarity. Classifier methods report the model's duplicate-class probability. These score types are not interchangeable. Evaluation metrics are included only when a training run has been recorded.

---
*QuerySense — Department of Computer Science & Engineering*
"""
    return Response(
        content=md.encode("utf-8"),
        media_type="text/markdown",
        headers={"Content-Disposition": "attachment; filename=QuerySense_Technical_Report.md"}
    )
