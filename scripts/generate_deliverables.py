#!/usr/bin/env python3
from __future__ import annotations

import json
import types
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables" / "sample_outputs"


def load_challenges() -> list[dict]:
    ns: dict = {}
    text = (ROOT / "backend" / "challenges.py").read_text()
    exec(text, ns)
    return ns["CHALLENGES"]


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    challenges = load_challenges()

    # Export each challenge's structured solution to a file (submission-friendly).
    exports_dir = OUT / "challenge_exports"
    exports_dir.mkdir(parents=True, exist_ok=True)
    for c in challenges:
        write_json(exports_dir / f"{c['id']}.json", c)

    # Deterministic samples from local generators (no keys).
    tools_ns: dict = {}
    exec((ROOT / "backend" / "tools.py").read_text(), tools_ns)
    media_ns: dict = {}
    exec((ROOT / "backend" / "media.py").read_text(), media_ns)

    generate_creatives = tools_ns["generate_creatives"]
    generate_template_pack = tools_ns["generate_template_pack"]
    generate_ad_mock_svg = media_ns["generate_ad_mock_svg"]

    write_json(
        OUT / "creative_local_awareness.json",
        generate_creatives({"persona": "GP", "market": "Romania", "funnelStage": "Awareness", "language": "en"}),
    )
    write_json(
        OUT / "creative_local_non_english.json",
        generate_creatives({"persona": "GP", "market": "Romania", "funnelStage": "Mid-Funnel", "language": "es"}),
    )
    write_json(OUT / "template_pack.json", generate_template_pack({"specialty": "General Practice", "tone": "concise", "locale": "en"}))

    svg = generate_ad_mock_svg(
        {
            "headline": "Charting shouldn’t be your second job.",
            "primaryText": "Reclaim after-hours time without sacrificing note quality.",
            "cta": "Run the audit",
            "funnelStage": "Awareness",
            "market": "Romania",
        }
    )["svg"]
    (OUT / "ad_mock.svg").write_text(svg)

    print(f"Wrote samples to: {OUT}")


if __name__ == "__main__":
    main()
