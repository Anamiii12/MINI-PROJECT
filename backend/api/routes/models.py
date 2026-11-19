import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.database.db import get_db_connection
from backend.ml.trainer import training_pipeline
from backend.api.schemas import TrainRequest, TrainResponse, ModelInfoItem

router = APIRouter(prefix="/api/v1", tags=["Models & Evaluation"])


@router.get("/models", response_model=List[ModelInfoItem], status_code=status.HTTP_200_OK)
async def list_models() -> List[ModelInfoItem]:
    """
    Returns latest evaluation metrics, confusion matrices, and statuses
    for all 4 model architectures.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query latest run for each distinct model_name
    query = """
    SELECT m.*
    FROM model_runs m
    INNER JOIN (
        SELECT model_name, MAX(id) as max_id
        FROM model_runs
        GROUP BY model_name
    ) latest ON m.id = latest.max_id
    ORDER BY m.f1_score DESC;
    """
    rows = cursor.execute(query).fetchall()
    conn.close()

    items = []
    for r in rows:
        cm = json.loads(r["confusion_matrix"]) if r["confusion_matrix"] else {"tn": 0, "fp": 0, "fn": 0, "tp": 0}
        datasets = json.loads(r["datasets_used"]) if r["datasets_used"] else []

        items.append(ModelInfoItem(
            model_name=r["model_name"],
            version=r["version"],
            accuracy=round(float(r["accuracy"]), 4),
            precision=round(float(r["precision"]), 4),
            recall=round(float(r["recall"]), 4),
            f1_score=round(float(r["f1_score"]), 4),
            roc_auc=round(float(r["roc_auc"]), 4) if r["roc_auc"] else None,
            confusion_matrix=cm,
            train_samples=r["train_samples"],
            test_samples=r["test_samples"],
            training_time_sec=round(float(r["training_time_sec"]), 3),
            datasets_used=datasets,
            is_active=bool(r["is_active"]),
            created_at=str(r["created_at"])
        ))

    return items


@router.post("/models/train", response_model=TrainResponse, status_code=status.HTTP_200_OK)
async def train_models_endpoint(payload: TrainRequest = TrainRequest()) -> TrainResponse:
    """
    Executes real training of all models on selected or all datasets.
    Computes genuine test evaluation metrics and saves trained artifacts to disk.
    Never fabricates metrics.
    """
    try:
        res = training_pipeline.run_training_and_evaluation(
            dataset_ids=payload.dataset_ids,
            version_tag=payload.version_tag
        )
        return TrainResponse(
            status=res["status"],
            version=res["version"],
            total_pairs=res["total_pairs"],
            train_count=res["train_count"],
            test_count=res["test_count"],
            best_model=res["best_model"],
            elapsed_seconds=res["elapsed_seconds"],
            datasets_used=res["datasets_used"],
            models=res["models"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )


@router.get("/models/history", status_code=status.HTTP_200_OK)
async def get_training_history():
    """Returns chronological log of all historical training cycles."""
    conn = get_db_connection()
    cursor = conn.cursor()
    rows = cursor.execute(
        """
        SELECT id, model_name, version, accuracy, precision, recall, f1_score,
               roc_auc, confusion_matrix, train_samples, test_samples,
               training_time_sec, datasets_used, is_active, created_at
        FROM model_runs
        ORDER BY id DESC
        LIMIT 50;
        """
    ).fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "id": r["id"],
            "model_name": r["model_name"],
            "version": r["version"],
            "accuracy": r["accuracy"],
            "precision": r["precision"],
            "recall": r["recall"],
            "f1_score": r["f1_score"],
            "roc_auc": r["roc_auc"],
            "confusion_matrix": json.loads(r["confusion_matrix"]) if r["confusion_matrix"] else {},
            "train_samples": r["train_samples"],
            "test_samples": r["test_samples"],
            "training_time_sec": r["training_time_sec"],
            "datasets_used": json.loads(r["datasets_used"]) if r["datasets_used"] else [],
            "is_active": bool(r["is_active"]),
            "created_at": str(r["created_at"])
        })

    return history
