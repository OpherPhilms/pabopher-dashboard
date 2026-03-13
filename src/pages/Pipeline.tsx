import { useEffect, useMemo, useState } from 'react'
import type { Platform, Stage, Video } from '../types/video'
import type { Workspace } from '../types/workspace'
import { subscribeToVideos } from '../firebase/videos'
import { subscribeToWorkspace } from '../firebase/workspace'
import { useFilter } from '../context/FilterContext'
import KanbanBoard     from '../components/pipeline/KanbanBoard'
import VideoForm       from '../components/pipeline/VideoForm'
import PipelineFilters from '../components/pipeline/PipelineFilters'
import Confetti        from '../components/Confetti'

export default function Pipeline() {
  const [videos,       setVideos]       = useState<Video[]>([])
  const [workspace,    setWorkspace]    = useState<Workspace | null>(null)
  const [editTarget,   setEditTarget]   = useState<Video | null>(null)
  const [showAdd,      setShowAdd]      = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Search / filter bar state
  const [search,          setSearch]          = useState('')
  const [filterPlatform,  setFilterPlatform]  = useState<Platform | ''>('')
  const [filterStage,     setFilterStage]     = useState<Stage | ''>('')

  useEffect(() => subscribeToVideos(setVideos),       [])
  useEffect(() => subscribeToWorkspace(setWorkspace), [])

  const { activeCreator } = useFilter()

  const pabStreak   = workspace?.streaks?.Pab?.count   ?? 0
  const opherStreak = workspace?.streaks?.Opher?.count ?? 0

  // All filters applied in sequence — no extra Firestore reads
  const filteredVideos = useMemo(() => {
    let result = videos

    // Global creator filter (from sidebar/nav)
    if (activeCreator !== 'All') {
      result = result.filter((v) => v.creator === activeCreator)
    }
    // Title search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((v) => v.title.toLowerCase().includes(q))
    }
    // Platform dropdown
    if (filterPlatform) {
      result = result.filter((v) => v.platform === filterPlatform)
    }
    // Stage dropdown
    if (filterStage) {
      result = result.filter((v) => v.stage === filterStage)
    }

    return result
  }, [videos, activeCreator, search, filterPlatform, filterStage])

  const isFormOpen = showAdd || editTarget !== null

  return (
    <div className="pipeline-page">
      <div className="pipeline-toolbar">
        <h2 className="pipeline-heading">VIDEO PIPELINE</h2>
        <div className="pipeline-toolbar-right">
          <div className="streak-badge">
            <span className="streak-name">PAB</span>
            <span className="streak-number">{pabStreak}</span>
            <span className="streak-unit">{pabStreak === 1 ? 'WK' : 'WKS'}</span>
          </div>
          <div className="streak-badge">
            <span className="streak-name">OPHER</span>
            <span className="streak-number">{opherStreak}</span>
            <span className="streak-unit">{opherStreak === 1 ? 'WK' : 'WKS'}</span>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            + ADD VIDEO
          </button>
        </div>
      </div>

      <PipelineFilters
        search={search}
        platform={filterPlatform}
        stage={filterStage}
        onSearch={setSearch}
        onPlatform={setFilterPlatform}
        onStage={setFilterStage}
      />

      <KanbanBoard
        videos={filteredVideos}
        onEditVideo={setEditTarget}
        onVideoPublished={() => setShowConfetti(true)}
      />

      {isFormOpen && (
        <VideoForm
          initial={editTarget}
          onClose={() => { setShowAdd(false); setEditTarget(null) }}
        />
      )}

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  )
}
