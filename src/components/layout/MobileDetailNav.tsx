import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, X } from 'lucide-react'
import { useMobileNav } from './MobileNavContext'
import { useDragToDismiss } from '@/hooks/useDragToDismiss'

/**
 * Renders the mobile detail page header inside the nav bar.
 * Shows back button, icon, name with dropdown, subtitle, and optional badge.
 * Only visible on mobile (lg:hidden) and only when a detail page has registered content.
 *
 * The dropdown renders as an animated "top drawer" — slides down from the top
 * with the same animation pattern as MobileDrawer (bottom drawers).
 */
export function MobileDetailNav() {
  const { content } = useMobileNav()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setDropdownOpen(false), [])

  // Escape key dismiss
  useEffect(() => {
    if (!dropdownOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dropdownOpen, close])

  useDragToDismiss({
    direction: 'up',
    onDismiss: close,
    panelRef,
    handleRef,
    isOpen: dropdownOpen,
  })

  if (!content) return null

  // Overview mode: simple title + subtitle (no back button, icon, or dropdown)
  const isOverview = !content.backTo && !content.dropdown

  if (isOverview) {
    return (
      <div className="flex lg:hidden items-center gap-2.5">
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-tight">{content.name}</div>
          <div className="text-[11px] text-base-400 mt-0.5">{content.subtitle}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex lg:hidden items-center justify-between gap-2">
        {/* Left: back + icon + name */}
        <div className="flex items-center gap-2.5 min-w-0">
          {content.backTo && (
            <button
              onClick={() => navigate(content.backTo!)}
              className="w-9 h-9 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {content.icon && (
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              {content.icon}
            </div>
          )}

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 min-w-0"
          >
            <div className="min-w-0 text-left">
              <div className="text-sm font-bold tracking-tight truncate">{content.name}</div>
              <div className="text-[11px] text-base-400 mt-0.5">{content.subtitle}</div>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 text-base-300 shrink-0 transition-transform duration-200"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>

        {/* Right: badge */}
        {content.badge && (
          <div className="shrink-0">
            {content.badge}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Animated top drawer */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 top-0 z-50 bg-white dark:bg-base-800 rounded-b-2xl shadow-xl lg:hidden transform transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto"
        style={{ transform: dropdownOpen ? 'translateY(0)' : 'translateY(-100%)' }}
        role="dialog"
        aria-modal={dropdownOpen}
        aria-label={`${content.name} switcher`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-100 dark:border-base-700">
          <div className="flex items-center gap-2.5 min-w-0">
            {content.icon && (
              <div className="flex items-center gap-2 shrink-0">
                {content.icon}
              </div>
            )}
            <div className="text-sm font-bold tracking-tight">{content.name}</div>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-300"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dropdown content provided by the detail page */}
        <div onClick={close}>
          {content.dropdown}
        </div>

        {/* Drag handle (bottom of top-drawer) */}
        <div
          ref={handleRef}
          className="flex justify-center py-2 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-10 h-1 rounded-full bg-base-200 dark:bg-base-600" />
        </div>
      </div>
    </>
  )
}
