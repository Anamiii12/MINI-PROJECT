"""
QuerySense FastAPI Backend Service
Intelligent Duplicate Question Detection Platform.
Entry point, CORS configuration, Lifespan warm-up, and Global Error Handlers.
"""
import sys
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

# Allowed Origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://[::1]:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://[::1]:5174",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
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
    return {
        "status": "healthy",
        "warmed_up": similarity_engine.is_warmed_up,
        "candidates_count": len(similarity_engine.candidate_items)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
