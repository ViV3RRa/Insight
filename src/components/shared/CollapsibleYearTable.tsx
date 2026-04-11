import { useState, useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { ChangeIndicator } from '@/components/shared/ChangeIndicator'
import { MobileColumnCyclerHeader, MobileColumnCyclerCell } from '@/components/shared/MobileColumnCycler'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { formatNumber, formatYearLabel, formatPercent } from '@/utils/formatters'

interface MonthData {
  month: Date
  consumption: number
  consumptionChange: number | null
  cost: number
  costPerUnit: number
  costChange: number | null
}

interface YearData {
  year: number
  isCurrentYear: boolean
  totalConsumption: number
  avgMonthly: number
  consumptionChange: number | null
  totalCost: number
  avgCost: number
  avgCostPerUnit: number
  costChange: number | null
  months: MonthData[]
}

interface CollapsibleYearTableProps {
  years: YearData[]
  unit: string
  currency?: string
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatValue(value: number, suffix: string, decimals = 0): string {
  return `${formatNumber(value, decimals)} ${suffix}`
}

const CYCLING_COLUMNS = [
  { label: 'Avg Monthly' },
  { label: 'Consump. %' },
  { label: 'Total Cost' },
  { label: 'Avg Mo. Cost' },
  { label: 'Cost/Unit' },
  { label: 'Cost Change' },
]

export function CollapsibleYearTable({
  years,
  unit,
  currency = 'DKK',
}: CollapsibleYearTableProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())
  const [cycleIndex, setCycleIndex] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState<MonthData | null>(null)

  const sortedYears = [...years].sort((a, b) => b.year - a.year)

  // Flatten all months across all years for prev/next navigation (newest-first)
  const allMonths = useMemo(() => {
    const months: MonthData[] = []
    for (const y of sortedYears) {
      const sorted = [...y.months].sort((a, b) => b.month.getTime() - a.month.getTime())
      months.push(...sorted)
    }
    return months
  }, [sortedYears])

  const selectedIndex = selectedMonth
    ? allMonths.findIndex((m) => m.month.getTime() === selectedMonth.month.getTime())
    : -1

  function toggleYear(year: number) {
    setExpandedYears((prev) => {
      const next = new Set(prev)
      if (next.has(year)) {
        next.delete(year)
      } else {
        next.add(year)
      }
      return next
    })
  }

  function handleCycle() {
    setCycleIndex((prev) => (prev + 1) % CYCLING_COLUMNS.length)
  }

  function handleMonthClick(month: MonthData) {
    // Only open drawer on mobile (lg and below)
    if (window.innerWidth < 1024) {
      setSelectedMonth(month)
    }
  }

  const drawerFields = selectedMonth
    ? [
        { label: 'Period', value: formatMonthLabel(selectedMonth.month) },
        { label: 'Consumption', value: formatValue(selectedMonth.consumption, unit) },
        { label: 'Consump. Change', value: selectedMonth.consumptionChange !== null ? formatPercent(selectedMonth.consumptionChange) : '—' },
        { label: 'Cost', value: formatValue(selectedMonth.cost, currency) },
        { label: 'Cost/Unit', value: formatValue(selectedMonth.costPerUnit, currency, 2) },
        { label: 'Cost Change', value: selectedMonth.costChange !== null ? formatPercent(selectedMonth.costChange) : '—' },
      ]
    : []

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-base-200 dark:border-base-700">
              <th className="px-3 lg:px-4 py-2.5 text-left text-xs font-medium text-base-300 dark:text-base-400 w-8" />
              <th className="px-3 lg:px-4 py-2.5 text-left text-xs font-medium text-base-300 dark:text-base-400">
                Period
              </th>
              <th className="px-3 lg:px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
                Consumption
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
                Avg Monthly
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400 w-16" />
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
                Cost
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
                Avg Cost
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
                Cost/Unit
              </th>
              <th className="hidden lg:table-cell px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400 w-16" />
              <MobileColumnCyclerHeader
                columns={CYCLING_COLUMNS}
                activeIndex={cycleIndex}
                onCycle={handleCycle}
                hideAbove="lg"
              />
            </tr>
          </thead>
          <tbody>
            {sortedYears.map((yearData) => {
              const isExpanded = expandedYears.has(yearData.year)

              return (
                <YearSection
                  key={yearData.year}
                  yearData={yearData}
                  isExpanded={isExpanded}
                  onToggle={() => toggleYear(yearData.year)}
                  onMonthClick={handleMonthClick}
                  unit={unit}
                  currency={currency}
                  cycleIndex={cycleIndex}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      <MobileDrawer
        isOpen={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        title={selectedMonth ? formatMonthLabel(selectedMonth.month) : ''}
        fields={drawerFields}
        onPrev={selectedIndex > 0 ? () => setSelectedMonth(allMonths[selectedIndex - 1]!) : undefined}
        onNext={selectedIndex < allMonths.length - 1 ? () => setSelectedMonth(allMonths[selectedIndex + 1]!) : undefined}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < allMonths.length - 1}
      />
    </>
  )
}

interface YearSectionProps {
  yearData: YearData
  isExpanded: boolean
  onToggle: () => void
  onMonthClick: (month: MonthData) => void
  unit: string
  currency: string
  cycleIndex: number
}

function YearSection({
  yearData,
  isExpanded,
  onToggle,
  onMonthClick,
  unit,
  currency,
  cycleIndex,
}: YearSectionProps) {
  const cyclingValues = [
    <>{formatValue(yearData.avgMonthly, unit)}</>,
    yearData.consumptionChange !== null ? (
      <ChangeIndicator value={yearData.consumptionChange} invertColor={true} />
    ) : <span className="text-base-300">—</span>,
    <>{formatValue(yearData.totalCost, currency)}</>,
    <>{formatValue(yearData.avgCost, currency)}</>,
    <>{formatValue(yearData.avgCostPerUnit, currency, 2)}</>,
    yearData.costChange !== null ? (
      <ChangeIndicator value={yearData.costChange} invertColor={true} />
    ) : <span className="text-base-300">—</span>,
  ]

  return (
    <>
      <tr
        className="border-b border-base-100 dark:border-base-700/50 hover:bg-base-50/50 dark:hover:bg-base-700/30 cursor-pointer transition-colors duration-100"
        onClick={onToggle}
        aria-expanded={isExpanded}
        data-testid={`year-row-${yearData.year}`}
      >
        <td className="px-3 lg:px-4 py-3 w-8">
          <ChevronRight
            className="w-3.5 h-3.5 text-base-400 transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        </td>
        <td className="px-3 lg:px-4 py-3">
          <span className="text-sm font-semibold text-base-900 dark:text-white">
            {formatYearLabel(yearData.year, yearData.isCurrentYear)}
          </span>
        </td>
        <td className="px-3 lg:px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          {formatValue(yearData.totalConsumption, unit)}
        </td>
        <td className="hidden lg:table-cell px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          {formatValue(yearData.avgMonthly, unit)}
        </td>
        <td className="hidden lg:table-cell px-4 py-3 text-right">
          {yearData.consumptionChange !== null && (
            <ChangeIndicator value={yearData.consumptionChange} invertColor={true} />
          )}
        </td>
        <td className="hidden lg:table-cell px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          {formatValue(yearData.totalCost, currency)}
        </td>
        <td className="hidden lg:table-cell px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          {formatValue(yearData.avgCost, currency)}
        </td>
        <td className="hidden lg:table-cell px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          {formatValue(yearData.avgCostPerUnit, currency, 2)}
        </td>
        <td className="hidden lg:table-cell px-4 py-3 text-right">
          {yearData.costChange !== null && (
            <ChangeIndicator value={yearData.costChange} invertColor={true} />
          )}
        </td>
        <MobileColumnCyclerCell
          values={cyclingValues}
          activeIndex={cycleIndex}
          hideAbove="lg"
        />
      </tr>

      {isExpanded &&
        [...yearData.months].sort((a, b) => b.month.getTime() - a.month.getTime()).map((month) => {
          const monthCyclingValues = [
            <span className="text-base-300">—</span>,
            month.consumptionChange !== null ? (
              <ChangeIndicator value={month.consumptionChange} invertColor={true} />
            ) : <span className="text-base-300">—</span>,
            <>{formatValue(month.cost, currency)}</>,
            <span className="text-base-300">—</span>,
            <>{formatValue(month.costPerUnit, currency, 2)}</>,
            month.costChange !== null ? (
              <ChangeIndicator value={month.costChange} invertColor={true} />
            ) : <span className="text-base-300">—</span>,
          ]

          return (
            <tr
              key={month.month.toISOString()}
              className="border-b border-base-50 dark:border-base-700/30 bg-base-50/40 dark:bg-base-800/50 lg:cursor-default cursor-pointer hover:bg-base-100/50 lg:hover:bg-base-50/40 transition-colors"
              data-testid={`month-row-${month.month.toISOString()}`}
              onClick={() => onMonthClick(month)}
            >
              <td className="px-3 lg:px-4 py-2.5 w-8" />
              <td className="px-3 lg:px-4 py-2.5 pl-10">
                <span className="text-xs text-base-500 dark:text-base-400">
                  {formatMonthLabel(month.month)}
                </span>
              </td>
              <td className="px-3 lg:px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
                {formatValue(month.consumption, unit)}
              </td>
              <td className="hidden lg:table-cell px-4 py-2.5" />
              <td className="hidden lg:table-cell px-4 py-2.5 text-right">
                {month.consumptionChange !== null && (
                  <ChangeIndicator value={month.consumptionChange} invertColor={true} />
                )}
              </td>
              <td className="hidden lg:table-cell px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
                {formatValue(month.cost, currency)}
              </td>
              <td className="hidden lg:table-cell px-4 py-2.5" />
              <td className="hidden lg:table-cell px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
                {formatValue(month.costPerUnit, currency, 2)}
              </td>
              <td className="hidden lg:table-cell px-4 py-2.5 text-right">
                {month.costChange !== null && (
                  <ChangeIndicator value={month.costChange} invertColor={true} />
                )}
              </td>
              <MobileColumnCyclerCell
                values={monthCyclingValues}
                activeIndex={cycleIndex}
                hideAbove="lg"
              />
            </tr>
          )
        })}
    </>
  )
}
