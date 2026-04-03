import { useState, type ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  icon?: LucideIcon
  count?: number
  defaultExpanded?: boolean
  expanded?: boolean
  onToggle?: (expanded: boolean) => void
}

function CollapsibleSection({
  title,
  children,
  icon: Icon,
  count,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onToggle,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  function handleToggle() {
    const next = !isExpanded
    if (isControlled) {
      onToggle?.(next)
    } else {
      setInternalExpanded(next)
      onToggle?.(next)
    }
  }

  return (
    <div className="border border-base-150 dark:border-base-700 rounded-2xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 text-left bg-white dark:bg-base-800 hover:bg-base-50 dark:hover:bg-base-750 transition-colors duration-150"
        aria-expanded={isExpanded}
        onClick={handleToggle}
      >
        {Icon && <Icon className="w-4 h-4 text-base-400 flex-shrink-0" />}
        <span className="text-sm font-semibold text-base-900 dark:text-white flex-1">
          {title}
        </span>
        {count !== undefined && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
            {count}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-base-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      {isExpanded && (
        <div className="bg-white dark:bg-base-800">
          {children}
        </div>
      )}
    </div>
  )
}

export { CollapsibleSection }
