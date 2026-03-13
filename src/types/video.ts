// ── Enums / union types ───────────────────────────────────────────────────────

export type Platform = 'YouTube' | 'IG Reels' | 'TikTok'
export type Stage    = 'Idea' | 'Scripting' | 'Filming' | 'Editing' | 'Published'
export type Creator  = 'Pab' | 'Opher'

// Ordered — used to render columns left-to-right
export const STAGES: Stage[]       = ['Idea', 'Scripting', 'Filming', 'Editing', 'Published']
export const PLATFORMS: Platform[] = ['YouTube', 'IG Reels', 'TikTok']
export const CREATORS: Creator[]   = ['Pab', 'Opher']

// ── Title testing ─────────────────────────────────────────────────────────────

export interface TitleOptionVotes {
  Pab:   'up' | 'down' | null
  Opher: 'up' | 'down' | null
}

export interface TitleOption {
  id:          string       // crypto.randomUUID()
  text:        string
  submittedBy: Creator
  votes:       TitleOptionVotes
}

// ── Core model ────────────────────────────────────────────────────────────────

export interface Video {
  id:           string    // Firestore document ID
  title:        string
  platform:     Platform
  stage:        Stage
  creator:      Creator
  notes:        string
  dueDate:      string    // 'YYYY-MM-DD'
  liveUrl:      string    // '' until pasted on Published cards
  perfNote:     string    // '' inline note on performance card
  titleOptions: TitleOption[]
  createdAt:    number    // Unix ms
  updatedAt:    number    // Unix ms
}

// What VideoForm passes to addVideo — titleOptions + perfNote are managed separately
export type VideoInput = Omit<Video, 'id' | 'createdAt' | 'updatedAt' | 'titleOptions' | 'perfNote'>

// Broader partial used by updateVideo — covers titleOptions, stage changes, etc.
export type VideoUpdate = Partial<Omit<Video, 'id' | 'createdAt'>>

// ── Derived helpers ───────────────────────────────────────────────────────────

/**
 * Returns true if the video's due date is strictly in the past
 * (ignores time — a card due today is NOT overdue until tomorrow).
 */
export function isOverdue(video: Video): boolean {
  if (!video.dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(video.dueDate) < today
}

/** Up and down vote totals for a single title option. */
export function countVotes(option: TitleOption): { up: number; down: number } {
  const vals = Object.values(option.votes)
  return {
    up:   vals.filter((v) => v === 'up').length,
    down: vals.filter((v) => v === 'down').length,
  }
}
