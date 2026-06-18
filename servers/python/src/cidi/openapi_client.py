from typing import Any, Literal, Mapping
from urllib.parse import quote

import httpx
from fastapi import HTTPException

from src.config import AppSettings
from src.cidi.signature import create_nonce, generate_signature, now_in_seconds, remove_empty_values


HttpMethod = Literal["GET", "POST"]


class CidiOpenApiClient:
    def __init__(self, settings: AppSettings):
        self.settings = settings

    async def verify_temp_token(self, temp_token: str) -> dict[str, Any]:
        return await self._request("GET", "/openapi/user/verify", query={"tempToken": temp_token})

    async def query_balance(self, game_token: str) -> dict[str, Any]:
        return await self._request("GET", "/openapi/coin/balance", query={"gameToken": game_token})

    async def create_order(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("POST", "/openapi/order/create", body=payload)

    async def query_order(self, order_no: str) -> dict[str, Any]:
        return await self._request("GET", f"/openapi/order/{quote(order_no, safe='')}", query={})

    async def query_order_by_game_order_no(self, game_order_no: str) -> dict[str, Any]:
        return await self._request("GET", "/openapi/order/by-game-order", query={"gameOrderNo": game_order_no})

    async def query_order_records(self, query: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("GET", "/openapi/order/records", query=query)

    async def report_medal(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("POST", "/openapi/game/medal/report", body=payload)

    async def query_medal_ownership(self, query: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("GET", "/openapi/game/medal/ownership", query=query)

    async def report_tournament_score(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("POST", "/openapi/tournament/score", body=payload)

    async def report_game_task(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("POST", "/openapi/game/task/report", body=payload)

    async def query_game_task_result(self, query: Mapping[str, Any]) -> dict[str, Any]:
        return await self._request("GET", "/openapi/game/task/result", query=query)

    async def query_report(self, report_id: str) -> dict[str, Any]:
        return await self._request("GET", "/openapi/report/query", query={"reportId": report_id})

    async def _request(
        self,
        method: HttpMethod,
        path: str,
        *,
        query: Mapping[str, Any] | None = None,
        body: Mapping[str, Any] | None = None,
        signed: bool = True,
    ) -> dict[str, Any]:
        clean_query = remove_empty_values(query or {})
        clean_body = remove_empty_values(body or {})
        sign_params = clean_query if method == "GET" else clean_body
        headers = {"Content-Type": "application/json"}

        if signed:
            timestamp = now_in_seconds()
            nonce = create_nonce()
            headers.update(
                {
                    "X-Api-Key": self.settings.cidi_api_key,
                    "X-Timestamp": str(timestamp),
                    "X-Nonce": nonce,
                    "X-Signature": generate_signature(
                        sign_params,
                        timestamp,
                        nonce,
                        self.settings.cidi_api_secret,
                    ),
                }
            )

        url = f"{self.settings.normalized_cidi_base_url}{path}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.request(
                method,
                url,
                params=clean_query,
                json=clean_body if method == "POST" else None,
                headers=headers,
            )

        parsed = parse_json_response(response)
        if response.is_error:
            raise HTTPException(
                status_code=response.status_code,
                detail={
                    "message": "CiDi OpenAPI request failed",
                    "statusCode": response.status_code,
                    "response": parsed,
                },
            )

        return parsed


def parse_json_response(response: httpx.Response) -> dict[str, Any]:
    if not response.text:
        return {}

    try:
        parsed = response.json()
    except ValueError:
        return {"raw": response.text}

    if isinstance(parsed, dict):
        return parsed

    return {"data": parsed}
