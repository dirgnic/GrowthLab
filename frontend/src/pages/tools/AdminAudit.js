import React, { useMemo, useState } from 'react';
import { api } from '../../api';
import WaitlistForm from '../../components/WaitlistForm';

const DEFAULTS = {
  patientsPerDay: 18,
  workDaysPerWeek: 5,
  noteMinutesPerPatient: 6,
  afterHoursAdminMinutesPerDay: 45,
  interruptionsPerHour: 3,
  handoffsPerDay: 6,
};

function AdminAudit() {
  const [responses, setResponses] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [templatePack, setTemplatePack] = useState(null);
  const [templateMessage, setTemplateMessage] = useState(null);

  const fields = useMemo(
    () => [
      { key: 'patientsPerDay', label: 'Patients per day', type: 'number', min: 1, max: 80, step: 1 },
      { key: 'workDaysPerWeek', label: 'Work days per week', type: 'number', min: 1, max: 7, step: 1 },
      { key: 'noteMinutesPerPatient', label: 'Avg note minutes per patient', type: 'number', min: 1, max: 30, step: 0.5 },
      { key: 'afterHoursAdminMinutesPerDay', label: 'After-hours admin minutes per day', type: 'number', min: 0, max: 240, step: 5 },
      { key: 'interruptionsPerHour', label: 'Interruptions per hour', type: 'number', min: 0, max: 12, step: 0.5 },
      { key: 'handoffsPerDay', label: 'Patient handoffs per day', type: 'number', min: 0, max: 40, step: 1 },
    ],
    []
  );

  async function runAudit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTemplatePack(null);
    setTemplateMessage(null);
    try {
      const res = await api.post('/api/tools/admin-audit/report', { responses });
      setReport(res.data);
    } catch (err) {
      setError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function generateTemplates() {
    setLoading(true);
    setTemplateMessage(null);
    try {
      const res = await api.post('/api/tools/templates/save', {
        taskId: 'paid-media-a',
        inputs: { specialty: 'General Practice', locale: 'en', tone: 'concise' },
      });
      setTemplatePack(res.data.contentJson);
      setTemplateMessage('Saved template pack as an artifact (draft). See it under this task’s Assets tab.');
    } catch (err) {
      setTemplateMessage(err?.response?.data?.error || err?.message || 'Template generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="tool-header">
        <h1>Admin Burden Audit</h1>
        <p>Quick estimate of documentation/admin time and the top 3 fixes to reclaim hours.</p>
      </div>

      <div className="tool-grid">
        <form className="tool-card" onSubmit={runAudit}>
          <h2>Inputs</h2>
          <div className="form-grid">
            {fields.map(f => (
              <label key={f.key} className="form-field">
                <span>{f.label}</span>
                <input
                  type={f.type}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={responses[f.key]}
                  onChange={e => setResponses(prev => ({ ...prev, [f.key]: e.target.value }))}
                />
              </label>
            ))}
          </div>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Running…' : 'Run audit'}
          </button>
          {error && <p className="error-text">{error}</p>}
          <p className="fine-print">These are directional estimates to spark a workflow conversation, not a clinical claim.</p>
        </form>

        <div className="tool-card">
          <h2>Report</h2>
          {!report ? (
            <p style={{ color: '#666' }}>Fill the inputs and run the audit to see a report.</p>
          ) : (
            <>
              <div className="metric-row">
                <div className="metric">
                  <div className="metric-label">Weekly admin time</div>
                  <div className="metric-value">{report.results.weeklyAdminHours} hrs</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Annual admin time</div>
                  <div className="metric-value">{report.results.annualAdminHours} hrs</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Recoverable</div>
                  <div className="metric-value">
                    {report.results.annualRecoverableHours} hrs ({report.results.recoverablePercent}%)
                  </div>
                </div>
              </div>

              <div className="data-section">
                <h3>Top priorities</h3>
                <ol>
                  {report.priorities.map((p, idx) => (
                    <li key={idx}>
                      <strong>{p.title}</strong>
                      <div className="muted">{p.why}</div>
                      <div><strong>Next step:</strong> {p.nextStep}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="cta-box">
                <h3>{report.cta.headline}</h3>
                <p>{report.cta.body}</p>
                <WaitlistForm source="admin-audit" defaultRole="Clinician" />
              </div>

              <div className="cta-box">
                <h3>Next step: starter templates</h3>
                <p>Generate 3 reusable templates (routine follow-up, acute visit, referral) as an exportable pack.</p>
                <button className="secondary-button" style={{ marginTop: 0 }} onClick={generateTemplates} disabled={loading}>
                  {loading ? 'Generating…' : 'Generate template pack'}
                </button>
                {templateMessage && <div className="success-text">{templateMessage}</div>}
                {templatePack && (
                  <div className="data-section" style={{ marginTop: '1rem' }}>
                    <h3>Preview</h3>
                    <ul>
                      {templatePack.templates.map(t => (
                        <li key={t.id}>
                          <strong>{t.title}</strong> ({t.format})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAudit;
