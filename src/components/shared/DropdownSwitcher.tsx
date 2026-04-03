import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { ChevronDown, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'

interface DropdownItem {
  id: string
  name: string
  icon?: ReactNode
  section?: string
}

interface DropdownSection {
  key: string
  label: string
}

interface DropdownSwitcherProps {
  currentId: string
  items: DropdownItem[]
  sections?: DropdownSection[]
  onSelect: (id: string) => void
  overviewHref: string
  overviewLabel: string
}

function DropdownSwitcher({
  currentId,
  items,
  sections,
  onSelect,
  overviewHref,
  overviewLabel,
}: DropdownSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentItem = items.find((item) => item.id === currentId)

  const close = useCallback(() => setIsOpen(false), [])

  // Click-outside dismiss
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close])

  // Escape key dismiss
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  function handleSelect(id: string) {
    onSelect(id)
    close()
  }

  function renderItems() {
    if (sections && sections.length > 0) {
      return sections.map((section, sectionIndex) => {
        const sectionItems = items.filter((item) => item.section === section.key)
        if (sectionItems.length === 0) return null

        return (
          <div key={section.key}>
            {sectionIndex > 0 && (
              <div className="border-t border-base-100 dark:border-base-700 my-1" />
            )}
            <div className="px-3 py-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-base-300 dark:text-base-500">
                {section.label}
              </span>
            </div>
            {sectionItems.map((item) => renderItem(item))}
          </div>
        )
      })
    }

    return items.map((item) => renderItem(item))
  }

  function renderItem(item: DropdownItem) {
    const isActive = item.id === currentId

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        className={[
          'w-full flex items-center gap-2.5 px-3 py-2 text-left',
          isActive
            ? 'bg-accent-50/50 dark:bg-accent-900/20 border-l-2 border-accent-600 dark:border-accent-400'
            : 'hover:bg-base-50 dark:hover:bg-base-700 border-l-2 border-transparent',
        ].join(' ')}
      >
        {item.icon && (
          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center">
            {item.icon}
          </div>
        )}
        <span
          className={[
            'truncate',
            isActive
              ? 'text-sm font-medium text-base-900 dark:text-white'
              : 'text-sm text-base-700 dark:text-base-300',
          ].join(' ')}
        >
          {item.name}
        </span>
      </button>
    )
  }

  const dropdownContent = (
    <>
      <Link
        to={overviewHref}
        onClick={close}
        className="flex items-center gap-2 px-3 py-2 text-sm text-base-500 dark:text-base-400 hover:bg-base-50 dark:hover:bg-base-700"
      >
        <LayoutGrid className="w-4 h-4" aria-hidden="true" />
        {overviewLabel}
      </Link>

      <div className="border-t border-base-100 dark:border-base-700 my-1" />

      {renderItems()}
    </>
  )

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 text-base font-semibold text-base-900 dark:text-white hover:text-accent-700 dark:hover:text-accent-400 transition-colors duration-150"
      >
        {currentItem?.name ?? 'Select...'}
        <ChevronDown
          className="w-4 h-4 text-base-400 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          {/* Desktop dropdown */}
          <div className="absolute top-full left-0 mt-1 z-30 w-64 sm:w-72 bg-white dark:bg-base-800 rounded-xl shadow-lg border border-base-150 dark:border-base-700 py-1 max-h-80 overflow-y-auto hidden sm:block">
            {dropdownContent}
          </div>

          {/* Mobile dropdown */}
          <div
            className="sm:hidden fixed inset-x-0 top-0 z-30 bg-white dark:bg-base-800 shadow-lg border-b border-base-150 dark:border-base-700 overflow-y-auto"
            style={{ maxHeight: '70vh' }}
          >
            <div className="py-2">{dropdownContent}</div>
          </div>
        </>
      )}
    </div>
  )
}

export { DropdownSwitcher }
export type { DropdownSwitcherProps, DropdownItem, DropdownSection }
