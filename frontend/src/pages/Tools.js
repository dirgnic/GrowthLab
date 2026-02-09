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
      title: 'Creative Library',
      description: 'Review, approve/reject, and manage saved creatives (human judgment step).',
      to: '/tools/creative-library',
    },
    {
      title: 'Media Studio',
      description: 'Generate image mocks and attach them to creatives (image step).',
      to: '/tools/media-studio',
    },
    {
      title: 'Creative Audit',
      description: 'Checklist proof: required set + approvals.',
      to: '/tools/creative-audit',
    },
    {
      title: 'Pipeline Diagram',
      description: 'Diagram showing AI vs human judgment boundaries.',
      to: '/tools/creative-diagram',
    },
    {
      title: 'Medical Note Templates Library',
      description: 'Searchable, specialty-specific templates (logged-out experience).',
      to: '/tools/note-templates',
    },
    {
      title: 'Kinetic Incentives Prototype',
      description: 'Opt-in/out + reciprocity credits + audit trail simulator.',
      to: '/tools/kinetic-incentives',
    },
    {
      title: 'Pathway Referrals Prototype',
      description: 'Referrer → patient (1-tap booking/callback) → receiver + loop closure.',
      to: '/tools/pathway-referrals',
    },
    {
      title: 'Capsule Summary Prototype',
      description: 'Role-based summary + patient-controlled sensitive modules.',
      to: '/tools/capsule-summary',
    },
    {
      title: 'Heidi Calls Onboarding Prototype',
      description: 'Self-serve wizard → config JSON → call behavior simulation.',
      to: '/tools/calls-onboarding',
    },
    {
      title: 'Voicemail Triage Prototype',
      description: 'Transcript → priority/intent/summary → queue + resolution.',
      to: '/tools/voicemail-triage',
    },
    {
      title: 'Lifecycle Simulator',
      description: 'Simulate segments + triggers and see metric impact.',
      to: '/tools/lifecycle-simulator',
    },
    {
      title: 'Growth AI Studio',
      description: 'Generate CRO experiments + copy variants and save as artifacts.',
      to: '/tools/growth-ai-studio',
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
