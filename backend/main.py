"""
QuerySense FastAPI Backend Service
Intelligent Duplicate Question Detection Platform.
Entry point, CORS configuration, Lifespan warm-up, and Global Error Handlers.
"""
import sys
import os
import logging
import time
from collections import defaultdict, deque
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# Ensure backend and root directory in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
parent_dir = backend_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from backend.database.db import init_db
from backend.database.seed_data import seed_database_if_empty
from backend.services.similarity_engine import similarity_engine
from backend.api.routes import (
    predict,
    finder,
    dataset,
    analytics,
    models,
    history,
    explorer
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager that initializes SQLite tables, seeds benchmark data,
    and warms up ML models and candidate indexes on API startup.
    """
    # 1. Initialize SQLite schema & seed benchmark datasets if empty
    init_db()
    seed_database_if_empty()

    # 2. Warm up similarity engine & load models
    similarity_engine.warm_up()
    yield


app = FastAPI(
    title="QuerySense API",
    description="Intelligent Duplicate Question Detection AI Platform Backend",
    version="2.0.0",
    lifespan=lifespan
)

# Allowed origins can be configured for deployed frontends.
_local_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://[::1]:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://[::1]:5174",
    "http://localhost:8000",
]
_configured_origins = os.getenv("CORS_ORIGINS", "")
ALLOWED_ORIGINS = _local_origins + [
    origin.strip() for origin in _configured_origins.split(",") if origin.strip()
]
ALLOWED_ORIGINS = list(dict.fromkeys(ALLOWED_ORIGINS))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_request_timestamps = defaultdict(deque)
_RATE_LIMITS = {
    "/api/v1/models/train": (2, 3600),
    "/api/v1/analyze-dataset": (6, 60),
}
_DEFAULT_RATE_LIMIT = (120, 60)
_MAX_REQUEST_BYTES = 2 * 1024 * 1024 + 64 * 1024
_RATE_LIMIT_LOCK = __import__("threading").Lock()


@app.middleware("http")
async def enforce_request_limits(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > _MAX_REQUEST_BYTES:
                return JSONResponse(status_code=413, content={"detail": "Request exceeds the 2 MB limit."})
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Invalid Content-Length header."})

    bucket = request.url.path if request.url.path in _RATE_LIMITS else "default"
    limit, window_seconds = _RATE_LIMITS.get(bucket, _DEFAULT_RATE_LIMIT)
    client_key = request.client.host if request.client else "unknown"
    rate_key = f"{client_key}:{bucket}"
    now = time.monotonic()
    with _RATE_LIMIT_LOCK:
        timestamps = _request_timestamps[rate_key]
        while timestamps and timestamps[0] <= now - window_seconds:
            timestamps.popleft()
        if len(timestamps) >= limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please wait and try again."},
                headers={"Retry-After": str(max(1, int(window_seconds - (now - timestamps[0]))))},
            )
        timestamps.append(now)
    return await call_next(request)


# Global Exception Handler for HTTPException
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


# Global Exception Handler for RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []) if l != "body")
        msg = err.get("msg", "Invalid input")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        if loc:
            error_messages.append(f"{loc}: {msg}")
        else:
            error_messages.append(msg)

    detail_str = "; ".join(error_messages) if error_messages else "Invalid request data."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail_str}
    )


# Global Fallback Exception Handler
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.getLogger("querysense").exception("Unhandled application error", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again."}
    )


# Register all API Routers
app.include_router(predict.router)
app.include_router(finder.router)
app.include_router(dataset.router)
app.include_router(analytics.router)
app.include_router(models.router)
app.include_router(history.router)
app.include_router(explorer.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "QuerySense AI Platform API",
        "status": "online",
        "version": "2.0.0",
        "method": similarity_engine.method_name,
        "active_model": similarity_engine.method_name,
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    from backend.database.db import get_db_connection
    conn = None
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1;")
    except Exception as exc:
        logging.getLogger("querysense").exception("Database readiness check failed", exc_info=exc)
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "unavailable"})
    finally:
        if conn is not None:
            conn.close()
    ready = similarity_engine.is_warmed_up
    return JSONResponse(
        status_code=200 if ready else 503,
        content={
            "status": "healthy" if ready else "starting",
            "database": "available",
            "warmed_up": ready,
            "candidates_count": len(similarity_engine.candidate_items),
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
