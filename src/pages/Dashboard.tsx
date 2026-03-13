import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { creatorFromEmail } from '../utils/creator'
import { subscribeToVideos } from '../firebase/videos'
import { subscribeToWorkspace } from '../firebase/workspace'
import { seedDatabase } from '../firebase/seed'
import type { Video } from '../types/video'
import type { Workspace } from '../types/workspace'
import { STAGES, isOverdue } from '../types/video'

function timeAgo(ms: number): string {
  const days = Math.floor((Date.now() - ms) / 86_400_000)
  if (days === 0) return 'TODAY'
  if (days === 1) return 'YESTERDAY'
  if (days < 7)  return `${days}D AGO`
  if (days < 30) return `${Math.floor(days / 7)}WK AGO`
  return `${Math.floor(days / 30)}MO AGO`
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).toUpperCase()
}

export default function Dashboard() {
  const { user } = useAuth()
  const creator  = creatorFromEmail(user?.email)

  const [videos,    setVideos]    = useState<Video[]>([])
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [seeding,   setSeeding]   = useState(false)

  useEffect(() => subscribeToVideos(setVideos),       [])
  useEffect(() => subscribeToWorkspace(setWorkspace), [])

  const overdueVideos = useMemo(() => videos.filter(isOverdue), [videos])

  const stageCounts = useMemo(() => {
    const counts: Record<string, { pab: number; opher: number }> = {}
    for (const s of STAGES) counts[s] = { pab: 0, opher: 0 }
    for (const v of videos) {
      if (v.creator === 'Pab')   counts[v.stage].pab++
      if (v.creator === 'Opher') counts[v.stage].opher++
    }
    return counts
  }, [videos])

  const recentVideos = useMemo(
    () => [...videos].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6),
    [videos]
  )

  const pabStreak   = workspace?.streaks?.Pab?.count   ?? 0
  const opherStreak = workspace?.streaks?.Opher?.count ?? 0

  async function handleSeed() {
    if (!confirm('Insert 13 sample videos into Firestore?')) return
    setSeeding(true)
    try {
      await seedDatabase()
      alert('Done! Check the Pipeline board.')
    } catch (e) {
      alert(`Seed failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="dashboard">

      {/* ── Greeting ────────────────────────────────── */}
      <div className={`dash-greeting${creator ? ` dash-greeting-${creator.toLowerCase()}` : ''}`}>
        <div className="dash-greeting-left">
          <span className="dash-greeting-hey">
            {creator ? `HEY, ${creator.toUpperCase()}!` : 'WELCOME BACK!'}
          </span>
          <span className="dash-greeting-date">{todayLabel()}</span>
        </div>
        <div className="dash-greeting-right">
          {overdueVideos.length > 0 && (
            <span className="dash-overdue-chip">
              !! {overdueVideos.length} OVERDUE
            </span>
          )}
          {creator && (
            <span className={`dash-you-tag creator-tag creator-tag-${creator.toLowerCase()}`}>
              LOGGED IN AS {creator.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* ── Streaks ─────────────────────────────────── */}
      <div className="dash-section">
        <h2 className="dash-section-title">STREAKS</h2>
        <div className="dash-streaks">
          {([['Pab', pabStreak], ['Opher', opherStreak]] as const).map(([name, count]) => (
            <div
              key={name}
              className={`dash-streak-card dash-streak-${name.toLowerCase()}${creator === name ? ' dash-streak-mine' : ''}`}
            >
              <div className="dash-streak-top">
                <span className={`creator-tag creator-tag-${name.toLowerCase()}`}>
                  {name.toUpperCase()}
                </span>
                {creator === name && <span className="dash-streak-you-label">YOU</span>}
              </div>
              <span className="dash-streak-count">{count}</span>
              <span className="dash-streak-unit">{count === 1 ? 'WEEK' : 'WEEKS'} STRAIGHT</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pipeline snapshot ───────────────────────── */}
      <div className="dash-section">
        <h2 className="dash-section-title">PIPELINE</h2>
        <div className="dash-pipeline">
          {STAGES.map((stage) => {
            const { pab, opher } = stageCounts[stage]
            const total = pab + opher
            return (
              <div key={stage} className="dash-stage-card">
                <span className="dash-stage-name">{stage.toUpperCase()}</span>
                <span className="dash-stage-total">{total}</span>
                <div className="dash-stage-breakdown">
                  <span className="dash-stage-pab">P {pab}</span>
                  <span className="dash-stage-opher">O {opher}</span>
                </div>
              </div>
            )
          })}
          {overdueVideos.length > 0 && (
            <div className="dash-stage-card dash-stage-card-overdue">
              <span className="dash-stage-name">OVERDUE</span>
              <span className="dash-stage-total dash-stage-total-overdue">
                {overdueVideos.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent activity ─────────────────────────── */}
      <div className="dash-section">
        <h2 className="dash-section-title">RECENT ACTIVITY</h2>
        {recentVideos.length === 0 ? (
          <p className="dash-empty">No videos yet. Add some from the Pipeline board.</p>
        ) : (
          <div className="dash-recent">
            {recentVideos.map((v) => (
              <div key={v.id} className={`dash-recent-row${isOverdue(v) ? ' dash-recent-overdue' : ''}`}>
                <span className={`creator-tag creator-tag-${v.creator.toLowerCase()}`}>
                  {v.creator.toUpperCase()}
                </span>
                <span className="dash-recent-title">{v.title}</span>
                <span className="dash-recent-stage">{v.stage.toUpperCase()}</span>
                <span className="dash-recent-time">{timeAgo(v.updatedAt)}</span>
                {isOverdue(v) && <span className="dash-recent-overdue-chip">OVERDUE</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {import.meta.env.DEV && (
        <button
          className="btn-secondary"
          style={{ marginTop: '0.5rem', width: 'fit-content' }}
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? 'SEEDING...' : '[DEV] SEED SAMPLE DATA'}
        </button>
      )}

    </div>
  )
}
