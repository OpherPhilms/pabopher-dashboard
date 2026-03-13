import { STAGES } from '../../types/video'
import type { Stage, Video } from '../../types/video'
import KanbanColumn from './KanbanColumn'

interface Props {
  videos:           Video[]
  onEditVideo:      (video: Video) => void
  onVideoPublished: () => void
}

export default function KanbanBoard({ videos, onEditVideo, onVideoPublished }: Props) {
  const byStage = (stage: Stage) => videos.filter((v) => v.stage === stage)

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          videos={byStage(stage)}
          onEditVideo={onEditVideo}
          onVideoPublished={onVideoPublished}
        />
      ))}
    </div>
  )
}
