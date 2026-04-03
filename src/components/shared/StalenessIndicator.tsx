interface StalenessIndicatorProps {
  severity: 'warning' | 'critical'
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: {
    container: 'text-[10px] font-medium px-1.5 py-0.5 gap-1',
    dot: 'w-1 h-1',
  },
  md: {
    container: 'text-xs font-medium px-2 py-0.5 gap-1.5',
    dot: 'w-1.5 h-1.5',
  },
  lg: {
    container: 'text-sm font-semibold px-3.5 py-1 gap-2',
    dot: 'w-2 h-2',
  },
} as const

const severityClasses = {
  warning: {
    container:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
    dot: 'bg-amber-500',
  },
  critical: {
    container:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700',
    dot: 'bg-rose-500',
  },
} as const

export function StalenessIndicator({
  severity,
  size = 'md',
}: StalenessIndicatorProps) {
  const sizeStyle = sizeClasses[size]
  const severityStyle = severityClasses[severity]

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeStyle.container} ${severityStyle.container}`}
    >
      <span
        className={`rounded-full animate-pulse ${sizeStyle.dot} ${severityStyle.dot}`}
      />
      Stale
    </span>
  )
}
