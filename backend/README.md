# QuerySense Backend Service

High-performance, asynchronous Python **FastAPI** backend service for **QuerySense** — Intelligent Duplicate Question Detection.

---

## 🚀 Overview & Architecture

The QuerySense backend provides real-time natural language semantic similarity analysis and duplicate question detection using a dual-strategy inference engine:
- **Primary Strategy**: TF-IDF vectorization with sublinear scaling, unigram + bigram capture, punctuation stripping, lowercasing, stopword removal, and Cosine Similarity (via `scikit-learn`).
- **Alternative Strategy (Optional Upgrade)**: Sentence Transformers (`all-MiniLM-L6-v2`) / PyTorch deep semantic embeddings configurable via environment toggle.
- **Fast Startup & Low Latency**: Pre-computes candidate database vectors and warms up models during application startup using FastAPI's `lifespan` context manager, providing sub-100ms inference response times.

### Directory Structure

```plaintext
backend/
│
├── main.py                     # FastAPI entry point & CORS configuration
├── requirements.txt            # Dependencies (fastapi, uvicorn, scikit-learn, pydantic, numpy, pytest, httpx)
├── README.md                   # Backend documentation and API guide
│
├── api/
│   ├── routes/
│   │   ├── predict.py          # Handler for POST /api/v1/predict
│   │   ├── finder.py           # Handler for POST /api/v1/find-similar
│   │   └── dataset.py          # Handler for POST /api/v1/analyze-dataset
│   └── schemas.py              # Pydantic request/response models & validators
│
├── services/
│   ├── text_processor.py       # Cleaning, normalization, tokenization, stop words
│   ├── similarity_engine.py    # TF-IDF & Cosine Similarity logic + Transformer loader
│   └── candidate_repository.py # Repository of 90 seed benchmark questions across 15 categories
│
└── tests/
    └── test_endpoints.py       # Comprehensive pytest suite (16 tests)
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Python 3.10+ (tested and verified on Python 3.10 through 3.14)

### 2. Install Dependencies
From the `backend/` directory:
```bash
pip install -r requirements.txt
```

*(Optional) For deep transformer semantic matching:*
```bash
pip install sentence-transformers
```

---

## 🏃 Running the Service

### Development Mode (with hot-reload)
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Or directly with Python:
```bash
python main.py
```

- **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📡 API Endpoints & JSON Contracts

### 1. Single Pair Comparison
* **Route**: `POST /api/v1/predict`
* **Description**: Compares two questions and predicts whether they are semantic duplicates. Duplicate threshold is $\ge 0.60$.

#### Request:
```json
{
  "question1": "How can I learn Python?",
  "question2": "What is the best way to learn Python?"
}
```

#### Response:
```json
{
  "is_duplicate": true,
  "similarity_score": 0.644,
  "label": "Duplicate",
  "method": "TF-IDF + Cosine Similarity"
}
```

---

### 2. Duplicate Finder
* **Route**: `POST /api/v1/find-similar`
* **Description**: Searches the benchmark candidate database for questions semantically similar to the input query, ranking results by cosine similarity score.

#### Request:
```json
{
  "question": "How can I learn Python?",
  "limit": 5
}
```

#### Response:
```json
{
  "method": "TF-IDF + Cosine Similarity",
  "matches": [
    {
      "question": "What is the best way to learn Python?",
      "similarity_score": 0.644,
      "category": "Programming",
      "matched_terms": ["learn", "python"]
    },
    {
      "question": "How should a beginner start learning Python?",
      "similarity_score": 0.512,
      "category": "Programming",
      "matched_terms": ["learn", "python"]
    }
  ]
}
```

---

### 3. Dataset Batch Analyzer
* **Route**: `POST /api/v1/analyze-dataset`
* **Description**: Performs pairwise comparison across an uploaded batch of questions ($1 \le i < j \le N$, capped at 100 questions per request). Only pairs with score $\ge \text{threshold}$ are returned. `highest_similarity` reflects the peak score found across all pairs.

#### Request:
```json
{
  "questions": [
    "How can I learn Python?",
    "What is the best way to learn Python?",
    "How do I cook pasta?"
  ],
  "threshold": 0.5
}
```

#### Response:
```json
{
  "total_questions": 3,
  "analysed_questions": 3,
  "highest_similarity": 0.644,
  "threshold": 0.5,
  "method": "TF-IDF + Cosine Similarity",
  "pairs": [
    {
      "row1": 1,
      "row2": 2,
      "question1": "How can I learn Python?",
      "question2": "What is the best way to learn Python?",
      "similarity_score": 0.644
    }
  ]
}
```

---

## 🛡️ Error Handling & Validation

All client-side validation errors, bad requests, missing parameters, and server exceptions return clean, standardized JSON objects matching:

```json
{
  "detail": "Descriptive error message"
}
```

Examples:
- Empty string or whitespace-only inputs trigger HTTP 422/400 with descriptive messages.
- Batch datasets with fewer than 2 questions trigger HTTP 422/400.
- Out-of-bounds parameters are rejected.

---

## 🧪 Running the Pytest Suite

Run all unit, contract, and latency tests:
```bash
pytest backend/tests -v
```

Expected output:
```
backend/tests/test_endpoints.py::test_health_check PASSED
backend/tests/test_endpoints.py::test_root_endpoint PASSED
backend/tests/test_endpoints.py::test_predict_duplicate_questions PASSED
backend/tests/test_endpoints.py::test_predict_non_duplicate_questions PASSED
backend/tests/test_endpoints.py::test_predict_identical_questions PASSED
backend/tests/test_endpoints.py::test_predict_validation_errors PASSED
backend/tests/test_endpoints.py::test_find_similar_questions PASSED
backend/tests/test_endpoints.py::test_find_similar_custom_limit PASSED
backend/tests/test_endpoints.py::test_find_similar_validation_error PASSED
backend/tests/test_endpoints.py::test_analyze_dataset_success PASSED
backend/tests/test_endpoints.py::test_analyze_dataset_highest_similarity_with_no_matches PASSED
backend/tests/test_endpoints.py::test_analyze_dataset_cap_at_100_questions PASSED
backend/tests/test_endpoints.py::test_analyze_dataset_validation_fewer_than_two PASSED
backend/tests/test_endpoints.py::test_analyze_dataset_empty_question_in_list PASSED
backend/tests/test_endpoints.py::test_global_404_handler PASSED
backend/tests/test_endpoints.py::test_prediction_latency_under_100ms PASSED
======================= 16 passed in 2.98s =======================
```

---

## ⚙️ Configuration & Environment Variables

| Variable | Default | Description |
|---|---|---|
| `USE_SENTENCE_TRANSFORMERS` | `false` | When set to `true`, attempts to load `all-MiniLM-L6-v2` for dense embeddings. Falls back to TF-IDF if unavailable. |
