from __future__ import annotations

import json
import os
import sqlite3
import time
from typing import Any, Iterable

DEFAULT_DB_PATH = os.environ.get("DB_PATH") or os.path.join(os.path.dirname(__file__), "app.db")


def _utc_epoch_ms() -> int:
    return int(time.time() * 1000)


def init_db(db_path: str = DEFAULT_DB_PATH) -> None:
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA foreign_keys=ON;")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS artifacts (
              id TEXT PRIMARY KEY,
              task_id TEXT NOT NULL,
              type TEXT NOT NULL,
              status TEXT NOT NULL,
              tags_json TEXT NOT NULL,
              content_json TEXT,
              content_markdown TEXT,
              created_at_ms INTEGER NOT NULL,
              updated_at_ms INTEGER NOT NULL
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_task_id ON artifacts(task_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(type);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_artifacts_status ON artifacts(status);")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
              id TEXT PRIMARY KEY,
              task_id TEXT,
              name TEXT NOT NULL,
              props_json TEXT NOT NULL,
              created_at_ms INTEGER NOT NULL
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_task_id ON events(task_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at_ms);")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS waitlist (
              id TEXT PRIMARY KEY,
              email TEXT NOT NULL,
              country TEXT,
              role TEXT,
              source TEXT,
              created_at_ms INTEGER NOT NULL,
              UNIQUE(email, source)
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at_ms);")

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS simulation_runs (
              id TEXT PRIMARY KEY,
              task_id TEXT NOT NULL,
              inputs_json TEXT NOT NULL,
              outputs_json TEXT NOT NULL,
              created_at_ms INTEGER NOT NULL
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sim_task ON simulation_runs(task_id);")


def _row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {k: row[k] for k in row.keys()}


def _json_dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


def _json_loads(value: str | None, default: Any) -> Any:
    if not value:
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default


def connect(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def create_artifact(
    conn: sqlite3.Connection,
    *,
    artifact_id: str,
    task_id: str,
    type: str,
    status: str,
    tags: dict[str, Any] | None,
    content_json: dict[str, Any] | None,
    content_markdown: str | None,
) -> dict[str, Any]:
    now = _utc_epoch_ms()
    conn.execute(
        """
        INSERT INTO artifacts (
          id, task_id, type, status, tags_json, content_json, content_markdown, created_at_ms, updated_at_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            artifact_id,
            task_id,
            type,
            status,
            _json_dumps(tags or {}),
            _json_dumps(content_json) if content_json is not None else None,
            content_markdown,
            now,
            now,
        ),
    )
    return get_artifact(conn, artifact_id)


def update_artifact(
    conn: sqlite3.Connection,
    artifact_id: str,
    *,
    status: str | None = None,
    tags: dict[str, Any] | None = None,
    content_json: dict[str, Any] | None = None,
    content_markdown: str | None = None,
) -> dict[str, Any] | None:
    now = _utc_epoch_ms()
    current = get_artifact(conn, artifact_id)
    if not current:
        return None

    next_status = status if status is not None else current["status"]
    next_tags = tags if tags is not None else current["tags"]
    next_content_json = content_json if content_json is not None else current["contentJson"]
    next_content_markdown = content_markdown if content_markdown is not None else current["contentMarkdown"]

    conn.execute(
        """
        UPDATE artifacts
        SET status = ?, tags_json = ?, content_json = ?, content_markdown = ?, updated_at_ms = ?
        WHERE id = ?
        """,
        (
            next_status,
            _json_dumps(next_tags or {}),
            _json_dumps(next_content_json) if next_content_json is not None else None,
            next_content_markdown,
            now,
            artifact_id,
        ),
    )
    return get_artifact(conn, artifact_id)


def get_artifact(conn: sqlite3.Connection, artifact_id: str) -> dict[str, Any] | None:
    row = conn.execute("SELECT * FROM artifacts WHERE id = ?", (artifact_id,)).fetchone()
    if not row:
        return None
    d = _row_to_dict(row)
    return {
        "id": d["id"],
        "taskId": d["task_id"],
        "type": d["type"],
        "status": d["status"],
        "tags": _json_loads(d["tags_json"], {}),
        "contentJson": _json_loads(d["content_json"], None),
        "contentMarkdown": d["content_markdown"],
        "createdAtMs": d["created_at_ms"],
        "updatedAtMs": d["updated_at_ms"],
    }


def list_artifacts(
    conn: sqlite3.Connection,
    *,
    task_id: str | None = None,
    type: str | None = None,
    status: str | None = None,
    limit: int = 200,
) -> list[dict[str, Any]]:
    where: list[str] = []
    params: list[Any] = []
    if task_id:
        where.append("task_id = ?")
        params.append(task_id)
    if type:
        where.append("type = ?")
        params.append(type)
    if status:
        where.append("status = ?")
        params.append(status)

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    rows = conn.execute(
        f"SELECT * FROM artifacts {where_sql} ORDER BY updated_at_ms DESC LIMIT ?",
        (*params, int(limit)),
    ).fetchall()
    return [get_artifact(conn, r["id"]) for r in rows if r]


def log_event(
    conn: sqlite3.Connection,
    *,
    event_id: str,
    task_id: str | None,
    name: str,
    props: dict[str, Any] | None,
) -> dict[str, Any]:
    now = _utc_epoch_ms()
    conn.execute(
        """
        INSERT INTO events (id, task_id, name, props_json, created_at_ms)
        VALUES (?, ?, ?, ?, ?)
        """,
        (event_id, task_id, name, _json_dumps(props or {}), now),
    )
    return {"id": event_id, "taskId": task_id, "name": name, "props": props or {}, "createdAtMs": now}


def list_events(
    conn: sqlite3.Connection,
    *,
    task_id: str | None = None,
    name: str | None = None,
    limit: int = 200,
) -> list[dict[str, Any]]:
    where: list[str] = []
    params: list[Any] = []
    if task_id:
        where.append("task_id = ?")
        params.append(task_id)
    if name:
        where.append("name = ?")
        params.append(name)
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    rows = conn.execute(
        f"SELECT * FROM events {where_sql} ORDER BY created_at_ms DESC LIMIT ?",
        (*params, int(limit)),
    ).fetchall()
    out: list[dict[str, Any]] = []
    for r in rows:
        d = _row_to_dict(r)
        out.append(
            {
                "id": d["id"],
                "taskId": d["task_id"],
                "name": d["name"],
                "props": _json_loads(d["props_json"], {}),
                "createdAtMs": d["created_at_ms"],
            }
        )
    return out


def summarize_events(conn: sqlite3.Connection, *, task_id: str | None = None) -> dict[str, Any]:
    where_sql = ""
    params: tuple[Any, ...] = ()
    if task_id:
        where_sql = "WHERE task_id = ?"
        params = (task_id,)

    rows = conn.execute(
        f"SELECT name, COUNT(*) AS cnt FROM events {where_sql} GROUP BY name ORDER BY cnt DESC",
        params,
    ).fetchall()
    counts = [{"name": r["name"], "count": int(r["cnt"])} for r in rows]
    recent = list_events(conn, task_id=task_id, limit=25)
    return {"taskId": task_id, "counts": counts, "recent": recent}


def add_waitlist_entry(
    conn: sqlite3.Connection,
    *,
    entry_id: str,
    email: str,
    country: str | None,
    role: str | None,
    source: str | None,
) -> dict[str, Any]:
    now = _utc_epoch_ms()
    try:
        conn.execute(
            """
            INSERT INTO waitlist (id, email, country, role, source, created_at_ms)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (entry_id, email.strip().lower(), country, role, source, now),
        )
    except sqlite3.IntegrityError:
        row = conn.execute(
            "SELECT * FROM waitlist WHERE email = ? AND COALESCE(source,'') = COALESCE(?, '')",
            (email.strip().lower(), source),
        ).fetchone()
        if row:
            d = _row_to_dict(row)
            return {
                "id": d["id"],
                "email": d["email"],
                "country": d["country"],
                "role": d["role"],
                "source": d["source"],
                "createdAtMs": d["created_at_ms"],
                "deduped": True,
            }
        raise
    return {"id": entry_id, "email": email.strip().lower(), "country": country, "role": role, "source": source, "createdAtMs": now}


def list_waitlist(conn: sqlite3.Connection, limit: int = 200) -> list[dict[str, Any]]:
    rows = conn.execute("SELECT * FROM waitlist ORDER BY created_at_ms DESC LIMIT ?", (int(limit),)).fetchall()
    out: list[dict[str, Any]] = []
    for r in rows:
        out.append(
            {
                "id": r["id"],
                "email": r["email"],
                "country": r["country"],
                "role": r["role"],
                "source": r["source"],
                "createdAtMs": r["created_at_ms"],
            }
        )
    return out


def create_simulation_run(
    conn: sqlite3.Connection,
    *,
    run_id: str,
    task_id: str,
    inputs: dict[str, Any],
    outputs: dict[str, Any],
) -> dict[str, Any]:
    now = _utc_epoch_ms()
    conn.execute(
        """
        INSERT INTO simulation_runs (id, task_id, inputs_json, outputs_json, created_at_ms)
        VALUES (?, ?, ?, ?, ?)
        """,
        (run_id, task_id, _json_dumps(inputs), _json_dumps(outputs), now),
    )
    return {"id": run_id, "taskId": task_id, "inputs": inputs, "outputs": outputs, "createdAtMs": now}


def list_simulation_runs(conn: sqlite3.Connection, *, task_id: str, limit: int = 50) -> list[dict[str, Any]]:
    rows = conn.execute(
        "SELECT * FROM simulation_runs WHERE task_id = ? ORDER BY created_at_ms DESC LIMIT ?",
        (task_id, int(limit)),
    ).fetchall()
    out: list[dict[str, Any]] = []
    for r in rows:
        out.append(
            {
                "id": r["id"],
                "taskId": r["task_id"],
                "inputs": _json_loads(r["inputs_json"], {}),
                "outputs": _json_loads(r["outputs_json"], {}),
                "createdAtMs": r["created_at_ms"],
            }
        )
    return out

