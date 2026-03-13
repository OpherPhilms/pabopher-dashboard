import { useState } from 'react'
import type { Video } from '../../types/video'
import { updateVideo } from '../../firebase/videos'
import { useYouTubeStats } from '../../hooks/useYouTubeStats'
import { extractYouTubeId } from '../../utils/youtube'

interface Props {
  video: Video
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function PerformanceCard({ video }: Props) {
  const { stats, loading, error, refresh } = useYouTubeStats(video.liveUrl)
  const [note, setNote] = useState(video.perfNote)

  const videoId = extractYouTubeId(video.liveUrl)

  async function handleNoteBlur() {
    if (note === video.perfNote) return
    await updateVideo(video.id, { perfNote: note })
  }

  return (
    <div
      className="perf-card"
      onDragStart={(e) => e.stopPropagation()}
      draggable={false}
    >
      <div className="perf-card-header">
        <span className="perf-card-label">PERFORMANCE</span>
        {videoId && (
          <a
            className="perf-card-link"
            href={video.liveUrl}
            target="_blank"
            rel="noreferrer"
          >
            [WATCH]
          </a>
        )}
        <button className="perf-refresh-btn" onClick={refresh} title="Refresh stats">
          [REFRESH]
        </button>
      </div>

      {loading && <div className="perf-loading">FETCHING STATS...</div>}

      {error && !loading && (
        <div className="perf-error">ERR: {error}</div>
      )}

      {!loading && !error && stats && (
        <div className="perf-stats">
          <div className="perf-stat">
            <span className="perf-stat-value">{fmt(stats.views)}</span>
            <span className="perf-stat-label">VIEWS</span>
          </div>
          <div className="perf-stat">
            <span className="perf-stat-value">{fmt(stats.likes)}</span>
            <span className="perf-stat-label">LIKES</span>
          </div>
          <div className="perf-stat">
            <span className="perf-stat-value">{fmt(stats.comments)}</span>
            <span className="perf-stat-label">CMTS</span>
          </div>
        </div>
      )}

      <textarea
        className="perf-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleNoteBlur}
        placeholder="NOTE..."
        rows={2}
      />
    </div>
  )
}
