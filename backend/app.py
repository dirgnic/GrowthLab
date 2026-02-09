import os
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from challenges import get_all_challenges, get_challenge_by_id
from tools import build_admin_audit_report, generate_creatives, generate_template_pack
from ai_client import get_provider, is_configured as ai_is_configured
from ai_pipelines import generate_creatives_via_openai, generate_image_via_openrouter, triage_voicemail_via_openai
from ai_pipelines import generate_experiment_plan_via_ai
from storage import (
    DEFAULT_DB_PATH,
    add_waitlist_entry,
    connect,
    create_artifact,
    create_simulation_run,
    init_db,
    list_artifacts,
    list_simulation_runs,
    list_waitlist,
    log_event,
    summarize_events,
    update_artifact,
)
from exporter import export_task_markdown
from media import generate_ad_mock_svg

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

init_db(DEFAULT_DB_PATH)

@app.route('/api/challenges', methods=['GET'])
def challenges():
    """Get all challenges"""
    return jsonify(get_all_challenges())

@app.route('/api/challenges/<challenge_id>', methods=['GET'])
def challenge(challenge_id):
    """Get a specific challenge by ID"""
    ch = get_challenge_by_id(challenge_id)
    if ch:
        return jsonify(ch)
    return jsonify({'error': 'Challenge not found'}), 404

@app.route('/api/tasks', methods=['GET'])
def tasks_alias():
    return jsonify(get_all_challenges())

@app.route('/api/tasks/<task_id>', methods=['GET'])
def task_alias(task_id):
    ch = get_challenge_by_id(task_id)
    if ch:
        return jsonify(ch)
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'dbPath': DEFAULT_DB_PATH, "aiProvider": get_provider(), "aiConfigured": ai_is_configured()})

@app.route('/api/tools/admin-audit/report', methods=['POST'])
def admin_audit_report():
    payload = request.get_json(silent=True) or {}
    responses = payload.get("responses") or {}
    return jsonify(build_admin_audit_report(responses))

@app.route('/api/tools/creative/generate', methods=['POST'])
def creative_generate():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    return jsonify(generate_creatives(inputs))

@app.route('/api/tools/creative/seed-required-set', methods=['POST'])
def creative_seed_required_set():
    """
    Create (or tag) a required creative set for the Creative System Audit:
    - 3 awareness (EN)
    - 2 mid-funnel (EN)
    - 1 conversion (EN)
    - 1 non-English (any stage; we use Mid-Funnel)
    This is deterministic (no AI key required) so the audit can always be made PASS.
    """
    payload = request.get_json(silent=True) or {}
    task_id = (payload.get("taskId") or "paid-media-b").strip()
    base_inputs = payload.get("inputs") or {}
    persona = (base_inputs.get("persona") or "GP").strip()
    market = (base_inputs.get("market") or "Australia").strip()
    base_language = (base_inputs.get("language") or "en").strip().lower()
    non_english_language = (payload.get("nonEnglishLanguage") or ("es" if base_language == "en" else "en")).strip().lower()
    if non_english_language == "en":
        non_english_language = "es"

    plan = [
        {"funnelStage": "Awareness", "language": "en", "n": 3},
        {"funnelStage": "Mid-Funnel", "language": "en", "n": 2},
        {"funnelStage": "Conversion", "language": "en", "n": 1},
        {"funnelStage": "Mid-Funnel", "language": non_english_language, "n": 1},
    ]

    with connect() as conn:
        existing = list_artifacts(conn, task_id=task_id, type="creative", limit=500)
        headline_seen: set[str] = set()
        for a in existing:
            h = ((a.get("contentJson") or {}).get("headline") or "").strip()
            if h:
                headline_seen.add(h.lower())

        created_ids: list[str] = []
        updated_ids: list[str] = []

        def promote_candidates(stage: str, language: str, needed: int) -> int:
            if needed <= 0:
                return 0
            candidates = []
            for a in existing:
                if (a.get("tags") or {}).get("requiredSet"):
                    continue
                c = a.get("contentJson") or {}
                if c.get("funnelStage") != stage:
                    continue
                lang = (c.get("language") or "en").strip().lower()
                if lang != language:
                    continue
                candidates.append(a)

            promoted = 0
            for a in candidates[:needed]:
                tags = dict(a.get("tags") or {})
                tags["requiredSet"] = True
                tags.setdefault("funnelStage", stage)
                tags.setdefault("persona", persona)
                tags.setdefault("market", market)
                tags.setdefault("language", language)
                tags.setdefault("source", "seed-required-set:promote")
                update_artifact(conn, a["id"], tags=tags)
                updated_ids.append(a["id"])
                promoted += 1
            return promoted

        for item in plan:
            stage = item["funnelStage"]
            language = item["language"]
            needed = int(item["n"])

            promoted = promote_candidates(stage, language, needed)
            needed -= promoted

            if needed <= 0:
                continue

            out = generate_creatives({"persona": persona, "market": market, "funnelStage": stage, "language": language})
            for c in out.get("creatives") or []:
                if needed <= 0:
                    break
                headline = (c.get("headline") or "").strip()
                if headline and headline.lower() in headline_seen:
                    continue
                if headline:
                    headline_seen.add(headline.lower())
                artifact_id = str(uuid.uuid4())
                created = create_artifact(
                    conn,
                    artifact_id=artifact_id,
                    task_id=task_id,
                    type="creative",
                    status="draft",
                    tags={
                        "funnelStage": stage,
                        "persona": persona,
                        "market": market,
                        "language": language,
                        "requiredSet": True,
                        "source": "seed-required-set:generate",
                    },
                    content_json=c,
                    content_markdown=None,
                )
                created_ids.append(created["id"])
                needed -= 1

        log_event(
            conn,
            event_id=str(uuid.uuid4()),
            task_id=task_id,
            name="seeded_required_creative_set",
            props={"created": len(created_ids), "updated": len(updated_ids)},
        )
        conn.commit()

    return jsonify({"taskId": task_id, "createdIds": created_ids, "updatedIds": updated_ids})

@app.route('/api/tools/templates/generate', methods=['POST'])
def templates_generate():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    return jsonify(generate_template_pack(inputs))

@app.route('/api/tools/templates/save', methods=['POST'])
def templates_save():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    task_id = (payload.get("taskId") or "paid-media-a").strip()
    pack = generate_template_pack(inputs)

    artifact_id = str(uuid.uuid4())
    with connect() as conn:
        created = create_artifact(
            conn,
            artifact_id=artifact_id,
            task_id=task_id,
            type="template-pack",
            status="draft",
            tags={"source": "admin-audit", "locale": pack.get("locale"), "specialty": pack.get("specialty")},
            content_json=pack,
            content_markdown=None,
        )
        log_event(conn, event_id=str(uuid.uuid4()), task_id=task_id, name="generated_template_pack", props={"artifactId": artifact_id})
        conn.commit()

    return jsonify(created)

@app.route('/api/tools/media/mock', methods=['POST'])
def media_mock():
    payload = request.get_json(silent=True) or {}
    return jsonify(generate_ad_mock_svg(payload))

@app.route('/api/ai/status', methods=['GET'])
def ai_status():
    return jsonify(
        {
            "provider": get_provider(),
            "aiConfigured": ai_is_configured(),
            "supportedPipelines": ["creative.generate", "voicemail.triage", "growth.experiment_plan"],
            "recommendedModels": [
                # OpenRouter-style ids also work on OpenAI-compatible backends that accept them.
                "openai/gpt-4o-mini",
                "openai/gpt-4.1-mini",
                "anthropic/claude-3.5-sonnet",
            ],
            "recommendedImageModels": [
                "black-forest-labs/flux.2-flex",
                "sourceful/riverflow-v2-standard-preview",
                "google/gemini-2.5-flash-image-preview",
            ],
        }
    )

@app.route('/api/ai/creative/generate', methods=['POST'])
def ai_creative_generate():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    model = (payload.get("model") or "openai/gpt-4o-mini").strip()

    if not ai_is_configured():
        return jsonify({"error": "AI key not configured on backend"}), 400

    try:
        out = generate_creatives_via_openai(inputs, model=model)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(out)

@app.route('/api/ai/voicemail/triage', methods=['POST'])
def ai_voicemail_triage():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    model = (payload.get("model") or "openai/gpt-4o-mini").strip()

    if not ai_is_configured():
        return jsonify({"error": "AI key not configured on backend"}), 400

    try:
        out = triage_voicemail_via_openai(inputs, model=model)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(out)

@app.route('/api/ai/media/generate', methods=['POST'])
def ai_media_generate():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    model = (payload.get("model") or "black-forest-labs/flux.2-flex").strip()

    if not ai_is_configured():
        return jsonify({"error": "AI key not configured on backend"}), 400

    # For now, we assume OpenRouter models for image generation.
    try:
        out = generate_image_via_openrouter(inputs, model=model)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(out)

@app.route('/api/ai/growth/experiment-plan', methods=['POST'])
def ai_growth_experiment_plan():
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    model = (payload.get("model") or "openai/gpt-4o-mini").strip()

    if not ai_is_configured():
        return jsonify({"error": "AI key not configured on backend"}), 400

    try:
        out = generate_experiment_plan_via_ai(inputs, model=model)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(out)

@app.route('/api/artifacts', methods=['GET'])
def artifacts_list():
    task_id = request.args.get("task_id")
    type = request.args.get("type")
    status = request.args.get("status")
    limit = int(request.args.get("limit", "200"))
    with connect() as conn:
        return jsonify(list_artifacts(conn, task_id=task_id, type=type, status=status, limit=limit))

@app.route('/api/artifacts', methods=['POST'])
def artifacts_create():
    payload = request.get_json(silent=True) or {}
    task_id = payload.get("taskId")
    type = payload.get("type")
    status = payload.get("status") or "draft"
    tags = payload.get("tags") or {}
    content_json = payload.get("contentJson")
    content_markdown = payload.get("contentMarkdown")

    if not task_id or not type:
        return jsonify({"error": "taskId and type are required"}), 400

    artifact_id = str(uuid.uuid4())
    with connect() as conn:
        created = create_artifact(
            conn,
            artifact_id=artifact_id,
            task_id=str(task_id),
            type=str(type),
            status=str(status),
            tags=tags,
            content_json=content_json,
            content_markdown=content_markdown,
        )
        conn.commit()
    return jsonify(created)

@app.route('/api/artifacts/<artifact_id>', methods=['PATCH'])
def artifacts_update(artifact_id: str):
    payload = request.get_json(silent=True) or {}
    with connect() as conn:
        updated = update_artifact(
            conn,
            artifact_id,
            status=payload.get("status"),
            tags=payload.get("tags"),
            content_json=payload.get("contentJson"),
            content_markdown=payload.get("contentMarkdown"),
        )
        if not updated:
            return jsonify({"error": "Artifact not found"}), 404
        conn.commit()
    return jsonify(updated)

@app.route('/api/events', methods=['POST'])
def events_log():
    payload = request.get_json(silent=True) or {}
    task_id = payload.get("taskId")
    name = payload.get("name")
    props = payload.get("props") or {}
    if not name:
        return jsonify({"error": "name is required"}), 400

    event_id = str(uuid.uuid4())
    with connect() as conn:
        ev = log_event(conn, event_id=event_id, task_id=task_id, name=str(name), props=props)
        conn.commit()
    return jsonify(ev)

@app.route('/api/events/summary', methods=['GET'])
def events_summary():
    task_id = request.args.get("task_id")
    with connect() as conn:
        return jsonify(summarize_events(conn, task_id=task_id))

@app.route('/api/waitlist', methods=['POST'])
def waitlist_add():
    payload = request.get_json(silent=True) or {}
    email = (payload.get("email") or "").strip()
    if not email or "@" not in email:
        return jsonify({"error": "valid email is required"}), 400
    country = payload.get("country")
    role = payload.get("role")
    source = payload.get("source")

    entry_id = str(uuid.uuid4())
    with connect() as conn:
        entry = add_waitlist_entry(conn, entry_id=entry_id, email=email, country=country, role=role, source=source)
        conn.commit()
    return jsonify(entry)

@app.route('/api/waitlist', methods=['GET'])
def waitlist_list():
    limit = int(request.args.get("limit", "200"))
    with connect() as conn:
        return jsonify(list_waitlist(conn, limit=limit))

@app.route('/api/simulate/<task_id>', methods=['POST'])
def simulate(task_id: str):
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}

    # Minimal deterministic simulation for demo: a generic funnel with tunable rates.
    impressions = int(inputs.get("impressions", 50000))
    ctr = float(inputs.get("ctr", 0.012))
    landing_to_waitlist = float(inputs.get("landingToWaitlist", 0.07))
    waitlist_to_demo = float(inputs.get("waitlistToDemo", 0.25))

    clicks = int(impressions * max(0.0, min(0.2, ctr)))
    waitlist = int(clicks * max(0.0, min(0.8, landing_to_waitlist)))
    demos = int(waitlist * max(0.0, min(0.9, waitlist_to_demo)))

    outputs = {
        "funnel": {"impressions": impressions, "clicks": clicks, "waitlist": waitlist, "demos": demos},
        "rates": {"ctr": ctr, "landingToWaitlist": landing_to_waitlist, "waitlistToDemo": waitlist_to_demo},
        "notes": "Directional simulation for leading-signal planning (not a forecast).",
    }

    run_id = str(uuid.uuid4())
    with connect() as conn:
        run = create_simulation_run(conn, run_id=run_id, task_id=task_id, inputs=inputs, outputs=outputs)
        conn.commit()
    return jsonify(run)

@app.route('/api/simulations', methods=['GET'])
def simulations_list():
    task_id = request.args.get("task_id")
    if not task_id:
        return jsonify({"error": "task_id is required"}), 400
    limit = int(request.args.get("limit", "50"))
    with connect() as conn:
        return jsonify(list_simulation_runs(conn, task_id=task_id, limit=limit))

@app.route('/api/export/<task_id>', methods=['GET'])
def export_task(task_id: str):
    fmt = (request.args.get("format") or "markdown").lower()
    task = get_challenge_by_id(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    with connect() as conn:
        artifacts = list_artifacts(conn, task_id=task_id, limit=200)

    if fmt in ("md", "markdown"):
        md = export_task_markdown(task, artifacts=artifacts)
        return app.response_class(md, mimetype="text/markdown; charset=utf-8")
    if fmt in ("json",):
        return jsonify({"task": task, "artifacts": artifacts})
    return jsonify({"error": "format must be markdown or json"}), 400

@app.route('/api/webhooks/n8n/creative', methods=['POST'])
def n8n_creative_webhook():
    """
    Endpoint designed for n8n (or any automation tool) to run an AI pipeline
    and persist results as artifacts so the system is demonstrably end-to-end.
    """
    payload = request.get_json(silent=True) or {}
    inputs = payload.get("inputs") or {}
    model = (payload.get("model") or "openai/gpt-4o-mini").strip()
    task_id = (payload.get("taskId") or "paid-media-b").strip()

    if not ai_is_configured():
        return jsonify({"error": "AI key not configured on backend"}), 400

    out = generate_creatives_via_openai(inputs, model=model)
    created_ids: list[str] = []
    with connect() as conn:
        for c in out.get("creatives") or []:
            artifact_id = str(uuid.uuid4())
            created = create_artifact(
                conn,
                artifact_id=artifact_id,
                task_id=task_id,
                type="creative",
                status="draft",
                tags={
                    "source": "n8n",
                    "model": model,
                    "funnelStage": c.get("funnelStage"),
                    "market": c.get("market"),
                    "persona": c.get("persona"),
                    "language": c.get("language"),
                },
                content_json=c,
                content_markdown=None,
            )
            created_ids.append(created["id"])
        conn.commit()

    try:
        with connect() as conn:
            log_event(conn, event_id=str(uuid.uuid4()), task_id=task_id, name="n8n_pipeline_run", props={"created": len(created_ids), "model": model})
            conn.commit()
    except Exception:
        pass

    return jsonify({"ok": True, "created": len(created_ids), "artifactIds": created_ids, "model": model})

if __name__ == '__main__':
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    app.run(debug=True, host=host, port=port)
