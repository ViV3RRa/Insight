import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { VehicleEfficiencyChart } from './VehicleEfficiencyChart'
import type { EfficiencyDataPoint } from './VehicleEfficiencyChart'

function buildDataPoints(count: number): EfficiencyDataPoint[] {
  const points: EfficiencyDataPoint[] = []
  for (let i = 0; i < count; i++) {
    const month = String(i + 1).padStart(2, '0')
    points.push({
      date: `2026-${month}-15`,
      efficiency: 14 + i * 0.5,
      fuelAmount: 40 + i,
    })
  }
  return points
}

function setup(
  data: EfficiencyDataPoint[] = [],
  priorYearData?: EfficiencyDataPoint[],
  unit = 'km/l',
) {
  return renderWithProviders(
    <div style={{ width: 600, height: 400 }}>
      <VehicleEfficiencyChart
        data={data}
        priorYearData={priorYearData}
        unit={unit}
      />
    </div>,
  )
}

describe('VehicleEfficiencyChart', () => {
  it('renders ChartCard with "Fuel Efficiency" title', () => {
    setup()
    expect(screen.getByText('Fuel Efficiency')).toBeInTheDocument()
  })

  it('renders without crashing with empty data', () => {
    setup([])
    expect(screen.getByText('Fuel Efficiency')).toBeInTheDocument()
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders without crashing with valid data points', () => {
    setup(buildDataPoints(3))
    expect(screen.getByText('Fuel Efficiency')).toBeInTheDocument()
    expect(screen.queryByText('No data available')).not.toBeInTheDocument()
  })

  it('displays "Per refueling" legend text', () => {
    setup(buildDataPoints(3))
    expect(screen.getByText('Per refueling')).toBeInTheDocument()
  })

  it('displays legend even with empty data', () => {
    setup([])
    expect(screen.getByText('Per refueling')).toBeInTheDocument()
  })

  it('renders TimeSpanSelector with YTD default', () => {
    setup()
    expect(screen.getByRole('tab', { name: 'YTD' })).toBeInTheDocument()
  })

  it('renders YoY toggle', () => {
    setup()
    expect(screen.getByRole('button', { name: /yoy/i })).toBeInTheDocument()
  })

  it('renders with km/kWh unit', () => {
    setup(buildDataPoints(2), undefined, 'km/kWh')
    expect(screen.getByText('Fuel Efficiency')).toBeInTheDocument()
  })
})
