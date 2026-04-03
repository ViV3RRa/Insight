import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface TabDef {
  label: string
  value: string
}

interface TabBarProps {
  tabs: TabDef[]
  activeTab: string
  onChange: (value: string) => void
  rightContent?: ReactNode
}

function TabBar({ tabs, activeTab, onChange, rightContent }: TabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusIndex, setFocusIndex] = useState(() =>
    tabs.findIndex((t) => t.value === activeTab),
  )

  useEffect(() => {
    setFocusIndex(tabs.findIndex((t) => t.value === activeTab))
  }, [activeTab, tabs])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = focusIndex
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        newIndex = (focusIndex + 1) % tabs.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        newIndex = (focusIndex - 1 + tabs.length) % tabs.length
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(tabs[focusIndex]!.value)
        return
      } else {
        return
      }
      setFocusIndex(newIndex)
    },
    [focusIndex, onChange, tabs],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const buttons = container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons[focusIndex]?.focus()
  }, [focusIndex])

  return (
    <div className="border-b border-base-150 dark:border-base-700">
      <div className="flex items-center justify-between">
        <div
          ref={containerRef}
          role="tablist"
          className="flex gap-0"
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab, index) => {
            const isActive = tab.value === activeTab
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => {
                  if (!isActive) onChange(tab.value)
                }}
                className={
                  isActive
                    ? 'tab-btn active relative px-4 py-2.5 text-sm font-medium text-accent-700 dark:text-accent-400 transition-colors duration-150'
                    : 'tab-btn relative px-4 py-2.5 text-sm font-medium text-base-400 dark:text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors duration-150'
                }
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {rightContent && (
          <div className="flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  )
}

export { TabBar }
