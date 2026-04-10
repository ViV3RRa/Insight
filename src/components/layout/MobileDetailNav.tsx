import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useMobileNav } from './MobileNavContext'

/**
 * Renders the mobile detail page header inside the nav bar.
 * Shows back button, icon, name with dropdown, subtitle, and optional badge.
 * Only visible on mobile (lg:hidden) and only when a detail page has registered content.
 */
export function MobileDetailNav() {
  const { content } = useMobileNav()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  if (!content) return null

  return (
    <div className="flex lg:hidden items-center justify-between gap-2">
      {/* Left: back + icon + name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={() => navigate(content.backTo)}
          className="w-9 h-9 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {content.icon}
        </div>

        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 min-w-0"
        >
          <div className="min-w-0 text-left">
            <div className="text-sm font-bold tracking-tight truncate">{content.name}</div>
            <div className="text-[11px] text-base-400 mt-0.5">{content.subtitle}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-base-300 shrink-0" />
        </button>
      </div>

      {/* Right: badge */}
      {content.badge && (
        <div className="shrink-0">
          {content.badge}
        </div>
      )}

      {/* Full-screen dropdown overlay */}
      {dropdownOpen && (
        <div className="fixed inset-x-0 top-0 z-30 bg-white dark:bg-base-800 shadow-lg border-b border-base-100 dark:border-base-700 max-h-[80vh] overflow-y-auto">
          {/* Dropdown header with close */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-100 dark:border-base-700">
            <button
              onClick={() => { setDropdownOpen(false); navigate(content.backTo); }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="flex items-center gap-2 shrink-0">
                {content.icon}
              </div>
              <div className="text-sm font-bold tracking-tight">{content.name}</div>
            </button>
            <button
              onClick={() => setDropdownOpen(false)}
              className="p-1.5 rounded-lg text-base-400 hover:text-base-600"
              aria-label="Close"
            >
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Dropdown content provided by the detail page */}
          <div onClick={() => setDropdownOpen(false)}>
            {content.dropdown}
          </div>
        </div>
      )}
    </div>
  )
}
