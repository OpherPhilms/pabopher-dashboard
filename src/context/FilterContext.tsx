import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { Creator } from '../types/video'

export type FilterCreator = Creator | 'All'

interface FilterContextValue {
  activeCreator:    FilterCreator
  setActiveCreator: (c: FilterCreator) => void
}

const FilterContext = createContext<FilterContextValue>({
  activeCreator:    'All',
  setActiveCreator: () => {},
})

export function FilterProvider({ children }: { children: ReactNode }) {
  const [activeCreator, setActiveCreator] = useState<FilterCreator>('All')

  return (
    <FilterContext.Provider value={{ activeCreator, setActiveCreator }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilter() {
  return useContext(FilterContext)
}
