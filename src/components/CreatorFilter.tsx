import { useFilter } from '../context/FilterContext'
import type { FilterCreator } from '../context/FilterContext'

const OPTIONS: { value: FilterCreator; label: string }[] = [
  { value: 'All',   label: 'ALL'   },
  { value: 'Pab',   label: 'PAB'   },
  { value: 'Opher', label: 'OPHER' },
]

const ACTIVE_CLASS: Record<FilterCreator, string> = {
  'All':   'tgl-active-all',
  'Pab':   'tgl-active-pab',
  'Opher': 'tgl-active-opher',
}

export default function CreatorFilter() {
  const { activeCreator, setActiveCreator } = useFilter()

  return (
    <div className="creator-toggle">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          className={`creator-toggle-btn${activeCreator === value ? ` ${ACTIVE_CLASS[value]}` : ''}`}
          onClick={() => setActiveCreator(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
