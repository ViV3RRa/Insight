import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test/utils'
import { buildUtility } from '@/test/factories/homeFactory'
import { UtilityDetailSwitcher } from './UtilityDetailSwitcher'
import type { Utility, UtilityMetrics } from '@/types/home'

function renderSwitcher(overrides?: {
  utility?: Utility
  allUtilities?: Utility[]
  metricsMap?: Map<string, UtilityMetrics>
  latestReadingDates?: Map<string, Date | null>
  onSelectUtility?: (id: string) => void
  onEditUtility?: () => void
}) {
  const utility = overrides?.utility ?? buildUtility({ name: 'Electricity', unit: 'kWh' })
  const water = buildUtility({ name: 'Water', unit: 'm³', icon: 'droplet', color: 'blue' })
  const allUtilities = overrides?.allUtilities ?? [utility, water]

  const latestReadingDates =
    overrides?.latestReadingDates ?? new Map([[utility.id, new Date('2026-04-04')]])

  return renderWithProviders(
    <UtilityDetailSwitcher
      utility={utility}
      allUtilities={allUtilities}
      metricsMap={overrides?.metricsMap ?? new Map()}
      latestReadingDates={latestReadingDates}
      onSelectUtility={overrides?.onSelectUtility ?? vi.fn()}
      onEditUtility={overrides?.onEditUtility ?? vi.fn()}
    />,
  )
}

describe('UtilityDetailSwitcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders utility icon for current utility', () => {
    renderSwitcher()
    // UtilityIcon renders a container div with amber background for Electricity
    const iconContainers = document.querySelectorAll('.bg-amber-50')
    expect(iconContainers.length).toBeGreaterThan(0)
  })

  it('renders DropdownSwitcher trigger with utility name', () => {
    renderSwitcher()
    expect(screen.getByText('Electricity')).toBeInTheDocument()
  })

  it('shows critical staleness indicator when reading is >7 days old', () => {
    const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })
    renderSwitcher({
      utility,
      latestReadingDates: new Map([[utility.id, new Date('2026-03-20')]]),
    })
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('shows warning staleness indicator when reading is >2 days old', () => {
    const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })
    renderSwitcher({
      utility,
      latestReadingDates: new Map([[utility.id, new Date('2026-04-02')]]),
    })
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('does not show staleness indicator when reading is fresh (<=2 days)', () => {
    const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })
    renderSwitcher({
      utility,
      latestReadingDates: new Map([[utility.id, new Date('2026-04-04')]]),
    })
    expect(screen.queryByText('Stale')).not.toBeInTheDocument()
  })

  it('shows critical staleness indicator when latestReadingDate is null', () => {
    const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })
    renderSwitcher({
      utility,
      latestReadingDates: new Map([[utility.id, null]]),
    })
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('shows unit text and "Updated {date}" subtitle', () => {
    const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })
    renderSwitcher({
      utility,
      latestReadingDates: new Map([[utility.id, new Date('2026-04-04')]]),
    })
    expect(screen.getByText(/kWh/)).toBeInTheDocument()
    expect(screen.getByText(/Updated/)).toBeInTheDocument()
    expect(screen.getByText(/Apr 4/)).toBeInTheDocument()
  })

  it('shows "—" for Updated when no reading date', () => {
    const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })
    renderSwitcher({
      utility,
      latestReadingDates: new Map(),
    })
    expect(screen.getByText(/Updated \u2014/)).toBeInTheDocument()
  })

  it('clicking dropdown trigger shows dropdown items', () => {
    renderSwitcher()
    // Click the trigger button (has aria-expanded)
    const trigger = screen.getByRole('button', { expanded: false })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('all utilities appear in dropdown list', () => {
    const electricity = buildUtility({ name: 'Electricity', unit: 'kWh' })
    const water = buildUtility({ name: 'Water', unit: 'm³', icon: 'droplet', color: 'blue' })
    const gas = buildUtility({ name: 'Gas', unit: 'm³', icon: 'flame', color: 'orange' })

    renderSwitcher({
      utility: electricity,
      allUtilities: [electricity, water, gas],
    })

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { expanded: false }))

    // All utility names should appear (duplicated across desktop + mobile dropdowns)
    expect(screen.getAllByText('Electricity').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Water').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Gas').length).toBeGreaterThanOrEqual(1)
  })
})
