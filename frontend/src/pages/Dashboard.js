import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api';

function Bar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 70px', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
      <div className="muted">{label}</div>
      <div style={{ height: 10, background: 'rgba(22,163,74,0.12)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: 10, background: 'var(--brand-600)', borderRadius: 999 }} />
      </div>
      <div style={{ textAlign: 'right', fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Dashboard() {
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [waitlist, setWaitlist] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const summary = await api.get('/api/events/summary');
        setCounts(summary.data.counts || []);
        const wl = await api.get('/api/waitlist', { params: { limit: 50 } });
        setWaitlist(Array.isArray(wl.data) ? wl.data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxCount = useMemo(() => Math.max(0, ...(counts.map(c => c.count) || [0])), [counts]);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p style={{ color: '#666' }}>Lightweight proof of end-to-end flows: events, artifacts, waitlist conversions.</p>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Events (all tasks)</h2>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : counts.length === 0 ? (
            <p className="muted">No events yet. Open a task page or use a tool to generate events.</p>
          ) : (
            counts.slice(0, 12).map(c => <Bar key={c.name} label={c.name} value={c.count} max={maxCount} />)
          )}
        </div>

        <div className="tool-card">
          <h2>Waitlist (latest)</h2>
          {waitlist.length === 0 ? (
            <p className="muted">No waitlist entries yet. Submit via `/tools/admin-audit` or `/tools/note-templates`.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Role</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map(w => (
                    <tr key={w.id}>
                      <td>{w.email}</td>
                      <td>{w.source || '-'}</td>
                      <td>{w.role || '-'}</td>
                      <td>{new Date(w.createdAtMs).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
