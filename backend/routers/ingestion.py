from fastapi import APIRouter
from data.mock_generator import get_connectors, get_ingestion_throughput

router = APIRouter(prefix="/api/v1/ingestion", tags=["ingestion"])


@router.get("/connectors")
def connectors():
    return get_connectors()


@router.get("/throughput")
def throughput():
    return get_ingestion_throughput()
