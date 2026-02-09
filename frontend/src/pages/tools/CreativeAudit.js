import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function countBy(list, predicate) {
  return list.reduce((acc, item) => acc + (predicate(item) ? 1 : 0), 0);
}

function CreativeAudit() {
  const [creatives, setCreatives] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
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

  const required = useMemo(() => creatives.filter(a => a.tags?.requiredSet), [creatives]);

  const stats = useMemo(() => {
    const awareness = countBy(required, a => a.contentJson?.funnelStage === 'Awareness');
    const mid = countBy(required, a => a.contentJson?.funnelStage === 'Mid-Funnel');
    const conversion = countBy(required, a => a.contentJson?.funnelStage === 'Conversion');
    const nonEnglish = countBy(required, a => (a.contentJson?.language || 'en') !== 'en');
    const approved = countBy(required, a => a.status === 'approved');
    const mediaByCreative = new Set((media || []).map(m => m.tags?.creativeArtifactId).filter(Boolean));
    const withMedia = countBy(required, a => mediaByCreative.has(a.id));
    return { awareness, mid, conversion, nonEnglish, approved, total: required.length, withMedia };
  }, [required, media]);

  const ok = {
    awareness: stats.awareness >= 3,
    mid: stats.mid >= 2,
    conversion: stats.conversion >= 1,
    nonEnglish: stats.nonEnglish >= 1,
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
            <div className="metric-row">
              <div className="metric">
                <div className="metric-label">Awareness</div>
                <div className="metric-value">{stats.awareness}/3</div>
              </div>
              <div className="metric">
                <div className="metric-label">Mid-funnel</div>
                <div className="metric-value">{stats.mid}/2</div>
              </div>
              <div className="metric">
                <div className="metric-label">Conversion</div>
                <div className="metric-value">{stats.conversion}/1</div>
              </div>
            </div>

            <div className="metric-row">
              <div className="metric">
                <div className="metric-label">Non-English</div>
                <div className="metric-value">{stats.nonEnglish}/1</div>
              </div>
              <div className="metric">
                <div className="metric-label">Approved</div>
                <div className="metric-value">{stats.approved}/{stats.total}</div>
              </div>
              <div className="metric">
                <div className="metric-label">With media</div>
                <div className="metric-value">{stats.withMedia}/{stats.total}</div>
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
          <p className="muted">No required-set creatives saved yet.</p>
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
