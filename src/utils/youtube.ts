/**
 * Extracts the YouTube video ID from common URL formats:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *
 * Returns null if the URL doesn't match any known format.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null

  try {
    const u = new URL(url)

    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id || null
    }

    // youtube.com/watch?v=ID
    if (u.hostname.endsWith('youtube.com')) {
      if (u.pathname === '/watch') {
        return u.searchParams.get('v')
      }
      // youtube.com/shorts/ID or youtube.com/embed/ID
      const match = u.pathname.match(/^\/(shorts|embed)\/([^/?]+)/)
      if (match) return match[2]
    }

    return null
  } catch {
    return null
  }
}
