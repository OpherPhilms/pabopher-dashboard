import { useEffect, useMemo, useState } from 'react'
import type { Video } from '../types/video'
import type { UploadedVideo } from '../hooks/useChannelAnalytics'
import type { Creator } from '../types/video'
import { subscribeToVideos } from '../firebase/videos'
import { subscribeToChannelVideos, setVideoCreator, clearVideoCreator } from '../firebase/channelVideos'
import { useFilter } from '../context/FilterContext'
import { extractYouTubeId } from '../utils/youtube'
import { useChannelAnalytics } from '../hooks/useChannelAnalytics'

type TypeFilter  = 'all' | 'videos' | 'shorts'
type UploadSort  = 'date' | 'views'

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface CardProps {
  v:           UploadedVideo
  assignment:  Creator | undefined
  onAssign:    (creator: Creator) => Promise<void>
  onClear:     () => Promise<void>
}

function VideoCard({ v, assignment, onAssign, onClear }: CardProps) {
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  async function handleAssign(creator: Creator) {
    setSaving(true); setErr('')
    try { await onAssign(creator) } catch (e) { setErr(e instanceof Error ? e.message : 'Failed') }
    setSaving(false)
  }

  async function handleClear() {
    setSaving(true); setErr('')
    try { await onClear() } catch (e) { setErr(e instanceof Error ? e.message : 'Failed') }
    setSaving(false)
  }

  return (
    <div className="upload-card">
      <a
        className="upload-thumb-wrap"
        href={`https://www.youtube.com/watch?v=${v.id}`}
        target="_blank"
        rel="noreferrer"
      >
        <img className="upload-thumb" src={v.thumbnail} alt={v.title} loading="lazy" />
        {v.isShort && <span className="upload-short-badge">SHORT</span>}
      </a>

      <div className="upload-card-body">
        <p className="upload-card-title">{v.title}</p>
        <p className="upload-card-date">{formatDate(v.publishedAt)}</p>

        <div className="upload-card-stats">
          <span>{fmt(v.views)} views</span>
          <span>{fmt(v.likes)} likes</span>
          <span>{fmt(v.comments)} cmts</span>
        </div>

        <div className="upload-card-assign">
          {assignment ? (
            <>
              <span className={`upload-assigned-badge creator-tag-${assignment.toLowerCase()}`}>
                {assignment.toUpperCase()}
              </span>
              <button className="upload-assign-clear" onClick={handleClear} disabled={saving} title="Remove assignment">
                {saving ? '...' : '[×]'}
              </button>
            </>
          ) : (
            <>
              <button
                className="upload-assign-btn upload-assign-pab"
                onClick={() => handleAssign('Pab')}
                disabled={saving}
              >
                {saving ? '...' : 'PAB'}
              </button>
              <button
                className="upload-assign-btn upload-assign-opher"
                onClick={() => handleAssign('Opher')}
                disabled={saving}
              >
                {saving ? '...' : 'OPHER'}
              </button>
            </>
          )}
        </div>
        {err && <p className="upload-assign-err">{err}</p>}
      </div>
    </div>
  )
}

export default function Stats() {
  const [videos,      setVideos]      = useState<Video[]>([])
  const [assignments, setAssignments] = useState<Record<string, Creator>>({})
  const [typeFilter,    setTypeFilter]    = useState<TypeFilter>('all')
  const [uploadSort,    setUploadSort]    = useState<UploadSort>('date')
  const [includeShorts, setIncludeShorts] = useState(true)
  const { activeCreator } = useFilter()

  useEffect(() => subscribeToVideos(setVideos), [])
  useEffect(() => subscribeToChannelVideos(setAssignments), [])

  // Pipeline: published videos with a live URL
  const publishedVideos = useMemo(() => {
    let result = videos.filter((v) => v.stage === 'Published' && v.liveUrl)
    if (activeCreator !== 'All') result = result.filter((v) => v.creator === activeCreator)
    return result
  }, [videos, activeCreator])

  const idMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const v of publishedVideos) {
      const ytId = extractYouTubeId(v.liveUrl)
      if (ytId) map[v.id] = ytId
    }
    return map
  }, [publishedVideos])

  const videoIdsParam = Object.values(idMap).join(',')
  const { data, loading, error, refresh } = useChannelAnalytics(videoIdsParam)

  const channel = data?.channel
  const ytStats = data?.videos ?? {}

  // Pipeline performance table rows
  const rows = useMemo(() => {
    return publishedVideos
      .map((v) => {
        const ytId  = idMap[v.id]
        const stats = ytId ? ytStats[ytId] : undefined
        return { video: v, ytId, stats }
      })
      .sort((a, b) => (b.stats?.views ?? 0) - (a.stats?.views ?? 0))
  }, [publishedVideos, idMap, ytStats])

  // Uploaded videos: apply type + creator filters, then sort
  const sortedUploads = useMemo(() => {
    let list = [...(data?.uploadedVideos ?? [])]

    // Type filter
    if (typeFilter === 'videos') list = list.filter((v) => !v.isShort)
    if (typeFilter === 'shorts') list = list.filter((v) => v.isShort)

    // Global creator filter — only show videos assigned to that creator (unassigned = hidden)
    if (activeCreator !== 'All') {
      list = list.filter((v) => assignments[v.id] === activeCreator)
    }

    // Sort
    if (uploadSort === 'views') return list.sort((a, b) => b.views - a.views)
    return list  // newest-first from API
  }, [data?.uploadedVideos, typeFilter, uploadSort, activeCreator, assignments])

  const totalVideos = (data?.uploadedVideos ?? []).filter((v) => !v.isShort).length
  const totalShorts = (data?.uploadedVideos ?? []).filter((v) => v.isShort).length

  // Individual creator stats — aggregated from their assigned uploaded videos
  const creatorStats = useMemo(() => {
    if (activeCreator === 'All' || !data) return null
    const assigned = (data.uploadedVideos ?? []).filter((v) => assignments[v.id] === activeCreator)
    const mine     = includeShorts ? assigned : assigned.filter((v) => !v.isShort)
    return {
      videos:   assigned.filter((v) => !v.isShort).length,
      shorts:   assigned.filter((v) => v.isShort).length,
      views:    mine.reduce((s, v) => s + v.views,    0),
      likes:    mine.reduce((s, v) => s + v.likes,    0),
      comments: mine.reduce((s, v) => s + v.comments, 0),
    }
  }, [activeCreator, data, assignments, includeShorts])

  return (
    <div className="stats-page">

      {/* ── Overview (channel or individual) ─────────────── */}
      <div className="stats-section">
        <div className="stats-section-header">
          <h2 className="stats-heading">
            {activeCreator === 'All' ? 'CHANNEL STATS' : `${activeCreator.toUpperCase()} STATS`}
          </h2>
          <div className="stats-header-controls">
            {activeCreator !== 'All' && (
              <div className="shorts-toggle">
                <button
                  className={`shorts-toggle-btn${includeShorts ? ' active' : ''}`}
                  onClick={() => setIncludeShorts(true)}
                >
                  W/ SHORTS
                </button>
                <button
                  className={`shorts-toggle-btn${!includeShorts ? ' active' : ''}`}
                  onClick={() => setIncludeShorts(false)}
                >
                  NO SHORTS
                </button>
              </div>
            )}
            <button className="stats-refresh-btn" onClick={refresh} disabled={loading}>
              {loading ? 'LOADING...' : '[REFRESH]'}
            </button>
          </div>
        </div>

        {error && <p className="stats-error">ERR: {error}</p>}

        {/* Channel-wide stats */}
        {activeCreator === 'All' && (
          <div className="channel-overview">
            <div className="channel-stat-block">
              <span className="channel-stat-value">{channel ? fmt(channel.subscribers) : '—'}</span>
              <span className="channel-stat-label">SUBSCRIBERS</span>
            </div>
            <div className="channel-stat-divider">|</div>
            <div className="channel-stat-block">
              <span className="channel-stat-value">{channel ? fmt(channel.views) : '—'}</span>
              <span className="channel-stat-label">TOTAL VIEWS</span>
            </div>
            <div className="channel-stat-divider">|</div>
            <div className="channel-stat-block">
              <span className="channel-stat-value">{channel ? fmt(channel.videoCount) : '—'}</span>
              <span className="channel-stat-label">VIDEOS</span>
            </div>
          </div>
        )}

        {/* Individual creator stats */}
        {activeCreator !== 'All' && creatorStats && (
          <div className="channel-overview">
            <div className="channel-stat-block">
              <span className="channel-stat-value">{fmt(creatorStats.views)}</span>
              <span className="channel-stat-label">TOTAL VIEWS</span>
            </div>
            <div className="channel-stat-divider">|</div>
            <div className="channel-stat-block">
              <span className="channel-stat-value">{fmt(creatorStats.likes)}</span>
              <span className="channel-stat-label">TOTAL LIKES</span>
            </div>
            <div className="channel-stat-divider">|</div>
            <div className="channel-stat-block">
              <span className="channel-stat-value">{creatorStats.videos}</span>
              <span className="channel-stat-label">VIDEOS</span>
            </div>
            <div className="channel-stat-divider">|</div>
            <div className="channel-stat-block">
              <span className="channel-stat-value">{creatorStats.shorts}</span>
              <span className="channel-stat-label">SHORTS</span>
            </div>
          </div>
        )}

        {activeCreator !== 'All' && !creatorStats && !loading && (
          <p className="stats-empty">
            No videos assigned to {activeCreator} yet. Use the PAB / OPHER buttons on videos below.
          </p>
        )}
      </div>

      {/* ── Uploaded videos grid ─────────────────────────── */}
      <div className="stats-section">
        <div className="stats-section-header">
          <h2 className="stats-heading">
            UPLOADED VIDEOS
            {sortedUploads.length > 0 && (
              <span className="stats-count"> [{sortedUploads.length}]</span>
            )}
          </h2>
          <div className="stats-sort-btns">
            <button
              className={`stats-sort-btn${uploadSort === 'date' ? ' active' : ''}`}
              onClick={() => setUploadSort('date')}
            >
              RECENT
            </button>
            <button
              className={`stats-sort-btn${uploadSort === 'views' ? ' active' : ''}`}
              onClick={() => setUploadSort('views')}
            >
              TOP VIEWS
            </button>
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="uploads-type-tabs">
          <button
            className={`type-tab${typeFilter === 'all' ? ' active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            ALL
          </button>
          <button
            className={`type-tab${typeFilter === 'videos' ? ' active' : ''}`}
            onClick={() => setTypeFilter('videos')}
          >
            VIDEOS {totalVideos > 0 && `(${totalVideos})`}
          </button>
          <button
            className={`type-tab${typeFilter === 'shorts' ? ' active' : ''}`}
            onClick={() => setTypeFilter('shorts')}
          >
            SHORTS {totalShorts > 0 && `(${totalShorts})`}
          </button>
        </div>

        {loading && sortedUploads.length === 0 && (
          <p className="stats-empty">LOADING VIDEOS...</p>
        )}

        {!loading && sortedUploads.length === 0 && (
          <p className="stats-empty">
            {activeCreator !== 'All'
              ? `No ${typeFilter === 'all' ? '' : typeFilter + ' '}videos assigned to ${activeCreator}.`
              : `No ${typeFilter === 'all' ? '' : typeFilter + ' '}videos found.`}
          </p>
        )}

        {sortedUploads.length > 0 && (
          <div className="uploads-grid">
            {sortedUploads.map((v) => (
              <VideoCard
                key={v.id}
                v={v}
                assignment={assignments[v.id]}
                onAssign={(creator) => setVideoCreator(v.id, creator)}
                onClear={() => clearVideoCreator(v.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pipeline video performance ────────────────────── */}
      {rows.length > 0 && (
        <div className="stats-section">
          <div className="stats-section-header">
            <h2 className="stats-heading">PIPELINE PERFORMANCE</h2>
            {activeCreator !== 'All' && (
              <span className={`stats-filter-badge creator-tag-${activeCreator.toLowerCase()}`}>
                {activeCreator.toUpperCase()} ONLY
              </span>
            )}
          </div>

          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>TITLE</th>
                  <th>CREATOR</th>
                  <th className="stat-col">VIEWS</th>
                  <th className="stat-col">LIKES</th>
                  <th className="stat-col">CMTS</th>
                  <th className="stat-col">LINK</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ video, ytId, stats }) => (
                  <tr key={video.id}>
                    <td className="stats-title-cell">{video.title}</td>
                    <td>
                      <span className={`creator-tag creator-tag-${video.creator.toLowerCase()}`}>
                        {video.creator.toUpperCase()}
                      </span>
                    </td>
                    <td className="stat-col stat-value">
                      {stats ? fmt(stats.views) : (loading ? '...' : '—')}
                    </td>
                    <td className="stat-col stat-value">
                      {stats ? fmt(stats.likes) : (loading ? '...' : '—')}
                    </td>
                    <td className="stat-col stat-value">
                      {stats ? fmt(stats.comments) : (loading ? '...' : '—')}
                    </td>
                    <td className="stat-col">
                      {ytId && (
                        <a className="stats-watch-link" href={video.liveUrl} target="_blank" rel="noreferrer">
                          [WATCH]
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}
