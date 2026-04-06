import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { VehicleFuelCostChart } from './VehicleFuelCostChart'
import type { MonthlyFuelCostPoint } from './VehicleFuelCostChart'

function buildMonthlyData(count: number): MonthlyFuelCostPoint[] {
  const points: MonthlyFuelCostPoint[] = []
  for (let i = 0; i < count; i++) {
    const month = String(i + 1).padStart(2, '0')
    points.push({
      month: `2026-${month}`,
      cost: 500 + i * 100,
    })
  }
  return points
}

function setup(
  data: MonthlyFuelCostPoint[] = [],
  priorYearData?: MonthlyFuelCostPoint[],
) {
  return renderWithProviders(
    <div style={{ width: 600, height: 400 }}>
      <VehicleFuelCostChart data={data} priorYearData={priorYearData} />
    </div>,
  )
}

describe('VehicleFuelCostChart', () => {
  it('renders ChartCard with "Monthly Fuel Cost" title', () => {
    setup()
    expect(screen.getByText('Monthly Fuel Cost')).toBeInTheDocument()
  })

  it('shows "No data available" when data is empty', () => {
    setup([])
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders bars when data is provided', () => {
    setup(buildMonthlyData(3))
    expect(screen.getByText('Monthly Fuel Cost')).toBeInTheDocument()
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })

  it('renders TimeSpanSelector', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'YTD' })).toBeInTheDocument()
  })

  it('renders YoY toggle', () => {
    setup()
    expect(screen.getByRole('button', { name: /yoy/i })).toBeInTheDocument()
  })

  it('displays "Fuel cost" legend text', () => {
    setup(buildMonthlyData(3))
    expect(screen.getByText('Fuel cost')).toBeInTheDocument()
  })

  it('displays legend even with empty data', () => {
    setup([])
    expect(screen.getByText('Fuel cost')).toBeInTheDocument()
  })
})
