import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const stages = useMemo(() => ['Awareness', 'Mid-Funnel', 'Conversion'], []);

  async function generate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/tools/creative/generate', { inputs });
      setResult(res.data);
    } catch (err) {
      setError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function addToSaved(c) {
    const next = [{ ...c, savedAt: new Date().toISOString() }, ...saved];
    setSaved(next);
    saveSaved(next);
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

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Generating…' : 'Generate creatives'}
          </button>
          {error && <p className="error-text">{error}</p>}

          <div className="fine-print">
            This demo uses deterministic generation so it works locally. Swap the backend generator to a real model call when needed.
          </div>
        </form>

        <div className="tool-card">
          <h2>Output</h2>
          {!result ? (
            <p style={{ color: '#666' }}>Generate to see ad objects you can paste into a paid media workflow.</p>
          ) : (
            <div className="creative-grid">
              {result.creatives.map(c => (
                <div key={c.id} className="creative-card">
                  <div className="creative-headline">{c.headline}</div>
                  <div className="muted" style={{ marginTop: '0.25rem' }}>
                    {c.funnelStage} · {c.persona} · {c.market} · {c.language.toUpperCase()}
                  </div>
                  <p style={{ marginTop: '0.75rem' }}>{c.primaryText}</p>
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
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreativeGenerator;

