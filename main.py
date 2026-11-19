"""
Root entry point redirecting to backend.main:app.
This allows running:
    uvicorn main:app --reload
or
    python main.py
directly from the workspace root directory.
"""
import sys
from pathlib import Path

# Ensure root and backend directory are in sys.path
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"

for d in (str(root_dir), str(backend_dir)):
    if d not in sys.path:
        sys.path.insert(0, d)

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
