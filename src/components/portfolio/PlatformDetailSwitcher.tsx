import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, LayoutGrid, Pencil } from 'lucide-react'
import { PlatformIcon } from '@/components/shared/PlatformIcon'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { formatNumber, formatSignedNumber } from '@/utils/formatters'

export interface PlatformSwitcherItem {
  id: string
  name: string
  iconUrl?: string
  type: 'investment' | 'cash' | 'closed'
  currency: string
  currentValue: number
  returnPercent?: number
  staleness?: 'warning' | 'critical'
}

export interface PlatformDetailSwitcherProps {
  currentPlatformId: string
  currentPlatformName: string
  platforms: PlatformSwitcherItem[]
  totalPortfolioValue?: number
  onSelect: (platformId: string) => void
  onOverviewClick: () => void
  onEditPlatform?: () => void
}

const SECTIONS = [
  { key: 'investment', label: 'Active Platforms' },
  { key: 'cash', label: 'Cash Accounts' },
  { key: 'closed', label: 'Closed' },
] as const

export function PlatformDetailSwitcher({
  currentPlatformId,
  currentPlatformName,
  platforms,
  totalPortfolioValue,
  onSelect,
  onOverviewClick,
  onEditPlatform,
}: PlatformDetailSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setIsOpen(false), [])

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

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  function handleSelect(id: string) {
    if (id !== currentPlatformId) {
      onSelect(id)
    }
    close()
  }

  function handleOverviewClick() {
    onOverviewClick()
    close()
  }

  function handleEditPlatform() {
    onEditPlatform?.()
    close()
  }

  function renderItem(item: PlatformSwitcherItem) {
    const isActive = item.id === currentPlatformId
    const isClosed = item.type === 'closed'
    const showCurrencySuffix = item.currency !== 'DKK'

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        data-testid={`platform-item-${item.id}`}
        className={[
          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
          isActive
            ? 'bg-accent-50/50 dark:bg-accent-900/15 border-l-2 border-accent-600 dark:border-accent-400'
            : 'hover:bg-base-50 dark:hover:bg-base-700 border-l-2 border-transparent',
          isClosed && !isActive && 'opacity-50',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <PlatformIcon name={item.name} imageUrl={item.iconUrl} size="sm" />
        <div className="flex-1 min-w-0">
          <div
            className={[
              'text-sm truncate',
              isActive ? 'font-medium' : '',
              isClosed
                ? 'text-base-400 dark:text-base-500'
                : 'text-base-900 dark:text-white',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.name}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-base-400">{item.currency}</span>
            {item.staleness && (
              <StalenessIndicator severity={item.staleness} size="sm" />
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono-data text-sm">
            {formatNumber(item.currentValue, 0)}
            {showCurrencySuffix && (
              <span className="text-xs text-base-300 dark:text-base-500 ml-1">
                {item.currency}
              </span>
            )}
          </div>
          {item.type === 'investment' && item.returnPercent != null && (
            <div
              className={[
                'font-mono-data text-xs',
                item.returnPercent >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-500 dark:text-rose-400',
              ].join(' ')}
            >
              {formatSignedNumber(item.returnPercent, 1)}%
            </div>
          )}
        </div>
      </button>
    )
  }

  function renderSections() {
    return SECTIONS.map((section) => {
      const sectionItems = platforms.filter((p) => p.type === section.key)
      if (sectionItems.length === 0) return null

      return (
        <div key={section.key}>
          <div className="px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-base-400 dark:text-base-500">
              {section.label}
            </span>
          </div>
          {sectionItems.map(renderItem)}
        </div>
      )
    })
  }

  const dropdownContent = (
    <>
      <button
        type="button"
        onClick={handleOverviewClick}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-50 dark:hover:bg-base-700 transition-colors border-b border-base-100 dark:border-base-700"
      >
        <LayoutGrid className="w-4 h-4 text-base-400" aria-hidden="true" />
        <span className="font-medium text-base-700 dark:text-base-300">
          Portfolio Overview
        </span>
        {totalPortfolioValue != null && (
          <span className="ml-auto font-mono-data text-xs text-base-400">
            {formatNumber(totalPortfolioValue, 0)} DKK
          </span>
        )}
      </button>

      <div className="py-1">{renderSections()}</div>

      {onEditPlatform && (
        <div className="border-t border-base-100 dark:border-base-700 mt-1 pt-1">
          <button
            type="button"
            onClick={handleEditPlatform}
            className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300 hover:bg-base-50 dark:hover:bg-base-700/50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            Edit Platform
          </button>
        </div>
      )}
    </>
  )

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 text-base font-semibold text-base-900 dark:text-white hover:text-accent-700 dark:hover:text-accent-400 transition-colors duration-150"
      >
        {currentPlatformName}
        <ChevronDown
          className="w-4 h-4 text-base-400 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          {/* Desktop dropdown */}
          <div className="absolute top-full left-0 mt-1.5 z-30 w-80 bg-white dark:bg-base-800 rounded-xl shadow-lg border border-base-200 dark:border-base-600 overflow-hidden max-h-96 overflow-y-auto hidden sm:block">
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
