from fastapi import APIRouter
from data.mock_generator import get_alerts

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("")
def alerts():
    return get_alerts()


@router.get("/{alert_id}")
def alert_detail(alert_id: str):
    all_alerts = get_alerts()
    for a in all_alerts:
        if a["id"] == alert_id:
            return a
    return {"error": "not found"}
