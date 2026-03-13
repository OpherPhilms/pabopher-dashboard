import type { Creator } from '../types/video'

/**
 * Maps a Firebase Auth email to a creator name using env vars.
 * Add VITE_PAB_EMAIL and VITE_OPHER_EMAIL to your .env.local.
 * Returns null if the email doesn't match either — voting is disabled in that case.
 */
export function creatorFromEmail(email: string | null | undefined): Creator | null {
  if (!email) return null
  if (email === import.meta.env.VITE_PAB_EMAIL)   return 'Pab'
  if (email === import.meta.env.VITE_OPHER_EMAIL) return 'Opher'
  return null
}
