import React from 'react';

function Box({ title, bullets }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '1rem', background: 'var(--surface)' }}>
      <div style={{ fontWeight: 900, color: 'var(--brand-700)', marginBottom: '0.5rem' }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--muted)' }}>
        {bullets.map(b => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--brand-700)', fontWeight: 900 }}>
      ↓
    </div>
  );
}

function CreativePipelineDiagram() {
  return (
    <div className="container">
      <div className="tool-header">
        <h1>AI Creative Pipeline Diagram</h1>
        <p>Explicit “where AI ends and human judgment begins” + weekly iteration loop.</p>
      </div>

      <div className="tool-card">
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <Box
            title="1) Inputs (human)"
            bullets={['Persona + market + funnel stage', 'Constraints (no medical claims)', 'Channel specs']}
          />
          <Arrow />
          <Box
            title="2) Generate (AI)"
            bullets={['Hooks + angles + copy variants', 'Non-English localization', 'Tags for library']}
          />
          <Arrow />
          <Box
            title="3) Media step (tool)"
            bullets={['Create image/video mocks (SVG now)', 'Swap later with Runway/Sora outputs']}
          />
          <Arrow />
          <Box
            title="4) Review (human)"
            bullets={['Approve / reject creatives', 'Edit risky claims', 'Pick winners per stage']}
          />
          <Arrow />
          <Box
            title="5) Ship + measure (system)"
            bullets={['Export pack', 'Log events + leading signals', 'Feed results back into next generation']}
          />
        </div>

        <div className="cta-box">
          <h3>Live proof pages</h3>
          <ul>
            <li><code>/tools/creative-generator</code> — generation + required set</li>
            <li><code>/tools/media-studio</code> — image mock step</li>
            <li><code>/tools/creative-library</code> — approve/reject (human step)</li>
            <li><code>/tools/creative-audit</code> — required deliverables checklist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreativePipelineDiagram;

