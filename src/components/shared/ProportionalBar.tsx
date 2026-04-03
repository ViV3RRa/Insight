import { formatNumber, formatPercent } from '@/utils/formatters'

interface ProportionalBarSegment {
  label: string
  value: number
  formattedValue?: string
  color: string
  isCash?: boolean
}

interface ProportionalBarProps {
  segments: ProportionalBarSegment[]
  showLegend?: boolean
}

function computeWidths(segments: ProportionalBarSegment[]): number[] {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total <= 0) return segments.map(() => 0)

  const MIN_WIDTH = 2
  const rawWidths = segments.map((s) => (s.value / total) * 100)

  // Find segments below minimum and those above
  const belowMin: number[] = []
  const aboveMin: number[] = []
  for (let i = 0; i < rawWidths.length; i++) {
    const w = rawWidths[i]!
    if (w > 0 && w < MIN_WIDTH) {
      belowMin.push(i)
    } else if (w >= MIN_WIDTH) {
      aboveMin.push(i)
    }
  }

  if (belowMin.length === 0) return rawWidths

  // Calculate deficit needed
  const deficit = belowMin.reduce(
    (sum, i) => sum + (MIN_WIDTH - rawWidths[i]!),
    0,
  )

  // Redistribute from larger segments proportionally
  const aboveTotal = aboveMin.reduce((sum, i) => sum + rawWidths[i]!, 0)
  const adjusted = [...rawWidths]
  for (const i of belowMin) {
    adjusted[i] = MIN_WIDTH
  }
  for (const i of aboveMin) {
    adjusted[i] = rawWidths[i]! - (rawWidths[i]! / aboveTotal) * deficit
  }

  return adjusted
}

export function ProportionalBar({
  segments,
  showLegend = true,
}: ProportionalBarProps) {
  if (segments.length === 0) return null

  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const widths = computeWidths(segments)

  return (
    <div>
      <div className="h-8 rounded-lg overflow-hidden flex">
        {segments.map((segment, index) => (
          <div
            key={segment.label}
            className="h-full transition-all duration-300"
            style={{
              width: `${widths[index]}%`,
              backgroundColor: segment.color,
              ...(segment.isCash
                ? {
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)',
                  }
                : {}),
            }}
          />
        ))}
      </div>

      {showLegend && (
        <div className="space-y-2.5 mt-5">
          {segments.map((segment) => {
            const percentage = total > 0 ? (segment.value / total) * 100 : 0

            return (
              <div
                key={segment.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span
                    className={`text-sm ${segment.isCash ? 'text-base-500 dark:text-base-400' : ''}`}
                  >
                    {segment.label}
                  </span>
                  {segment.isCash && (
                    <span className="text-xs text-base-300 dark:text-base-500 bg-base-100 dark:bg-base-700 px-1.5 py-0.5 rounded">
                      Cash
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-data text-sm">
                    {segment.formattedValue ?? formatNumber(segment.value)}
                  </span>
                  <span className="font-mono-data text-xs text-base-400 w-12 text-right">
                    {formatPercent(percentage, 1)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
