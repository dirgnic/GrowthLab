import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';

function classify(text) {
  const t = text.toLowerCase();
  const urgentSignals = ['chest pain', 'shortness of breath', 'bleeding', 'stroke', 'suicidal', 'faint', 'severe'];
  const highSignals = ['prescription', 'refill', 'appointment', 'reschedule', 'cancel', 'results', 'lab'];

  let priority = 'Normal';
  if (urgentSignals.some(s => t.includes(s))) priority = 'Urgent';
  else if (highSignals.some(s => t.includes(s))) priority = 'High';

  let type = 'General inquiry';
  if (t.includes('refill') || t.includes('prescription')) type = 'Prescription refill';
  else if (t.includes('reschedule') || t.includes('cancel')) type = 'Appointment change';
  else if (t.includes('result') || t.includes('lab')) type = 'Lab results follow-up';
  else if (t.includes('new patient')) type = 'New patient';

  let nextAction = 'Call back';
  if (type === 'Appointment change') nextAction = 'Reschedule';
  if (type === 'Prescription refill') nextAction = 'Route to GP for approval';
  if (priority === 'Urgent') nextAction = 'Escalate to on-call clinician';

  const summary = text.length > 140 ? `${text.slice(0, 140)}…` : text;
  return { priority, type, summary, nextAction };
}

function VoicemailTriage() {
  const [input, setInput] = useState('Hi, I need to reschedule my appointment for tomorrow. Please call me back.');
  const [queue, setQueue] = useState([]);
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    api.get('/api/ai/status').then(r => setAiStatus(r.data)).catch(() => {});
  }, []);

  const sorted = useMemo(() => {
    const rank = { Urgent: 0, High: 1, Normal: 2 };
    return [...queue].sort((a, b) => rank[a.priority] - rank[b.priority] || b.createdAt - a.createdAt);
  }, [queue]);

  async function add() {
    const transcript = input.trim();
    if (!transcript) return;

    let c = classify(transcript);
    if (useOpenAI) {
      try {
        const res = await api.post('/api/ai/voicemail/triage', { inputs: { transcript }, model });
        c = {
          priority: res.data.priority,
          type: res.data.type,
          summary: res.data.summary,
          nextAction: res.data.nextAction,
        };
      } catch (e) {
        // fall back silently to deterministic classify
      }
    }

    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      transcript,
      createdAt: Date.now(),
      resolved: false,
      ...c,
    };
    setQueue(prev => [item, ...prev]);
    setInput('');
    api.post('/api/events', { taskId: 'intelligent-voicemail', name: 'voicemail_added', props: { priority: item.priority, type: item.type } }).catch(() => {});
  }

  function resolve(id) {
    setQueue(prev => prev.map(i => (i.id === id ? { ...i, resolved: true } : i)));
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Intelligent Voicemail Triage (Prototype)</h1>
        <p>Transcript → priority + intent + summary + next action → staff queue with closure.</p>
      </div>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>New voicemail (transcript)</h2>
          <label className="form-field">
            <span>Paste transcript</span>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={6}
              style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', fontSize: '1rem' }}
            />
          </label>
          <button className="primary-button" onClick={add} disabled={!input.trim()}>
            Add to queue
          </button>
          <div className="data-section" style={{ marginTop: '1rem' }}>
            <h3>Pipeline</h3>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={useOpenAI}
                onChange={e => setUseOpenAI(e.target.checked)}
                disabled={aiStatus && !aiStatus.aiConfigured}
              />
              Use AI triage pipeline (backend key required)
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
          </div>
          <div className="fine-print">Without a key, the demo uses deterministic keyword rules. With a key, it runs an AI pipeline.</div>
        </div>

        <div className="tool-card">
          <h2>Morning queue</h2>
          {sorted.length === 0 ? (
            <p className="muted">Add a voicemail to see it prioritized.</p>
          ) : (
            <div className="data-section">
              {sorted.map(i => (
                <div key={i.id} className="creative-card" style={{ opacity: i.resolved ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div className="creative-headline">
                        {i.priority} · {i.type}
                      </div>
                      <div className="muted" style={{ marginTop: '0.25rem' }}>
                        {new Date(i.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {!i.resolved && (
                      <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => resolve(i.id)}>
                        Mark resolved
                      </button>
                    )}
                  </div>
                  <p style={{ marginTop: '0.75rem' }}>{i.summary}</p>
                  <div className="tag-row">
                    <span className="tag">Next: {i.nextAction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VoicemailTriage;
