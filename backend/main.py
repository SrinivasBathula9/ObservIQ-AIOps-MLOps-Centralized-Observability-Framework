"""
ObservIQ — AIOps/MLOps Central Observability Framework
FastAPI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import overview, ingestion, intelligence, alerts, mlops, routing
from ws.stream import router as ws_router

app = FastAPI(
    title="ObservIQ — AIOps/MLOps Observability Platform",
    description=(
        "Centralised, vendor-agnostic observability framework with topology-aware "
        "AIOps correlation, anomaly detection, and MLOps lifecycle management."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── REST Routers ──────────────────────────────────────────────────────────────
app.include_router(overview.router)
app.include_router(ingestion.router)
app.include_router(intelligence.router)
app.include_router(alerts.router)
app.include_router(mlops.router)
app.include_router(routing.router)

# ─── WebSocket ─────────────────────────────────────────────────────────────────
app.include_router(ws_router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "ObservIQ Backend"}
