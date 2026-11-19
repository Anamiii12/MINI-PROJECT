# QuerySense

QuerySense detects similar and duplicate questions using a React/Vite frontend and a FastAPI service with TF-IDF retrieval and trained classifiers.

## Production deployment

- Frontend: https://anamiii12.github.io/MINI-PROJECT/
- API health: https://querysense-anamiii12-api.onrender.com/health (available after the Render service is created and deployed)
- Backend deployment: Render Blueprint (`render.yaml`), using a persistent 1 GB volume for SQLite and model artifacts.
- GitHub Pages builds use `VITE_USE_MOCK_API=false` and call the configured API. Local demos are opt-in only.

The API service requires a Render account connected to this GitHub repository. The Render Blueprint uses a paid Starter web service and 1 GB persistent disk. Review the current Render pricing before creating the service; the expected base is about $7/month for compute plus $0.25/month for the disk. Do not select a paid service unless you approve that recurring cost. Render service auto-deploy is disabled so checks can be run before deployment.

## Run locally

Requirements: Python 3.12.11 and Node.js 22.

```powershell
python -m pip install -r backend/requirements.txt
npm ci
```

Start the backend from the repository root:

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

Start the frontend in another terminal:

```powershell
npm run dev
```

Open <http://localhost:5173/MINI-PROJECT/>. Set `VITE_API_BASE_URL=http://localhost:8000` and `VITE_USE_MOCK_API=false` in a local `.env` to use real API responses. Set `VITE_USE_MOCK_API=true` only when intentionally using the local demo scorer. Never put backend secrets in Vite variables.

## Backend configuration

| Variable | Purpose |
| --- | --- |
| `QUERYSENSE_DB_PATH` | SQLite database path. Use a persistent mounted volume in deployment. |
| `QUERYSENSE_MODEL_DIR` | Writable directory for trained model artifacts. |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API. |

CSV uploads are limited to 2 MB and 10,000 records. Pair analysis evaluates at most 100 questions. Public endpoints have per-IP request limits; model training and pair analysis have stricter limits. The health endpoint checks both database connectivity and model warm-up.

Uploaded datasets, prediction history, and finder history are stored in the shared service database. Do not submit sensitive or confidential question text. Back up the persistent disk before changing or removing the Render service; the database and trained artifacts live on that disk.

## Features

- Compare two questions using a selected backend inference method and view the returned explanation.
- Search the indexed benchmark questions for likely matches.
- Parse and analyze CSV question lists or upload labeled question datasets.
- Inspect dataset previews, model evaluation history, prediction history, analytics, and related-question clusters.
- Train supported models using registered pair datasets.

Model metrics appear only after a real evaluation run; the dashboard does not substitute example accuracy values.

## Checks

```powershell
npm test
npm run lint
npm run build
python -m compileall -q backend
python -m pytest backend/tests -q
```

GitHub Actions runs these checks on pushes and pull requests. Deployment is a separate manual step; the Render health check uses `/health`.
