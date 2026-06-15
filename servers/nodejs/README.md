# Node.js Demo Server

NestJS demo server for CIDI Game SDK server-side OpenAPI integration.

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
- Includes the dev/test coin grant endpoint for integration testing.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
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
| `POST` | `/demo/test/coin/add` | Add test CiDiCoin in dev/test environment |
| `POST` | `/callbacks/order-paid` | Receive signed order paid callback |
| `POST` | `/callbacks/tournament-score` | Receive tournament score result callback |

## Example Request

```bash
curl --request POST http://localhost:3000/demo/verify \
  --header "Content-Type: application/json" \
  --data "{\"tempToken\":\"temp_token_from_cidi_app\"}"
```

## Notes

- `api_secret` and `callback_secret` must only be used on the server.
- The signature implementation follows the document's signing algorithm section: collect query/body business params, skip empty values, sort by ASCII key, append `timestamp` and `nonce`, then calculate HMAC-SHA256.
- The Python full example in the source document uses a different canonical JSON format; this demo follows the main signing rule section.
