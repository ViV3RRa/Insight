import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { VehicleYoYRow, type VehicleYoYData } from './VehicleYoYRow'

function buildYoYData(overrides?: Partial<VehicleYoYData>): VehicleYoYData {
  return {
    ytdKm: { current: 8500, previous: 7200 },
    ytdFuelCost: { current: 12300, previous: 10500 },
    efficiency: { current: 15.2, previous: 14.1, unit: 'km/l' },
    ...overrides,
  }
}

describe('VehicleYoYRow', () => {
  it('renders three YoY metrics', () => {
    renderWithProviders(<VehicleYoYRow data={buildYoYData()} />)

    // Each label appears twice (desktop + mobile layout)
    expect(screen.getAllByText('YTD Km Driven')).toHaveLength(2)
    expect(screen.getAllByText('YTD Fuel Cost')).toHaveLength(2)
    expect(screen.getAllByText('Efficiency')).toHaveLength(2)
  })

  it('renders the period label', () => {
    renderWithProviders(<VehicleYoYRow data={buildYoYData()} />)

    expect(
      screen.getByText('Year-over-Year · Same period last year'),
    ).toBeInTheDocument()
  })

  it('renders current and previous values correctly', () => {
    renderWithProviders(<VehicleYoYRow data={buildYoYData()} />)

    // Km values (formatted with da-DK locale, 0 decimals)
    expect(screen.getAllByText('8.500')).toHaveLength(2)
    expect(screen.getAllByText('vs 7.200')).toHaveLength(2)

    // Cost values with DKK suffix
    expect(screen.getAllByText('12.300 DKK')).toHaveLength(2)
    expect(screen.getAllByText('vs 10.500 DKK')).toHaveLength(2)

    // Efficiency values with unit
    expect(screen.getAllByText('15,2 km/l')).toHaveLength(2)
    expect(screen.getAllByText('vs 14,1 km/l')).toHaveLength(2)
  })

  it('cost increase shown in red (invertColor)', () => {
    const data = buildYoYData({
      ytdFuelCost: { current: 15000, previous: 10000 },
    })
    const { container } = renderWithProviders(<VehicleYoYRow data={data} />)

    // Find the Fuel Cost metric's ChangeIndicator — positive cost change with invertColor = rose
    const allIndicators = container.querySelectorAll(
      '.inline-flex.items-center.gap-0\\.5',
    )
    // There are 6 indicators total (3 metrics × 2 layouts)
    // Fuel Cost is the 2nd metric → indices 1 (desktop) and 4 (mobile)
    expect(allIndicators[1]).toHaveClass('text-rose-600')
    expect(allIndicators[4]).toHaveClass('text-rose-600')
  })

  it('efficiency increase shown in green (normal polarity)', () => {
    const data = buildYoYData({
      efficiency: { current: 16.0, previous: 14.0, unit: 'km/l' },
    })
    const { container } = renderWithProviders(<VehicleYoYRow data={data} />)

    const allIndicators = container.querySelectorAll(
      '.inline-flex.items-center.gap-0\\.5',
    )
    // Efficiency is the 3rd metric → indices 2 (desktop) and 5 (mobile)
    expect(allIndicators[2]).toHaveClass('text-emerald-600')
    expect(allIndicators[5]).toHaveClass('text-emerald-600')
  })

  it('shows "—" when efficiency data is null', () => {
    const data = buildYoYData({
      efficiency: { current: null, previous: null, unit: 'km/l' },
    })
    renderWithProviders(<VehicleYoYRow data={data} />)

    // Current and previous both show em-dash
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(2)

    const vsDashes = screen.getAllByText('vs —')
    expect(vsDashes.length).toBeGreaterThanOrEqual(2)
  })

  it('renders nothing when data prop is null', () => {
    const { container } = renderWithProviders(<VehicleYoYRow data={null} />)

    expect(container.innerHTML).toBe('')
  })

  it('handles zero previous values gracefully', () => {
    const data = buildYoYData({
      ytdKm: { current: 5000, previous: 0 },
      ytdFuelCost: { current: 3000, previous: 0 },
      efficiency: { current: 15.0, previous: 0, unit: 'km/l' },
    })
    const { container } = renderWithProviders(<VehicleYoYRow data={data} />)

    // Should not crash — all change indicators should show 0% (neutral color)
    const allIndicators = container.querySelectorAll(
      '.inline-flex.items-center.gap-0\\.5',
    )
    expect(allIndicators.length).toBe(6)
    // All should have neutral color (text-base-400) since previous is 0
    allIndicators.forEach((indicator) => {
      expect(indicator).toHaveClass('text-base-400')
    })
  })

  it('handles partial null efficiency (current null, previous present)', () => {
    const data = buildYoYData({
      efficiency: { current: null, previous: 14.5, unit: 'km/kWh' },
    })
    renderWithProviders(<VehicleYoYRow data={data} />)

    // Current shows dash, previous shows value
    expect(screen.getAllByText('—')).toHaveLength(2) // desktop + mobile
    expect(screen.getAllByText('vs 14,5 km/kWh')).toHaveLength(2)
  })
})
