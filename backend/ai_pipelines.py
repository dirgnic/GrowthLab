from __future__ import annotations

import json
from typing import Any

from ai_client import chat_completions_create, extract_chat_images, extract_chat_text


def _creative_schema() -> dict[str, Any]:
    # OpenAI-compatible response_format; some providers/models may ignore it.
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "creative_output",
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "creatives": {
                        "type": "array",
                        "minItems": 3,
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "headline": {"type": "string"},
                                "primaryText": {"type": "string"},
                                "cta": {"type": "string"},
                                "format": {"type": "string"},
                                "platform": {"type": "string"},
                                "creativeDirection": {"type": "string"},
                                "tags": {"type": "array", "items": {"type": "string"}},
                            },
                            "required": ["headline", "primaryText", "cta", "format", "platform", "creativeDirection", "tags"],
                        },
                    },
                    "notes": {"type": "string"},
                },
                "required": ["creatives", "notes"],
            },
        },
    }


def generate_creatives_via_openai(inputs: dict[str, Any], *, model: str) -> dict[str, Any]:
    persona = (inputs.get("persona") or "GP").strip()
    market = (inputs.get("market") or "Australia").strip()
    stage = (inputs.get("funnelStage") or "Awareness").strip()
    language = (inputs.get("language") or "en").strip().lower()

    prompt = f"""
You are generating paid media creatives for Heidi.
Inputs:
- Persona: {persona}
- Market: {market}
- Funnel stage: {stage}
- Language: {language}

Requirements:
- Return 3-5 creatives.
- No medical claims; no patient data; keep it professional.
- Keep copy short enough for social ads.
- Provide tags that help a creative library: stage, persona, market, language, channel_guess.
- Include platform and creativeDirection fields that a designer/editor can execute.
"""

    resp = chat_completions_create(
        model=model,
        messages=[
            {"role": "system", "content": "Return only JSON. No markdown. No backticks."},
            {"role": "user", "content": prompt.strip()},
        ],
        response_format=_creative_schema(),
        temperature=0.8,
        max_tokens=900,
    )

    text = extract_chat_text(resp)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        # Fallback: return raw text for debugging.
        parsed = {"creatives": [], "notes": f"Non-JSON response: {text[:300]}..."}

    creatives = parsed.get("creatives") or []
    normalized = []
    for idx, c in enumerate(creatives[:5], start=1):
        normalized.append(
            {
                "id": f"{stage.lower()}-ai-{idx}",
                "persona": persona,
                "market": market,
                "funnelStage": stage,
                "language": language,
                "headline": c.get("headline", ""),
                "primaryText": c.get("primaryText", ""),
                "cta": c.get("cta", "Learn more"),
                "tags": c.get("tags") or [stage.lower(), persona.lower().replace(" ", "-"), market.lower().replace(" ", "-"), language],
                "format": c.get("format", "Square (1080×1080) - static"),
                "platform": c.get("platform", "Meta (Feed)"),
                "creativeDirection": c.get("creativeDirection", ""),
            }
        )

    return {
        "inputs": {"persona": persona, "market": market, "funnelStage": stage, "language": language},
        "creatives": normalized,
        "notes": parsed.get("notes") or "",
        "model": model,
    }


def _voicemail_schema() -> dict[str, Any]:
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "voicemail_triage",
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "priority": {"type": "string", "enum": ["Urgent", "High", "Normal"]},
                    "type": {"type": "string"},
                    "summary": {"type": "string"},
                    "nextAction": {"type": "string"},
                    "rationale": {"type": "string"},
                },
                "required": ["priority", "type", "summary", "nextAction", "rationale"],
            },
        },
    }


def triage_voicemail_via_openai(inputs: dict[str, Any], *, model: str) -> dict[str, Any]:
    transcript = (inputs.get("transcript") or "").strip()
    if not transcript:
        return {"error": "transcript is required"}

    prompt = f"""
You are triaging a clinic voicemail transcript into a staff queue.
Return JSON only. No medical diagnosis. No clinical advice. Focus on operational routing.

Transcript:
{transcript}

Output fields:
- priority: Urgent | High | Normal
- type: a short category (e.g. Appointment change, Prescription refill, Lab results follow-up)
- summary: 1 sentence summary (no extra details)
- nextAction: 1 short action for admin/staff
- rationale: 1 sentence explaining why this priority/action was chosen
"""

    resp = chat_completions_create(
        model=model,
        messages=[
            {"role": "system", "content": "Return only JSON. No markdown. No backticks."},
            {"role": "user", "content": prompt.strip()},
        ],
        response_format=_voicemail_schema(),
        temperature=0.2,
        max_tokens=350,
    )
    text = extract_chat_text(resp)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {"priority": "Normal", "type": "General inquiry", "summary": transcript[:160], "nextAction": "Call back", "rationale": "Non-JSON model output"}

    parsed["model"] = model
    return parsed


def generate_image_via_openrouter(inputs: dict[str, Any], *, model: str) -> dict[str, Any]:
    """
    Generate an image via OpenRouter-compatible Chat Completions with modalities=["image"].
    Returns data URLs (typically base64).
    """
    prompt = (inputs.get("prompt") or "").strip()
    creative = inputs.get("creative") or {}
    if not prompt:
        headline = (creative.get("headline") or "").strip()
        primary = (creative.get("primaryText") or "").strip()
        cta = (creative.get("cta") or "").strip()
        stage = (creative.get("funnelStage") or "").strip()
        market = (creative.get("market") or "").strip()
        prompt = f"""
Create a clean square (1080x1080) static ad image concept for a healthcare B2B tool brand.
No logos, no trademarks, no real patient data, no medical claims.
Use a calming green palette with whitespace and minimal illustration.

Ad context:
- Funnel stage: {stage}
- Market: {market}

Text content:
- Headline: {headline}
- Primary text idea: {primary}
- CTA label: {cta}

Design guidance:
- Put headline in the upper third.
- Use simple abstract shapes (waves/leaf forms) and subtle gradient.
- Avoid photos of real people.
""".strip()

    modalities = inputs.get("modalities") or ["image"]
    resp = chat_completions_create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        modalities=modalities,
        temperature=0.7,
        max_tokens=300,
    )
    images = extract_chat_images(resp)
    text = extract_chat_text(resp)
    return {"model": model, "prompt": prompt, "modalities": modalities, "images": images, "text": text}


def _experiment_schema() -> dict[str, Any]:
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "experiment_plan",
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "page": {"type": "string"},
                    "goal": {"type": "string"},
                    "audience": {"type": "string"},
                    "objection": {"type": "string"},
                    "tests": {
                        "type": "array",
                        "minItems": 3,
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "properties": {
                                "name": {"type": "string"},
                                "hypothesis": {"type": "string"},
                                "metric": {"type": "string"},
                                "variations": {
                                    "type": "array",
                                    "minItems": 2,
                                    "items": {
                                        "type": "object",
                                        "additionalProperties": False,
                                        "properties": {
                                            "headline": {"type": "string"},
                                            "body": {"type": "string"},
                                        },
                                        "required": ["headline", "body"],
                                    },
                                },
                            },
                            "required": ["name", "hypothesis", "metric", "variations"],
                        },
                    },
                    "measurement": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "primary": {"type": "string"},
                            "guardrails": {"type": "array", "items": {"type": "string"}},
                            "segmentation": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["primary", "guardrails", "segmentation"],
                    },
                    "notes": {"type": "string"},
                },
                "required": ["page", "goal", "audience", "objection", "tests", "measurement", "notes"],
            },
        },
    }


def generate_experiment_plan_via_ai(inputs: dict[str, Any], *, model: str) -> dict[str, Any]:
    page = (inputs.get("page") or "").strip()
    goal = (inputs.get("goal") or "").strip()
    audience = (inputs.get("audience") or "").strip()
    objection = (inputs.get("objection") or "").strip()

    prompt = f"""
You are a growth/CRO assistant. Produce a practical A/B experiment plan for a B2B SaaS landing page.
Return JSON only (no markdown/backticks). No medical claims.

Inputs:
- Page/surface: {page}
- Primary goal metric: {goal}
- Audience: {audience}
- Top objection: {objection}

Output requirements:
- 3 to 5 tests.
- Each test includes: name, hypothesis, metric, and 2-4 copy variations (headline + body).
- Add measurement.primary, measurement.guardrails, measurement.segmentation.
- Keep copy short and specific.
""".strip()

    resp = chat_completions_create(
        model=model,
        messages=[
            {"role": "system", "content": "Return only JSON. No markdown. No backticks."},
            {"role": "user", "content": prompt},
        ],
        response_format=_experiment_schema(),
        temperature=0.6,
        max_tokens=1100,
    )
    text = extract_chat_text(resp)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {
            "page": page,
            "goal": goal,
            "audience": audience,
            "objection": objection,
            "tests": [],
            "measurement": {"primary": goal, "guardrails": [], "segmentation": []},
            "notes": f"Non-JSON model output: {text[:300]}...",
        }
    parsed["model"] = model
    return parsed
