import { PLATFORMS, STAGES } from '../../types/video'
import type { Platform, Stage } from '../../types/video'

interface Props {
  search:     string
  platform:   Platform | ''
  stage:      Stage | ''
  onSearch:   (v: string) => void
  onPlatform: (v: Platform | '') => void
  onStage:    (v: Stage | '') => void
}

export default function PipelineFilters({
  search, platform, stage,
  onSearch, onPlatform, onStage,
}: Props) {
  const hasFilters = search !== '' || platform !== '' || stage !== ''

  function clearAll() {
    onSearch('')
    onPlatform('')
    onStage('')
  }

  return (
    <div className="pipeline-filters">
      <input
        className="filter-search"
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="SEARCH TITLES..."
        spellCheck={false}
      />

      <select
        className="filter-select"
        value={platform}
        onChange={(e) => onPlatform(e.target.value as Platform | '')}
      >
        <option value="">ALL PLATFORMS</option>
        {PLATFORMS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        className="filter-select"
        value={stage}
        onChange={(e) => onStage(e.target.value as Stage | '')}
      >
        <option value="">ALL STAGES</option>
        {STAGES.map((s) => (
          <option key={s} value={s}>{s.toUpperCase()}</option>
        ))}
      </select>

      {hasFilters && (
        <button className="filter-clear-btn" onClick={clearAll}>
          CLEAR [X]
        </button>
      )}
    </div>
  )
}
