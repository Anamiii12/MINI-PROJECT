import urllib.request
import urllib.parse
import json
import io
import mimetypes

BASE_URL = "http://127.0.0.1:8000"

def post_multipart(url, fields, files):
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = io.BytesIO()
    for name, value in fields.items():
        body.write(f"--{boundary}\r\n".encode())
        body.write(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode())
        body.write(f"{value}\r\n".encode())
    for name, (filename, file_bytes) in files.items():
        body.write(f"--{boundary}\r\n".encode())
        body.write(f'Content-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'.encode())
        body.write(b"Content-Type: text/csv\r\n\r\n")
        body.write(file_bytes)
        body.write(b"\r\n")
    body.write(f"--{boundary}--\r\n".encode())
    data = body.getvalue()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def get_json(url):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def delete_req(url):
    req = urllib.request.Request(url, method="DELETE")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode())

def run_workflow_audit():
    print("==================================================")
    print("STEP 1: UPLOAD DATASET")
    print("==================================================")
    csv_content = """question1,question2,is_duplicate,category
How can I install Docker on Ubuntu?,What is the best way to install Docker on Ubuntu Linux?,1,DevOps
How do I install Node.js on macOS?,How can I setup Node.js on Mac?,1,DevOps
What is machine learning?,How do airplanes fly in the sky?,0,General
How can I improve my English speaking?,What are the best tips to speak fluent English?,1,Education
How do I cook Italian pasta?,What is the theory of general relativity?,0,Cooking
"""
    import time
    dataset_name = f"Workflow Audit Dataset {int(time.time())}"
    status, res = post_multipart(
        f"{BASE_URL}/api/v1/datasets/upload",
        {"name": dataset_name, "source": "E2E Test Runner", "description": "Benchmark verification dataset"},
        {"file": ("workflow_test.csv", csv_content.encode("utf-8"))}
    )
    print(f"Upload Status: {status}, Response: {res}")
    assert status == 201, f"Failed upload: {res}"
    dataset_id = res["dataset_id"]

    print("\n==================================================")
    print("STEP 2: VALIDATE DATASET")
    print("==================================================")
    status, datasets = get_json(f"{BASE_URL}/api/v1/datasets")
    assert status == 200
    matched_ds = next((d for d in datasets if d["id"] == dataset_id), None)
    assert matched_ds is not None, "Uploaded dataset not found in /datasets"
    print(f"Found uploaded dataset: Name='{matched_ds['name']}', Total Rows={matched_ds['total_rows']}, Dups={matched_ds['duplicate_rows']}")

    status, preview = get_json(f"{BASE_URL}/api/v1/datasets/{dataset_id}/preview")
    assert status == 200
    assert len(preview["records"]) == 5, f"Expected 5 records, got {len(preview['records'])}"
    print(f"Dataset preview verified with {len(preview['records'])} records.")

    # Batch validation via /analyze-dataset
    questions_to_test = [
        "How can I install Docker on Ubuntu?",
        "What is the best way to install Docker on Ubuntu Linux?",
        "What is machine learning?"
    ]
    status, batch_res = post_json(
        f"{BASE_URL}/api/v1/analyze-dataset",
        {"questions": questions_to_test, "threshold": 0.5}
    )
    assert status == 200
    print(f"Batch dataset validation passed: {len(batch_res['pairs'])} pairs identified above threshold {batch_res['threshold']}")

    print("\n==================================================")
    print("STEP 3: TRAIN MODEL")
    print("==================================================")
    status, train_res = post_json(
        f"{BASE_URL}/api/v1/models/train",
        {"version_tag": "audit_run_2026"}
    )
    assert status == 200, f"Training failed: {train_res}"
    print(f"Training status: {train_res['status']}")
    print(f"Version: {train_res['version']}")
    print(f"Total training pairs: {train_res['total_pairs']} (Train: {train_res['train_count']}, Test: {train_res['test_count']})")
    print(f"Best model chosen: {train_res['best_model']}")
    print(f"Training duration: {train_res['elapsed_seconds']}s")

    print("\n==================================================")
    print("STEP 4: EVALUATE MODEL")
    print("==================================================")
    status, models_eval = get_json(f"{BASE_URL}/api/v1/models")
    assert status == 200
    print(f"Evaluated {len(models_eval)} model architectures:")
    for m in models_eval:
        print(f" - {m['model_name']} ({m['version']}): Accuracy={m['accuracy']:.4f}, Precision={m['precision']:.4f}, Recall={m['recall']:.4f}, F1={m['f1_score']:.4f}, Samples={m['test_samples']}")
        cm = m["confusion_matrix"]
        print(f"   Confusion Matrix: TN={cm.get('tn')}, FP={cm.get('fp')}, FN={cm.get('fn')}, TP={cm.get('tp')}")

    status, history_models = get_json(f"{BASE_URL}/api/v1/models/history")
    assert status == 200
    print(f"Model training runs in history: {len(history_models)}")

    print("\n==================================================")
    print("STEP 5: COMPARE QUESTIONS")
    print("==================================================")
    q1 = "How can I install Docker on Ubuntu?"
    q2 = "What is the best way to install Docker on Ubuntu Linux?"
    status, pred_res = post_json(
        f"{BASE_URL}/api/v1/predict",
        {"question1": q1, "question2": q2, "model_name": "Random Forest Classifier"}
    )
    assert status == 200
    print(f"Prediction result: is_duplicate={pred_res['is_duplicate']}, Score={pred_res['similarity_score']}, Confidence={pred_res['confidence']}, Label={pred_res['label']}, Method={pred_res['method']}")
    assert pred_res["is_duplicate"] is True
    assert pred_res["similarity_score"] >= 0.50

    # Non-duplicate test
    status, non_dup_res = post_json(
        f"{BASE_URL}/api/v1/predict",
        {"question1": "How do I bake sourdough bread?", "question2": "What is quantum computing?", "model_name": "Logistic Regression Classifier"}
    )
    assert status == 200
    print(f"Non-duplicate result: is_duplicate={non_dup_res['is_duplicate']}, Score={non_dup_res['similarity_score']}, Label={non_dup_res['label']}")
    assert non_dup_res["is_duplicate"] is False

    print("\n==================================================")
    print("STEP 6: SAVE PREDICTION")
    print("==================================================")
    # Both predictions above were automatically persisted to SQLite prediction_history
    status, hist_list = get_json(f"{BASE_URL}/api/v1/history?limit=10")
    assert status == 200
    latest = hist_list[0]
    print(f"Latest saved prediction: ID={latest['id']}, Q1='{latest['question1']}', Score={latest['similarity_score']}, Duplicate={latest['is_duplicate']}, Feedback={latest['feedback']}")
    assert latest["question1"] == "How do I bake sourdough bread?"
    second_latest = hist_list[1]
    assert second_latest["question1"] == q1
    print("Prediction persistence verified in SQLite database.")

    print("\n==================================================")
    print("STEP 7: VIEW HISTORY & SUBMIT FEEDBACK")
    print("==================================================")
    print(f"History list contains {len(hist_list)} entries.")
    # Submit feedback on the prediction
    status, fb_res = post_json(
        f"{BASE_URL}/api/v1/feedback",
        {"prediction_id": second_latest["id"], "feedback": "correct_duplicate"}
    )
    assert status == 200
    print(f"Feedback submitted: {fb_res['message']}")

    # Verify updated feedback in history
    status, updated_hist = get_json(f"{BASE_URL}/api/v1/history?limit=10")
    updated_item = next(h for h in updated_hist if h["id"] == second_latest["id"])
    assert updated_item["feedback"] == "correct_duplicate", f"Expected feedback 'correct_duplicate', got {updated_item['feedback']}"
    print(f"Verified feedback stored in DB: {updated_item['feedback']}")

    # Cleanup audit dataset
    delete_req(f"{BASE_URL}/api/v1/datasets/{dataset_id}")
    print(f"\nCleaned up audit dataset ID {dataset_id}")
    print("\n>>> COMPLETE END-TO-END WORKFLOW VERIFIED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_workflow_audit()
