import { useState, useEffect, useCallback } from 'react'
import { extractYouTubeId } from '../utils/youtube'

export interface YouTubeStats {
  views:    number
  likes:    number
  comments: number
}

interface Result {
  stats:   YouTubeStats | null
  loading: boolean
  error:   string | null
  refresh: () => void
}

export function useYouTubeStats(liveUrl: string): Result {
  const [stats,   setStats]   = useState<YouTubeStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const videoId = extractYouTubeId(liveUrl)
    if (!videoId) {
      setStats(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/.netlify/functions/youtube-stats?videoId=${encodeURIComponent(videoId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: YouTubeStats) => {
        if (!cancelled) { setStats(data); setLoading(false) }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [liveUrl, tick])

  return { stats, loading, error, refresh }
}
