from __future__ import annotations

import html
from typing import Any


def generate_ad_mock_svg(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Simple, dependency-free 'image tool equivalent': produces an SVG ad mock.
    This is useful for demonstrating a creative pipeline end-to-end without external APIs.
    """
    headline = str(payload.get("headline") or "You finish clinic at 5pm. Your work doesn’t.").strip()
    primary = str(payload.get("primaryText") or "Heidi helps clinicians reclaim after-hours time.").strip()
    cta = str(payload.get("cta") or "Learn more").strip()
    market = str(payload.get("market") or "").strip()
    stage = str(payload.get("funnelStage") or "").strip()

    # Escape user-provided text for SVG.
    h = html.escape(headline)
    p = html.escape(primary)
    c = html.escape(cta)
    meta = html.escape(" · ".join([x for x in [stage, market] if x]))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="55%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
  </defs>

  <rect width="1080" height="1080" fill="url(#g)"/>

  <rect x="90" y="110" width="900" height="860" rx="36" fill="rgba(255,255,255,0.92)" filter="url(#shadow)"/>

  <text x="140" y="210" font-family="Baskerville, 'Hoefler Text', Garamond, 'Times New Roman', serif" font-size="40" fill="#14532d" font-weight="700">
    Heidi Launchpad
  </text>
  <text x="930" y="210" text-anchor="end" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="24" fill="#14532d">
    {meta}
  </text>

  <foreignObject x="140" y="290" width="800" height="420">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Baskerville, 'Hoefler Text', Garamond, 'Times New Roman', serif; color:#111827;">
      <div style="font-size:72px; font-weight:800; line-height:1.02;">{h}</div>
      <div style="margin-top:28px; font-size:34px; line-height:1.25; color:#14532d;">{p}</div>
    </div>
  </foreignObject>

  <rect x="140" y="820" width="320" height="96" rx="18" fill="#16a34a"/>
  <text x="300" y="882" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="30" fill="white" font-weight="800">
    {c}
  </text>

  <text x="940" y="940" text-anchor="end" font-family="system-ui, -apple-system, Segoe UI, Arial" font-size="22" fill="#4b5563">
    Mock creative (SVG) · swap with Runway/Sora later
  </text>
</svg>"""

    return {"format": "svg", "width": 1080, "height": 1080, "svg": svg}

