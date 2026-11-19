from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class PredictRequest(BaseModel):
    question1: str = Field(..., description="First question to compare")
    question2: str = Field(..., description="Second question to compare")
    model_name: Optional[str] = Field(default=None, description="Model to use for inference")

    @field_validator("question1", "question2")
    @classmethod
    def validate_non_empty(cls, v: str, info) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError(f"'{info.field_name}' must be a non-empty string.")
        cleaned = v.strip()
        if len(cleaned) > 1000:
            raise ValueError(f"'{info.field_name}' exceeds maximum allowed length of 1000 characters.")
        return cleaned


class ExplanationDetails(BaseModel):
    summary: str
    is_duplicate: bool
    similarity_score: float
    similarity_percentage: float
    confidence: float
    confidence_percentage: float
    matched_words: List[str] = Field(default_factory=list)
    matched_phrases: List[str] = Field(default_factory=list)
    unique_to_question1: List[str] = Field(default_factory=list)
    unique_to_question2: List[str] = Field(default_factory=list)
    shared_token_count: int
    q1_token_count: int
    q2_token_count: int
    same_intent: bool
    reasons: List[str] = Field(default_factory=list)
    method: str
    model_version: str
    is_calibrated: bool = False


class PredictResponse(BaseModel):
    is_duplicate: bool = Field(..., description="True if questions are predicted duplicates")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score between 0.0 and 1.0")
    confidence: float = Field(default=0.75, ge=0.0, le=1.0, description="Model confidence indicator")
    label: str = Field(..., description="'Duplicate' or 'Non-Duplicate'")
    method: str = Field(default="Logistic Regression Classifier", description="Inference method used")
    model_version: str = Field(default="v2.0", description="Model version")
    explanation: Optional[ExplanationDetails] = None


class FindSimilarRequest(BaseModel):
    question: str = Field(..., description="Input question to find matches for")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of similar questions to return")
    category: Optional[str] = Field(default=None, description="Category filter (e.g. Programming, Education)")
    threshold: float = Field(default=0.0, ge=0.0, le=1.0, description="Minimum similarity threshold")
    sort_by: str = Field(default="highest", description="Sort order: 'highest' or 'lowest'")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=10, ge=1, le=50, description="Page size")

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("'question' must be a non-empty string.")
        cleaned = v.strip()
        if len(cleaned) > 1000:
            raise ValueError("'question' exceeds maximum allowed length of 1000 characters.")
        return cleaned


class MatchItem(BaseModel):
    id: Optional[int] = None
    question: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    is_duplicate: Optional[bool] = False
    confidence: Optional[float] = 0.5
    category: Optional[str] = None
    matched_terms: Optional[List[str]] = None
    explanation: Optional[str] = None


class FindSimilarResponse(BaseModel):
    method: str = Field(default="Hybrid TF-IDF + Calibrated ML Model")
    matches: List[MatchItem] = Field(default_factory=list)
    total_matches: int = 0
    page: int = 1
    page_size: int = 10


class SuggestItem(BaseModel):
    question: str
    category: str


class SuggestResponse(BaseModel):
    suggestions: List[SuggestItem] = Field(default_factory=list)


class DatasetAnalysisRequest(BaseModel):
    questions: List[str] = Field(..., description="List of questions to analyze in batch")
    threshold: float = Field(default=0.5, ge=0.0, le=1.0, description="Minimum similarity threshold")

    @field_validator("questions")
    @classmethod
    def validate_questions(cls, v: List[str]) -> List[str]:
        if not isinstance(v, list) or len(v) < 2:
            raise ValueError("'questions' must contain at least 2 questions.")
        cleaned_list: List[str] = []
        for idx, item in enumerate(v):
            if not isinstance(item, str) or not item.strip():
                raise ValueError(f"Question at index {idx} must be a non-empty string.")
            cleaned = item.strip()
            if len(cleaned) > 1000:
                raise ValueError(f"Question at index {idx} exceeds maximum allowed length of 1000 characters.")
            cleaned_list.append(cleaned)
        return cleaned_list


class DatasetPair(BaseModel):
    row1: int = Field(..., ge=1, description="1-indexed row number of first question")
    row2: int = Field(..., ge=1, description="1-indexed row number of second question")
    question1: str
    question2: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    ml_score: Optional[float] = None
    is_duplicate: Optional[bool] = None
    confidence: Optional[float] = None
    category: Optional[str] = None


class DatasetAnalysisResponse(BaseModel):
    total_questions: int
    analysed_questions: int
    highest_similarity: float = Field(..., ge=0.0, le=1.0)
    threshold: float = Field(..., ge=0.0, le=1.0)
    method: str = Field(default="Pairwise ML Classifier")
    pairs: List[DatasetPair] = Field(default_factory=list)


class ActivityItem(BaseModel):
    type: str
    title: str
    details: str
    timestamp: str
    score: Optional[float] = None


class CategoryCount(BaseModel):
    category: str
    count: int


class DashboardStatsResponse(BaseModel):
    total_questions: int
    total_duplicate_pairs: int
    total_datasets: int
    unique_questions: int
    average_similarity_score: float
    model_accuracy: float
    model_f1_score: float
    model_precision: float
    model_recall: float
    active_model_name: str
    model_version: str
    recent_activities: List[ActivityItem] = Field(default_factory=list)
    category_distribution: List[CategoryCount] = Field(default_factory=list)
    duplicate_vs_non_duplicate: Dict[str, int] = Field(default_factory=dict)


class FeedbackRequest(BaseModel):
    prediction_id: Optional[int] = None
    question1: Optional[str] = None
    question2: Optional[str] = None
    feedback: str = Field(..., description="'correct_duplicate', 'incorrect_duplicate', or 'not_duplicate'")


class FeedbackResponse(BaseModel):
    status: str
    message: str


class TrainRequest(BaseModel):
    dataset_ids: Optional[List[int]] = None
    version_tag: Optional[str] = None


class ModelInfoItem(BaseModel):
    model_name: str
    version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    confusion_matrix: Dict[str, int]
    train_samples: int
    test_samples: int
    training_time_sec: float
    datasets_used: List[str]
    is_active: bool
    created_at: str
    feature_importances: Optional[Dict[str, float]] = None


class TrainResponse(BaseModel):
    status: str
    version: str
    total_pairs: int
    train_count: int
    test_count: int
    best_model: str
    elapsed_seconds: float
    datasets_used: List[str]
    models: Dict[str, Any]


class DatasetMetaItem(BaseModel):
    id: int
    name: str
    filename: Optional[str] = None
    source: Optional[str] = None
    description: Optional[str] = None
    total_rows: int
    duplicate_rows: int
    non_duplicate_rows: int
    is_pair_format: bool
    used_in_training: bool
    created_at: str


class ExplorerCluster(BaseModel):
    cluster_id: int
    primary_question: str
    category: str
    question_count: int
    questions: List[str]
