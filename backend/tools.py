from __future__ import annotations

from dataclasses import dataclass
from typing import Any


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _as_float(value: Any, default: float) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _as_int(value: Any, default: int) -> int:
    try:
        if value is None or value == "":
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


@dataclass(frozen=True)
class AdminAuditInputs:
    patients_per_day: int
    work_days_per_week: int
    avg_note_minutes_per_patient: float
    after_hours_admin_minutes_per_day: float
    interruptions_per_hour: float
    handoffs_per_day: int


def build_admin_audit_report(responses: dict[str, Any]) -> dict[str, Any]:
    """
    Logged-out tool: quick estimate of admin burden + prioritized fixes.
    This is intentionally conservative and deterministic (no external model calls).
    """
    inputs = AdminAuditInputs(
        patients_per_day=_as_int(responses.get("patientsPerDay"), 18),
        work_days_per_week=_as_int(responses.get("workDaysPerWeek"), 5),
        avg_note_minutes_per_patient=_as_float(responses.get("noteMinutesPerPatient"), 6.0),
        after_hours_admin_minutes_per_day=_as_float(responses.get("afterHoursAdminMinutesPerDay"), 45.0),
        interruptions_per_hour=_as_float(responses.get("interruptionsPerHour"), 3.0),
        handoffs_per_day=_as_int(responses.get("handoffsPerDay"), 6),
    )

    patients_per_day = _clamp(inputs.patients_per_day, 1, 80)
    work_days_per_week = int(_clamp(inputs.work_days_per_week, 1, 7))
    note_minutes = _clamp(inputs.avg_note_minutes_per_patient, 1.0, 30.0)
    after_hours = _clamp(inputs.after_hours_admin_minutes_per_day, 0.0, 240.0)
    interruptions = _clamp(inputs.interruptions_per_hour, 0.0, 12.0)
    handoffs = _clamp(inputs.handoffs_per_day, 0, 40)

    weekly_note_minutes = patients_per_day * note_minutes * work_days_per_week
    weekly_after_hours_minutes = after_hours * work_days_per_week

    # Soft-cost: interruptions and handoffs create rework/context-switch.
    # These are deliberately approximate multipliers to keep the tool interpretable.
    interruption_overhead = weekly_note_minutes * (0.03 * interruptions)  # 0–36% extra
    handoff_overhead = weekly_note_minutes * (0.01 * min(handoffs, 20))  # cap at 20%

    weekly_admin_minutes = weekly_note_minutes + weekly_after_hours_minutes + interruption_overhead + handoff_overhead
    weekly_admin_hours = weekly_admin_minutes / 60.0
    annual_admin_hours = weekly_admin_hours * 48  # assume 4 weeks PTO / holidays

    # "Recoverable" is what a tool/system could plausibly return without changing patient volume.
    recoverable_pct = _clamp(0.25 + (0.02 * interruptions) + (0.01 * min(handoffs, 20)), 0.25, 0.55)
    annual_recoverable_hours = annual_admin_hours * recoverable_pct

    # A simple $ proxy for internal justification (editable by user later).
    implied_hourly_cost = 160.0
    annual_recoverable_value = annual_recoverable_hours * implied_hourly_cost

    priorities: list[dict[str, str]] = []
    if after_hours >= 60:
        priorities.append(
            {
                "title": "Attack after-hours charting first",
                "why": "After-hours admin is the clearest burnout driver and easiest to measure week-over-week.",
                "nextStep": "Start with 10 notes/week on a standardized template; review time-to-finish + edits.",
            }
        )
    if interruptions >= 4:
        priorities.append(
            {
                "title": "Reduce context switching",
                "why": "Frequent interruptions inflate note time via rework and missed details.",
                "nextStep": "Introduce a 2-hour protected documentation block and a 'capture now, finish later' workflow.",
            }
        )
    if handoffs >= 10:
        priorities.append(
            {
                "title": "Standardize handoffs",
                "why": "Unstructured handoffs create duplicate documentation and unsafe gaps.",
                "nextStep": "Adopt a one-page shared summary format for internal referrals and follow-ups.",
            }
        )
    if not priorities:
        priorities.append(
            {
                "title": "Optimize templates and shortcuts",
                "why": "Even moderate note time adds up; small wins compound across the week.",
                "nextStep": "Add 3 reusable templates (routine follow-up, acute visit, referral) and measure completion time.",
            }
        )

    return {
        "inputs": {
            "patientsPerDay": int(patients_per_day),
            "workDaysPerWeek": int(work_days_per_week),
            "noteMinutesPerPatient": round(note_minutes, 1),
            "afterHoursAdminMinutesPerDay": round(after_hours, 0),
            "interruptionsPerHour": round(interruptions, 1),
            "handoffsPerDay": int(handoffs),
        },
        "results": {
            "weeklyAdminHours": round(weekly_admin_hours, 1),
            "annualAdminHours": round(annual_admin_hours, 0),
            "annualRecoverableHours": round(annual_recoverable_hours, 0),
            "annualRecoverableValueUSD": int(round(annual_recoverable_value, 0)),
            "recoverablePercent": int(round(recoverable_pct * 100, 0)),
        },
        "priorities": priorities,
        "cta": {
            "headline": "See what this looks like inside Heidi",
            "body": "If you want, we can turn your top 3 fixes into a ready-to-run workflow and templates in under 15 minutes.",
            "primaryAction": "Join the waitlist / request demo",
        },
    }


def generate_creatives(inputs: dict[str, Any]) -> dict[str, Any]:
    """
    Deterministic creative generator that can later be swapped for a real model call.
    """
    persona = (inputs.get("persona") or "GP").strip()
    market = (inputs.get("market") or "Australia").strip()
    stage = (inputs.get("funnelStage") or "Awareness").strip()
    language = (inputs.get("language") or "en").strip().lower()

    base_hooks = {
        "Awareness": [
            "You finish clinic at 5pm. Your work doesn't.",
            "The computer is stealing the consult.",
            "Charting shouldn't be your second job.",
        ],
        "Mid-Funnel": [
            "See your time saved in 60 seconds.",
            "Templates that learn your style.",
            "Your notes, your voice — just faster.",
        ],
        "Conversion": [
            "Try it on your next patient — free for 14 days.",
            "Book a 10-minute demo. Leave with a template.",
            "Start today. Cancel anytime.",
        ],
    }

    ct_as = {
        "Awareness": "Learn how it works",
        "Mid-Funnel": "See the calculator",
        "Conversion": "Start free trial",
    }

    hooks = base_hooks.get(stage, base_hooks["Awareness"])
    cta = ct_as.get(stage, "Learn more")

    if language == "es":
        hooks = [
            "Tu consulta termina. El papeleo no.",
            "Menos pantalla. Más paciente.",
            "Tus notas, tu estilo — más rápido.",
        ]
        cta = "Ver cómo funciona"

    creatives = []
    for i, hook in enumerate(hooks[:3], start=1):
        creatives.append(
            {
                "id": f"{stage.lower()}-{i}",
                "persona": persona,
                "market": market,
                "funnelStage": stage,
                "language": language,
                "headline": hook,
                "primaryText": f"For {persona}s in {market}: reduce admin load without sacrificing note quality.",
                "cta": cta,
                "tags": [stage.lower(), persona.lower().replace(" ", "-"), market.lower().replace(" ", "-")],
                "format": "Square (1080×1080) - static",
            }
        )

    return {"inputs": {"persona": persona, "market": market, "funnelStage": stage, "language": language}, "creatives": creatives}

