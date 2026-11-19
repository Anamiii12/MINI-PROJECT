from typing import List
from fastapi import APIRouter, Query, status

from backend.services.similarity_engine import similarity_engine
from backend.api.schemas import ExplorerCluster

router = APIRouter(prefix="/api/v1", tags=["Duplicate Question Explorer"])


@router.get("/explorer/clusters", response_model=List[ExplorerCluster], status_code=status.HTTP_200_OK)
async def get_duplicate_clusters(
    min_similarity: float = Query(0.55, ge=0.3, le=0.95, description="Cluster similarity threshold")
) -> List[ExplorerCluster]:
    """
    Groups questions in the repository into connected duplicate clusters.
    Allows users to explore related and duplicate inquiry groups.
    """
    clusters_data = similarity_engine.get_duplicate_clusters(min_similarity=min_similarity)
    return [
        ExplorerCluster(
            cluster_id=c["cluster_id"],
            primary_question=c["primary_question"],
            category=c["category"],
            question_count=c["question_count"],
            questions=c["questions"]
        )
        for c in clusters_data
    ]
