from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
from app.routes.history import router as history_router


app = FastAPI(
    title="AI Resume Analyzer API",
    description="Backend API for AI Resume Analyzer",
    version="1.0.0",
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Routes
app.include_router(upload_router)
app.include_router(history_router)


# Root Route
@app.get("/")
def root():
    return {
        "status": "success",
        "message": "AI Resume Analyzer Backend is Running!",
    }


# Health Check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Backend is running successfully.",
    }