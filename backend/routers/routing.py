from fastapi import APIRouter
from data.mock_generator import get_routing_rules, get_pipeline_throughput

router = APIRouter(prefix="/api/v1/routing", tags=["routing"])


@router.get("/rules")
def rules():
    return get_routing_rules()


@router.get("/throughput")
def throughput():
    return get_pipeline_throughput()
