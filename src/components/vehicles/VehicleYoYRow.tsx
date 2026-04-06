import { YoYComparisonRow } from '@/components/shared/YoYComparisonRow'
import { formatNumber } from '@/utils/formatters'

export interface VehicleYoYData {
  ytdKm: { current: number; previous: number }
  ytdFuelCost: { current: number; previous: number }
  efficiency: { current: number | null; previous: number | null; unit: string }
}

export interface VehicleYoYRowProps {
  data: VehicleYoYData | null
}

function changePercent(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function VehicleYoYRow({ data }: VehicleYoYRowProps) {
  if (!data) return null

  const effCurrent = data.efficiency.current
  const effPrevious = data.efficiency.previous

  const metrics = [
    {
      label: 'YTD Km Driven',
      currentValue: formatNumber(data.ytdKm.current, 0),
      previousValue: formatNumber(data.ytdKm.previous, 0),
      changePercent: changePercent(data.ytdKm.current, data.ytdKm.previous),
    },
    {
      label: 'YTD Fuel Cost',
      currentValue: `${formatNumber(data.ytdFuelCost.current, 0)} DKK`,
      previousValue: `${formatNumber(data.ytdFuelCost.previous, 0)} DKK`,
      changePercent: changePercent(data.ytdFuelCost.current, data.ytdFuelCost.previous),
      invertColor: true,
    },
    {
      label: 'Efficiency',
      currentValue:
        effCurrent !== null
          ? `${formatNumber(effCurrent, 1)} ${data.efficiency.unit}`
          : '—',
      previousValue:
        effPrevious !== null
          ? `${formatNumber(effPrevious, 1)} ${data.efficiency.unit}`
          : '—',
      changePercent:
        effCurrent !== null && effPrevious !== null
          ? changePercent(effCurrent, effPrevious)
          : 0,
    },
  ]

  return (
    <YoYComparisonRow
      periodLabel="Year-over-Year · Same period last year"
      metrics={metrics}
    />
  )
}
