# Heidi Launchpad

A full-stack web application showcasing solutions to all 15 Heidi growth, product, and operations challenges.

## Architecture

- **Backend:** Python Flask API serving challenge data
- **Frontend:** React with React Router for navigation and client-side routing
- **Communication:** Axios HTTP client for backend API calls

## Project Structure

```
heidi_smth/
├── backend/
│   ├── app.py                 # Flask app and routes
│   ├── challenges.py          # Challenge data definitions
│   └── requirements.txt        # Python dependencies
│
└── frontend/
    ├── public/
    │   └── index.html         # HTML entry point
    ├── src/
    │   ├── App.js             # Main App component with routing
    │   ├── App.css            # Styling
    │   ├── index.js           # React DOM render
    │   └── pages/
    │       ├── Home.js        # Landing page
    │       ├── ChallengeList.js   # Browse all challenges
    │       └── ChallengeDetail.js # Individual challenge view
    ├── package.json           # Node dependencies
    └── .gitignore
```

## Setup & Running

## One-command dev start (recommended)

From the repo root:

First-time setup:

```bash
cd backend && python3 -m pip install -r requirements.txt
cd ../frontend && npm install
cd ..
```

Run both servers:

```bash
npm start
```

## Enable AI pipelines (OpenRouter/OpenAI) (optional)

Never paste API keys into the frontend (browser). Keep keys **backend-only**.

1) Create `backend/.env` from `backend/.env.example` and set either:

- **OpenRouter (recommended):** `AI_PROVIDER=openrouter` and `OPENROUTER_API_KEY=...`
- **OpenAI:** `AI_PROVIDER=openai` and `OPENAI_API_KEY=...`

2) Restart `npm start`.

3) In the UI, go to `Tools → AI Creative Generator` (or `Tools → Voicemail Triage`) and toggle “Use AI pipeline”.

Notes:

- Backend port defaults to `8000`, but `npm start` will auto-pick `8000–8049` if `8000` is already in use.
- Backend log file: `backend/.dev-backend.log`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python3 app.py
```

The backend will start on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### Optional: Configure API Base URL

By default the frontend calls `http://localhost:8000`. To override:

```bash
export REACT_APP_API_BASE_URL=http://localhost:8000
```

Restart `npm start` after changing env vars.

## Challenges Included

1. **Paid Media Task A** — Media Buying & Growth
2. **Paid Media Task B** — Creative Systems  
3. **Organic Flywheel** — Building organic growth assets
4. **Logged-Out Experience** — Web tool discovery
5. **Growth AI Enablement** — 10x a growth function
6. **Brand Sponsorship Strategy** — Strategic brand positioning
7. **Lifecycle System** — Metrics-moving lifecycle campaigns
8. **Incentive Design** — Solving the sharing problem (Kinetic)
9. **Referral Infrastructure** — Conversion-focused referrals (Pathway)
10. **Shared Patient Summary** — Safe data sharing (Capsule)
11. **Self-Serve Onboarding** — Clinic configuration (Heidi Calls)
12. **Intelligent Voicemail** — Admin-friendly message triage
13. **Copywriter Campaign** — Brand messaging strategy
14. **Product Marketing Launch** — Feature launch plan
15. **Communications AI Strategy** — Global comms at scale

Each challenge includes:
- Full problem brief
- Required deliverables
- Concrete, implementable solution
- Supporting data and frameworks

## Tech Stack

- React 18
- React Router 6
- Axios
- Flask
- Python 3
- CSS3

## Features

- Browse all 15 challenges organized by category
- Detailed view for each challenge with full solution
- Logged-out tool demos for selected challenges (see `/tools`)
- Per-task “Solution Hub” tabs: Plan, Prototype, Assets (artifacts), Metrics (events), Export
- Responsive design
- Data-rich solution presentations with tables, lists, and structured content
- RESTful API backend
- Submission pack in `deliverables/` (checklist, runbook, sample inputs/outputs)

## Platform Primitives (shared building blocks)

- **Artifacts:** save notes/creative/exports per task via `POST /api/artifacts`, query via `GET /api/artifacts?task_id=...`
- **Events:** lightweight analytics via `POST /api/events`, summary via `GET /api/events/summary?task_id=...`
- **Waitlist:** early user capture via `POST /api/waitlist`
- **Exports:** `GET /api/export/:taskId?format=markdown|json`
- **Storage:** SQLite file at `backend/app.db` (demo-friendly; can be swapped later)

## Next Steps

To add more challenges or extend the solution:

1. Add challenge data to `backend/challenges.py`
2. Update the `renderSolution()` function in `frontend/src/pages/ChallengeDetail.js` to handle new solution types
3. Restart both backend and frontend servers

---

Built as a portfolio to showcase solutions across Heidi's core functions.
