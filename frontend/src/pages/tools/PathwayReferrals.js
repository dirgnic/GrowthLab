import React, { useMemo, useState } from 'react';

const SLOTS = [
  { id: 's1', label: 'Tue 9:30am' },
  { id: 's2', label: 'Tue 2:00pm' },
  { id: 's3', label: 'Wed 11:15am' },
];

function PathwayReferrals() {
  const [role, setRole] = useState('referrer');
  const [referral, setReferral] = useState({
    patientName: 'Alex P.',
    patientPhone: '+61 4xx xxx xxx',
    reason: 'Mobility assessment for knee pain',
    goals: 'Return to running; reduce pain on stairs',
    notesShared: true,
  });
  const [status, setStatus] = useState('draft'); // draft | sent | booked | called | seen | closed
  const [chosenSlot, setChosenSlot] = useState(null);
  const [callMe, setCallMe] = useState(false);

  const context = useMemo(
    () => ({
      summary: 'Knee pain x 6 weeks, worse with stairs. No trauma. Wants to return to running.',
      flags: ['No red flags reported', 'Prefers morning appointments', 'Goal-oriented plan requested'],
    }),
    []
  );

  function sendReferral() {
    setStatus('sent');
  }

  function book(slotId) {
    setChosenSlot(slotId);
    setCallMe(false);
    setStatus('booked');
  }

  function requestCall() {
    setChosenSlot(null);
    setCallMe(true);
    setStatus('called');
  }

  function markSeen() {
    setStatus('seen');
  }

  function closeLoop() {
    setStatus('closed');
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Pathway: Referral Flow (Prototype)</h1>
        <p>No app downloads. Demonstrates referrer → patient → receiver continuity and closure.</p>
      </div>

      <div className="tool-card">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>Role view:</strong>{' '}
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="referrer">Referring practitioner</option>
              <option value="patient">Patient</option>
              <option value="receiver">Receiving practitioner</option>
            </select>
          </div>
          <div className="muted">
            Status: <strong>{status}</strong>
          </div>
        </div>
      </div>

      {role === 'referrer' && (
        <div className="tool-grid">
          <div className="tool-card">
            <h2>Create referral</h2>
            <div className="form-grid">
              <label className="form-field">
                <span>Patient</span>
                <input value={referral.patientName} onChange={e => setReferral(r => ({ ...r, patientName: e.target.value }))} />
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input value={referral.patientPhone} onChange={e => setReferral(r => ({ ...r, patientPhone: e.target.value }))} />
              </label>
              <label className="form-field">
                <span>Reason</span>
                <input value={referral.reason} onChange={e => setReferral(r => ({ ...r, reason: e.target.value }))} />
              </label>
              <label className="form-field">
                <span>Goals</span>
                <input value={referral.goals} onChange={e => setReferral(r => ({ ...r, goals: e.target.value }))} />
              </label>
            </div>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={referral.notesShared}
                onChange={e => setReferral(r => ({ ...r, notesShared: e.target.checked }))}
              />
              Share read-only clinical context (structured summary)
            </label>
            <button className="primary-button" onClick={sendReferral} disabled={status !== 'draft'}>
              Send referral (SMS link)
            </button>
            <div className="fine-print">Drop-off reducer: patient receives a 1-tap booking link + a “call me” fallback.</div>
          </div>

          <div className="tool-card">
            <h2>Referrer visibility</h2>
            <ul>
              <li>Sent: {status !== 'draft' ? 'Yes' : 'No'}</li>
              <li>Booked: {status === 'booked' || status === 'seen' || status === 'closed' ? 'Yes' : 'No'}</li>
              <li>Seen: {status === 'seen' || status === 'closed' ? 'Yes' : 'No'}</li>
              <li>Closed-loop update: {status === 'closed' ? 'Yes' : 'No'}</li>
            </ul>
            {status === 'closed' && (
              <div className="data-section">
                <h3>Update received</h3>
                <p>
                  <strong>Plan:</strong> 4-week strengthening program + gait adjustments. Follow-up booked.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {role === 'patient' && (
        <div className="tool-grid">
          <div className="tool-card">
            <h2>Referral link (SMS)</h2>
            {status === 'draft' ? (
              <p className="muted">Referral not sent yet. Switch to referrer view and click “Send referral”.</p>
            ) : (
              <>
                <p>
                  <strong>Your referral:</strong> {referral.reason}
                </p>
                <p className="muted">Choose a time, or request a callback. No account needed.</p>
                <div className="data-section">
                  <h3>Book</h3>
                  {SLOTS.map(s => (
                    <button
                      key={s.id}
                      className={`list-button ${chosenSlot === s.id ? 'active' : ''}`}
                      onClick={() => book(s.id)}
                      disabled={status === 'seen' || status === 'closed'}
                    >
                      <div className="list-title">{s.label}</div>
                      <div className="list-meta">1-tap booking</div>
                    </button>
                  ))}
                </div>
                <div className="data-section">
                  <h3>Or</h3>
                  <button className="secondary-button" style={{ marginTop: 0 }} onClick={requestCall}>
                    Call me to book
                  </button>
                  {callMe && <div className="success-text">Callback requested. We’ll call you shortly.</div>}
                </div>
              </>
            )}
          </div>

          <div className="tool-card">
            <h2>Continuity cues</h2>
            <ul>
              <li>Referrer context included: {referral.notesShared ? 'Yes (read-only)' : 'No'}</li>
              <li>Receiving practitioner prepared pre-visit: {status === 'booked' || status === 'seen' || status === 'closed' ? 'Yes' : 'Not yet'}</li>
              <li>Reminders: SMS 24h + 2h (simulated)</li>
            </ul>
          </div>
        </div>
      )}

      {role === 'receiver' && (
        <div className="tool-grid">
          <div className="tool-card">
            <h2>Inbound referral</h2>
            {status === 'draft' ? (
              <p className="muted">Nothing yet.</p>
            ) : (
              <>
                <p>
                  <strong>Patient:</strong> {referral.patientName}
                </p>
                <p>
                  <strong>Reason:</strong> {referral.reason}
                </p>
                <p>
                  <strong>Booked:</strong>{' '}
                  {status === 'booked' || status === 'seen' || status === 'closed'
                    ? chosenSlot
                      ? SLOTS.find(s => s.id === chosenSlot)?.label
                      : 'Via callback'
                    : 'Not booked'}
                </p>
                {referral.notesShared && (
                  <div className="data-section">
                    <h3>Structured context (read-only)</h3>
                    <p>{context.summary}</p>
                    <ul>
                      {context.flags.map(f => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="secondary-button" style={{ marginTop: 0 }} onClick={markSeen} disabled={status !== 'booked' && status !== 'called'}>
                    Mark visit completed
                  </button>
                  <button className="primary-button" style={{ marginTop: 0 }} onClick={closeLoop} disabled={status !== 'seen'}>
                    Send closure update
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="tool-card">
            <h2>Drop-off reducers</h2>
            <ul>
              <li>Booking friction removed (1-tap)</li>
              <li>Callback option for older patients</li>
              <li>Context included (no “blind” referral)</li>
              <li>Loop closure to referrer (trust + accountability)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default PathwayReferrals;

