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

    # Deterministic, clinician-first copy (no consumer "health companion" framing).
    channels = {
        "Awareness": ["Meta (Reels/Feed)", "YouTube Shorts", "LinkedIn"],
        "Mid-Funnel": ["Meta Retargeting", "Google Display", "LinkedIn Retargeting"],
        "Conversion": ["LinkedIn", "Google Search (limited)", "Meta Retargeting"],
    }

    base = {
        "Awareness": [
            {
                "headline": "You finish clinic at 5pm. Your work doesn’t.",
                "primaryText": "Most clinicians do a second shift at night: notes. Heidi helps you reclaim after-hours time without sacrificing quality.",
                "creativeDirection": "Close-up: clinician closing laptop at 9:47pm; overlay text: “Unpaid shift.” Cut to calm consult moment.",
            },
            {
                "headline": "The third person in the consult is the computer.",
                "primaryText": "Patients notice when screens win. Heidi drafts notes so you can stay present and keep the conversation human.",
                "creativeDirection": "Split-screen: eye contact vs typing. Simple animation of notes being drafted in the background.",
            },
            {
                "headline": "Charting shouldn’t be your second job.",
                "primaryText": "If documentation is stealing evenings, it’s not a willpower problem — it’s a workflow problem. Start with a 60-second audit.",
                "creativeDirection": "Minimal UI: audit inputs → result card “hours/year” → CTA.",
            },
        ],
        "Mid-Funnel": [
            {
                "headline": "How many hours does your clinic lose to admin?",
                "primaryText": "Answer 6 questions. Get a personalized estimate + the top 3 fixes to cut admin load this month.",
                "creativeDirection": "Calculator-style card + bold number result + checklist of 3 fixes.",
            },
            {
                "headline": "Templates that don’t break what works.",
                "primaryText": "Version history + easy edits mean you can iterate safely. Keep your clinic’s style while reducing manual typing.",
                "creativeDirection": "Before/after template preview with “Restore version” interaction highlight.",
            },
            {
                "headline": "Your notes are your fingerprint.",
                "primaryText": "Heidi adapts to your structure and tone — then helps you produce consistent notes faster across the week.",
                "creativeDirection": "Carousel: 3 specialties, same structure, consistent tone.",
            },
        ],
        "Conversion": [
            {
                "headline": "Pilot clinics: limited spots.",
                "primaryText": "Try Heidi on real workflows. Bring one template and one use case — leave with a working setup in 15 minutes.",
                "creativeDirection": "Clean offer card: “15-min setup” + calendar CTA + trust badges (no claims).",
            },
            {
                "headline": "Book a 10-minute demo. Leave with a template.",
                "primaryText": "No long sales call. We’ll set up a first template together and measure time-to-finish on your next notes.",
                "creativeDirection": "Simple calendar UI + screenshot-style template builder preview.",
            },
        ],
    }

    ctas = {"Awareness": "Run the audit", "Mid-Funnel": "See your result", "Conversion": "Book a quick demo"}

    if language == "es":
        base = {
            "Awareness": [
                {
                    "headline": "Tu consulta termina. El papeleo no.",
                    "primaryText": "Muchos clínicos hacen un segundo turno por la noche: notas. Heidi te devuelve tiempo sin perder calidad.",
                    "creativeDirection": "Reloj nocturno + portátil + resultado en tarjeta (horas/año).",
                },
                {
                    "headline": "Menos pantalla. Más paciente.",
                    "primaryText": "Heidi redacta notas para que puedas mantener el contacto y la conversación humana.",
                    "creativeDirection": "Split-screen: mirada al paciente vs tecleo; el borrador aparece solo.",
                },
                {
                    "headline": "Documentar no debería robarte la noche.",
                    "primaryText": "Empieza con una auditoría de 60 segundos y un plan de 3 pasos para reducir carga administrativa.",
                    "creativeDirection": "UI del audit + lista de 3 pasos.",
                },
            ],
            "Mid-Funnel": [
                {
                    "headline": "¿Cuántas horas pierdes en administración?",
                    "primaryText": "6 preguntas. Resultado personalizado + prioridades claras para actuar esta semana.",
                    "creativeDirection": "Tarjeta de resultado + checklist.",
                },
                {
                    "headline": "Plantillas sin miedo a romper lo que funciona.",
                    "primaryText": "Historial de versiones y ediciones seguras para mantener el estilo de tu clínica.",
                    "creativeDirection": "Vista “restaurar versión” destacada.",
                },
            ],
            "Conversion": [
                {
                    "headline": "Clínicas piloto: cupos limitados.",
                    "primaryText": "Trae un caso y una plantilla. Sal con un flujo funcionando en 15 minutos.",
                    "creativeDirection": "Oferta clara + CTA calendario.",
                }
            ],
        }

    items = base.get(stage, base["Awareness"])
    cta = ctas.get(stage, "Learn more")
    platform_choices = channels.get(stage, channels["Awareness"])

    creatives = []
    for i, item in enumerate(items[:3], start=1):
        creatives.append(
            {
                "id": f"{stage.lower()}-{i}",
                "persona": persona,
                "market": market,
                "funnelStage": stage,
                "language": language,
                "headline": item["headline"],
                "primaryText": item["primaryText"],
                "cta": cta,
                "tags": [stage.lower(), persona.lower().replace(" ", "-"), market.lower().replace(" ", "-")],
                "format": "Square (1080×1080) - static",
                "platform": platform_choices[(i - 1) % len(platform_choices)],
                "creativeDirection": item["creativeDirection"],
                "complianceNotes": [
                    "No patient data.",
                    "No clinical claims (time saved depends on workflow).",
                    "Avoid implying diagnosis/treatment.",
                ],
            }
        )

    return {"inputs": {"persona": persona, "market": market, "funnelStage": stage, "language": language}, "creatives": creatives}


def generate_template_pack(inputs: dict[str, Any]) -> dict[str, Any]:
    """
    Lightweight deliverable: generates 3 reusable note templates (text) as a pack.
    Intended for the Admin Burden Audit "next step" to feel real and exportable.
    """
    specialty = (inputs.get("specialty") or "General Practice").strip()
    tone = (inputs.get("tone") or "concise").strip()
    locale = (inputs.get("locale") or "en").strip().lower()

    def block(title: str, lines: list[str]) -> str:
        body = "\n".join([f"- {l}" for l in lines])
        return f"## {title}\n{body}\n"

    templates = []

    templates.append(
        {
            "id": "routine-follow-up",
            "title": "Routine follow-up",
            "format": "SOAP",
            "markdown": block(
                "Subjective",
                ["Chief complaint:", "Interval history:", "Med adherence / side effects:", "ROS (relevant):"],
            )
            + block("Objective", ["Vitals:", "Exam (focused):", "Results reviewed:"])
            + block("Assessment", ["Problem list (prioritized):", "Stability / change since last visit:"])
            + block("Plan", ["Continue / adjust meds:", "Counseling:", "Tests ordered:", "Follow-up interval:", "Safety netting:"]),
        }
    )

    templates.append(
        {
            "id": "acute-visit",
            "title": "Acute visit",
            "format": "SOAP + red flags",
            "markdown": block(
                "Subjective",
                ["Chief complaint:", "Onset / duration:", "Severity / trajectory:", "Associated symptoms:", "Red flags (explicitly assessed):"],
            )
            + block("Objective", ["Vitals:", "Exam (focused):", "POC tests / imaging (if any):"])
            + block("Assessment", ["Most likely diagnosis:", "Differentials considered:", "Reasoning (1-2 lines):"])
            + block(
                "Plan",
                [
                    "Treatment:",
                    "Patient instructions:",
                    "Return precautions (clear):",
                    "Follow-up plan:",
                    "Escalation if worse:",
                ],
            ),
        }
    )

    templates.append(
        {
            "id": "referral-letter",
            "title": "Referral / handoff",
            "format": "SBAR",
            "markdown": block("Situation", ["Reason for referral:", "Urgency:", "Key question you want answered:"])
            + block("Background", ["Relevant history:", "Medications:", "Allergies:", "Pertinent negatives:"])
            + block("Assessment", ["Working diagnosis / concerns:", "Key findings/results:"])
            + block("Recommendation", ["Requested action:", "Suggested next steps:", "Preferred communication loop closure:"]),
        }
    )

    return {
        "specialty": specialty,
        "tone": tone,
        "locale": locale,
        "templates": templates,
        "notes": "Templates are generic starter formats. In production, these would be customized per clinic and versioned.",
    }
