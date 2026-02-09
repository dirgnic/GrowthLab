import React, { useState } from 'react';
import { api } from '../api';

function WaitlistForm({ source, defaultRole = '' }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/waitlist', { email, role: role || null, country: country || null, source: source || null });
      setDone(res.data);
      setEmail('');
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="waitlist-form">
      <div className="form-grid">
        <label className="form-field">
          <span>Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@clinic.com" required />
        </label>
        <label className="form-field">
          <span>Role (optional)</span>
          <input value={role} onChange={e => setRole(e.target.value)} placeholder="GP / Practice Manager / Admin…" />
        </label>
        <label className="form-field">
          <span>Country (optional)</span>
          <input value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. AU" />
        </label>
      </div>

      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? 'Submitting…' : 'Join waitlist'}
      </button>
      {error && <div className="error-text">{error}</div>}
      {done && (
        <div className="success-text">
          Added to waitlist{done.deduped ? ' (already on it)' : ''}. Thanks!
        </div>
      )}
    </form>
  );
}

export default WaitlistForm;

