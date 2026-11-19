import csv
import io
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from fastapi.responses import Response

from backend.database.db import get_db_connection
from backend.services.similarity_engine import similarity_engine
from backend.services.categorizer import categorizer
from backend.api.schemas import (
    DatasetAnalysisRequest,
    DatasetAnalysisResponse,
    DatasetPair,
    DatasetMetaItem
)

router = APIRouter(prefix="/api/v1", tags=["Dataset Management"])


@router.post("/analyze-dataset", response_model=DatasetAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_dataset_batch(payload: DatasetAnalysisRequest) -> DatasetAnalysisResponse:
    """
    Compares every unique pair (i, j) where 1 <= i < j <= min(N, 150).
    Returns summary statistics and all candidate pairs exceeding threshold.
    """
    questions = payload.questions
    if len(questions) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 questions are required to analyze pairs."
        )

    total_q, analysed_q, highest_sim, raw_pairs, method = similarity_engine.analyze_dataset(
        questions=questions,
        threshold=payload.threshold
    )

    pairs = [
        DatasetPair(
            row1=p["row1"],
            row2=p["row2"],
            question1=p["question1"],
            question2=p["question2"],
            similarity_score=p["similarity_score"],
            ml_score=p.get("ml_score"),
            is_duplicate=p.get("is_duplicate"),
            confidence=p.get("confidence"),
            category=p.get("category")
        )
        for p in raw_pairs
    ]

    return DatasetAnalysisResponse(
        total_questions=total_q,
        analysed_questions=analysed_q,
        highest_similarity=highest_sim,
        threshold=payload.threshold,
        method=method,
        pairs=pairs
    )


@router.get("/datasets", response_model=List[DatasetMetaItem], status_code=status.HTTP_200_OK)
async def list_datasets() -> List[DatasetMetaItem]:
    """Retrieves all registered datasets with record counts and training statuses."""
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        """
        SELECT id, name, filename, source, description, total_rows,
               duplicate_rows, non_duplicate_rows, is_pair_format,
               used_in_training, created_at
        FROM datasets
        ORDER BY id ASC;
        """
    ).fetchall()
    conn.close()

    return [
        DatasetMetaItem(
            id=r["id"],
            name=r["name"],
            filename=r["filename"],
            source=r["source"],
            description=r["description"],
            total_rows=r["total_rows"],
            duplicate_rows=r["duplicate_rows"],
            non_duplicate_rows=r["non_duplicate_rows"],
            is_pair_format=bool(r["is_pair_format"]),
            used_in_training=bool(r["used_in_training"]),
            created_at=str(r["created_at"])
        )
        for r in rows
    ]


@router.post("/datasets/upload", status_code=status.HTTP_201_CREATED)
async def upload_custom_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    source: Optional[str] = Form("User Upload"),
    description: Optional[str] = Form("Custom uploaded question dataset")
):
    """
    Accepts CSV upload. Auto-detects structure:
    - Pair format: (question1, question2, is_duplicate)
    - Single question format: (question, optional category)
    Cleans data, inserts into SQLite, and updates candidate repository.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files (.csv) are supported."
        )

    content = await file.read(2 * 1024 * 1024 + 1)
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="CSV uploads must be 2 MB or smaller.")
    try:
        decoded = content.decode("utf-8-sig")
    except Exception:
        decoded = content.decode("latin-1")

    reader = csv.reader(io.StringIO(decoded))
    header = next(reader, None)
    if not header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded CSV file is empty.")

    header_clean = [h.strip().lower() for h in header]

    # Detect pair format vs single questions
    is_pair = ("question1" in header_clean and "question2" in header_clean) or ("q1" in header_clean and "q2" in header_clean)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id FROM datasets WHERE name = ?;", (name.strip(),))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A dataset named '{name.strip()}' already exists. Please use a distinct name."
            )

        if is_pair:
            # Question Pair CSV
            q1_idx = header_clean.index("question1") if "question1" in header_clean else header_clean.index("q1")
            q2_idx = header_clean.index("question2") if "question2" in header_clean else header_clean.index("q2")
            dup_idx = header_clean.index("is_duplicate") if "is_duplicate" in header_clean else (header_clean.index("duplicate") if "duplicate" in header_clean else -1)
            cat_idx = header_clean.index("category") if "category" in header_clean else -1

            pairs = []
            for row in reader:
                if len(row) <= max(q1_idx, q2_idx):
                    continue
                q1 = row[q1_idx].strip()
                q2 = row[q2_idx].strip()
                if not q1 or not q2 or len(q1) > 1000 or len(q2) > 1000:
                    continue

                is_dup = 0
                if dup_idx != -1 and len(row) > dup_idx:
                    val = row[dup_idx].strip().lower()
                    if val in ("1", "true", "yes", "duplicate"):
                        is_dup = 1

                cat = row[cat_idx].strip() if (cat_idx != -1 and len(row) > cat_idx and row[cat_idx].strip()) else categorizer.predict_category(q1)
                pairs.append((q1, q2, is_dup, cat))
                if len(pairs) > 10000:
                    raise HTTPException(status_code=413, detail="CSV uploads are limited to 10,000 rows.")

            if not pairs:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid question pairs found in CSV.")

            total = len(pairs)
            dups = sum(1 for p in pairs if p[2] == 1)
            non_dups = total - dups

            cursor.execute(
                """
                INSERT INTO datasets (name, filename, source, description, total_rows, duplicate_rows, non_duplicate_rows, is_pair_format, used_in_training)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0);
                """,
                (name.strip(), file.filename, source, description, total, dups, non_dups)
            )
            dataset_id = cursor.lastrowid

            cursor.executemany(
                """
                INSERT INTO question_pairs (dataset_id, question1, question2, is_duplicate, category)
                VALUES (?, ?, ?, ?, ?);
                """,
                [(dataset_id, p[0], p[1], p[2], p[3]) for p in pairs]
            )

        else:
            # Single Question Repository CSV
            q_idx = -1
            for col in ["question", "questions", "text", "query"]:
                if col in header_clean:
                    q_idx = header_clean.index(col)
                    break
            if q_idx == -1:
                q_idx = 0  # Fallback to first column

            cat_idx = header_clean.index("category") if "category" in header_clean else -1

            questions = []
            for row in reader:
                if len(row) <= q_idx:
                    continue
                q = row[q_idx].strip()
                if not q or len(q) > 1000:
                    continue
                cat = row[cat_idx].strip() if (cat_idx != -1 and len(row) > cat_idx and row[cat_idx].strip()) else categorizer.predict_category(q)
                questions.append((q, cat))
                if len(questions) > 10000:
                    raise HTTPException(status_code=413, detail="CSV uploads are limited to 10,000 rows.")

            if not questions:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid questions found in CSV.")

            cursor.execute(
                """
                INSERT INTO datasets (name, filename, source, description, total_rows, duplicate_rows, non_duplicate_rows, is_pair_format, used_in_training)
                VALUES (?, ?, ?, ?, ?, 0, ?, 0, 0);
                """,
                (name.strip(), file.filename, source, description, len(questions), len(questions))
            )
            dataset_id = cursor.lastrowid

            for q, cat in questions:
                cursor.execute(
                    "INSERT OR IGNORE INTO questions (question, category, source_dataset_id) VALUES (?, ?, ?);",
                    (q, cat, dataset_id)
                )

        conn.commit()
    finally:
        conn.close()

    # Refresh cached candidate questions for duplicate finder
    similarity_engine.reload_candidates()

    return {
        "status": "success",
        "dataset_id": dataset_id,
        "name": name.strip(),
        "is_pair_format": is_pair,
        "message": f"Successfully imported {file.filename}."
    }


@router.delete("/datasets/{dataset_id}", status_code=status.HTTP_200_OK)
async def delete_dataset(dataset_id: int):
    """Deletes an uploaded dataset and its associated pairs/questions."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name FROM datasets WHERE id = ?;", (dataset_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    # Prevent deleting primary benchmark if desired, or allow with cascade
    cursor.execute("DELETE FROM question_pairs WHERE dataset_id = ?;", (dataset_id,))
    cursor.execute("DELETE FROM questions WHERE source_dataset_id = ?;", (dataset_id,))
    cursor.execute("DELETE FROM datasets WHERE id = ?;", (dataset_id,))
    conn.commit()
    conn.close()

    similarity_engine.reload_candidates()

    return {"status": "success", "message": f"Dataset '{existing['name']}' deleted."}


@router.get("/datasets/{dataset_id}/preview", status_code=status.HTTP_200_OK)
async def preview_dataset(dataset_id: int, limit: int = 20):
    """Returns sample records from the dataset."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, is_pair_format FROM datasets WHERE id = ?;", (dataset_id,))
    d = cursor.fetchone()
    if not d:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    if d["is_pair_format"]:
        rows = cursor.execute(
            """
            SELECT id, question1, question2, is_duplicate, category
            FROM question_pairs
            WHERE dataset_id = ?
            LIMIT ?;
            """,
            (dataset_id, limit)
        ).fetchall()
        records = [dict(r) for r in rows]
    else:
        rows = cursor.execute(
            """
            SELECT id, question, category
            FROM questions
            WHERE source_dataset_id = ?
            LIMIT ?;
            """,
            (dataset_id, limit)
        ).fetchall()
        records = [dict(r) for r in rows]

    conn.close()
    return {"dataset_name": d["name"], "is_pair_format": bool(d["is_pair_format"]), "records": records}


@router.get("/datasets/{dataset_id}/download")
async def download_cleaned_dataset(dataset_id: int):
    """Downloads cleaned dataset as CSV."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, filename, is_pair_format FROM datasets WHERE id = ?;", (dataset_id,))
    d = cursor.fetchone()
    if not d:
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")

    output = io.StringIO()
    writer = csv.writer(output)

    if d["is_pair_format"]:
        writer.writerow(["question1", "question2", "is_duplicate", "category"])
        rows = cursor.execute(
            "SELECT question1, question2, is_duplicate, category FROM question_pairs WHERE dataset_id = ?;",
            (dataset_id,)
        ).fetchall()
        for r in rows:
            writer.writerow([r["question1"], r["question2"], r["is_duplicate"], r["category"]])
    else:
        writer.writerow(["question", "category"])
        rows = cursor.execute(
            "SELECT question, category FROM questions WHERE source_dataset_id = ?;",
            (dataset_id,)
        ).fetchall()
        for r in rows:
            writer.writerow([r["question"], r["category"]])

    conn.close()
    csv_bytes = output.getvalue().encode("utf-8")
    filename = d["filename"] or f"dataset_{dataset_id}_cleaned.csv"

    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
