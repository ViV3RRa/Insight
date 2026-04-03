import { formatPercent } from '@/utils/formatters'

interface ChangeIndicatorProps {
  value: number
  formattedValue?: string
  invertColor?: boolean
  suffix?: string
}

function UpArrow() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9V3M6 3L3 6M6 3L9 6" />
    </svg>
  )
}

function DownArrow() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3V9M6 9L3 6M6 9L9 6" />
    </svg>
  )
}

export function ChangeIndicator({
  value,
  formattedValue,
  invertColor = false,
  suffix = '',
}: ChangeIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isZero = value === 0

  let colorClass: string
  if (isZero) {
    colorClass = 'text-base-400'
  } else if (isPositive) {
    colorClass = invertColor
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-emerald-600 dark:text-emerald-400'
  } else {
    colorClass = invertColor
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400'
  }

  const displayValue =
    formattedValue ??
    (() => {
      const formatted = formatPercent(Math.abs(value))
      const sign = isPositive ? '+' : isNegative ? '-' : ''
      return `${sign}${formatted}${suffix}`
    })()

  return (
    <span className={`inline-flex items-center gap-0.5 ${colorClass}`}>
      {isPositive && <UpArrow />}
      {isNegative && <DownArrow />}
      <span className="font-mono-data text-xs font-medium">{displayValue}</span>
    </span>
  )
}
