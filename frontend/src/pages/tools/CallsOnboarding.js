import React, { useMemo, useState } from 'react';

function CallsOnboarding() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    clinicName: 'Northside Clinic',
    businessHours: { start: '08:30', end: '17:30' },
    afterHoursMode: 'voicemail', // voicemail | nurse-triage
    newPatients: { allowed: true, requireApprovalFor: ['Dr. Singh'] },
    escalation: { urgentKeywords: ['chest pain', 'shortness of breath', 'bleeding'], routeTo: 'On-call nurse' },
    tone: { style: 'friendly', phrasesToAvoid: ['guarantee', 'diagnose'] },
  });

  const scenarios = useMemo(
    () => [
      { id: 's1', title: 'After hours: chest pain', time: '19:20', transcript: 'Hi, I have chest pain and trouble breathing. Please call me back.' },
      { id: 's2', title: 'Business hours: new patient request (Dr. Singh)', time: '10:15', transcript: 'I want to book with Dr. Singh, I am a new patient.' },
      { id: 's3', title: 'After hours: appointment change', time: '21:10', transcript: 'Need to reschedule tomorrow’s appointment.' },
    ],
    []
  );
  const [scenario, setScenario] = useState(scenarios[0].id);

  function next() {
    setStep(s => Math.min(5, s + 1));
  }

  function back() {
    setStep(s => Math.max(1, s - 1));
  }

  function simulate() {
    const sc = scenarios.find(s => s.id === scenario);
    const withinHours = sc.time >= config.businessHours.start && sc.time <= config.businessHours.end;
    const lower = sc.transcript.toLowerCase();

    const isUrgent = config.escalation.urgentKeywords.some(k => lower.includes(k));
    if (!withinHours) {
      if (isUrgent) return { decision: 'Escalate', to: config.escalation.routeTo, reason: 'Urgent keyword match after-hours.' };
      if (config.afterHoursMode === 'nurse-triage') return { decision: 'Route', to: 'Nurse triage', reason: 'After-hours mode is nurse triage.' };
      return { decision: 'Voicemail', to: 'Voicemail queue', reason: 'After-hours mode is voicemail.' };
    }

    if (lower.includes('new patient') && lower.includes('dr. singh') && config.newPatients.requireApprovalFor.includes('Dr. Singh')) {
      return { decision: 'Escalate', to: 'Front desk approval', reason: 'Dr. Singh new patients require approval.' };
    }
    return { decision: 'Handle automatically', to: 'Appointment booking flow', reason: 'Within hours and no special constraints.' };
  }

  const sim = simulate();

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Heidi Calls: Self-Serve Onboarding (Prototype)</h1>
        <p>Clinic-friendly wizard → structured config → call-handling behavior simulation.</p>
      </div>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Wizard</h2>
          <div className="muted" style={{ marginBottom: '0.75rem' }}>
            Step {step} of 5
          </div>

          {step === 1 && (
            <div className="form-grid">
              <label className="form-field">
                <span>Clinic name</span>
                <input value={config.clinicName} onChange={e => setConfig(c => ({ ...c, clinicName: e.target.value }))} />
              </label>
              <label className="form-field">
                <span>Business hours start</span>
                <input value={config.businessHours.start} onChange={e => setConfig(c => ({ ...c, businessHours: { ...c.businessHours, start: e.target.value } }))} />
              </label>
              <label className="form-field">
                <span>Business hours end</span>
                <input value={config.businessHours.end} onChange={e => setConfig(c => ({ ...c, businessHours: { ...c.businessHours, end: e.target.value } }))} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <label className="form-field">
                <span>After-hours mode</span>
                <select value={config.afterHoursMode} onChange={e => setConfig(c => ({ ...c, afterHoursMode: e.target.value }))}>
                  <option value="voicemail">Voicemail</option>
                  <option value="nurse-triage">Nurse triage</option>
                </select>
              </label>
              <label className="form-field">
                <span>Urgent escalation route</span>
                <input value={config.escalation.routeTo} onChange={e => setConfig(c => ({ ...c, escalation: { ...c.escalation, routeTo: e.target.value } }))} />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="form-grid">
              <label className="form-field">
                <span>Allow new patients</span>
                <select
                  value={config.newPatients.allowed ? 'yes' : 'no'}
                  onChange={e => setConfig(c => ({ ...c, newPatients: { ...c.newPatients, allowed: e.target.value === 'yes' } }))}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label className="form-field">
                <span>Require approval (comma-separated clinicians)</span>
                <input
                  value={config.newPatients.requireApprovalFor.join(', ')}
                  onChange={e =>
                    setConfig(c => ({
                      ...c,
                      newPatients: { ...c.newPatients, requireApprovalFor: e.target.value.split(',').map(x => x.trim()).filter(Boolean) },
                    }))
                  }
                />
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="form-grid">
              <label className="form-field">
                <span>Urgent keywords (comma-separated)</span>
                <input
                  value={config.escalation.urgentKeywords.join(', ')}
                  onChange={e =>
                    setConfig(c => ({
                      ...c,
                      escalation: { ...c.escalation, urgentKeywords: e.target.value.split(',').map(x => x.trim()).filter(Boolean) },
                    }))
                  }
                />
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="data-section">
              <h3>Review</h3>
              <code className="code-block">{JSON.stringify(config, null, 2)}</code>
              <div className="fine-print">Exportable as `clinic_config.json` (demo).</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="secondary-button" style={{ marginTop: 0 }} onClick={back} disabled={step === 1}>
              Back
            </button>
            <button className="primary-button" style={{ marginTop: 0 }} onClick={next} disabled={step === 5}>
              Next
            </button>
          </div>
        </div>

        <div className="tool-card">
          <h2>Call simulation</h2>
          <label className="form-field">
            <span>Scenario</span>
            <select value={scenario} onChange={e => setScenario(e.target.value)}>
              {scenarios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <div className="data-section">
            <h3>Transcript</h3>
            <div className="metric">
              <div className="metric-label">Time</div>
              <div className="metric-value">{scenarios.find(s => s.id === scenario)?.time}</div>
              <div style={{ marginTop: '0.75rem' }}>{scenarios.find(s => s.id === scenario)?.transcript}</div>
            </div>
          </div>

          <div className="data-section">
            <h3>Decision</h3>
            <ul>
              <li>
                <strong>Action:</strong> {sim.decision}
              </li>
              <li>
                <strong>Route:</strong> {sim.to}
              </li>
              <li>
                <strong>Reason:</strong> {sim.reason}
              </li>
            </ul>
          </div>

          <div className="fine-print">
            This demonstrates how structured onboarding inputs change runtime behavior without the clinic touching technical rules.
          </div>

          <div className="cta-box">
            <h3>Walkthrough (script)</h3>
            <ol>
              <li>Practice manager answers 5 short steps (hours, after-hours mode, clinician constraints, escalation keywords, tone).</li>
              <li>They review a generated config JSON (defaults pre-filled) and run 2–3 scenarios to validate behavior.</li>
              <li>If an edge case fails, they tweak one field (e.g., urgent keywords) and rerun immediately.</li>
              <li>They click “Activate” (stub) and Heidi Calls uses this config for routing + handoffs.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallsOnboarding;
