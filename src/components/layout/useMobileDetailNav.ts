import { useEffect, useRef } from 'react'
import { useMobileNav, type MobileNavContent } from './MobileNavContext'

/**
 * Hook for detail pages to inject their header into the mobile nav bar.
 * Content is automatically cleared when the component unmounts.
 * Uses a ref to avoid infinite re-render loops from ReactNode dependencies.
 */
export function useMobileDetailNav(content: MobileNavContent | null) {
  const { setContent } = useMobileNav()
  const contentRef = useRef(content)
  contentRef.current = content

  // Track primitive keys to detect meaningful changes
  const key = content
    ? `${content.backTo}|${content.name}|${content.subtitle}`
    : null

  useEffect(() => {
    setContent(contentRef.current)
    return () => setContent(null)
  }, [key, setContent])
}
