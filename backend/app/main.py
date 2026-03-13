"""
SMILE-AI — Student Mental Health Intelligent Learning Evaluator
FastAPI Backend Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes.auth import router as auth_router
from .routes.predict import router as predict_router
from .routes.dashboard import router as dashboard_router
from .routes.journal import router as journal_router
from .routes.ai import router as ai_router
from .routes.counselor import router as counselor_router
from .routes.conversation import router as conversation_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Student Mental Health Intelligent Learning Evaluator — AI-powered mental health risk prediction platform",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(journal_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(counselor_router, prefix="/api")
app.include_router(conversation_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Student Mental Health Prediction Platform",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}

@app.get("/api/test-route")
async def test_route():
    return {"message": "API is reachable"}
