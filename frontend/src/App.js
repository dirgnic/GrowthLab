import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import ChallengeDetail from './pages/ChallengeDetail';
import ChallengeList from './pages/ChallengeList';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Api from './pages/Api';
import AdminAudit from './pages/tools/AdminAudit';
import CreativeGenerator from './pages/tools/CreativeGenerator';
import NoteTemplatesLibrary from './pages/tools/NoteTemplatesLibrary';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            Heidi Challenges
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/challenges">All Challenges</Link>
            <Link to="/tools">Tools</Link>
            <Link to="/api">API</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/challenges" element={<ChallengeList />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/api" element={<Api />} />
          <Route path="/tools/admin-audit" element={<AdminAudit />} />
          <Route path="/tools/creative-generator" element={<CreativeGenerator />} />
          <Route path="/tools/note-templates" element={<NoteTemplatesLibrary />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
