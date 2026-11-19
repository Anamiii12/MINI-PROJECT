from fastapi import APIRouter, HTTPException, status
from backend.api.schemas import PredictRequest, PredictResponse, ExplanationDetails
from backend.services.similarity_engine import similarity_engine

router = APIRouter(prefix="/api/v1", tags=["Prediction"])


@router.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK)
async def predict_duplicate_pair(payload: PredictRequest) -> PredictResponse:
    """
    Compares two questions and predicts whether they are semantic duplicates.
    Supports model selection, explainable results, confidence estimation,
    and returns token/phrase overlap breakdowns.
    """
    q1 = payload.question1.strip()
    q2 = payload.question2.strip()

    if not q1 or not q2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both 'question1' and 'question2' must be non-empty strings."
        )

    res = similarity_engine.compare_pair_full(q1, q2, model_name=payload.model_name)
    explanation = res.get("explanation")

    return PredictResponse(
        is_duplicate=res["is_duplicate"],
        similarity_score=res["similarity_score"],
        confidence=res["confidence"],
        label=res["label"],
        method=res["method"],
        model_version=res["model_version"],
        explanation=ExplanationDetails(**explanation) if explanation else None
    )
