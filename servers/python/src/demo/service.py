import time
import uuid
from typing import Any, Mapping

from fastapi import HTTPException

from src.cidi.openapi_client import CidiOpenApiClient


class DemoService:
    def __init__(self, cidi: CidiOpenApiClient):
        self.cidi = cidi

    def health(self) -> dict[str, Any]:
        return {
            "ok": True,
            "service": "cidi-python-demo",
            "timestamp": int(time.time()),
        }

    async def verify_temp_token(self, temp_token: str) -> dict[str, Any]:
        return await self.cidi.verify_temp_token(read_required_string(temp_token, "tempToken"))

    async def query_balance(self, game_token: str) -> dict[str, Any]:
        return await self.cidi.query_balance(read_required_string(game_token, "gameToken"))

    async def create_order(self, body: Mapping[str, Any]) -> dict[str, Any]:
        payload = {
            "gameOrderNo": read_optional_string(body.get("gameOrderNo")) or self.create_game_order_no(),
            "gameToken": read_required_string(body.get("gameToken"), "gameToken"),
            "amount": read_required_number(body.get("amount"), "amount"),
            "description": read_optional_string(body.get("description")),
            "metadata": read_optional_string(body.get("metadata")),
            "callback_url": read_optional_string(body.get("callback_url")) or read_optional_string(body.get("callbackUrl")),
        }

        return await self.cidi.create_order(payload)

    async def query_order(self, order_no: str) -> dict[str, Any]:
        return await self.cidi.query_order(read_required_string(order_no, "orderNo"))

    async def query_order_by_game_order_no(self, game_order_no: str) -> dict[str, Any]:
        return await self.cidi.query_order_by_game_order_no(read_required_string(game_order_no, "gameOrderNo"))

    async def query_order_records(self, query: Mapping[str, Any]) -> dict[str, Any]:
        return await self.cidi.query_order_records(query)

    async def report_medal(self, body: Mapping[str, Any]) -> dict[str, Any]:
        return await self.cidi.report_medal(body)

    async def query_medal_ownership(self, query: Mapping[str, Any]) -> dict[str, Any]:
        return await self.cidi.query_medal_ownership(query)

    async def report_tournament_score(self, body: Mapping[str, Any]) -> dict[str, Any]:
        return await self.cidi.report_tournament_score(body)

    async def report_game_task(self, body: Mapping[str, Any]) -> dict[str, Any]:
        return await self.cidi.report_game_task(body)

    async def query_game_task_result(self, query: Mapping[str, Any]) -> dict[str, Any]:
        return await self.cidi.query_game_task_result(query)

    async def query_report(self, report_id: str) -> dict[str, Any]:
        return await self.cidi.query_report(read_required_string(report_id, "reportId"))

    def create_game_order_no(self) -> str:
        suffix = uuid.uuid4().hex[:8]
        return f"GAME{int(time.time() * 1000)}{suffix}"


def read_required_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or value.strip() == "":
        raise HTTPException(status_code=400, detail=f"{field} is required")

    return value


def read_optional_string(value: Any) -> str | None:
    if not isinstance(value, str) or value.strip() == "":
        return None

    return value


def read_required_number(value: Any, field: str) -> int | float:
    if isinstance(value, bool):
        raise HTTPException(status_code=400, detail=f"{field} must be a number")

    if isinstance(value, (int, float)):
        return value

    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"{field} must be a number") from None

    raise HTTPException(status_code=400, detail=f"{field} must be a number")
