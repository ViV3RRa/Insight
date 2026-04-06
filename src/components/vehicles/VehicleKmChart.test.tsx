import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { VehicleKmChart } from './VehicleKmChart'
import type { MonthlyKmPoint } from './VehicleKmChart'

function buildMonthlyKmPoints(count: number): MonthlyKmPoint[] {
  const points: MonthlyKmPoint[] = []
  for (let i = 0; i < count; i++) {
    const month = String(i + 1).padStart(2, '0')
    points.push({
      month: `2026-${month}`,
      km: 800 + i * 100,
    })
  }
  return points
}

function setup(
  data: MonthlyKmPoint[] = [],
  priorYearData?: MonthlyKmPoint[],
) {
  return renderWithProviders(
    <div style={{ width: 600, height: 400 }}>
      <VehicleKmChart data={data} priorYearData={priorYearData} />
    </div>,
  )
}

describe('VehicleKmChart', () => {
  it('renders ChartCard with "Monthly Km Driven" title', () => {
    setup()
    expect(screen.getByText('Monthly Km Driven')).toBeInTheDocument()
  })

  it('shows "No data available" when data is empty', () => {
    setup([])
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders bars when data is provided', () => {
    setup(buildMonthlyKmPoints(3))
    expect(screen.getByText('Monthly Km Driven')).toBeInTheDocument()
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })

  it('displays legend with "Km driven" text', () => {
    setup(buildMonthlyKmPoints(3))
    expect(screen.getByText('Km driven')).toBeInTheDocument()
  })

  it('displays legend even with empty data', () => {
    setup([])
    expect(screen.getByText('Km driven')).toBeInTheDocument()
  })

  it('renders TimeSpanSelector with YTD default', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'YTD' })).toBeInTheDocument()
  })

  it('renders YoY toggle', () => {
    setup()
    expect(screen.getByRole('button', { name: /yoy/i })).toBeInTheDocument()
  })
})
