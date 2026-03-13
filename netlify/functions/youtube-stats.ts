import type { Handler, HandlerEvent } from '@netlify/functions'

const YT_API = 'https://www.googleapis.com/youtube/v3/videos'

export const handler: Handler = async (event: HandlerEvent) => {
  const videoId = event.queryStringParameters?.videoId

  if (!videoId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing videoId' }) }
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  console.log('[youtube-stats] apiKey present:', !!apiKey, '| length:', apiKey?.length ?? 0)

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  const url = `${YT_API}?part=statistics&id=${encodeURIComponent(videoId)}&key=${apiKey}`
  console.log('[youtube-stats] fetching:', url.replace(apiKey, 'KEY_REDACTED'))

  const res = await fetch(url, {
    headers: { Referer: process.env.SITE_URL ?? 'https://localhost' },
  })
  console.log('[youtube-stats] response status:', res.status)

  if (!res.ok) {
    const errorBody = await res.text()
    console.log('[youtube-stats] error body:', errorBody)
    return {
      statusCode: res.status,
      body: JSON.stringify({ error: 'YouTube API error', detail: errorBody }),
    }
  }

  const data = await res.json()
  const item = data.items?.[0]
  console.log('[youtube-stats] items count:', data.items?.length ?? 0)

  if (!item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Video not found' }) }
  }

  const { viewCount, likeCount, commentCount } = item.statistics

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      views:    Number(viewCount    ?? 0),
      likes:    Number(likeCount    ?? 0),
      comments: Number(commentCount ?? 0),
    }),
  }
}
