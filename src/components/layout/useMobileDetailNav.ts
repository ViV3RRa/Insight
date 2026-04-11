import { useEffect, useRef } from 'react'
import { useMobileNav, type MobileNavContent } from './MobileNavContext'

/**
 * Hook for detail pages to inject their header into the mobile nav bar.
 * Content is automatically cleared when the component unmounts.
 * Uses a ref to avoid infinite re-render loops from ReactNode dependencies.
 *
 * @param content The mobile nav content, or null to clear.
 * @param dropdownKey Optional string that changes when dropdown content changes,
 *   forcing re-registration even if name/subtitle haven't changed.
 */
export function useMobileDetailNav(content: MobileNavContent | null, dropdownKey?: string) {
  const { setContent } = useMobileNav()
  const contentRef = useRef(content)
  contentRef.current = content

  // Track primitive keys to detect meaningful changes
  const key = content
    ? `${content.backTo}|${content.name}|${content.subtitle}|${dropdownKey ?? ''}`
    : null

  useEffect(() => {
    setContent(contentRef.current)
    return () => setContent(null)
  }, [key, setContent])
}
