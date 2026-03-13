import { useState, useEffect, useCallback } from 'react'

export interface ChannelStats {
  subscribers: number
  views:       number
  videoCount:  number
}

export interface VideoStat {
  views:    number
  likes:    number
  comments: number
}

export interface UploadedVideo {
  id:          string
  title:       string
  thumbnail:   string
  publishedAt: string
  isShort:     boolean
  views:       number
  likes:       number
  comments:    number
}

export interface ChannelAnalytics {
  channel:        ChannelStats
  uploadedVideos: UploadedVideo[]
  videos:         Record<string, VideoStat>
}

interface Result {
  data:    ChannelAnalytics | null
  loading: boolean
  error:   string | null
  refresh: () => void
}

export function useChannelAnalytics(videoIdsParam: string): Result {
  const [data,    setData]    = useState<ChannelAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = videoIdsParam ? `?videoIds=${encodeURIComponent(videoIdsParam)}` : ''

    fetch(`/.netlify/functions/youtube-analytics${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((d: ChannelAnalytics) => {
        if (!cancelled) { setData(d); setLoading(false) }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [videoIdsParam, tick])

  return { data, loading, error, refresh }
}
