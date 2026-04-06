import { useState, type ReactNode } from 'react'
import { TimeSpanSelector } from './TimeSpanSelector'
import { YoYToggle } from './YoYToggle'
import { ChartModeToggle } from './ChartModeToggle'
import type { TimeSpan } from '@/utils/timeSpan'

interface ChartModeOption {
  label: string
  value: string
}

interface ChartCardProps {
  title: string
  children: ReactNode
  modes?: ChartModeOption[]
  activeMode?: string
  onModeChange?: (mode: string) => void
  timeSpan?: TimeSpan
  onTimeSpanChange?: (span: TimeSpan) => void
  yoyActive?: boolean
  onYoYChange?: (active: boolean) => void
  hideYoY?: boolean
  hideTimeSpan?: boolean
}

function ChartCard({
  title,
  children,
  modes,
  activeMode,
  onModeChange,
  timeSpan: controlledTimeSpan,
  onTimeSpanChange,
  yoyActive: controlledYoY,
  onYoYChange,
  hideYoY = false,
  hideTimeSpan = false,
}: ChartCardProps) {
  const [internalTimeSpan, setInternalTimeSpan] = useState<TimeSpan>('YTD')
  const [internalYoY, setInternalYoY] = useState(false)

  const timeSpan = controlledTimeSpan ?? internalTimeSpan
  const yoyActive = controlledYoY ?? internalYoY

  const handleTimeSpanChange = (span: TimeSpan) => {
    if (onTimeSpanChange) {
      onTimeSpanChange(span)
    } else {
      setInternalTimeSpan(span)
    }
  }

  const handleYoYChange = (active: boolean) => {
    if (onYoYChange) {
      onYoYChange(active)
    } else {
      setInternalYoY(active)
    }
  }

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 sm:p-6">
      {/* Row 1: Title + controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-base-900 dark:text-white">
          {title}
        </h3>

        <div className="flex items-center gap-2">
          {modes && activeMode != null && onModeChange && (
            <ChartModeToggle
              options={modes}
              value={activeMode}
              onChange={onModeChange}
            />
          )}

          {!hideYoY && (
            <YoYToggle active={yoyActive} onChange={handleYoYChange} />
          )}
        </div>
      </div>

      {/* Row 2: Time span selector */}
      {!hideTimeSpan && (
        <div className="mb-4">
          <TimeSpanSelector
            value={timeSpan}
            onChange={handleTimeSpanChange}
          />
        </div>
      )}

      {/* Row 3: Chart content area */}
      <div className="w-full" role="img" aria-label={`${title} chart`}>
        {children}
      </div>
    </div>
  )
}

export { ChartCard }
