import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface MobileNavContent {
  /** Back navigation URL (omit for overview pages) */
  backTo?: string
  /** Icon element to display (omit for overview pages) */
  icon?: ReactNode
  /** Primary name text */
  name: string
  /** Subtitle text (e.g., "kWh · Updated Dec 15") */
  subtitle: string
  /** Dropdown content to render when name is clicked (omit for overview pages) */
  dropdown?: ReactNode
  /** Optional badge element (e.g., StalenessIndicator) */
  badge?: ReactNode
}

interface MobileNavContextValue {
  content: MobileNavContent | null
  setContent: (content: MobileNavContent | null) => void
}

const MobileNavContext = createContext<MobileNavContextValue>({
  content: null,
  setContent: () => {},
})

function MobileNavProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<MobileNavContent | null>(null)

  const setContent = useCallback((c: MobileNavContent | null) => {
    setContentState(c)
  }, [])

  return (
    <MobileNavContext.Provider value={{ content, setContent }}>
      {children}
    </MobileNavContext.Provider>
  )
}

function useMobileNav() {
  return useContext(MobileNavContext)
}

export { MobileNavProvider, useMobileNav }
export type { MobileNavContent }
