import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ChallengeDetail from './pages/ChallengeDetail';
import ChallengeList from './pages/ChallengeList';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Api from './pages/Api';
import Dashboard from './pages/Dashboard';
import AdminAudit from './pages/tools/AdminAudit';
import CreativeGenerator from './pages/tools/CreativeGenerator';
import CreativeLibrary from './pages/tools/CreativeLibrary';
import MediaStudio from './pages/tools/MediaStudio';
import NoteTemplatesLibrary from './pages/tools/NoteTemplatesLibrary';
import CreativeAudit from './pages/tools/CreativeAudit';
import CreativePipelineDiagram from './pages/tools/CreativePipelineDiagram';
import KineticIncentives from './pages/tools/KineticIncentives';
import PathwayReferrals from './pages/tools/PathwayReferrals';
import CapsuleSummary from './pages/tools/CapsuleSummary';
import CallsOnboarding from './pages/tools/CallsOnboarding';
import VoicemailTriage from './pages/tools/VoicemailTriage';
import LifecycleSimulator from './pages/tools/LifecycleSimulator';
import GrowthAIStudio from './pages/tools/GrowthAIStudio';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            Heidi Launchpad
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/challenges">All Challenges</Link>
            <Link to="/tools">Tools</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/api">API</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/challenges" element={<ChallengeList />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/api" element={<Api />} />
          <Route path="/tools/admin-audit" element={<AdminAudit />} />
          <Route path="/tools/creative-generator" element={<CreativeGenerator />} />
          <Route path="/tools/creative-library" element={<CreativeLibrary />} />
          <Route path="/tools/media-studio" element={<MediaStudio />} />
          <Route path="/tools/creative-audit" element={<CreativeAudit />} />
          <Route path="/tools/creative-diagram" element={<CreativePipelineDiagram />} />
          <Route path="/tools/note-templates" element={<NoteTemplatesLibrary />} />
          <Route path="/tools/kinetic-incentives" element={<KineticIncentives />} />
          <Route path="/tools/pathway-referrals" element={<PathwayReferrals />} />
          <Route path="/tools/capsule-summary" element={<CapsuleSummary />} />
          <Route path="/tools/calls-onboarding" element={<CallsOnboarding />} />
          <Route path="/tools/voicemail-triage" element={<VoicemailTriage />} />
          <Route path="/tools/lifecycle-simulator" element={<LifecycleSimulator />} />
          <Route path="/tools/growth-ai-studio" element={<GrowthAIStudio />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
