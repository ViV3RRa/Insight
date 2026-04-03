import { useCallback, useEffect, useRef, useState } from 'react'
import { TIME_SPAN_OPTIONS, type TimeSpan } from '@/utils/timeSpan'

interface TimeSpanSelectorProps {
  value: TimeSpan
  onChange: (span: TimeSpan) => void
}

function TimeSpanSelector({ value, onChange }: TimeSpanSelectorProps) {
  const [isNarrow, setIsNarrow] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(() =>
    TIME_SPAN_OPTIONS.findIndex((o) => o.value === value),
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 409px)')
    setIsNarrow(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    setFocusIndex(TIME_SPAN_OPTIONS.findIndex((o) => o.value === value))
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = focusIndex
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        newIndex = (focusIndex + 1) % TIME_SPAN_OPTIONS.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        newIndex = (focusIndex - 1 + TIME_SPAN_OPTIONS.length) % TIME_SPAN_OPTIONS.length
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(TIME_SPAN_OPTIONS[focusIndex]!.value)
        return
      } else {
        return
      }
      setFocusIndex(newIndex)
    },
    [focusIndex, onChange],
  )

  // Focus the pill when focusIndex changes via keyboard
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const buttons = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons[focusIndex]?.focus()
  }, [focusIndex])

  if (isNarrow) {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TimeSpan)}
          aria-label="Time span"
          className="w-full px-3 py-2 text-xs font-medium bg-base-100 dark:bg-base-700 text-base-900 dark:text-white border-none rounded-lg appearance-none"
        >
          {TIME_SPAN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Time span"
      className="inline-flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5"
      onKeyDown={handleKeyDown}
    >
      {TIME_SPAN_OPTIONS.map((option, index) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={
              isActive
                ? 'px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-white shadow-sm transition-all duration-150'
                : 'px-2.5 py-1 text-xs font-medium rounded-md text-base-400 dark:text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors duration-150'
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { TimeSpanSelector }
