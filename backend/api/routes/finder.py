from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.api.schemas import (
    FindSimilarRequest,
    FindSimilarResponse,
    MatchItem,
    SuggestResponse,
    SuggestItem
)
from backend.services.similarity_engine import similarity_engine

router = APIRouter(prefix="/api/v1", tags=["Duplicate Finder"])


@router.post("/find-similar", response_model=FindSimilarResponse, status_code=status.HTTP_200_OK)
async def find_similar_questions(payload: FindSimilarRequest) -> FindSimilarResponse:
    """
    Ranks stored questions against the input string and returns top matches
    sorted in descending or ascending order with optional category and threshold filtering.
    """
    question = payload.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'question' must be a non-empty string."
        )

    matches_data, method, total_count = similarity_engine.find_similar(
        question=question,
        limit=payload.limit,
        category=payload.category,
        threshold=payload.threshold,
        sort_by=payload.sort_by,
        page=payload.page,
        page_size=payload.page_size
    )

    matches = [
        MatchItem(
            id=item.get("id"),
            question=item["question"],
            similarity_score=item["similarity_score"],
            is_duplicate=item.get("is_duplicate", False),
            confidence=item.get("confidence", 0.5),
            category=item.get("category"),
            matched_terms=item.get("matched_terms"),
            explanation=item.get("explanation")
        )
        for item in matches_data
    ]

    return FindSimilarResponse(
        method=method,
        matches=matches,
        total_matches=total_count,
        page=payload.page,
        page_size=payload.page_size
    )


@router.get("/suggest", response_model=SuggestResponse, status_code=status.HTTP_200_OK)
async def autocomplete_suggestions(
    query: str = Query(..., min_length=2, description="Partial search query"),
    limit: int = Query(5, ge=1, le=10)
) -> SuggestResponse:
    """
    Smart question suggestions as user types in comparison or search boxes.
    """
    items = similarity_engine.suggest_questions(query, limit=limit)
    return SuggestResponse(
        suggestions=[SuggestItem(question=i["question"], category=i["category"]) for i in items]
    )
