from fastapi import APIRouter
from data.mock_generator import (
    get_models, get_retraining_jobs, get_feedback_events, get_model_accuracy_history
)

router = APIRouter(prefix="/api/v1/mlops", tags=["mlops"])


@router.get("/models")
def models():
    return get_models()


@router.get("/jobs")
def jobs():
    return get_retraining_jobs()


@router.get("/feedback")
def feedback():
    return get_feedback_events()


@router.get("/accuracy-history")
def accuracy_history():
    return get_model_accuracy_history()
