from fastapi import APIRouter
from data.mock_generator import get_topology, get_anomalies, get_correlations

router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])


@router.get("/topology")
def topology():
    return get_topology()


@router.get("/anomalies")
def anomalies():
    return get_anomalies()


@router.get("/correlations")
def correlations():
    return get_correlations()
