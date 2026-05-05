# Mini Wefunder

**Discover, evaluate, and invest in startups — with AI-powered deal analysis.**

A full-stack startup investment platform inspired by Wefunder. Browse a curated deal feed, read detailed company profiles, and get an AI-generated investment brief — all from a clean, fast, mobile-friendly interface.

---

## Why I Built This

Retail startup investing is opaque. Platforms like Wefunder and Republic surface interesting deals, but most investors don't have the time or frameworks to evaluate them rigorously. I wanted to build something that closes that gap — a Tinder-style feed for fast filtering, combined with an AI analyst that generates the kind of structured brief a VC associate would write.

This project is also a practical sandbox for building a product-grade full-stack app: typed API contract, in-memory state management, Next.js App Router patterns, and a clean system for swapping mock services for real ones.

---

## Features

**Discovery Feed**
- Tinder-style card stack: swipe right to watch, left to pass
- Keyboard shortcuts (← / →) for power users
- Cards show sector, stage, raise amount, and MRR growth at a glance
- Progress bar tracks how far through the deal flow you are

**Startup Profiles**
- Full company page: description, funding goal, location, team size, runway
- Funding progress bar with raise target and valuation
- Highlights and key risks in a structured, scannable layout
- Quick-action Invest / Pass buttons without leaving the page

**AI Deal Room**
- Generates a structured investment brief per startup:
  - One-sentence summary
  - Market opportunity (TAM, timing, distribution angle)
  - Key risks (specific, not generic)
  - Bull case and bear case
  - Investment score (0–100) and verdict
- Animated step-by-step loading state ("Reading the deal memo… Stress-testing the bull case…")
- In-process caching — second visit is instant
- Pluggable: replace the mock with a real OpenAI call by adding one env var

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, DM Serif Display + DM Sans fonts |
| Backend | Node.js, Express |
| State | In-memory (no database) |
| AI | Curated mock responses (OpenAI-compatible interface) |

---

## Core Product Flow

```
Feed  ──►  Startup Profile  ──►  AI Deal Room  ──►  Invest or Pass
 ↑                                                        │
 └────────────────────────────────────────────────────────┘
```

1. **Feed** — A card stack of startup deals. Swipe right (Watch) or left (Pass). Cards show the essential signal: sector, stage, raise, and growth rate. Click "View profile" to go deeper.

2. **Startup Profile** — Full company page. Funding goal with a progress bar, description, location, team size, highlights, and risks. Two CTAs: view the pitch deck or open the Deal Room.

3. **AI Deal Room** — Click "Generate AI Deal Room". The backend runs the analysis prompt against the startup's data and returns a structured five-section brief. The UI reveals it with a step-by-step loading sequence so the "thinking" process is visible.

4. **Invest / Pass** — Decisions are recorded in session state and reflected in the watchlist. The feed excludes already-seen startups.

---

## Architecture

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│         Next.js Frontend        │     │        Express Backend           │
│                                 │     │                                  │
│                                 │     │                                  │
│  app/feed/page.tsx              │     │  GET  /api/startups?mode=feed    │
│  app/startup/[id]/page.tsx      │────►│  GET  /api/startups/:id          │
│  app/deal-room/[id]/page.tsx    │     │  POST /api/startups/:id/like     │
│                                 │     │  POST /api/startups/:id/pass     │
│  lib/startups.ts  (shared data) │     │  POST /api/analyze               │
│  lib/api.ts       (typed client)│     │                                  │
│                                 │     │  data/startups.js  (seed data)   │
│  next.config.js rewrite proxy   │     │  data/userState.js (session)     │
│  /api/* → backend URL           │     │                                  │
└─────────────────────────────────┘     └──────────────────────────────────┘
```

**A few intentional design choices:**

- **Next.js rewrite proxy** — all `/api/*` calls from the browser are forwarded server-side to the backend. No CORS issues in production, and no backend URL leaks into the client bundle.
- **Shared data file** — `lib/startups.ts` is the canonical source for startup data on the frontend. Profile pages read from it directly instead of making an extra fetch, eliminating a waterfall request on every page load.
- **Mock AI with a real interface** — `POST /api/analyze` returns the same JSON shape a real OpenAI integration would. Swapping in a live model is one env var and zero code changes.
- **In-process cache** — analysis results are stored in memory on the backend. Re-visiting a Deal Room is instant; no duplicate compute.

---

## Running Locally

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/mini-wefunder.git
cd mini-wefunder
```

```bash
# 2. Start the backend
cd backend
npm install
cp .env.example .env     # no edits needed — mock mode works out of the box
npm run dev
# → API running at http://localhost:4000
# → AI mode: Mock (no API key required)
```

```bash
# 3. Start the frontend (new terminal tab)
cd frontend
npm install
npm run dev
# → App running at http://localhost:3000
```

Open [localhost:3000](http://localhost:3000). The feed loads immediately with seed data.

**API reference**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/startups?mode=feed` | Unseen startups for the feed |
| `GET` | `/api/startups/:id` | Single startup |
| `POST` | `/api/startups/:id/like` | Add to watchlist |
| `POST` | `/api/startups/:id/pass` | Pass on a startup |
| `GET` | `/api/startups/user/watchlist` | Watchlisted startups |
| `POST` | `/api/analyze` | Generate AI investment analysis |

**Enable real OpenAI (optional)**

```bash
# backend/.env
OPENAI_API_KEY=sk-...
```

Restart the backend. The analyze route detects the key and calls GPT-4o-mini instead of returning the mock. Expected cost: ~$0.002 per analysis.

---

## What This Demonstrates

**Product thinking** — the feature set maps to a real user need (filtering and evaluating startup deals) rather than being a generic CRUD demo. The flow from feed → profile → AI analysis → decision mirrors how an actual investor engages with a platform.

**Full-stack architecture** — typed end-to-end contract between frontend and backend, clean separation of concerns, a shared data layer, and a proxy pattern that eliminates CORS complexity without collapsing the frontend/backend boundary.

**Component design** - composable UI components (`SwipeCard`, `SectionCard`, `ScoreRing`, `BulletList`) built on consistent design tokens rather than ad hoc styles. Each component has a single responsibility and no hidden dependencies.

**State management without a framework** - session state (watchlist, pass history, analysis cache) handled cleanly with plain React hooks and server-side in-memory objects. No Redux, no Zustand — just the right tool for the scope.

**Extensibility by design** — mock AI, in-memory data, and absent auth are explicit trade-offs, not oversights. Each has a clear upgrade path and the interfaces are shaped to make those swaps non-breaking.

---

## Future Work

- **Persistent storage** — swap in-memory state for Postgres + Prisma. The schema is straightforward: `startups`, `users`, `decisions`.
- **Auth** — NextAuth.js with GitHub OAuth. Decisions and watchlist become user-scoped and survive page refresh.
- **Streaming AI** — `POST /api/analyze` already has the right shape. Stream the response with `ReadableStream` for faster perceived performance.
- **Touch gestures** — `framer-motion` is already installed. Wiring `useDrag` for mobile swipe is the next UI milestone.
- **Pledge flow** — an investment amount input and a simulated portfolio view. Simple data model, meaningful product moment.
- **Admin panel** — a password-protected route for adding and editing startup listings without touching the codebase.

---

## License

MIT