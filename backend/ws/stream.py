import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from data.mock_generator import get_live_tick

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/live")
async def live_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            tick = get_live_tick()
            await websocket.send_text(json.dumps(tick))
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
