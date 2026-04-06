import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { VehicleMaintenanceChart } from './VehicleMaintenanceChart'
import type { MonthlyMaintenanceCostPoint } from './VehicleMaintenanceChart'

function buildData(count: number): MonthlyMaintenanceCostPoint[] {
  const points: MonthlyMaintenanceCostPoint[] = []
  for (let i = 0; i < count; i++) {
    const month = String(i + 1).padStart(2, '0')
    points.push({
      month: `2026-${month}`,
      cost: 500 + i * 200,
    })
  }
  return points
}

function setup(data: MonthlyMaintenanceCostPoint[] = []) {
  return renderWithProviders(
    <div style={{ width: 600, height: 400 }}>
      <VehicleMaintenanceChart data={data} />
    </div>,
  )
}

describe('VehicleMaintenanceChart', () => {
  it('renders ChartCard with "Maintenance Cost" title', () => {
    setup()
    expect(screen.getByText('Maintenance Cost')).toBeInTheDocument()
  })

  it('shows "No maintenance costs" when data is empty', () => {
    setup([])
    expect(screen.getByText('No maintenance costs')).toBeInTheDocument()
  })

  it('renders bars when data is provided', () => {
    setup(buildData(3))
    expect(screen.queryByText('No maintenance costs')).not.toBeInTheDocument()
  })

  it('does not render YoY toggle (hideYoY)', () => {
    setup()
    expect(screen.queryByRole('button', { name: /yoy/i })).not.toBeInTheDocument()
  })

  it('does not render TimeSpanSelector (hideTimeSpan)', () => {
    setup()
    expect(screen.queryByRole('tab', { name: 'YTD' })).not.toBeInTheDocument()
  })

  it('displays "Maintenance" legend text', () => {
    setup(buildData(3))
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })

  it('displays legend even with empty data', () => {
    setup([])
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
  })
})
