from fastapi import APIRouter
from data.mock_generator import get_kpis

router = APIRouter(prefix="/api/v1/overview", tags=["overview"])


@router.get("/kpis")
def kpis():
    return get_kpis()
