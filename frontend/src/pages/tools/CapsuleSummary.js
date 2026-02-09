import React, { useMemo, useState } from 'react';

function CapsuleSummary() {
  const [role, setRole] = useState('gp');
  const [consent, setConsent] = useState({
    shareMentalHealth: false,
    shareSexualHealth: false,
  });

  const base = useMemo(
    () => ({
      allergies: 'Penicillin (rash)',
      diagnoses: ['Type 2 diabetes', 'Knee osteoarthritis', consent.shareMentalHealth ? 'Generalized anxiety' : null].filter(Boolean),
      meds: ['Metformin', 'Atorvastatin', consent.shareMentalHealth ? 'Sertraline' : null].filter(Boolean),
      recentSummaries: [
        { from: 'Physio', text: 'Improving ROM; progressing strengthening; flare-ups reduced. Next review in 2 weeks.' },
        { from: 'Dietitian', text: 'Meal plan for glycemic control; agreed weekly check-ins for 4 weeks.' },
        consent.shareMentalHealth ? { from: 'Psychology', text: 'Working on sleep hygiene + CBT skills; mild improvement reported.' } : null,
      ].filter(Boolean),
      sensitiveModules: [
        { key: 'shareMentalHealth', label: 'Mental health details', why: 'May be sensitive; share only when beneficial.' },
        { key: 'shareSexualHealth', label: 'Sexual health details', why: 'Sensitive; default hidden.' },
      ],
    }),
    [consent.shareMentalHealth]
  );

  function visibleDiagnoses() {
    if (role === 'physio') return base.diagnoses.filter(d => /knee|osteoarthritis/i.test(d));
    if (role === 'psych') return base.diagnoses.filter(d => /anxiety/i.test(d) || /diabetes/i.test(d));
    return base.diagnoses;
  }

  function visibleMeds() {
    if (role === 'physio') return base.meds.filter(m => /metformin|atorvastatin/i.test(m));
    return base.meds;
  }

  function visibleSummaries() {
    if (role === 'psych') return base.recentSummaries.filter(s => s.from !== 'Physio' || consent.shareMentalHealth);
    if (role === 'physio') return base.recentSummaries.filter(s => s.from !== 'Psychology');
    return base.recentSummaries;
  }

  const whyYouSee = useMemo(() => {
    if (role === 'gp') return 'GP view includes broad context for safe prescribing and coordination.';
    if (role === 'physio') return 'Physio view defaults to MSK-relevant diagnoses + meds that affect exercise tolerance.';
    return 'Psychology view focuses on mental health + meds with relevant interactions.';
  }, [role]);

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Capsule: Shared Patient Summary (Prototype)</h1>
        <p>Role-based views + patient-controlled sensitive modules to reduce liability and “CYA” note inflation.</p>
      </div>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Controls</h2>
          <label className="form-field">
            <span>Practitioner role</span>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="gp">GP</option>
              <option value="physio">Physio</option>
              <option value="psych">Psychologist</option>
            </select>
          </label>

          <div className="data-section">
            <h3>Patient consent modules</h3>
            {base.sensitiveModules.map(m => (
              <label key={m.key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={Boolean(consent[m.key])}
                  onChange={e => setConsent(c => ({ ...c, [m.key]: e.target.checked }))}
                />
                <div>
                  <strong>{m.label}</strong>
                  <div className="muted">{m.why}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="fine-print">
            Safety: summaries are structured + time-bounded; interpretations stay out of the shared layer; every view is audit-logged (conceptually).
          </div>
        </div>

        <div className="tool-card">
          <h2>Patient Summary</h2>
          <div className="cta-box" style={{ marginTop: 0 }}>
            <strong>Why you can see this:</strong> {whyYouSee}
          </div>

          <div className="data-section">
            <h3>Allergies</h3>
            <p>{base.allergies}</p>
          </div>

          <div className="data-section">
            <h3>Active diagnoses</h3>
            <ul>
              {visibleDiagnoses().map(d => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="data-section">
            <h3>Active treatments</h3>
            <ul>
              {visibleMeds().map(m => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>

          <div className="data-section">
            <h3>Recent summaries (objective)</h3>
            {visibleSummaries().map((s, idx) => (
              <div key={idx} className="metric" style={{ marginTop: '0.75rem' }}>
                <div className="metric-label">{s.from}</div>
                <div style={{ marginTop: '0.5rem' }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CapsuleSummary;

