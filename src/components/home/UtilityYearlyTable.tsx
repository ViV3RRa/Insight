import { useMemo } from 'react'
import { CollapsibleYearTable } from '@/components/shared/CollapsibleYearTable'
import { calculateYearlySummaries, calculateMonthlySummaries } from '@/utils/utilityYoY'
import type { Utility, MeterReading, UtilityBill } from '@/types/home'

interface UtilityYearlyTableProps {
  utility: Utility
  readings: MeterReading[]
  bills: UtilityBill[]
}

function UtilityYearlyTable({ utility, readings, bills }: UtilityYearlyTableProps) {
  const yearlySummaries = useMemo(
    () => calculateYearlySummaries(readings, bills),
    [readings, bills],
  )

  const yearData = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return yearlySummaries.map((summary) => {
      const monthlySummaries = calculateMonthlySummaries(readings, bills, summary.year)
      return {
        year: summary.year,
        isCurrentYear: summary.year === currentYear,
        totalConsumption: summary.totalConsumption,
        avgMonthly: summary.avgMonthlyConsumption,
        consumptionChange: summary.consumptionChangePercent,
        totalCost: summary.totalCost,
        avgCost: summary.avgMonthlyCost,
        avgCostPerUnit: summary.avgCostPerUnit,
        costChange: summary.costChangePercent,
        months: monthlySummaries.map((ms) => ({
          month: new Date(
            parseInt(ms.month.split('-')[0]!, 10),
            parseInt(ms.month.split('-')[1]!, 10) - 1,
            1,
          ),
          consumption: ms.consumption,
          consumptionChange: ms.consumptionChangePercent,
          cost: ms.cost,
          costPerUnit: ms.costPerUnit ?? 0,
          costChange: ms.costChangePercent,
        })),
      }
    })
  }, [yearlySummaries, readings, bills])

  return (
    <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
      <div className="px-3 lg:px-6 py-5">
        <h3 className="text-sm font-semibold text-base-900 dark:text-white">Yearly Summary</h3>
      </div>
      {yearData.length > 0 ? (
        <CollapsibleYearTable years={yearData} unit={utility.unit} />
      ) : (
        <div className="px-3 lg:px-6 py-8 text-center text-sm text-base-400">
          No data available
        </div>
      )}
    </div>
  )
}

export { UtilityYearlyTable }
