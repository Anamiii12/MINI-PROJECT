import json
import urllib.request
import urllib.error
import urllib.parse
import sys

BASE_URL = "http://127.0.0.1:8000"

def log_test(name, status, details=""):
    print(f"[{status}] {name}{': ' + details if details else ''}")

def http_get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8")
        try:
            return resp.status, json.loads(body)
        except Exception:
            return resp.status, body

def http_post_json(path, data):
    url = f"{BASE_URL}{path}"
    body_bytes = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body_bytes,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode("utf-8")
        try:
            return resp.status, json.loads(body)
        except Exception:
            return resp.status, body

def http_delete(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"}, method="DELETE")
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8")
        try:
            return resp.status, json.loads(body)
        except Exception:
            return resp.status, body

def run_comprehensive_audit():
    results = {}

    print("=" * 60)
    print("QUERYSENSE FULL SYSTEM AUDIT - LIVE BACKEND API SUITE")
    print("=" * 60)

    # 1. Health & Root
    try:
        status, data = http_get("/health")
        assert status == 200 and data.get("status") == "healthy"
        log_test("GET /health", "PASSED", f"status={data.get('status')}")
        results["health_check"] = "PASSED"
    except Exception as e:
        log_test("GET /health", "FAILED", str(e))
        results["health_check"] = "FAILED"

    try:
        status, data = http_get("/")
        assert status == 200 and "app" in data
        log_test("GET /", "PASSED", f"app={data.get('app')}")
        results["root_endpoint"] = "PASSED"
    except Exception as e:
        log_test("GET /", "FAILED", str(e))
        results["root_endpoint"] = "FAILED"

    # 2. Analytics Dashboard
    try:
        status, data = http_get("/api/v1/analytics/dashboard")
        assert status == 200 and "metrics" in data
        log_test("GET /api/v1/analytics/dashboard", "PASSED", f"datasets={data['metrics'].get('total_datasets')}, questions={data['metrics'].get('total_questions')}")
        results["analytics_dashboard"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/analytics/dashboard", "FAILED", str(e))
        results["analytics_dashboard"] = "FAILED"

    # 3. Model Predictions (All Available Models)
    models_to_test = [
        ("Default Model", None),
        ("Logistic Regression", "Logistic Regression Classifier"),
        ("Random Forest", "Random Forest Classifier"),
        ("Semantic LSA", "Semantic LSA Similarity Model")
    ]
    for label, m_name in models_to_test:
        test_key = f"predict_{label.lower().replace(' ', '_')}"
        try:
            status, data = http_post_json("/api/v1/predict", {
                "question1": "How do I start learning Python programming?",
                "question2": "What are the best resources to learn Python for beginners?",
                "model_name": m_name
            })
            assert status == 200 and "is_duplicate" in data and "similarity_score" in data
            log_test(f"POST /api/v1/predict ({label})", "PASSED", f"Score={data['similarity_score']}, Dup={data['is_duplicate']}, Method={data['method']}")
            results[test_key] = "PASSED"
        except Exception as e:
            log_test(f"POST /api/v1/predict ({label})", "FAILED", str(e))
            results[test_key] = "FAILED"

    # Test Non-Duplicate Separation
    try:
        status, data = http_post_json("/api/v1/predict", {
            "question1": "How do I bake sourdough bread at home?",
            "question2": "What is quantum computing and qubit superposition?",
            "model_name": "Logistic Regression Classifier"
        })
        assert status == 200 and data["is_duplicate"] is False and data["similarity_score"] == 0.0
        log_test("POST /api/v1/predict (Non-Duplicate Guardrail)", "PASSED", f"Score={data['similarity_score']}, Dup={data['is_duplicate']}")
        results["predict_non_duplicate_guardrail"] = "PASSED"
    except Exception as e:
        log_test("POST /api/v1/predict (Non-Duplicate Guardrail)", "FAILED", str(e))
        results["predict_non_duplicate_guardrail"] = "FAILED"

    # Batch Predict
    try:
        status, data = http_post_json("/api/v1/predict/batch", {
            "pairs": [
                {"question1": "How to learn python?", "question2": "Best way to learn python?"},
                {"question1": "How to make tea?", "question2": "How to fly an airplane?"}
            ]
        })
        assert status == 200 and len(data.get("results", [])) == 2
        log_test("POST /api/v1/predict/batch", "PASSED", f"Results returned={len(data['results'])}")
        results["predict_batch"] = "PASSED"
    except Exception as e:
        log_test("POST /api/v1/predict/batch", "FAILED", str(e))
        results["predict_batch"] = "FAILED"

    # 4. Smart Duplicate Finder
    try:
        status, data = http_post_json("/api/v1/find-similar", {
            "question": "What is the best way to learn Python?",
            "threshold": 0.50,
            "limit": 5
        })
        assert status == 200 and "matches" in data and len(data["matches"]) > 0
        top_match = data["matches"][0]
        log_test("POST /api/v1/find-similar", "PASSED", f"Found {len(data['matches'])} matches. Top: '{top_match['question'][:30]}...' ({top_match['similarity_score']})")
        results["duplicate_finder"] = "PASSED"
    except Exception as e:
        log_test("POST /api/v1/find-similar", "FAILED", str(e))
        results["duplicate_finder"] = "FAILED"

    # Autocomplete Suggestions
    try:
        status, data = http_get("/api/v1/suggest?query=python&limit=3")
        assert status == 200 and isinstance(data, list)
        log_test("GET /api/v1/suggest", "PASSED", f"Suggestions returned={len(data)}")
        results["autocomplete_suggest"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/suggest", "FAILED", str(e))
        results["autocomplete_suggest"] = "FAILED"

    # Finder Search History
    try:
        status, data = http_get("/api/v1/finder-history?limit=5")
        assert status == 200 and isinstance(data, list)
        log_test("GET /api/v1/finder-history", "PASSED", f"Search queries logged={len(data)}")
        results["finder_history"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/finder-history", "FAILED", str(e))
        results["finder_history"] = "FAILED"

    # 5. Dataset Management & Validation
    try:
        status, datasets = http_get("/api/v1/datasets")
        assert status == 200 and len(datasets) > 0
        log_test("GET /api/v1/datasets", "PASSED", f"Total datasets={len(datasets)}")
        results["list_datasets"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/datasets", "FAILED", str(e))
        results["list_datasets"] = "FAILED"

    # Upload Test Dataset
    uploaded_id = None
    try:
        boundary = "----WebKitFormBoundaryAuditTest7MA4YWxkTrZu0gW"
        csv_content = (
            "question1,question2,is_duplicate,category\n"
            "How do I learn C++?,What is the best way to master C++?,1,Programming\n"
            "Where can I buy fresh coffee?,How to roast coffee beans?,1,Food\n"
            "What is the speed of light?,How to train a retriever puppy?,0,Science\n"
        )
        parts = [
            f"--{boundary}",
            'Content-Disposition: form-data; name="name"',
            '',
            'Audit Verification Dataset',
            f"--{boundary}",
            'Content-Disposition: form-data; name="source"',
            '',
            'Automated Suite',
            f"--{boundary}",
            'Content-Disposition: form-data; name="file"; filename="audit_dataset.csv"',
            'Content-Type: text/csv',
            '',
            csv_content,
            f"--{boundary}--",
            ''
        ]
        body_bytes = "\r\n".join(parts).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/v1/datasets/upload",
            data=body_bytes,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            assert resp.status == 201 and resp_data.get("dataset_id")
            uploaded_id = resp_data["dataset_id"]
            log_test("POST /api/v1/datasets/upload", "PASSED", f"Created dataset_id={uploaded_id}")
            results["upload_dataset"] = "PASSED"
    except Exception as e:
        log_test("POST /api/v1/datasets/upload", "FAILED", str(e))
        results["upload_dataset"] = "FAILED"

    # Dataset Preview & Download
    if uploaded_id:
        try:
            status, preview = http_get(f"/api/v1/datasets/{uploaded_id}/preview?limit=10")
            assert status == 200 and len(preview.get("records", [])) == 3
            log_test(f"GET /api/v1/datasets/{uploaded_id}/preview", "PASSED", f"Preview rows={len(preview['records'])}")
            results["preview_dataset"] = "PASSED"
        except Exception as e:
            log_test(f"GET /api/v1/datasets/{uploaded_id}/preview", "FAILED", str(e))
            results["preview_dataset"] = "FAILED"

        try:
            status, dl_data = http_get(f"/api/v1/datasets/{uploaded_id}/download")
            assert status == 200 and len(dl_data) > 0
            log_test(f"GET /api/v1/datasets/{uploaded_id}/download", "PASSED", f"Downloaded {len(dl_data)} bytes")
            results["download_dataset"] = "PASSED"
        except Exception as e:
            log_test(f"GET /api/v1/datasets/{uploaded_id}/download", "FAILED", str(e))
            results["download_dataset"] = "FAILED"

        # Cleanup dataset
        try:
            status, del_res = http_delete(f"/api/v1/datasets/{uploaded_id}")
            assert status == 200 and del_res.get("status") == "success"
            log_test(f"DELETE /api/v1/datasets/{uploaded_id}", "PASSED", "Deleted test dataset")
            results["delete_dataset"] = "PASSED"
        except Exception as e:
            log_test(f"DELETE /api/v1/datasets/{uploaded_id}", "FAILED", str(e))
            results["delete_dataset"] = "FAILED"

    # 6. Model Training & History
    try:
        status, models = http_get("/api/v1/models")
        assert status == 200 and len(models) >= 3
        log_test("GET /api/v1/models", "PASSED", f"Available models={len(models)}")
        results["list_models"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/models", "FAILED", str(e))
        results["list_models"] = "FAILED"

    try:
        status, train_res = http_post_json("/api/v1/models/train", {
            "dataset_ids": None,
            "version_tag": "audit_complete_run"
        })
        assert status == 200 and train_res.get("status") == "success"
        log_test("POST /api/v1/models/train", "PASSED", f"Best={train_res.get('best_model')}, Version={train_res.get('version')}")
        results["train_model"] = "PASSED"
    except Exception as e:
        log_test("POST /api/v1/models/train", "FAILED", str(e))
        results["train_model"] = "FAILED"

    try:
        status, history = http_get("/api/v1/models/history")
        assert status == 200 and len(history) > 0
        log_test("GET /api/v1/models/history", "PASSED", f"Training runs logged={len(history)}")
        results["model_history"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/models/history", "FAILED", str(e))
        results["model_history"] = "FAILED"

    # 7. Prediction History & Human Feedback
    try:
        status, history_items = http_get("/api/v1/history?limit=10")
        assert status == 200 and len(history_items) > 0
        log_test("GET /api/v1/history", "PASSED", f"History records={len(history_items)}")
        results["prediction_history"] = "PASSED"

        # Submit Feedback
        first_item = history_items[0]
        status, fb_res = http_post_json("/api/v1/feedback", {
            "prediction_id": first_item["id"],
            "feedback": "correct_duplicate"
        })
        assert status == 200 and fb_res.get("status") == "success"
        log_test("POST /api/v1/feedback", "PASSED", f"Feedback recorded for ID={first_item['id']}")
        results["submit_feedback"] = "PASSED"
    except Exception as e:
        log_test("Prediction History & Feedback", "FAILED", str(e))
        results["prediction_history"] = "FAILED"
        results["submit_feedback"] = "FAILED"

    # 8. Explorer & Semantic Clusters
    try:
        status, clusters = http_get("/api/v1/explorer/clusters?min_similarity=0.55")
        assert status == 200 and "clusters" in clusters
        log_test("GET /api/v1/explorer/clusters", "PASSED", f"Clusters found={len(clusters['clusters'])}")
        results["explorer_clusters"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/explorer/clusters", "FAILED", str(e))
        results["explorer_clusters"] = "FAILED"

    try:
        status, vocab = http_get("/api/v1/explorer/vocabulary")
        assert status == 200 and "terms" in vocab
        log_test("GET /api/v1/explorer/vocabulary", "PASSED", f"Vocabulary terms={len(vocab['terms'])}")
        results["explorer_vocabulary"] = "PASSED"
    except Exception as e:
        log_test("GET /api/v1/explorer/vocabulary", "FAILED", str(e))
        results["explorer_vocabulary"] = "FAILED"

    # SUMMARY
    passed_count = sum(1 for v in results.values() if v == "PASSED")
    failed_count = sum(1 for v in results.values() if v == "FAILED")
    print("=" * 60)
    print(f"AUDIT SUMMARY: {passed_count} PASSED, {failed_count} FAILED, TOTAL {len(results)}")
    print("=" * 60)

    if failed_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_comprehensive_audit()
