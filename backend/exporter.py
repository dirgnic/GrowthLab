from __future__ import annotations

import json
from typing import Any


def export_task_markdown(task: dict[str, Any], artifacts: list[dict[str, Any]] | None = None) -> str:
    artifacts = artifacts or []
    lines: list[str] = []
    lines.append(f"# {task.get('title','')}".strip())
    lines.append("")
    lines.append(f"**Category:** {task.get('category','')}".strip())
    lines.append("")
    lines.append("## Brief")
    lines.append(task.get("description", ""))
    lines.append("")
    lines.append("## Required Deliverables")
    for r in task.get("requirements") or []:
        lines.append(f"- {r}")
    lines.append("")
    lines.append("## Solution (Structured)")
    solution = task.get("solution") or {}
    lines.append(f"- **Type:** {solution.get('type','')}")
    lines.append("")
    try:
        lines.append("```json")
        lines.append(json.dumps(solution.get("data"), ensure_ascii=False, indent=2))
        lines.append("```")
    except TypeError:
        lines.append("_Solution data not JSON-serializable._")
    lines.append("")

    if artifacts:
        lines.append("## Artifacts")
        for a in artifacts:
            lines.append(f"### {a.get('type','artifact')} — {a.get('status','')}")
            lines.append(f"- id: `{a.get('id','')}`")
            if a.get("tags"):
                lines.append(f"- tags: `{json.dumps(a.get('tags'), ensure_ascii=False)}`")
            if a.get("contentMarkdown"):
                lines.append("")
                lines.append(a.get("contentMarkdown"))
                lines.append("")
            elif a.get("contentJson") is not None:
                lines.append("")
                lines.append("```json")
                lines.append(json.dumps(a.get("contentJson"), ensure_ascii=False, indent=2))
                lines.append("```")
                lines.append("")

    return "\n".join(lines).strip() + "\n"

