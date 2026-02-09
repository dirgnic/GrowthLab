from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any


class AIError(RuntimeError):
    pass


def _json_dumps(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _env(*names: str) -> str | None:
    for n in names:
        v = os.environ.get(n)
        if v and v.strip():
            return v.strip()
    return None


def get_provider() -> str:
    # default to openrouter if OPENROUTER_API_KEY is present
    provider = _env("AI_PROVIDER")
    if provider:
        return provider.lower()
    if _env("OPENROUTER_API_KEY"):
        return "openrouter"
    return "openai"


def get_api_key() -> str | None:
    provider = get_provider()
    if provider == "openrouter":
        return _env("OPENROUTER_API_KEY")
    # openai (or other OpenAI-compatible providers)
    return _env("OPENAI_API_KEY")


def is_configured() -> bool:
    return bool(get_api_key())


def get_base_url() -> str:
    provider = get_provider()
    if provider == "openrouter":
        return _env("AI_BASE_URL", "OPENROUTER_BASE_URL") or "https://openrouter.ai/api/v1"
    return _env("AI_BASE_URL", "OPENAI_BASE_URL") or "https://api.openai.com/v1"


def _default_headers() -> dict[str, str]:
    headers: dict[str, str] = {"Content-Type": "application/json"}
    key = get_api_key()
    if key:
        headers["Authorization"] = f"Bearer {key}"

    # OpenRouter recommended metadata headers (optional)
    if get_provider() == "openrouter":
        referer = _env("OPENROUTER_SITE_URL", "OR_SITE_URL")
        title = _env("OPENROUTER_APP_NAME", "OR_APP_NAME")
        if referer:
            headers["HTTP-Referer"] = referer
        if title:
            headers["X-Title"] = title

    return headers


def chat_completions_create(
    *,
    model: str,
    messages: list[dict[str, str]],
    response_format: dict[str, Any] | None = None,
    modalities: list[str] | None = None,
    max_tokens: int | None = None,
    temperature: float | None = None,
) -> dict[str, Any]:
    if not get_api_key():
        raise AIError("AI key not configured (set OPENROUTER_API_KEY or OPENAI_API_KEY)")

    base = get_base_url().rstrip("/")
    url = f"{base}/chat/completions"

    body: dict[str, Any] = {"model": model, "messages": messages}
    if response_format is not None:
        body["response_format"] = response_format
    if modalities is not None:
        body["modalities"] = modalities
    if max_tokens is not None:
        body["max_tokens"] = int(max_tokens)
    if temperature is not None:
        body["temperature"] = float(temperature)

    req = urllib.request.Request(url, data=_json_dumps(body), headers=_default_headers(), method="POST")

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        try:
            detail = e.read().decode("utf-8")
        except Exception:
            detail = str(e)
        raise AIError(f"AI HTTPError: {e.code} {detail}") from e
    except urllib.error.URLError as e:
        raise AIError(f"AI URLError: {e}") from e


def extract_chat_text(resp: dict[str, Any]) -> str:
    choices = resp.get("choices") or []
    if not choices:
        return ""
    msg = (choices[0] or {}).get("message") or {}
    content = msg.get("content")
    if isinstance(content, str):
        return content.strip()
    return ""


def extract_chat_images(resp: dict[str, Any]) -> list[str]:
    """
    OpenRouter image generation returns message.images entries containing base64 data URLs.
    """
    choices = resp.get("choices") or []
    if not choices:
        return []
    msg = (choices[0] or {}).get("message") or {}
    images = msg.get("images") or []
    out: list[str] = []
    for img in images:
        if not isinstance(img, dict):
            continue
        image_url = img.get("image_url") or img.get("imageUrl") or {}
        if isinstance(image_url, dict) and isinstance(image_url.get("url"), str):
            out.append(image_url["url"])
    return out
