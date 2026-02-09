import React, { useMemo, useState } from 'react';

const TEMPLATES = [
  {
    id: 'soap-gp',
    specialty: 'General Practice',
    title: 'SOAP Note (GP)',
    tags: ['soap', 'gp', 'primary-care'],
    body: {
      Subjective: ['Chief complaint:', 'HPI:', 'ROS (relevant):'],
      Objective: ['Vitals:', 'Exam:', 'Investigations:'],
      Assessment: ['Problem list (prioritized):', 'DDx (if relevant):'],
      Plan: ['Tests:', 'Treatment:', 'Follow-up:', 'Safety netting:'],
    },
  },
  {
    id: 'mh-psychiatry',
    specialty: 'Psychiatry',
    title: 'Psychiatry Progress Note',
    tags: ['mental-health', 'mse', 'risk'],
    body: {
      'Presenting concerns': ['Symptoms:', 'Stressors:', 'Functioning:'],
      MSE: ['Appearance/behavior:', 'Speech:', 'Mood/affect:', 'Thought:', 'Perception:', 'Cognition:', 'Insight/judgment:'],
      Risk: ['Self-harm:', 'Harm to others:', 'Protective factors:'],
      Plan: ['Medication:', 'Therapy:', 'Follow-up:', 'Crisis plan:'],
    },
  },
  {
    id: 'pt-initial',
    specialty: 'Physiotherapy',
    title: 'Initial Assessment (MSK)',
    tags: ['pt', 'msk', 'objective-measures'],
    body: {
      History: ['Mechanism:', 'Aggravating/relieving:', 'Red flags:', 'Goals:'],
      Assessment: ['ROM:', 'Strength:', 'Special tests:', 'Functional tests:'],
      Impression: ['Primary impairment:', 'Contributors:', 'Prognosis:'],
      Plan: ['Exercises:', 'Education:', 'Frequency:', 'Home program:'],
    },
  },
  {
    id: 'vet-consult',
    specialty: 'Veterinary',
    title: 'Vet Consult Note',
    tags: ['vet', 'exam', 'owner-instructions'],
    body: {
      'Signalment + history': ['Species/breed/age:', 'Owner concerns:', 'Diet/meds:'],
      Exam: ['Vitals:', 'Systems review:', 'Pain score (if relevant):'],
      Assessment: ['Problem list:', 'Top differentials:'],
      Plan: ['Diagnostics:', 'Treatment:', 'Owner instructions:', 'Recheck:'],
    },
  },
];

function NoteTemplatesLibrary() {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [selected, setSelected] = useState(TEMPLATES[0]);

  const specialties = useMemo(() => ['All', ...Array.from(new Set(TEMPLATES.map(t => t.specialty)))], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TEMPLATES.filter(t => {
      if (specialty !== 'All' && t.specialty !== specialty) return false;
      if (!q) return true;
      const hay = `${t.title} ${t.specialty} ${t.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, specialty]);

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Medical Note Templates Library</h1>
        <p>Logged-out, searchable templates built to earn organic traffic and convert into Heidi intent.</p>
      </div>

      <div className="tool-grid templates-grid">
        <div className="tool-card">
          <h2>Search</h2>
          <div className="form-grid">
            <label className="form-field">
              <span>Keyword</span>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. SOAP, psychiatry, PT…" />
            </label>
            <label className="form-field">
              <span>Specialty</span>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)}>
                {specialties.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {filtered.map(t => (
              <button
                key={t.id}
                className={`list-button ${selected?.id === t.id ? 'active' : ''}`}
                onClick={() => setSelected(t)}
              >
                <div className="list-title">{t.title}</div>
                <div className="list-meta">{t.specialty}</div>
              </button>
            ))}
            {filtered.length === 0 && <p style={{ color: '#666' }}>No templates found.</p>}
          </div>
        </div>

        <div className="tool-card">
          <h2>{selected?.title}</h2>
          <p className="muted">{selected?.specialty}</p>

          {selected && (
            <div className="template-body">
              {Object.entries(selected.body).map(([section, bullets]) => (
                <div key={section} className="data-section">
                  <h3>{section}</h3>
                  <ul>
                    {bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="cta-box">
            <h3>Want these generated automatically?</h3>
            <p>Heidi can draft notes in your preferred format and tone, then learn your template style over time.</p>
            <button className="primary-button" onClick={() => alert('Stub: connect this to Heidi signup')}>
              Try Heidi templates →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteTemplatesLibrary;

