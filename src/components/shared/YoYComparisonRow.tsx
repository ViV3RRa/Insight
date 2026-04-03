import { ArrowLeftRight } from 'lucide-react'
import { ChangeIndicator } from './ChangeIndicator'

interface Metric {
  label: string
  currentValue: string
  previousValue: string
  changePercent: number
  invertColor?: boolean
}

interface YoYComparisonRowProps {
  periodLabel: string
  metrics: Metric[]
}

export function YoYComparisonRow({ periodLabel, metrics }: YoYComparisonRowProps) {
  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ArrowLeftRight className="w-4 h-4 text-base-400" />
        <span className="text-xs text-base-400 font-medium">{periodLabel}</span>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-[10px] font-medium uppercase tracking-wider text-base-400 mb-1">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-data text-lg font-medium text-base-900 dark:text-white">
                {metric.currentValue}
              </span>
              <span className="font-mono-data text-xs text-base-300">
                vs {metric.previousValue}
              </span>
            </div>
            <ChangeIndicator
              value={metric.changePercent}
              invertColor={metric.invertColor}
            />
          </div>
        ))}
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden space-y-0">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`flex items-center justify-between py-3 ${
              index > 0
                ? 'border-t border-base-100 dark:border-base-700'
                : ''
            }`}
          >
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-base-400 mb-1">
                {metric.label}
              </p>
              <span className="font-mono-data text-lg font-medium text-base-900 dark:text-white">
                {metric.currentValue}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono-data text-xs text-base-300">
                vs {metric.previousValue}
              </span>
              <div className="mt-0.5">
                <ChangeIndicator
                  value={metric.changePercent}
                  invertColor={metric.invertColor}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
