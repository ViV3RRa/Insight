import { PieChart } from 'lucide-react'
import { ProportionalBar } from '@/components/shared/ProportionalBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/shared/Skeleton'

interface AllocationSegment {
  label: string
  value: number
  formattedValue: string
  color: string
  isCash: boolean
}

interface PortfolioOverviewAllocationProps {
  segments: AllocationSegment[]
  isLoading?: boolean
}

function AllocationSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton width="w-full" height="h-8" className="rounded-lg mb-5" />
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width="w-2.5" height="h-2.5" className="rounded-sm" />
            <Skeleton width="w-24" height="h-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width="w-20" height="h-4" />
            <Skeleton width="w-12" height="h-3" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width="w-2.5" height="h-2.5" className="rounded-sm" />
            <Skeleton width="w-20" height="h-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width="w-16" height="h-4" />
            <Skeleton width="w-12" height="h-3" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton width="w-2.5" height="h-2.5" className="rounded-sm" />
            <Skeleton width="w-28" height="h-4" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton width="w-20" height="h-4" />
            <Skeleton width="w-12" height="h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PortfolioOverviewAllocation({
  segments,
  isLoading = false,
}: PortfolioOverviewAllocationProps) {
  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5">
        <h2 className="text-sm font-semibold text-base-900 dark:text-white">
          Portfolio Allocation
        </h2>
      </div>
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <AllocationSkeleton />
        ) : segments.length === 0 ? (
          <EmptyState
            variant="section"
            icon={PieChart}
            description="No allocation data available"
          />
        ) : (
          <ProportionalBar segments={segments} />
        )}
      </div>
    </div>
  )
}

export { PortfolioOverviewAllocation }
export type { PortfolioOverviewAllocationProps, AllocationSegment }
