import type { Handler, HandlerEvent } from '@netlify/functions'

const YT_CHANNELS       = 'https://www.googleapis.com/youtube/v3/channels'
const YT_VIDEOS         = 'https://www.googleapis.com/youtube/v3/videos'
const YT_PLAYLIST_ITEMS = 'https://www.googleapis.com/youtube/v3/playlistItems'

/** Parse ISO 8601 duration string (PT#H#M#S) → total seconds */
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] ?? '0') * 3600) + (parseInt(m[2] ?? '0') * 60) + parseInt(m[3] ?? '0')
}

export const handler: Handler = async (event: HandlerEvent) => {
  const apiKey    = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  const videoIds  = event.queryStringParameters?.videoIds
  const referer   = process.env.SITE_URL ?? 'https://localhost'

  console.log('[youtube-analytics] apiKey present:', !!apiKey, '| channelId:', channelId ?? 'MISSING')

  if (!apiKey)    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  if (!channelId) return { statusCode: 500, body: JSON.stringify({ error: 'Channel ID not configured — set YOUTUBE_CHANNEL_ID in .env' }) }

  const headers = { Referer: referer }

  // ── 1. Channel stats + uploads playlist ID ────────────────────────────────
  const channelUrl = `${YT_CHANNELS}?part=statistics,contentDetails&id=${channelId}&key=${apiKey}`
  const channelRes = await fetch(channelUrl, { headers })

  if (!channelRes.ok) {
    const detail = await channelRes.text()
    return { statusCode: channelRes.status, body: JSON.stringify({ error: 'Channel API error', detail }) }
  }

  const channelData  = await channelRes.json()
  const channelItem  = channelData.items?.[0]
  const s            = channelItem?.statistics ?? {}
  const uploadsId: string | undefined = channelItem?.contentDetails?.relatedPlaylists?.uploads

  const channel = {
    subscribers: Number(s.subscriberCount ?? 0),
    views:       Number(s.viewCount       ?? 0),
    videoCount:  Number(s.videoCount      ?? 0),
  }

  // ── 2. Fetch uploads playlist (50 most recent) ────────────────────────────
  let uploadedVideos: {
    id: string; title: string; thumbnail: string
    publishedAt: string; isShort: boolean
    views: number; likes: number; comments: number
  }[] = []

  if (uploadsId) {
    const playlistUrl = `${YT_PLAYLIST_ITEMS}?part=snippet&playlistId=${uploadsId}&maxResults=50&key=${apiKey}`
    const playlistRes = await fetch(playlistUrl, { headers })

    if (playlistRes.ok) {
      const playlistData = await playlistRes.json()
      const items = (playlistData.items ?? []) as {
        snippet: {
          resourceId: { videoId: string }
          title: string
          publishedAt: string
          thumbnails: Record<string, { url: string }>
        }
      }[]

      const validItems = items.filter((i) =>
        i.snippet.title !== 'Deleted video' && i.snippet.title !== 'Private video'
      )
      const uploadIds = validItems.map((i) => i.snippet.resourceId.videoId).join(',')

      // ── 3. Batch-fetch stats + duration for those videos ──────────────────
      if (uploadIds) {
        const statsUrl = `${YT_VIDEOS}?part=statistics,contentDetails&id=${encodeURIComponent(uploadIds)}&key=${apiKey}`
        const statsRes = await fetch(statsUrl, { headers })

        const statsMap: Record<string, {
          statistics: { viewCount?: string; likeCount?: string; commentCount?: string }
          contentDetails: { duration: string }
        }> = {}

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          for (const item of statsData.items ?? []) {
            statsMap[item.id] = item
          }
        }

        // Build thumbnail map from playlist items (keyed by videoId)
        const thumbMap: Record<string, { title: string; publishedAt: string; thumbnails: Record<string, { url: string }> }> = {}
        for (const item of validItems) {
          thumbMap[item.snippet.resourceId.videoId] = item.snippet
        }

        uploadedVideos = validItems
          .filter((item) => statsMap[item.snippet.resourceId.videoId])
          .map((item) => {
            const id      = item.snippet.resourceId.videoId
            const entry   = statsMap[id]
            const stats   = entry.statistics
            const secs    = parseDuration(entry.contentDetails?.duration ?? '')
            const thumbs  = item.snippet.thumbnails
            return {
              id,
              title:       item.snippet.title,
              thumbnail:   thumbs.medium?.url ?? thumbs.default?.url ?? '',
              publishedAt: item.snippet.publishedAt,
              isShort:     secs > 0 && secs <= 60,
              views:       Number(stats.viewCount    ?? 0),
              likes:       Number(stats.likeCount    ?? 0),
              comments:    Number(stats.commentCount ?? 0),
            }
          })
      }
    }
  }

  // ── 4. Pipeline video stats (optional) ───────────────────────────────────
  const videos: Record<string, { views: number; likes: number; comments: number }> = {}

  if (videoIds) {
    const videosUrl = `${YT_VIDEOS}?part=statistics&id=${encodeURIComponent(videoIds)}&key=${apiKey}`
    const videosRes = await fetch(videosUrl, { headers })

    if (videosRes.ok) {
      const videosData = await videosRes.json()
      for (const item of videosData.items ?? []) {
        videos[item.id] = {
          views:    Number(item.statistics.viewCount    ?? 0),
          likes:    Number(item.statistics.likeCount    ?? 0),
          comments: Number(item.statistics.commentCount ?? 0),
        }
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, uploadedVideos, videos }),
  }
}
