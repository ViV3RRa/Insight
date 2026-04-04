import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'
import { PortfolioSwitcher } from './PortfolioSwitcher'
import { PortfolioOverviewSummary } from './PortfolioOverviewSummary'
import type { PortfolioOverviewSummaryProps } from './PortfolioOverviewSummary'
import { PortfolioOverviewYoY } from './PortfolioOverviewYoY'
import type { PortfolioOverviewYoYProps } from './PortfolioOverviewYoY'
import { PortfolioOverviewPerformanceAccordion } from './PortfolioOverviewPerformanceAccordion'
import { PortfolioOverviewValueCharts } from './PortfolioOverviewValueCharts'
import type {
  CompositeDataPoint,
  PlatformSeries,
  MonthlyPerformancePoint,
} from './PortfolioOverviewValueCharts'
import { PortfolioOverviewPerfYearly } from './PortfolioOverviewPerfYearly'
import type { YearlyData } from './PortfolioOverviewPerfYearly'
import { PortfolioOverviewPerfMonthly } from './PortfolioOverviewPerfMonthly'
import type { MonthlyData } from './PortfolioOverviewPerfMonthly'
import { PortfolioOverviewPlatformsTable } from './PortfolioOverviewPlatformsTable'
import type { PlatformRow } from './PortfolioOverviewPlatformsTable'
import { PortfolioOverviewCashTable } from './PortfolioOverviewCashTable'
import type { CashPlatformRow } from './PortfolioOverviewCashTable'
import { PortfolioOverviewClosed } from './PortfolioOverviewClosed'
import type { ClosedPlatformRow } from './PortfolioOverviewClosed'
import { PortfolioOverviewAllocation } from './PortfolioOverviewAllocation'
import type { AllocationSegment } from './PortfolioOverviewAllocation'
import { Button } from '@/components/shared/Button'

interface PortfolioOverviewProps {
  summaryData: Omit<PortfolioOverviewSummaryProps, 'isLoading'>
  yoyData: Omit<PortfolioOverviewYoYProps, 'isLoading'>
  chartsData: {
    compositeData: CompositeDataPoint[]
    platforms: PlatformSeries[]
    monthlyPerformance: MonthlyPerformancePoint[]
    yoyMonthlyPerformance?: MonthlyPerformancePoint[]
  }
  yearlyData: {
    yearlyData: YearlyData[]
    totals: {
      startingValue: number
      endingValue: number
      netDeposits: number
      earnings: number
      earningsPercent: number
      xirr: number | null
    }
  }
  monthlyTableData: MonthlyData[]
  investmentPlatforms: PlatformRow[]
  cashPlatforms: CashPlatformRow[]
  closedPlatforms: ClosedPlatformRow[]
  allocationSegments: AllocationSegment[]
  isLoading?: boolean
  platformCountSummary?: string
}

function PortfolioOverview({
  summaryData,
  yoyData,
  chartsData,
  yearlyData,
  monthlyTableData,
  investmentPlatforms,
  cashPlatforms,
  closedPlatforms,
  allocationSegments,
  isLoading = false,
  platformCountSummary,
}: PortfolioOverviewProps) {
  const navigate = useNavigate()

  const timeSpan = useInvestmentUIStore((s) => s.timeSpan)
  const setTimeSpan = useInvestmentUIStore((s) => s.setTimeSpan)
  const yoyActive = useInvestmentUIStore((s) => s.yoyActive)
  const setYoyActive = useInvestmentUIStore((s) => s.setYoyActive)
  const chartMode = useInvestmentUIStore((s) => s.chartMode)

  const [dataPointDialogOpen, setDataPointDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [platformDialogOpen, setPlatformDialogOpen] = useState(false)

  const handlePlatformRowClick = (platformId: string) => {
    navigate(`/investment/platform/${platformId}`)
  }

  const handleCashRowClick = (platformId: string) => {
    navigate(`/investment/cash/${platformId}`)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
      {/* Desktop page header */}
      <div
        className="hidden lg:flex items-center justify-between mb-8"
        data-testid="section-header"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
              Investment Portfolio
            </h1>
            <PortfolioSwitcher />
          </div>
          {platformCountSummary && (
            <p className="text-sm text-base-400">{platformCountSummary}</p>
          )}
        </div>
      </div>

      {/* Mobile action buttons */}
      <div
        className="flex flex-col sm:flex-row gap-2 mb-4 lg:hidden"
        data-testid="section-mobile-actions"
      >
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setDataPointDialogOpen(true)}
        >
          + Add Data Point
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={() => setTransactionDialogOpen(true)}
        >
          + Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div data-testid="section-summary-cards">
        <PortfolioOverviewSummary {...summaryData} isLoading={isLoading} />
      </div>

      {/* YoY Comparison */}
      <div data-testid="section-yoy" className="mt-6 lg:mt-8">
        <PortfolioOverviewYoY {...yoyData} isLoading={isLoading} />
      </div>

      {/* Performance Charts Accordion */}
      <div data-testid="section-performance" className="mt-6 lg:mt-8">
        <PortfolioOverviewPerformanceAccordion>
          <PortfolioOverviewValueCharts
            {...chartsData}
            timeSpan={timeSpan}
            onTimeSpanChange={setTimeSpan}
            yoyActive={yoyActive}
            onYoYChange={setYoyActive}
            isLoading={isLoading}
          />
          <PortfolioOverviewPerfYearly
            yearlyData={yearlyData.yearlyData}
            totals={yearlyData.totals}
            isLoading={isLoading}
          />
          <PortfolioOverviewPerfMonthly
            monthlyData={monthlyTableData}
            chartMode={chartMode}
            isLoading={isLoading}
          />
        </PortfolioOverviewPerformanceAccordion>
      </div>

      {/* Investment Platforms Table */}
      <div data-testid="section-platforms" className="mt-6 lg:mt-8">
        <PortfolioOverviewPlatformsTable
          platforms={investmentPlatforms}
          isLoading={isLoading}
          onRowClick={handlePlatformRowClick}
          onAddDataPoint={() => setDataPointDialogOpen(true)}
          onAddTransaction={() => setTransactionDialogOpen(true)}
        />
      </div>

      {/* Cash Accounts Table */}
      <div data-testid="section-cash" className="mt-6 lg:mt-8">
        <PortfolioOverviewCashTable
          cashPlatforms={cashPlatforms}
          isLoading={isLoading}
          onRowClick={handleCashRowClick}
        />
      </div>

      {/* Closed Platforms */}
      <div data-testid="section-closed" className="mt-6 lg:mt-8">
        <PortfolioOverviewClosed
          closedPlatforms={closedPlatforms}
          isLoading={isLoading}
          onRowClick={handlePlatformRowClick}
        />
      </div>

      {/* Portfolio Allocation */}
      <div data-testid="section-allocation" className="mt-6 lg:mt-8">
        <PortfolioOverviewAllocation
          segments={allocationSegments}
          isLoading={isLoading}
        />
      </div>

      {/* Add Platform link */}
      <button
        className="w-full py-3 text-sm font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 mt-2 mb-2"
        onClick={() => setPlatformDialogOpen(true)}
        data-testid="add-platform-button"
      >
        <Plus className="w-4 h-4" />
        Add Platform
      </button>

      {/* Dialog placeholders — actual dialogs (US-078, US-079) will be wired during integration */}
      {dataPointDialogOpen && (
        <div data-testid="data-point-dialog" hidden />
      )}
      {transactionDialogOpen && (
        <div data-testid="transaction-dialog" hidden />
      )}
      {platformDialogOpen && (
        <div data-testid="platform-dialog" hidden />
      )}
    </div>
  )
}

export { PortfolioOverview }
export type {
  PortfolioOverviewProps,
  CompositeDataPoint,
  PlatformSeries,
  MonthlyPerformancePoint,
  YearlyData,
  MonthlyData,
  PlatformRow,
  CashPlatformRow,
  ClosedPlatformRow,
  AllocationSegment,
}
