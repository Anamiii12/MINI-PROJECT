import time
import pytest
from fastapi.testclient import TestClient

try:
    from backend.main import app
except ImportError:
    from main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


# ==========================================
# 1. Health & Startup Pre-warming Tests
# ==========================================

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["warmed_up"] is True
    assert data["candidates_count"] >= 90


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "method" in data


# ==========================================
# 2. Endpoint 1: Single Pair Comparison Tests
# ==========================================

def test_predict_duplicate_questions(client):
    payload = {
        "question1": "How can I learn Python?",
        "question2": "What is the best way to learn Python?"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "is_duplicate" in data
    assert "similarity_score" in data
    assert "label" in data
    assert "method" in data

    assert isinstance(data["is_duplicate"], bool)
    assert isinstance(data["similarity_score"], float)
    assert 0.0 <= data["similarity_score"] <= 1.0
    assert data["is_duplicate"] is True
    assert data["label"] == "Duplicate"
    assert data["similarity_score"] >= 0.60
    assert data["method"] == "TF-IDF + Cosine Similarity"


def test_predict_non_duplicate_questions(client):
    payload = {
        "question1": "How do I install Python on Windows?",
        "question2": "What is cloud computing?"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_duplicate"] is False
    assert data["label"] == "Non-Duplicate"
    assert data["similarity_score"] < 0.60


def test_predict_identical_questions(client):
    payload = {
        "question1": "How do I make coffee?",
        "question2": "How do I make coffee?"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_duplicate"] is True
    assert data["similarity_score"] == 1.0
    assert data["label"] == "Duplicate"


def test_predict_validation_errors(client):
    # Empty string
    res1 = client.post("/api/v1/predict", json={"question1": "", "question2": "Valid question"})
    assert res1.status_code in (400, 422)
    assert "detail" in res1.json()

    # Whitespace only
    res2 = client.post("/api/v1/predict", json={"question1": "    ", "question2": "Valid question"})
    assert res2.status_code in (400, 422)
    assert "detail" in res2.json()

    # Missing field
    res3 = client.post("/api/v1/predict", json={"question1": "Only one question"})
    assert res3.status_code == 422
    assert "detail" in res3.json()


# ==========================================
# 3. Endpoint 2: Duplicate Finder Tests
# ==========================================

def test_find_similar_questions(client):
    payload = {
        "question": "How can I learn Python?",
        "limit": 5
    }
    response = client.post("/api/v1/find-similar", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "method" in data
    assert "matches" in data
    assert isinstance(data["matches"], list)
    assert len(data["matches"]) <= 5
    assert len(data["matches"]) > 0

    # Ensure descending order of similarity score
    scores = [m["similarity_score"] for m in data["matches"]]
    assert scores == sorted(scores, reverse=True)

    # Check match structure
    first_match = data["matches"][0]
    assert "question" in first_match
    assert "similarity_score" in first_match
    assert "category" in first_match
    assert "matched_terms" in first_match
    assert 0.0 <= first_match["similarity_score"] <= 1.0


def test_find_similar_custom_limit(client):
    payload = {
        "question": "What is machine learning?",
        "limit": 3
    }
    response = client.post("/api/v1/find-similar", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["matches"]) == 3


def test_find_similar_validation_error(client):
    res = client.post("/api/v1/find-similar", json={"question": "   ", "limit": 5})
    assert res.status_code in (400, 422)
    assert "detail" in res.json()


# ==========================================
# 4. Endpoint 3: Dataset Batch Analyzer Tests
# ==========================================

def test_analyze_dataset_success(client):
    questions = [
        "How can I learn Python?",
        "What is the best way to learn Python?",
        "How do I cook pasta?"
    ]
    payload = {
        "questions": questions,
        "threshold": 0.5
    }
    response = client.post("/api/v1/analyze-dataset", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total_questions"] == 3
    assert data["analysed_questions"] == 3
    assert "highest_similarity" in data
    assert "threshold" in data
    assert data["threshold"] == 0.5
    assert "method" in data
    assert "pairs" in data
    assert isinstance(data["pairs"], list)

    # Validate pairs
    seen = set()
    for pair in data["pairs"]:
        assert 1 <= pair["row1"] < pair["row2"] <= 3
        assert pair["similarity_score"] >= data["threshold"]
        assert pair["similarity_score"] <= data["highest_similarity"]
        key = (pair["row1"], pair["row2"])
        assert key not in seen
        seen.add(key)

    # Validate pair sorting descending
    pair_scores = [p["similarity_score"] for p in data["pairs"]]
    assert pair_scores == sorted(pair_scores, reverse=True)


def test_analyze_dataset_highest_similarity_with_no_matches(client):
    # Questions that are distinct, with high threshold 0.99
    questions = [
        "How can I learn Python?",
        "What is the best way to bake bread?",
        "How do airplanes stay in the air?"
    ]
    payload = {
        "questions": questions,
        "threshold": 0.99
    }
    response = client.post("/api/v1/analyze-dataset", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["pairs"] == []
    # highest_similarity must reflect the maximum score found across all evaluated pairs, even if no pair exceeds threshold
    assert 0.0 <= data["highest_similarity"] < 0.99


def test_analyze_dataset_cap_at_100_questions(client):
    questions = [f"This is sample test question number {i}" for i in range(105)]
    payload = {
        "questions": questions,
        "threshold": 0.8
    }
    response = client.post("/api/v1/analyze-dataset", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["total_questions"] == 105
    assert data["analysed_questions"] == 100


def test_analyze_dataset_validation_fewer_than_two(client):
    payload = {
        "questions": ["Only one question"],
        "threshold": 0.5
    }
    response = client.post("/api/v1/analyze-dataset", json=payload)
    assert response.status_code in (400, 422)
    assert "detail" in response.json()


def test_analyze_dataset_empty_question_in_list(client):
    payload = {
        "questions": ["Valid question 1", "   "],
        "threshold": 0.5
    }
    response = client.post("/api/v1/analyze-dataset", json=payload)
    assert response.status_code in (400, 422)
    assert "detail" in response.json()


# ==========================================
# 5. Global Error Handling & Contract Tests
# ==========================================

def test_global_404_handler(client):
    response = client.get("/api/v1/nonexistent-route")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data


# ==========================================
# 6. Performance / Low-Latency Inference Test
# ==========================================

def test_prediction_latency_under_100ms(client):
    # Warm call
    payload = {
        "question1": "How can I learn Python?",
        "question2": "What is the best way to learn Python?"
    }
    start = time.perf_counter()
    response = client.post("/api/v1/predict", json=payload)
    elapsed_ms = (time.perf_counter() - start) * 1000

    assert response.status_code == 200
    # Pre-warmed model should complete in well under 100ms
    assert elapsed_ms < 100, f"Inference took {elapsed_ms:.2f}ms, expected < 100ms"
