import type { Video, Platform } from '../../types/video'
import { isOverdue } from '../../types/video'
import TitleTesting from './TitleTesting'
import PerformanceCard from './PerformanceCard'

const PLATFORM_CLASS: Record<Platform, string> = {
  'YouTube':  'platform-youtube',
  'IG Reels': 'platform-ig',
  'TikTok':   'platform-tiktok',
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${m}/${d}/${y}`
}

interface Props {
  video:  Video
  onEdit: (video: Video) => void
}

export default function VideoCard({ video, onEdit }: Props) {
  const overdue = isOverdue(video)

  return (
    <div
      className={`video-card${overdue ? ' is-overdue' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('videoId',      video.id)
        e.dataTransfer.setData('sourceStage',  video.stage)
        e.dataTransfer.setData('videoCreator', video.creator)
        e.dataTransfer.effectAllowed = 'move'
      }}
    >
      <div className="video-card-title">{video.title}</div>

      <div className="video-card-meta">
        <span className={`platform-badge ${PLATFORM_CLASS[video.platform]}`}>
          {video.platform}
        </span>
        <span className={`creator-tag creator-tag-${video.creator.toLowerCase()}`}>
          {video.creator}
        </span>
        {overdue && <span className="overdue-badge">OVERDUE</span>}
      </div>

      {video.dueDate && (
        <div className={`video-card-due${overdue ? ' overdue-text' : ''}`}>
          DUE: {formatDate(video.dueDate)}
        </div>
      )}

      {video.notes && (
        <div className="video-card-notes">{video.notes}</div>
      )}

      <button className="video-card-edit-btn" onClick={() => onEdit(video)}>
        EDIT
      </button>

      <TitleTesting video={video} />

      {video.stage === 'Published' && video.liveUrl && (
        <PerformanceCard video={video} />
      )}
    </div>
  )
}
