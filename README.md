# ⚡ Mini Wefunder

A minimal, production-quality startup investment discovery platform with:

- **Discovery Feed** — Tinder-style startup cards with keyboard/button swipe
- **Startup Profile** — Full profile page with financials, highlights, risks
- **AI Deal Room** — GPT-powered investment analysis + Q&A (mock fallback included)

---

## Project Structure

```
mini-wefunder/
├── backend/                    # Node.js + Express API
│   ├── data/
│   │   ├── startups.js         # In-memory startup seed data (5 startups)
│   │   └── userState.js        # In-memory watchlist / pass state
│   ├── routes/
│   │   ├── startups.js         # CRUD + like/pass endpoints
│   │   └── dealRoom.js         # AI analysis + Q&A endpoints
│   ├── server.js               # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # Next.js 14 (App Router)
    ├── app/
    │   ├── layout.tsx           # Root layout + fonts
    │   ├── globals.css          # Tailwind + design tokens
    │   ├── page.tsx             # Redirect → /feed
    │   ├── feed/
    │   │   └── page.tsx         # Discovery feed + watchlist tab
    │   ├── startup/
    │   │   └── [id]/page.tsx    # Startup profile page
    │   └── deal-room/
    │       └── [id]/page.tsx    # AI Deal Room page
    ├── components/
    │   ├── layout/
    │   │   └── Nav.tsx          # Top navigation
    │   └── ui/
    │       ├── SwipeCard.tsx    # Main feed card (swipeable)
    │       └── StartupCard.tsx  # Compact card for watchlist
    ├── lib/
    │   └── api.ts               # Typed API client
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.local
    └── package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

---

### 1. Backend

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env — add your OpenAI key (optional; mock AI works without it)

# Start dev server
npm run dev
# → API running at http://localhost:4000
```

**API endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/startups` | All startups |
| GET | `/api/startups?mode=feed` | Unseen startups only |
| GET | `/api/startups/:id` | Single startup |
| POST | `/api/startups/:id/like` | Add to watchlist |
| POST | `/api/startups/:id/pass` | Pass on startup |
| GET | `/api/startups/user/watchlist` | Watchlist items |
| POST | `/api/deal-room/:id/analyze` | AI analysis |
| POST | `/api/deal-room/:id/ask` | AI Q&A |

---

### 2. Frontend

```bash
cd frontend
npm install

# .env.local is pre-configured for local dev:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm run dev
# → App running at http://localhost:3000
```

---

### 3. OpenAI Integration (optional)

The app works **fully without an API key** using realistic mock analysis.

To enable real GPT-4o-mini analysis:

1. Get a key from [platform.openai.com](https://platform.openai.com)
2. Add it to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Restart the backend — the AI mode indicator in the terminal will confirm.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| In-memory data | Zero setup friction for MVP; swap for SQLite/Postgres in prod |
| Mock AI fallback | Demo-able without spending API credits |
| Analysis caching | Avoids duplicate OpenAI calls within a session |
| Next.js App Router | Modern, file-based routing with server/client component split |
| Framer Motion ready | `framer-motion` installed; wire up for swipe gesture support |
| Keyboard shortcuts | ←/→ arrow keys work in feed for power users |

---

## Next Steps (Post-MVP)

- [ ] Add PostgreSQL with Prisma for persistent data
- [ ] Real drag/swipe gestures with Framer Motion `useDrag`
- [ ] User auth (NextAuth.js)
- [ ] Investment round simulation (pledge amounts)
- [ ] Admin panel to add new startups
- [ ] Email digest of watchlist via Resend
- [ ] Streaming AI responses with `ReadableStream`
