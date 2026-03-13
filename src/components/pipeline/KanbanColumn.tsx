import { useState } from 'react'
import type { Creator, Stage, Video } from '../../types/video'
import { updateVideo } from '../../firebase/videos'
import { recordPublish } from '../../firebase/workspace'
import VideoCard from './VideoCard'

interface Props {
  stage:           Stage
  videos:          Video[]
  onEditVideo:     (video: Video) => void
  onVideoPublished: () => void   // fires when a card lands in Published
}

export default function KanbanColumn({ stage, videos, onEditVideo, onVideoPublished }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)

    const videoId      = e.dataTransfer.getData('videoId')
    const sourceStage  = e.dataTransfer.getData('sourceStage')
    const videoCreator = e.dataTransfer.getData('videoCreator') as Creator

    if (!videoId || sourceStage === stage) return

    await updateVideo(videoId, { stage })

    if (stage === 'Published') {
      onVideoPublished()                  // trigger confetti immediately
      await recordPublish(videoCreator)   // update streak in Firestore
    }
  }

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <span>{stage.toUpperCase()}</span>
        <span className="kanban-column-count">{videos.length}</span>
      </div>

      <div
        className={`kanban-column-body${isDragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={(e) => {
          const related = e.relatedTarget as Node | null
          if (!related || !e.currentTarget.contains(related)) {
            setIsDragOver(false)
          }
        }}
        onDrop={handleDrop}
      >
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onEdit={onEditVideo} />
        ))}
      </div>
    </div>
  )
}
