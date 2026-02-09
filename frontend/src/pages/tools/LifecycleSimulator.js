import React, { useMemo, useState } from 'react';
import { api } from '../../api';

function rand(seed) {
  // xorshift32-ish
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10000) / 10000;
  };
}

function LifecycleSimulator() {
  const [n, setN] = useState(200);
  const [seed, setSeed] = useState(42);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const rules = useMemo(
    () => [
      { segment: 'Power User', criteria: '≥20 notes in week', trigger: 'Day 7', action: 'Upgrade prompt' },
      { segment: 'Struggling User', criteria: '≤5 notes and 2 bounces', trigger: 'Day 3', action: 'Quick win template nudge' },
      { segment: 'Feature Explorer', criteria: 'Tried 2+ features', trigger: 'Feature use', action: 'Use-case email' },
    ],
    []
  );

  function simulate() {
    const r = rand(Number(seed) || 1);
    let power = 0;
    let struggling = 0;
    let explorer = 0;
    let upgraded = 0;
    let activated = 0;
    let firstValueUnder1Day = 0;

    for (let i = 0; i < Number(n); i++) {
      const baseEngagement = r();
      const notes = Math.floor(baseEngagement * 30);
      const features = Math.floor(r() * 4);
      const bounces = r() < 0.3 ? 2 : 0;
      const ttfvHours = Math.max(0.5, 24 * (1 - baseEngagement));

      if (notes >= 20) power += 1;
      if (notes <= 5 && bounces >= 2) struggling += 1;
      if (features >= 2 && notes < 20) explorer += 1;

      if (notes >= 1) activated += 1;
      if (ttfvHours <= 24) firstValueUnder1Day += 1;

      // Apply lifecycle actions: simple uplift model
      const uplift = notes >= 20 ? 0.25 : notes <= 5 ? 0.08 : 0.12;
      if (r() < uplift) upgraded += 1;
    }

    setResult({
      n: Number(n),
      segments: { power, struggling, explorer },
      metrics: {
        activationRate: activated / Number(n),
        ttfvUnder1DayRate: firstValueUnder1Day / Number(n),
        freeToPaidRate: upgraded / Number(n),
      },
      notes: 'Directional simulation for trigger logic + measurement (not a forecast).',
    });
  }

  async function saveRun() {
    if (!result) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.post('/api/artifacts', {
        taskId: 'lifecycle-system',
        type: 'simulation-run',
        status: 'draft',
        tags: { model: 'local-lifecycle-sim' },
        contentJson: { inputs: { n: result.n, seed }, outputs: result },
      });
      api.post('/api/events', { taskId: 'lifecycle-system', name: 'saved_simulation', props: { artifactId: res.data.id } }).catch(() => {});
      setMessage('Saved simulation run as an artifact.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Lifecycle Simulator (Prototype)</h1>
        <p>Simulates behavioral segments + triggers + measurement beyond opens/clicks.</p>
      </div>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Rules</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Segment</th>
                  <th>Criteria</th>
                  <th>Trigger</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.segment}>
                    <td>
                      <strong>{r.segment}</strong>
                    </td>
                    <td>{r.criteria}</td>
                    <td>{r.trigger}</td>
                    <td>{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Users</span>
              <input type="number" min="10" max="5000" value={n} onChange={e => setN(e.target.value)} />
            </label>
            <label className="form-field">
              <span>Seed</span>
              <input type="number" value={seed} onChange={e => setSeed(e.target.value)} />
            </label>
          </div>

          <button className="primary-button" onClick={simulate}>
            Run simulation
          </button>
          <div className="fine-print">Use the seed to reproduce results when iterating on rules.</div>
        </div>

        <div className="tool-card">
          <h2>Results</h2>
          {!result ? (
            <p className="muted">Run a simulation to see outcomes.</p>
          ) : (
            <>
              <div className="metric-row">
                <div className="metric">
                  <div className="metric-label">Activation</div>
                  <div className="metric-value">{Math.round(result.metrics.activationRate * 100)}%</div>
                </div>
                <div className="metric">
                  <div className="metric-label">TTFV &lt; 1 day</div>
                  <div className="metric-value">{Math.round(result.metrics.ttfvUnder1DayRate * 100)}%</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Free → Paid</div>
                  <div className="metric-value">{Math.round(result.metrics.freeToPaidRate * 100)}%</div>
                </div>
              </div>

              <div className="data-section">
                <h3>Segment counts</h3>
                <ul>
                  <li>
                    <strong>Power users:</strong> {result.segments.power}
                  </li>
                  <li>
                    <strong>Struggling users:</strong> {result.segments.struggling}
                  </li>
                  <li>
                    <strong>Feature explorers:</strong> {result.segments.explorer}
                  </li>
                </ul>
              </div>

              <div className="cta-box">
                <h3>Persist run</h3>
                <button className="secondary-button" style={{ marginTop: 0 }} onClick={saveRun} disabled={saving}>
                  {saving ? 'Saving…' : 'Save to backend'}
                </button>
                {message && <div className="success-text">{message}</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LifecycleSimulator;
