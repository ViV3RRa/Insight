import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { ChangeIndicator } from '@/components/shared/ChangeIndicator'
import { formatNumber, formatYearLabel } from '@/utils/formatters'

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

export function CollapsibleYearTable({
  years,
  unit,
  currency = 'DKK',
}: CollapsibleYearTableProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set())

  const sortedYears = [...years].sort((a, b) => b.year - a.year)

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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-200 dark:border-base-700">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-base-300 dark:text-base-400 w-24">
              Period
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
              Consumption
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
              Avg/Month
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400 w-16" />
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
              Cost
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
              Avg Cost
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
              Cost/Unit
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400 w-16" />
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
                unit={unit}
                currency={currency}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface YearSectionProps {
  yearData: YearData
  isExpanded: boolean
  onToggle: () => void
  unit: string
  currency: string
}

function YearSection({
  yearData,
  isExpanded,
  onToggle,
  unit,
  currency,
}: YearSectionProps) {
  return (
    <>
      <tr
        className="border-b border-base-100 dark:border-base-700/50 hover:bg-base-50/50 dark:hover:bg-base-700/30 cursor-pointer transition-colors duration-100"
        onClick={onToggle}
        aria-expanded={isExpanded}
        data-testid={`year-row-${yearData.year}`}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <ChevronRight
              className="w-3.5 h-3.5 text-base-400 transition-transform duration-200"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
            <span className="text-sm font-semibold text-base-900 dark:text-white">
              {formatYearLabel(yearData.year, yearData.isCurrentYear)}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          {formatValue(yearData.totalConsumption, unit)}
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          {formatValue(yearData.avgMonthly, unit)}
        </td>
        <td className="px-4 py-3 text-right">
          {yearData.consumptionChange !== null && (
            <ChangeIndicator
              value={yearData.consumptionChange}
              invertColor={true}
            />
          )}
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          {formatValue(yearData.totalCost, currency)}
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          {formatValue(yearData.avgCost, currency)}
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          {formatValue(yearData.avgCostPerUnit, currency, 2)}
        </td>
        <td className="px-4 py-3 text-right">
          {yearData.costChange !== null && (
            <ChangeIndicator
              value={yearData.costChange}
              invertColor={true}
            />
          )}
        </td>
      </tr>

      {isExpanded &&
        yearData.months.map((month) => (
          <tr
            key={month.month.toISOString()}
            className="border-b border-base-50 dark:border-base-700/30 bg-base-50/40 dark:bg-base-800/50"
            data-testid={`month-row-${month.month.toISOString()}`}
          >
            <td className="px-4 py-2.5 pl-10">
              <span className="text-xs text-base-500 dark:text-base-400">
                {formatMonthLabel(month.month)}
              </span>
            </td>
            <td className="px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
              {formatValue(month.consumption, unit)}
            </td>
            <td className="px-4 py-2.5" />
            <td className="px-4 py-2.5 text-right">
              {month.consumptionChange !== null && (
                <ChangeIndicator
                  value={month.consumptionChange}
                  invertColor={true}
                />
              )}
            </td>
            <td className="px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
              {formatValue(month.cost, currency)}
            </td>
            <td className="px-4 py-2.5" />
            <td className="px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
              {formatValue(month.costPerUnit, currency, 2)}
            </td>
            <td className="px-4 py-2.5 text-right">
              {month.costChange !== null && (
                <ChangeIndicator
                  value={month.costChange}
                  invertColor={true}
                />
              )}
            </td>
          </tr>
        ))}
    </>
  )
}
