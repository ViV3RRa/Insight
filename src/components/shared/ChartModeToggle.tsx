import { useCallback, useEffect, useRef, useState } from 'react'

interface ChartModeOption {
  label: string
  value: string
}

interface ChartModeToggleProps {
  options: ChartModeOption[]
  value: string
  onChange: (value: string) => void
}

function ChartModeToggle({ options, value, onChange }: ChartModeToggleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(() =>
    options.findIndex((o) => o.value === value),
  )

  useEffect(() => {
    setFocusIndex(options.findIndex((o) => o.value === value))
  }, [value, options])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = focusIndex
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        newIndex = (focusIndex + 1) % options.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        newIndex = (focusIndex - 1 + options.length) % options.length
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(options[focusIndex]!.value)
        return
      } else {
        return
      }
      setFocusIndex(newIndex)
    },
    [focusIndex, onChange, options],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const buttons = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons[focusIndex]?.focus()
  }, [focusIndex])

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Chart mode"
      className="inline-flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5"
      onKeyDown={handleKeyDown}
    >
      {options.map((option, index) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            tabIndex={index === focusIndex ? 0 : -1}
            onClick={() => {
              if (!isActive) onChange(option.value)
            }}
            className={
              isActive
                ? 'px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-white shadow-sm transition-all duration-150'
                : 'px-3 py-1 text-xs font-medium rounded-md text-base-400 dark:text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors duration-150'
            }
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { ChartModeToggle }
