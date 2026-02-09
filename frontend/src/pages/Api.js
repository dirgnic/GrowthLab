import React, { useState } from 'react';
import { API_BASE_URL, api } from '../api';

function Api() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function checkHealth() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/health');
      setHealth(res.data);
    } catch (err) {
      setError(err?.message || 'Request failed');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch {
      alert('Copy failed (clipboard permission).');
    }
  }

  const endpoints = [
    { method: 'GET', path: '/api/health', desc: 'Health check' },
    { method: 'GET', path: '/api/challenges', desc: 'List all challenges' },
    { method: 'GET', path: '/api/challenges/:id', desc: 'Challenge detail (e.g. paid-media-a)' },
    { method: 'POST', path: '/api/tools/admin-audit/report', desc: 'Admin Burden Audit report' },
    { method: 'POST', path: '/api/tools/creative/generate', desc: 'Creative generator' },
  ];

  return (
    <div className="container">
      <h1>API</h1>
      <p style={{ color: '#666' }}>This page helps you remember the backend base URL and available endpoints.</p>

      <div className="tool-grid">
        <div className="tool-card">
          <h2>Base URL</h2>
          <div className="code-row">
            <code className="code-block">{API_BASE_URL}</code>
            <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => copy(API_BASE_URL)}>
              Copy
            </button>
          </div>
          <p className="fine-print">
            Frontend reads this from <code>REACT_APP_API_BASE_URL</code> (defaults to <code>http://localhost:8000</code>).
          </p>
        </div>

        <div className="tool-card">
          <h2>Quick health check</h2>
          <button className="primary-button" onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking…' : 'Check /api/health'}
          </button>
          {error && <p className="error-text">{error}</p>}
          {health && (
            <div className="data-section">
              <p>
                <strong>Response:</strong> <code>{JSON.stringify(health)}</code>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="tool-card" style={{ marginTop: '2rem' }}>
        <h2>Endpoints</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Path</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(e => (
                <tr key={`${e.method}-${e.path}`}>
                  <td>
                    <strong>{e.method}</strong>
                  </td>
                  <td>
                    <code>{e.path}</code>
                  </td>
                  <td>{e.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>cURL examples</h3>
        <div className="code-sample">
          <code className="code-block">
            {`curl ${API_BASE_URL}/api/challenges\ncurl ${API_BASE_URL}/api/challenges/paid-media-a\ncurl ${API_BASE_URL}/api/health`}
          </code>
          <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => copy(`curl ${API_BASE_URL}/api/challenges`)}>
            Copy first
          </button>
        </div>
      </div>
    </div>
  );
}

export default Api;

