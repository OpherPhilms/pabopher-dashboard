import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'
import type { VideoInput } from '../types/video'

// Realistic mock data for a 2-person YouTube channel.
// Delete via Firebase Console > Firestore > videos collection once no longer needed.
const SAMPLE_VIDEOS: VideoInput[] = [
  // ── IDEA ─────────────────────────────────────────────
  {
    title:    'We Spent a Week Living Like Minimalists',
    platform: 'YouTube',
    stage:    'Idea',
    creator:  'Pab',
    notes:    'Could be a 2-parter. Pab does closet, Opher does kitchen.',
    dueDate:  '2026-04-11',
    liveUrl:  '',
  },
  {
    title:    'Rating Every Camera We Have Ever Owned',
    platform: 'YouTube',
    stage:    'Idea',
    creator:  'Opher',
    notes:    '',
    dueDate:  '2026-04-18',
    liveUrl:  '',
  },
  {
    title:    'Trying Every Viral TikTok Food Hack',
    platform: 'TikTok',
    stage:    'Idea',
    creator:  'Pab',
    notes:    'Collab with the food channel. Budget: keep it cheap.',
    dueDate:  '2026-04-25',
    liveUrl:  '',
  },

  // ── SCRIPTING ─────────────────────────────────────────
  {
    title:    'The Morning Routine That Changed Everything',
    platform: 'YouTube',
    stage:    'Scripting',
    creator:  'Opher',
    notes:    'Keep under 12 min. Hook needs work — revisit intro.',
    dueDate:  '2026-03-21',
    liveUrl:  '',
  },
  {
    title:    'Gear We Regret Buying',
    platform: 'YouTube',
    stage:    'Scripting',
    creator:  'Pab',
    notes:    'Pull receipts for B-roll. Unboxing footage still needs to be found.',
    dueDate:  '2026-03-28',
    liveUrl:  '',
  },

  // ── FILMING ──────────────────────────────────────────
  {
    title:    '48 Hour NYC Vlog',
    platform: 'YouTube',
    stage:    'Filming',
    creator:  'Opher',
    notes:    'B-roll from the High Line is gold. Still need rooftop shots.',
    dueDate:  '2026-03-10',   // overdue
    liveUrl:  '',
  },
  {
    title:    'Studio Tour 2026',
    platform: 'IG Reels',
    stage:    'Filming',
    creator:  'Pab',
    notes:    'Wide lens for room shots. Film before new desk arrives.',
    dueDate:  '2026-03-14',
    liveUrl:  '',
  },

  // ── EDITING ──────────────────────────────────────────
  {
    title:    'Testing Viral Productivity Hacks for 30 Days',
    platform: 'YouTube',
    stage:    'Editing',
    creator:  'Pab',
    notes:    'Color grade done. End card needs update, music not cleared yet.',
    dueDate:  '2026-03-07',   // overdue
    liveUrl:  '',
  },
  {
    title:    'How We Grew From 0 to 10k Subscribers',
    platform: 'YouTube',
    stage:    'Editing',
    creator:  'Opher',
    notes:    'Waiting on animated graph from designer.',
    dueDate:  '2026-03-16',
    liveUrl:  '',
  },
  {
    title:    'iPhone vs. $5000 Camera: Real World Test',
    platform: 'TikTok',
    stage:    'Editing',
    creator:  'Pab',
    notes:    'Keep under 60s. Use trending audio.',
    dueDate:  '2026-03-13',
    liveUrl:  '',
  },

  // ── PUBLISHED ────────────────────────────────────────
  {
    title:    'We Built an App in 48 Hours',
    platform: 'YouTube',
    stage:    'Published',
    creator:  'Pab',
    notes:    'Hit 50k in 3 days. Pin the comment thread.',
    dueDate:  '2026-02-28',
    liveUrl:  '',
  },
  {
    title:    'Day in the Life: Content Creator Edition',
    platform: 'TikTok',
    stage:    'Published',
    creator:  'Opher',
    notes:    '2.1M views. TikTok pushed it hard. Repurpose for Reels.',
    dueDate:  '2026-03-01',
    liveUrl:  '',
  },
  {
    title:    'Our Honest Channel Q&A',
    platform: 'YouTube',
    stage:    'Published',
    creator:  'Opher',
    notes:    'Great engagement — 1.2k comments.',
    dueDate:  '2026-03-07',
    liveUrl:  '',
  },
]

export async function seedDatabase(): Promise<void> {
  const col = collection(db, 'videos')
  for (const video of SAMPLE_VIDEOS) {
    await addDoc(col, {
      ...video,
      titleOptions: [],
      createdAt:    serverTimestamp(),
      updatedAt:    serverTimestamp(),
    })
  }
}
