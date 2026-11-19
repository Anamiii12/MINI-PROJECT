from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from backend.database.db import get_db_connection
from backend.api.schemas import FeedbackRequest, FeedbackResponse

router = APIRouter(prefix="/api/v1", tags=["History & Feedback"])


@router.get("/history", status_code=status.HTTP_200_OK)
async def get_prediction_history(limit: int = Query(50, ge=1, le=100)):
    """Retrieves previous question comparison predictions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        """
        SELECT id, question1, question2, model_name, similarity_score,
               is_duplicate, confidence, feedback, created_at
        FROM prediction_history
        ORDER BY id DESC
        LIMIT ?;
        """,
        (limit,)
    ).fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "question1": r["question1"],
            "question2": r["question2"],
            "model_name": r["model_name"],
            "similarity_score": round(float(r["similarity_score"]), 3),
            "is_duplicate": bool(r["is_duplicate"]),
            "confidence": round(float(r["confidence"]), 3) if r["confidence"] else 0.75,
            "feedback": r["feedback"],
            "created_at": str(r["created_at"])
        }
        for r in rows
    ]


@router.delete("/history", status_code=status.HTTP_200_OK)
async def clear_prediction_history():
    """Clears all stored prediction comparison logs."""
    conn = get_db_connection()
    conn.execute("DELETE FROM prediction_history;")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Prediction history cleared."}


@router.get("/finder-history", status_code=status.HTTP_200_OK)
async def get_finder_history(limit: int = Query(30, ge=1, le=100)):
    """Retrieves search queries from Duplicate Finder."""
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        """
        SELECT id, query_question, top_match, similarity_score, category, created_at
        FROM finder_history
        ORDER BY id DESC
        LIMIT ?;
        """,
        (limit,)
    ).fetchall()
    conn.close()

    return [
        {
            "id": r["id"],
            "query_question": r["query_question"],
            "top_match": r["top_match"],
            "similarity_score": round(float(r["similarity_score"]), 3) if r["similarity_score"] else None,
            "category": r["category"],
            "created_at": str(r["created_at"])
        }
        for r in rows
    ]


@router.delete("/finder-history", status_code=status.HTTP_200_OK)
async def clear_finder_history():
    """Clears duplicate search history."""
    conn = get_db_connection()
    conn.execute("DELETE FROM finder_history;")
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Search history cleared."}


@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_200_OK)
async def submit_prediction_feedback(payload: FeedbackRequest) -> FeedbackResponse:
    """
    Records human evaluation feedback for predictions:
    - 'correct_duplicate'
    - 'incorrect_duplicate'
    - 'not_duplicate'
    Stored for future model retraining cycles without unverified auto-training.
    """
    valid_feedback = ["correct_duplicate", "incorrect_duplicate", "not_duplicate"]
    if payload.feedback not in valid_feedback:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feedback. Must be one of: {', '.join(valid_feedback)}"
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    if payload.prediction_id:
        cursor.execute(
            "UPDATE prediction_history SET feedback = ? WHERE id = ?;",
            (payload.feedback, payload.prediction_id)
        )
    elif payload.question1 and payload.question2:
        # Match latest row with matching questions
        cursor.execute(
            """
            UPDATE prediction_history
            SET feedback = ?
            WHERE id = (
                SELECT id FROM prediction_history
                WHERE question1 = ? AND question2 = ?
                ORDER BY id DESC LIMIT 1
            );
            """,
            (payload.feedback, payload.question1, payload.question2)
        )
    else:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'prediction_id' or both 'question1' and 'question2' must be provided."
        )

    conn.commit()
    conn.close()

    return FeedbackResponse(
        status="success",
        message="Thank you! Feedback recorded for model audit and dataset refinement."
    )
