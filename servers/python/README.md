# Python Demo Server

FastAPI demo server for CIDI Game SDK server-side OpenAPI integration.

This demo shows how a game server can call CiDi OpenAPI endpoints with signed requests and receive platform callbacks.

## Features

- Generates `X-Api-Key`, `X-Timestamp`, `X-Nonce`, and `X-Signature` headers.
- Verifies temporary launch tokens.
- Queries CiDiCoin balance.
- Creates and queries payment orders.
- Queries payment records.
- Reports medals, tournament scores, and daily tasks.
- Queries report and task results.
- Receives order payment callbacks and tournament score callbacks.

## Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m src.main
```

Edit `.env` before calling real CiDi APIs.

## Configuration

| Variable | Description |
| --- | --- |
| `PORT` | Local demo server port |
| `CIDI_BASE_URL` | CiDi OpenAPI base URL |
| `CIDI_API_KEY` | Game API key |
| `CIDI_API_SECRET` | Game API secret |
| `CIDI_CALLBACK_SECRET` | Secret used to verify order payment callbacks |

## Common Demo Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/demo/verify` | Verify `tempToken` and receive `gameToken` |
| `GET` | `/demo/balance?gameToken=...` | Query CiDiCoin balance |
| `POST` | `/demo/orders` | Create payment order |
| `GET` | `/demo/orders/:orderNo` | Query order by CiDi order number |
| `GET` | `/demo/orders/by-game-order/:gameOrderNo` | Query order by game order number |
| `POST` | `/callbacks/order-paid` | Receive signed order paid callback |
| `POST` | `/callbacks/tournament-score` | Receive tournament score result callback |

Additional demo endpoints are available for order records, medal reports, tournament scores, daily tasks, task results, and report status queries.

## Example Request

```bash
curl --request POST http://localhost:3001/demo/verify \
  --header "Content-Type: application/json" \
  --data "{\"tempToken\":\"temp_token_from_cidi_app\"}"
```

## Notes

- `api_secret` and `callback_secret` must only be used on the server.
- The signature implementation follows the document's signing algorithm section: collect query/body business params, skip empty values, sort by ASCII key, append `timestamp` and `nonce`, then calculate HMAC-SHA256.
- This demo follows the same endpoint shape as the Node.js demo server so clients can switch demo server languages with minimal changes.
