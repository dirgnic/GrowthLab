import React, { useEffect, useState } from 'react';
import { api } from '../../api';

function generatePlan({ page, goal, audience, objection }) {
  const tests = [
    {
      name: 'Objection-led hero',
      hypothesis: `If we address "${objection}" above the fold, more ${audience} will continue to the CTA.`,
      variations: [
        { headline: `Spend less time charting. Keep your style.`, body: `Heidi drafts notes in your structure — you stay in control.` },
        { headline: `Your notes are your fingerprint.`, body: `Templates + version history so you never “break” what works.` },
        { headline: `Be in the room, not in the EHR.`, body: `Reduce after-hours admin with an AI partner that stays quiet.` },
      ],
      metric: goal,
    },
    {
      name: 'Social proof block',
      hypothesis: `If we add peer proof for ${audience}, trust increases and demo intent rises.`,
      variations: [
        { headline: 'Clinician-tested workflows', body: 'Short quotes + time-saved numbers next to the CTA.' },
        { headline: 'Security + compliance clarity', body: 'One-line assurances + link to deep compliance detail.' },
      ],
      metric: goal,
    },
    {
      name: 'CTA friction removal',
      hypothesis: `If the CTA feels lower-commitment, more users will start.`,
      variations: [
        { headline: 'Try it on your next patient', body: '14-day pilot flow, no credit card (demo).' },
        { headline: 'Get a template in 10 minutes', body: 'Book a short setup call and leave with a working template.' },
      ],
      metric: goal,
    },
  ];

  return {
    page,
    goal,
    audience,
    objection,
    tests,
    measurement: {
      primary: goal,
      guardrails: ['Bounce rate', 'Time-to-first-value proxy', 'Support tickets'],
      segmentation: ['New vs returning', 'Clinician vs admin', 'Traffic source'],
    },
  };
}

function GrowthAIStudio() {
  const [inputs, setInputs] = useState({
    page: 'Templates upgrade landing',
    goal: 'Demo bookings',
    audience: 'Practice managers',
    objection: 'I might break what already works',
  });
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [useAI, setUseAI] = useState(false);
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/ai/status')
      .then(r => setAiStatus(r.data))
      .catch(() => {});
  }, []);

  async function run(e) {
    e.preventDefault();
    setError(null);
    setSavedId(null);
    setLoading(true);
    try {
      if (!useAI) {
        setPlan(generatePlan(inputs));
        return;
      }
      const res = await api.post('/api/ai/growth/experiment-plan', { inputs, model });
      setPlan(res.data);
      api.post('/api/events', { taskId: 'growth-ai-enablement', name: 'generated_experiment_plan_ai', props: { model } }).catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Request failed');
      setPlan(null);
    } finally {
      setLoading(false);
    }
    setSavedId(null);
  }

  async function save() {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await api.post('/api/artifacts', {
        taskId: 'growth-ai-enablement',
        type: 'experiment-plan',
        status: 'draft',
        tags: { page: plan.page, goal: plan.goal, audience: plan.audience },
        contentJson: plan,
      });
      setSavedId(res.data.id);
      api.post('/api/events', { taskId: 'growth-ai-enablement', name: 'saved_experiment_plan', props: { artifactId: res.data.id } }).catch(() => {});
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Growth AI Studio (Prototype)</h1>
        <p>Turns a CRO prompt into an experiment plan + copy variants + measurement checklist (runnable, no keys needed).</p>
      </div>

      <div className="tool-grid">
        <form className="tool-card" onSubmit={run}>
          <h2>Inputs</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>Page / surface</span>
              <input value={inputs.page} onChange={e => setInputs(p => ({ ...p, page: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Primary goal metric</span>
              <input value={inputs.goal} onChange={e => setInputs(p => ({ ...p, goal: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Audience</span>
              <input value={inputs.audience} onChange={e => setInputs(p => ({ ...p, audience: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Top objection</span>
              <input value={inputs.objection} onChange={e => setInputs(p => ({ ...p, objection: e.target.value }))} />
            </label>
          </div>

          <div className="data-section" style={{ marginTop: '1rem' }}>
            <h3>Pipeline</h3>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={useAI}
                onChange={e => setUseAI(e.target.checked)}
                disabled={aiStatus && !aiStatus.aiConfigured}
              />
              Use AI pipeline (OpenRouter/OpenAI backend)
            </label>
            {useAI && (
              <label className="form-field" style={{ marginTop: '0.75rem' }}>
                <span>Model</span>
                <select value={model} onChange={e => setModel(e.target.value)}>
                  {(aiStatus?.recommendedModels || ['openai/gpt-4o-mini']).map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {aiStatus && !aiStatus.aiConfigured && (
              <div className="fine-print">AI provider not configured. Set `backend/.env` and restart.</div>
            )}
          </div>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Generating…' : 'Generate plan'}
          </button>
          {error && <div className="error-text">{error}</div>}
          <div className="fine-print">Swap this deterministic generator for a real LLM call later; the UI + artifacts/events stay the same.</div>
        </form>

        <div className="tool-card">
          <h2>Output</h2>
          {!plan ? (
            <p className="muted">Generate a plan to see tests + variants.</p>
          ) : (
            <>
              <div className="data-section">
                <h3>Tests</h3>
                {plan.tests.map((t, idx) => (
                  <div key={idx} className="creative-card">
                    <div className="creative-headline">{t.name}</div>
                    <div className="muted" style={{ marginTop: '0.25rem' }}>
                      Metric: {t.metric}
                    </div>
                    <p style={{ marginTop: '0.75rem' }}>
                      <strong>Hypothesis:</strong> {t.hypothesis}
                    </p>
                    <div className="data-section">
                      <h3>Copy variants</h3>
                      <ol>
                        {t.variations.map((v, vidx) => (
                          <li key={vidx}>
                            <strong>{v.headline}</strong> — {v.body}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cta-box">
                <h3>Save as artifact</h3>
                <button className="secondary-button" style={{ marginTop: 0 }} onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : 'Save experiment plan'}
                </button>
                {savedId && <div className="success-text">Saved as artifact `{savedId}`</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GrowthAIStudio;
