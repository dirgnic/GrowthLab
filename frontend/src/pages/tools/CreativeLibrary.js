import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function CreativeLibrary() {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all'); // all | draft | approved | rejected
  const [stage, setStage] = useState('all');
  const [language, setLanguage] = useState('all');
  const [query, setQuery] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const res = await api.get('/api/artifacts', { params: { task_id: 'paid-media-b', type: 'creative', limit: 200 } });
      setCreatives(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return creatives.filter(a => {
      if (status !== 'all' && a.status !== status) return false;
      const c = a.contentJson || {};
      if (stage !== 'all' && c.funnelStage !== stage) return false;
      if (language !== 'all' && c.language !== language) return false;
      if (!q) return true;
      const hay = `${c.headline || ''} ${c.primaryText || ''} ${(a.tags && JSON.stringify(a.tags)) || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [creatives, status, stage, language, query]);

  async function setArtifactStatus(artifactId, nextStatus) {
    await api.patch(`/api/artifacts/${artifactId}`, { status: nextStatus });
    api.post('/api/events', { taskId: 'paid-media-b', name: 'review_creative', props: { artifactId, status: nextStatus } }).catch(() => {});
    await refresh();
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Creative Library</h1>
        <p>Manage, tag, and iterate creatives. Approve/reject here to define the “human judgment” step.</p>
      </div>

      <div className="tool-card">
        <div className="form-grid">
          <label className="form-field">
            <span>Status</span>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label className="form-field">
            <span>Stage</span>
            <select value={stage} onChange={e => setStage(e.target.value)}>
              <option value="all">All</option>
              <option value="Awareness">Awareness</option>
              <option value="Mid-Funnel">Mid-Funnel</option>
              <option value="Conversion">Conversion</option>
            </select>
          </label>
          <label className="form-field">
            <span>Language</span>
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="all">All</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </label>
          <label className="form-field">
            <span>Search</span>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="headline, tags…" />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          <div className="muted">{loading ? 'Loading…' : `${filtered.length} creative(s)`}</div>
          <button className="secondary-button" style={{ marginTop: 0 }} onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="tool-card" style={{ marginTop: '1rem' }}>
          <p className="muted">No creatives yet. Generate some in `/tools/creative-generator` and “Save as artifacts”.</p>
        </div>
      ) : (
        <div className="creative-grid" style={{ marginTop: '1rem' }}>
          {filtered.map(a => {
            const c = a.contentJson || {};
            return (
              <div key={a.id} className="creative-card">
                <div className="creative-headline">{c.headline}</div>
                <div className="muted" style={{ marginTop: '0.25rem' }}>
                  {c.funnelStage} · {c.persona} · {c.market} · {String(c.language || '').toUpperCase()} · <strong>{a.status}</strong>
                </div>
                <p style={{ marginTop: '0.75rem' }}>{c.primaryText}</p>
                <div className="tag-row">
                  {(c.tags || []).slice(0, 8).map(t => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => setArtifactStatus(a.id, 'approved')}>
                    Approve
                  </button>
                  <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => setArtifactStatus(a.id, 'rejected')}>
                    Reject
                  </button>
                  <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => setArtifactStatus(a.id, 'draft')}>
                    Back to draft
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CreativeLibrary;

