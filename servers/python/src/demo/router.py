from typing import Any

from fastapi import APIRouter, Body, Depends, Query, Request

from src.cidi.openapi_client import CidiOpenApiClient
from src.config import get_settings
from src.demo.service import DemoService

router = APIRouter()


def get_demo_service() -> DemoService:
    return DemoService(CidiOpenApiClient(get_settings()))


@router.get("/health")
def health(demo: DemoService = Depends(get_demo_service)) -> dict[str, Any]:
    return demo.health()


@router.post("/demo/verify")
async def verify_temp_token(
    body: dict[str, Any] = Body(default_factory=dict),
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.verify_temp_token(body.get("tempToken"))


@router.get("/demo/balance")
async def query_balance(
    game_token: str = Query(alias="gameToken"),
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_balance(game_token)


@router.post("/demo/orders")
async def create_order(
    body: dict[str, Any] = Body(default_factory=dict),
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.create_order(body)


@router.get("/demo/orders/by-game-order/{game_order_no}")
async def query_order_by_game_order_no(
    game_order_no: str,
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_order_by_game_order_no(game_order_no)


@router.get("/demo/orders/{order_no}")
async def query_order(
    order_no: str,
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_order(order_no)


@router.get("/demo/order-records")
async def query_order_records(
    request: Request,
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_order_records(dict(request.query_params))


@router.post("/demo/medal/report")
async def report_medal(
    body: dict[str, Any] = Body(default_factory=dict),
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.report_medal(body)


@router.get("/demo/medal/ownership")
async def query_medal_ownership(
    request: Request,
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_medal_ownership(dict(request.query_params))


@router.post("/demo/tournament/score")
async def report_tournament_score(
    body: dict[str, Any] = Body(default_factory=dict),
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.report_tournament_score(body)


@router.post("/demo/task/report")
async def report_game_task(
    body: dict[str, Any] = Body(default_factory=dict),
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.report_game_task(body)


@router.get("/demo/task/result")
async def query_game_task_result(
    request: Request,
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_game_task_result(dict(request.query_params))


@router.get("/demo/report/{report_id}")
async def query_report(
    report_id: str,
    demo: DemoService = Depends(get_demo_service),
) -> dict[str, Any]:
    return await demo.query_report(report_id)
