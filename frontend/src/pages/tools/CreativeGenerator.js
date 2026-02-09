import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import WaitlistForm from '../../components/WaitlistForm';

const STORAGE_KEY = 'heidi_creatives_v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSaved(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
}

function CreativeGenerator() {
  const [inputs, setInputs] = useState({
    persona: 'GP',
    market: 'Australia',
    funnelStage: 'Awareness',
    language: 'en',
  });
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState([]);
  const [persisting, setPersisting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setSaved(loadSaved());
    api.get('/api/ai/status')
      .then(res => setAiStatus(res.data))
      .catch(() => {});
  }, []);

  const stages = useMemo(() => ['Awareness', 'Mid-Funnel', 'Conversion'], []);

  async function generate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const aiInputs = { ...inputs, count: 3 };
      const res = useOpenAI
        ? await api.post('/api/ai/creative/generate', { inputs: aiInputs, model })
        : await api.post('/api/tools/creative/generate', { inputs });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function addToSaved(c) {
    const next = [{ ...c, savedAt: new Date().toISOString() }, ...saved];
    setSaved(next);
    saveSaved(next);
  }

  async function persistAll() {
    if (!result?.creatives?.length) return;
    setPersisting(true);
    setMessage(null);
    try {
      let count = 0;
      for (const c of result.creatives) {
        await api.post('/api/artifacts', {
          taskId: 'paid-media-b',
          type: 'creative',
          status: 'draft',
          tags: {
            funnelStage: c.funnelStage,
            persona: c.persona,
            market: c.market,
            language: c.language,
            source: useOpenAI ? `openai:${model}` : 'local',
          },
          contentJson: c,
        });
        count += 1;
      }
      setMessage(`Saved ${count} creative(s) as artifacts.`);
      api.post('/api/events', { taskId: 'paid-media-b', name: 'persisted_creatives', props: { count } }).catch(() => {});
    } finally {
      setPersisting(false);
    }
  }

  async function generateRequiredSet() {
    // Meets: 3 awareness, 2 mid, 1 conversion, 1 non-English
    const plan = [
      { funnelStage: 'Awareness', n: 3, language: 'en' },
      { funnelStage: 'Mid-Funnel', n: 2, language: 'en' },
      { funnelStage: 'Conversion', n: 1, language: 'en' },
      { funnelStage: 'Mid-Funnel', n: 1, language: inputs.language === 'en' ? 'es' : inputs.language }, // non-English
    ];

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      let created = 0;
      for (const item of plan) {
        const reqInputs = { ...inputs, funnelStage: item.funnelStage, language: item.language, count: item.n };
        const res = useOpenAI
          ? await api.post('/api/ai/creative/generate', { inputs: reqInputs, model })
          : await api.post('/api/tools/creative/generate', { inputs: reqInputs });
        const creatives = (res.data?.creatives || []).slice(0, item.n);
        for (const c of creatives) {
          await api.post('/api/artifacts', {
            taskId: 'paid-media-b',
            type: 'creative',
            status: 'draft',
            tags: {
              funnelStage: c.funnelStage,
              persona: c.persona,
              market: c.market,
              language: c.language,
              requiredSet: true,
              source: useOpenAI ? `openai:${model}` : 'local',
            },
            contentJson: c,
          });
          created += 1;
        }
      }
      api.post('/api/events', { taskId: 'paid-media-b', name: 'created_required_creative_set', props: { created } }).catch(() => {});
      setMessage(`Saved required set (${created} creatives) as draft artifacts. Review/approve in Creative Library.`);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function clearSaved() {
    setSaved([]);
    saveSaved([]);
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>AI Creative Generator (Demo)</h1>
        <p>Inputs: persona, market, funnel stage. Output: ready-to-run ad copy objects with tags.</p>
      </div>

      <div className="tool-grid">
        <form className="tool-card" onSubmit={generate}>
          <h2>Inputs</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>Persona</span>
              <input value={inputs.persona} onChange={e => setInputs(p => ({ ...p, persona: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Market</span>
              <input value={inputs.market} onChange={e => setInputs(p => ({ ...p, market: e.target.value }))} />
            </label>
            <label className="form-field">
              <span>Funnel stage</span>
              <select value={inputs.funnelStage} onChange={e => setInputs(p => ({ ...p, funnelStage: e.target.value }))}>
                {stages.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Language</span>
              <select value={inputs.language} onChange={e => setInputs(p => ({ ...p, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </label>
          </div>

          <div className="data-section" style={{ marginTop: '1rem' }}>
            <h3>Pipeline</h3>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={useOpenAI}
                onChange={e => setUseOpenAI(e.target.checked)}
                disabled={aiStatus && !aiStatus.aiConfigured}
              />
              Use AI pipeline (backend key required)
            </label>
            {useOpenAI && (
              <label className="form-field" style={{ marginTop: '0.75rem' }}>
                <span>Model</span>
                <select value={model} onChange={e => setModel(e.target.value)}>
                  {(aiStatus?.recommendedModels || ['gpt-4o-mini']).map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {aiStatus && !aiStatus.aiConfigured && (
              <div className="fine-print">
                AI provider is not configured on the backend. Create `backend/.env` from `backend/.env.example` and restart.
              </div>
            )}
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Generating…' : 'Generate creatives'}
          </button>
          {error && <p className="error-text">{error}</p>}

          <div className="fine-print">
            Deterministic mode runs locally. OpenAI mode runs an AI pipeline on the backend and returns structured creatives.
          </div>
        </form>

        <div className="tool-card">
          <h2>Output</h2>
          {!result ? (
            <p style={{ color: '#666' }}>Generate to see ad objects you can paste into a paid media workflow.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" className="secondary-button" style={{ marginTop: 0 }} onClick={persistAll} disabled={persisting}>
                  {persisting ? 'Saving…' : 'Save all as artifacts'}
                </button>
                <button type="button" className="primary-button" style={{ marginTop: 0 }} onClick={generateRequiredSet} disabled={loading}>
                  Generate + save required set
                </button>
                {message && <div className="success-text">{message}</div>}
              </div>

              <div className="creative-grid">
                {result.creatives.map(c => (
                  <div key={c.id} className="creative-card">
                    <div className="creative-headline">{c.headline}</div>
                    <div className="muted" style={{ marginTop: '0.25rem' }}>
                      {c.funnelStage} · {c.persona} · {c.market} · {c.language.toUpperCase()}
                    </div>
                    <p style={{ marginTop: '0.75rem' }}>{c.primaryText}</p>
                    {c.platform && (
                      <div className="muted" style={{ marginTop: '0.5rem' }}>
                        <strong>Platform:</strong> {c.platform}
                      </div>
                    )}
                    {c.creativeDirection && (
                      <div className="muted" style={{ marginTop: '0.35rem' }}>
                        <strong>Creative direction:</strong> {c.creativeDirection}
                      </div>
                    )}
                    <div className="tag-row">
                      {c.tags.map(t => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <div className="muted">{c.format}</div>
                      <button type="button" className="secondary-button" onClick={() => addToSaved(c)} style={{ marginTop: 0 }}>
                        Save locally
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="cta-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: 0 }}>Saved creatives</h3>
                <div className="muted">{saved.length} saved</div>
              </div>
              <button type="button" className="secondary-button" onClick={clearSaved} style={{ marginTop: 0 }}>
                Clear
              </button>
            </div>
            {saved.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                {saved.slice(0, 6).map((c, idx) => (
                  <div key={`${c.id}-${idx}`} className="saved-row">
                    <div className="saved-title">{c.headline}</div>
                    <div className="muted">{c.tags?.join(', ')}</div>
                  </div>
                ))}
                {saved.length > 6 && <div className="muted">…and {saved.length - 6} more</div>}
              </div>
            )}
            <div style={{ marginTop: '1rem' }}>
              <h3>Want weekly creative drops?</h3>
              <p className="muted" style={{ marginTop: '0.25rem' }}>
                Join the waitlist to get the pipeline + review loop wired into your workflow.
              </p>
              <WaitlistForm source="creative-generator" defaultRole="Growth" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreativeGenerator;
