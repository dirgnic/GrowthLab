import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function countBy(list, predicate) {
  return list.reduce((acc, item) => acc + (predicate(item) ? 1 : 0), 0);
}

function statsFor(list, media) {
  const awareness = countBy(list, a => a.contentJson?.funnelStage === 'Awareness');
  const mid = countBy(list, a => a.contentJson?.funnelStage === 'Mid-Funnel');
  const conversion = countBy(list, a => a.contentJson?.funnelStage === 'Conversion');
  const nonEnglish = countBy(list, a => (a.contentJson?.language || 'en') !== 'en');
  const approved = countBy(list, a => a.status === 'approved');
  const mediaByCreative = new Set((media || []).map(m => m.tags?.creativeArtifactId).filter(Boolean));
  const withMedia = countBy(list, a => mediaByCreative.has(a.id));
  return { awareness, mid, conversion, nonEnglish, approved, total: list.length, withMedia };
}

function CreativeAudit() {
  const [creatives, setCreatives] = useState([]);
  const [media, setMedia] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const h = await api.get('/api/health');
        setHealth(h.data);
        const res = await api.get('/api/artifacts', { params: { task_id: 'paid-media-b', type: 'creative', limit: 500 } });
        setCreatives(Array.isArray(res.data) ? res.data : []);
        const m = await api.get('/api/artifacts', { params: { task_id: 'paid-media-b', type: 'media', limit: 500 } });
        setMedia(Array.isArray(m.data) ? m.data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function seedRequiredSet() {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await api.post('/api/tools/creative/seed-required-set', {
        taskId: 'paid-media-b',
        inputs: { persona: 'GP', market: 'Australia', language: 'en' },
      });
      const created = res.data?.createdIds?.length || 0;
      const updated = res.data?.updatedIds?.length || 0;
      setSeedMsg(`Seeded required set: created ${created}, updated ${updated}.`);
      const refresh = await api.get('/api/artifacts', { params: { task_id: 'paid-media-b', type: 'creative', limit: 500 } });
      setCreatives(Array.isArray(refresh.data) ? refresh.data : []);
    } catch (err) {
      setSeedMsg(err?.response?.data?.error || err?.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  }

  const required = useMemo(() => creatives.filter(a => a.tags?.requiredSet), [creatives]);

  const statsRequired = useMemo(() => statsFor(required, media), [required, media]);
  const statsAll = useMemo(() => statsFor(creatives, media), [creatives, media]);

  const using = required.length > 0 ? { label: 'Required-set tagged', stats: statsRequired } : { label: 'All saved creatives', stats: statsAll };
  const ok = {
    awareness: using.stats.awareness >= 3,
    mid: using.stats.mid >= 2,
    conversion: using.stats.conversion >= 1,
    nonEnglish: using.stats.nonEnglish >= 1,
  };

  const overall = ok.awareness && ok.mid && ok.conversion && ok.nonEnglish;

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Creative System Audit</h1>
        <p>Proof page that the required creative set exists in the library and can be approved.</p>
      </div>

      <div className="tool-card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            {health?.dbPath && (
              <div className="fine-print">
                Backend DB: <code>{health.dbPath}</code>
              </div>
            )}
            <div className="muted" style={{ marginTop: '0.75rem' }}>
              Counting mode: <strong>{using.label}</strong>{required.length === 0 ? ' (no `requiredSet` tags found)' : ''}
            </div>

            {required.length === 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="primary-button" disabled={seeding} onClick={seedRequiredSet}>
                  {seeding ? 'Seeding…' : 'Seed required set (no keys)'}
                </button>
                {seedMsg && <div className={String(seedMsg).toLowerCase().includes('fail') ? 'error-text' : 'success-text'}>{seedMsg}</div>}
              </div>
            )}

            <div className="metric-row">
              <div className="metric">
                <div className="metric-label">Awareness</div>
                <div className="metric-value">{using.stats.awareness}/3</div>
              </div>
              <div className="metric">
                <div className="metric-label">Mid-funnel</div>
                <div className="metric-value">{using.stats.mid}/2</div>
              </div>
              <div className="metric">
                <div className="metric-label">Conversion</div>
                <div className="metric-value">{using.stats.conversion}/1</div>
              </div>
            </div>

            <div className="metric-row">
              <div className="metric">
                <div className="metric-label">Non-English</div>
                <div className="metric-value">{using.stats.nonEnglish}/1</div>
              </div>
              <div className="metric">
                <div className="metric-label">Approved</div>
                <div className="metric-value">{using.stats.approved}/{using.stats.total}</div>
              </div>
              <div className="metric">
                <div className="metric-label">With media</div>
                <div className="metric-value">{using.stats.withMedia}/{using.stats.total}</div>
              </div>
            </div>

            <div className="metric-row">
              <div className="metric">
                <div className="metric-label">Overall</div>
                <div className="metric-value">{overall ? 'PASS' : 'INCOMPLETE'}</div>
              </div>
            </div>

            <div className="data-section">
              <h3>What to do if incomplete</h3>
              <ol>
                <li>Go to <code>/tools/creative-generator</code> → click “Generate + save required set”.</li>
                <li>Go to <code>/tools/creative-library</code> → approve/reject (human step).</li>
                <li>Attach image mocks or AI images in <code>/tools/media-studio</code>.</li>
              </ol>
            </div>
          </>
        )}
      </div>

      <div className="tool-card" style={{ marginTop: '1rem' }}>
        <h2>Required-set items</h2>
        {required.length === 0 ? (
          <p className="muted">No required-set creatives saved yet (tag `requiredSet`). You may still have creatives saved without that tag.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Lang</th>
                  <th>Headline</th>
                </tr>
              </thead>
              <tbody>
                {required.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.status}</strong></td>
                    <td>{a.contentJson?.funnelStage}</td>
                    <td>{String(a.contentJson?.language || 'en').toUpperCase()}</td>
                    <td>{a.contentJson?.headline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreativeAudit;
