# Pabopher Dashboard

The idea here is to make a collaborative content creator dashboard for **Pab** and **Opher** — two YouTubers sharing a channel. That's my buddy and I we personally have a collaborative YouTube channel, but we are hundreds of miles apart and are very individual when it comes to making our videos. So this way we could possibly look at everything needed for our biweekly uploads, the analytics of the ones we each personally uploaded and create together in a way that makes things much easier on us.

---

## Planned Features

1. **Video Pipeline Board** — move videos through stages: Idea → Scripting → Filming → Editing → Published
2. **Add / Edit / Delete Videos** — full control over your entries, each tagged to its creator
3. **Creator Filter** — toggle between my videos, Paolo's videos, or the full channel view
4. **Search & Filter** — find videos by title, platform (YouTube/TikTok), or status
5. **Per-Video Notes** — space for shot lists, script ideas, or whatever needs remembering
6. **Channel Stats** — a quick breakdown of what's in each stage and who owns what
7. **Authentication** — each of us logs in with our own account
8. **Cloud Sync** — Firestore so everything stays in sync across devices

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Plain CSS
- **Backend/Auth:** Firebase (Firestore + Auth)
- **Deployment:** Netlify

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## What I Learned

Setting up this project with Claude Code taught me how much planning upfront
affects the quality of AI output. Vague prompts consistently produced generic
results, I mean my landing page went through three full redesigns before I learned
to specify exactly what I didn't want as much as what I did. I also learned
that starting a fresh session is sometimes more efficient than iterating on a
bad output. The most useful skill so far has been scoping prompts to one
specific task rather than asking Claude to build everything at once.
