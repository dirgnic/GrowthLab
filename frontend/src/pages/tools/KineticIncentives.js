import React, { useMemo, useState } from 'react';

function KineticIncentives() {
  const [clinicAOptIn, setClinicAOptIn] = useState(true);
  const [clinicBOptIn, setClinicBOptIn] = useState(false);
  const [creditsA, setCreditsA] = useState(3);
  const [creditsB, setCreditsB] = useState(0);
  const [audit, setAudit] = useState([]);

  const canReceiveA = creditsA > 0;
  const canReceiveB = creditsB > 0;

  const sharedPayload = useMemo(
    () => ({
      shared: ['Objective treatment summary', 'Outcome measures', 'Contraindications'],
      excluded: ['Raw notes', 'Subjective judgments', 'Internal admin notes'],
      controls: ['Read-only', 'Access log', 'Patient-controlled sensitive modules'],
    }),
    []
  );

  function log(message) {
    setAudit(prev => [{ at: new Date().toLocaleTimeString(), message }, ...prev].slice(0, 20));
  }

  function contribute(clinic) {
    if (clinic === 'A') {
      if (!clinicAOptIn) return log('Clinic A is opted-out; cannot contribute.');
      setCreditsA(c => c + 1);
      log('Clinic A contributed a summary (+1 credit).');
      return;
    }
    if (!clinicBOptIn) return log('Clinic B is opted-out; cannot contribute.');
    setCreditsB(c => c + 1);
    log('Clinic B contributed a summary (+1 credit).');
  }

  function requestHistory(clinic) {
    if (clinic === 'A') {
      if (!canReceiveA) return log('Clinic A has 0 credits; cannot receive history.');
      setCreditsA(c => c - 1);
      log('Clinic A received history (−1 credit). Access logged.');
      return;
    }
    if (!canReceiveB) return log('Clinic B has 0 credits; cannot receive history.');
    setCreditsB(c => c - 1);
    log('Clinic B received history (−1 credit). Access logged.');
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Kinetic: Incentives for Sharing (Prototype)</h1>
        <p>Demonstrates opt-in/out behavior, what is shared, and how incentives drive adoption.</p>
      </div>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Network incentives</h2>
          <p className="muted">
            Mechanics: <strong>Reciprocity credits</strong> (to receive, you contribute) + <strong>public reputation</strong> +{' '}
            <strong>audit trails</strong>.
          </p>

          <div className="data-section">
            <h3>What gets shared</h3>
            <ul>
              {sharedPayload.shared.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h3>What never gets shared</h3>
            <ul>
              {sharedPayload.excluded.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="tool-card">
          <h2>Clinic simulator</h2>

          <div className="data-section">
            <h3>Clinic A</h3>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={clinicAOptIn} onChange={e => setClinicAOptIn(e.target.checked)} />
              Opted-in to share
            </label>
            <div className="metric-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="metric">
                <div className="metric-label">Credits</div>
                <div className="metric-value">{creditsA}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Can receive</div>
                <div className="metric-value">{canReceiveA ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => contribute('A')}>
                Contribute summary (+1)
              </button>
              <button className="primary-button" style={{ marginTop: 0 }} onClick={() => requestHistory('A')}>
                Receive history (−1)
              </button>
            </div>
          </div>

          <div className="data-section">
            <h3>Clinic B</h3>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={clinicBOptIn} onChange={e => setClinicBOptIn(e.target.checked)} />
              Opted-in to share
            </label>
            <div className="metric-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="metric">
                <div className="metric-label">Credits</div>
                <div className="metric-value">{creditsB}</div>
              </div>
              <div className="metric">
                <div className="metric-label">Can receive</div>
                <div className="metric-value">{canReceiveB ? 'Yes' : 'No'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => contribute('B')}>
                Contribute summary (+1)
              </button>
              <button className="primary-button" style={{ marginTop: 0 }} onClick={() => requestHistory('B')}>
                Receive history (−1)
              </button>
            </div>
          </div>

          <div className="data-section">
            <h3>Audit log</h3>
            {audit.length === 0 ? (
              <p className="muted">Try actions above to see how incentives reinforce behavior.</p>
            ) : (
              <ul>
                {audit.map((a, idx) => (
                  <li key={idx}>
                    <strong>{a.at}</strong> — {a.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="fine-print">
            Scaling 19% → 80%: clinics feel immediate downside to opting-out (can’t receive), while the shared payload reduces judgment/liability.
          </div>
        </div>
      </div>
    </div>
  );
}

export default KineticIncentives;

