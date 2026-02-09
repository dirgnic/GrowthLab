import React from 'react';
import { Link } from 'react-router-dom';

function Tools() {
  const tools = [
    {
      title: 'Admin Burden Audit',
      description: '60-second estimate of weekly/annual admin load + top 3 fixes.',
      to: '/tools/admin-audit',
    },
    {
      title: 'AI Creative Generator',
      description: 'Persona + market + stage → tagged ad creative objects (with save/iteration).',
      to: '/tools/creative-generator',
    },
    {
      title: 'Medical Note Templates Library',
      description: 'Searchable, specialty-specific templates (logged-out experience).',
      to: '/tools/note-templates',
    },
  ];

  return (
    <div className="container">
      <h1>Logged-Out Tools</h1>
      <p style={{ color: '#666' }}>Interactive pages designed to earn traffic and convert to Heidi interest.</p>

      <div className="challenges-grid">
        {tools.map(t => (
          <Link key={t.to} to={t.to} className="challenge-card">
            <h3>{t.title}</h3>
            <p>{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Tools;
