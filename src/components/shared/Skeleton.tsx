interface SkeletonProps {
  width?: string
  height?: string
  className?: string
}

function Skeleton({ width = 'w-24', height = 'h-4', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${height} ${width} rounded ${className}`.trim()}
      aria-hidden="true"
    />
  )
}

interface SkeletonKpiCardProps {
  count?: number
}

function SkeletonKpiCard({ count = 1 }: SkeletonKpiCardProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark"
          aria-hidden="true"
        >
          <div className="skeleton h-3 w-20 rounded mb-2" />
          <div className="skeleton h-6 w-32 rounded mb-1" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </>
  )
}

function SkeletonChart() {
  return (
    <div
      className="bg-white dark:bg-base-800 rounded-2xl p-4 sm:p-6 shadow-card dark:shadow-card-dark"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-7 w-14 rounded-lg" />
          <div className="skeleton h-7 w-12 rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-7 w-64 rounded-lg mb-4" />
      <div className="skeleton h-48 sm:h-64 w-full rounded-lg" />
    </div>
  )
}

interface SkeletonTableRowsProps {
  count?: number
}

const rowWidths = [
  ['w-24', 'w-16', 'w-20'],
  ['w-20', 'w-14', 'w-24'],
  ['w-28', 'w-12', 'w-16'],
] as const

function SkeletonTableRows({ count = 3 }: SkeletonTableRowsProps) {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-base-200 dark:border-base-700">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-12 rounded ml-auto" />
      </div>
      {Array.from({ length: count }, (_, i) => {
        const widths = rowWidths[i % rowWidths.length]!
        return (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-base-100 dark:border-base-700/50"
          >
            <div className={`skeleton h-4 ${widths[0]} rounded`} />
            <div className={`skeleton h-4 ${widths[1]} rounded`} />
            <div className={`skeleton h-4 ${widths[2]} rounded ml-auto`} />
          </div>
        )
      })}
    </div>
  )
}

export { Skeleton, SkeletonKpiCard, SkeletonChart, SkeletonTableRows }
export type { SkeletonProps, SkeletonKpiCardProps, SkeletonTableRowsProps }
