# Pabopher Dashboard

A collaborative content creator dashboard for **Pab** and **Opher** — two YouTubers sharing a channel. Built to replace chaos with a single place to plan, track, and create together.

---

## Project Plan

### Phase 1 — Foundation (current)

- [x] Scaffold Vite + React + TypeScript project
- [x] Initialize Git repo with `.gitignore`
- [x] Custom landing page
- [ ] Deploy to Netlify

### Phase 2 — Core Dashboard

- [ ] Authentication (two named users, no signup)
- [ ] Shared content calendar (plan upload dates)
- [ ] Task board per video (script → film → edit → thumbnail → upload)
- [ ] Idea inbox with upvoting

### Phase 3 — Analytics & Goals

- [ ] YouTube Analytics integration (YouTube Data API v3)
- [ ] Channel goal tracker (subscribers, views, watch hours)
- [ ] Per-video performance cards

### Phase 4 — Collab Tools

- [ ] Asset library (links to Drive / shared storage)
- [ ] In-app notes / comments per video
- [ ] Notification system for task updates

---

## Tech Stack

| Layer      | Choice                        |
| ---------- | ----------------------------- |
| Frontend   | React 19 + TypeScript + Vite  |
| Styling    | Plain CSS (component-scoped)  |
| Routing    | React Router (Phase 2)        |
| State      | React Context / Zustand (TBD) |
| Backend    | Supabase or Firebase (TBD)    |
| Deployment | Netlify                       |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

---

## Deployment (Netlify)

1. Push to GitHub
2. Connect repo in Netlify → "New site from Git"
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

A `netlify.toml` will be added in Phase 2 for SPA redirect rules.

## What I Learned

Setting up this project with Claude Code taught me how much planning upfront
affects the quality of AI output. Vague prompts consistently produced generic
results, I mean my landing page went through three full redesigns before I learned
to specify exactly what I didn't want as much as what I did. I also learned
that starting a fresh session is sometimes more efficient than iterating on a
bad output. The most useful skill so far has been scoping prompts to one
specific task rather than asking Claude to build everything at once.
