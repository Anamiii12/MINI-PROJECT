import io
from fastapi.testclient import TestClient
from backend.main import app

def test_full_e2e_suite():
    client = TestClient(app)

    print("\n=== 1. Health & Root ===")
    r = client.get("/health")
    assert r.status_code == 200, r.text
    print("GET /health:", r.json())

    r = client.get("/")
    assert r.status_code == 200, r.text
    print("GET /:", r.json())

    print("\n=== 2. Predict Endpoint ===")
    models_to_test = [None, "Logistic Regression Classifier", "Random Forest Classifier", "Semantic LSA Similarity Model"]
    for m in models_to_test:
        r = client.post("/api/v1/predict", json={
            "question1": "How to learn python?",
            "question2": "What is the best way to learn python?",
            "model_name": m
        })
        assert r.status_code == 200, f"{m}: {r.text}"
        data = r.json()
        print(f"Model [{m}]: score={data['similarity_score']}, dup={data['is_duplicate']}, method={data['method']}")

    print("\n=== 3. Finder & Suggest ===")
    r = client.post("/api/v1/find-similar", json={"question": "How to learn python?", "limit": 3})
    assert r.status_code == 200, r.text
    print("find-similar matches:", len(r.json()["matches"]))

    r = client.get("/api/v1/suggest?query=python&limit=3")
    assert r.status_code == 200, r.text
    print("suggest:", r.json())

    print("\n=== 4. Datasets API ===")
    r = client.get("/api/v1/datasets")
    assert r.status_code == 200, r.text
    datasets = r.json()
    print("Initial datasets count:", len(datasets))

    # Upload custom pair dataset
    csv_data = """question1,question2,is_duplicate,category
How to cook rice?,What is the best way to cook rice?,1,Cooking
How to fix bike tire?,What is quantum computing?,0,Technical
"""
    file_obj = io.BytesIO(csv_data.encode("utf-8"))
    r = client.post(
        "/api/v1/datasets/upload",
        data={"name": "Test Upload Dataset E2E", "source": "Audit Test"},
        files={"file": ("test_upload.csv", file_obj, "text/csv")}
    )
    assert r.status_code == 201, r.text
    upload_res = r.json()
    ds_id = upload_res["dataset_id"]
    print("Uploaded dataset id:", ds_id)

    r = client.get(f"/api/v1/datasets/{ds_id}/preview")
    assert r.status_code == 200, r.text
    print("Preview records:", len(r.json()["records"]))

    r = client.get(f"/api/v1/datasets/{ds_id}/download")
    assert r.status_code == 200, r.text
    print("Download bytes length:", len(r.content))

    print("\n=== 5. Model Training & Evaluation API ===")
    r = client.get("/api/v1/models")
    assert r.status_code == 200, r.text
    print("Models count:", len(r.json()))

    r = client.post("/api/v1/models/train", json={"dataset_ids": None, "version_tag": "audit_v1"})
    assert r.status_code == 200, r.text
    train_res = r.json()
    print("Train result:", train_res["status"], "version:", train_res["version"], "best_model:", train_res["best_model"])

    r = client.get("/api/v1/models/history")
    assert r.status_code == 200, r.text
    print("Model history count:", len(r.json()))

    # Delete uploaded test dataset
    r = client.delete(f"/api/v1/datasets/{ds_id}")
    assert r.status_code == 200, r.text
    print("Delete dataset response:", r.json())

    print("\n=== 6. History & Feedback API ===")
    r = client.get("/api/v1/history?limit=10")
    assert r.status_code == 200, r.text
    history = r.json()
    print("Prediction history count:", len(history))
    if history:
        pred_id = history[0]["id"]
        r = client.post("/api/v1/feedback", json={"prediction_id": pred_id, "feedback": "correct_duplicate"})
        assert r.status_code == 200, r.text
        print("Feedback response:", r.json())

    r = client.get("/api/v1/finder-history?limit=10")
    assert r.status_code == 200, r.text
    print("Finder history count:", len(r.json()))

    print("\n=== 7. Analytics & Explorer API ===")
    r = client.get("/api/v1/dashboard/stats")
    assert r.status_code == 200, r.text
    stats = r.json()
    print("Dashboard stats questions:", stats["total_questions"], "datasets:", stats["total_datasets"])

    r = client.get("/api/v1/explorer/clusters")
    assert r.status_code == 200, r.text
    print("Clusters count:", len(r.json()))

    print("\nALL BACKEND API TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_e2e_suite()
