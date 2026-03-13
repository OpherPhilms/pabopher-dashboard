import { doc, onSnapshot, runTransaction } from 'firebase/firestore'
import { db } from './config'
import type { Creator } from '../types/video'
import type { Workspace } from '../types/workspace'
import { WORKSPACE_DEFAULTS } from '../types/workspace'

const WORKSPACE_REF = doc(db, 'workspace', 'main')

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Local date as 'YYYY-MM-DD' — avoids UTC offset shifting the date. */
function localDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns the Monday of the ISO week containing the given date (local time).
 * Sunday is treated as the last day of the previous week.
 */
function getWeekStart(date: Date): string {
  const d   = new Date(date)
  const day = d.getDay()                  // 0=Sun, 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day  // shift back to Monday
  d.setDate(d.getDate() + diff)
  return localDateString(d)
}

/** Returns the Monday of the week before the given week-start date. */
function prevWeekStart(weekStart: string): string {
  const d = new Date(weekStart + 'T12:00:00') // noon avoids DST edge cases
  d.setDate(d.getDate() - 7)
  return localDateString(d)
}

// ── Subscription ──────────────────────────────────────────────────────────────

export function subscribeToWorkspace(onChange: (ws: Workspace) => void): () => void {
  return onSnapshot(WORKSPACE_REF, (snap) => {
    onChange(snap.exists() ? (snap.data() as Workspace) : { ...WORKSPACE_DEFAULTS })
  })
}

// ── Streak logic ──────────────────────────────────────────────────────────────

/**
 * Records a publish for one creator.
 * - Each creator has their own independent streak.
 * - Streak tracks consecutive calendar weeks (Mon–Sun), any day of the week.
 * - Calling this multiple times in the same week is idempotent.
 * - Confetti is always triggered by the caller regardless of streak changes.
 */
export async function recordPublish(creator: Creator): Promise<void> {
  const weekStart = getWeekStart(new Date())

  await runTransaction(db, async (tx) => {
    const snap    = await tx.get(WORKSPACE_REF)
    const current: Workspace = snap.exists()
      ? (snap.data() as Workspace)
      : { ...WORKSPACE_DEFAULTS }

    const existing = current.streaks?.[creator] ?? { count: 0, lastWeekStart: null }

    // Already published this week — no change needed
    if (existing.lastWeekStart === weekStart) return

    const wasConsecutive = existing.lastWeekStart === prevWeekStart(weekStart)

    tx.set(WORKSPACE_REF, {
      ...current,
      streaks: {
        ...current.streaks,
        [creator]: {
          count:         wasConsecutive ? existing.count + 1 : 1,
          lastWeekStart: weekStart,
        },
      },
    })
  })
}
