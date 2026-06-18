from typing import Any

from fastapi import APIRouter, Header

from src.cidi.signature import verify_signature
from src.config import get_settings

router = APIRouter(prefix="/callbacks")

paid_game_order_numbers: set[str] = set()
tournament_report_ids: set[str] = set()


@router.post("/order-paid")
async def receive_order_paid(
    body: dict[str, Any],
    x_timestamp: str | None = Header(default=None),
    x_nonce: str | None = Header(default=None),
    x_signature: str | None = Header(default=None),
) -> dict[str, Any]:
    settings = get_settings()

    if not settings.cidi_callback_secret:
        return {
            "code": 1002,
            "message": "callback secret is not configured",
        }

    if not x_timestamp or not x_nonce or not x_signature:
        return {
            "code": 1003,
            "message": "missing callback signature headers",
        }

    valid = verify_signature(body, x_timestamp, x_nonce, x_signature, settings.cidi_callback_secret)
    if not valid:
        return {
            "code": 1004,
            "message": "invalid callback signature",
        }

    game_order_no = str(body.get("gameOrderNo", ""))
    if game_order_no in paid_game_order_numbers:
        return {
            "code": 0,
            "message": "duplicate callback ignored",
        }

    paid_game_order_numbers.add(game_order_no)

    return {
        "code": 0,
        "message": "success",
    }


@router.post("/tournament-score")
async def receive_tournament_score(body: dict[str, Any]) -> dict[str, Any]:
    report_id = str(body.get("reportId", ""))

    if report_id in tournament_report_ids:
        return {
            "code": 0,
            "message": "duplicate callback ignored",
        }

    tournament_report_ids.add(report_id)

    return {
        "code": 0,
        "message": "success",
    }
