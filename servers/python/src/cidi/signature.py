import hashlib
import hmac
import json
import secrets
import time
from typing import Any, Mapping


SignableParams = Mapping[str, Any]


def create_nonce() -> str:
    return secrets.token_hex(16)


def now_in_seconds() -> int:
    return int(time.time())


def build_sign_string(params: SignableParams, timestamp: int | str, nonce: str) -> str:
    parts = []

    for key in sorted(params.keys()):
        value = params[key]
        if value is None or str(value) == "":
            continue
        parts.append(f"{key}={stringify_sign_value(value)}")

    parts.append(f"timestamp={timestamp}")
    parts.append(f"nonce={nonce}")

    return "&".join(parts)


def generate_signature(params: SignableParams, timestamp: int | str, nonce: str, secret: str) -> str:
    sign_string = build_sign_string(params, timestamp, nonce)
    return hmac.new(secret.encode("utf-8"), sign_string.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_signature(
    params: SignableParams,
    timestamp: int | str,
    nonce: str,
    signature: str,
    secret: str,
) -> bool:
    expected = generate_signature(params, timestamp, nonce, secret)
    return hmac.compare_digest(expected, signature)


def remove_empty_values(params: SignableParams) -> dict[str, Any]:
    return {key: value for key, value in params.items() if value is not None and str(value) != ""}


def stringify_sign_value(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"

    if isinstance(value, (dict, list)):
        return json.dumps(value, separators=(",", ":"), ensure_ascii=False)

    return str(value)
