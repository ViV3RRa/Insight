import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/utils'
import { CollapsibleYearTable } from './CollapsibleYearTable'

const mockMonths2026 = [
  {
    month: new Date(2026, 0, 1),
    consumption: 650,
    consumptionChange: 3.2,
    cost: 1500,
    costPerUnit: 2.31,
    costChange: -1.5,
  },
  {
    month: new Date(2026, 1, 1),
    consumption: 594,
    consumptionChange: null,
    cost: 1350,
    costPerUnit: 2.27,
    costChange: -2.8,
  },
  {
    month: new Date(2026, 2, 1),
    consumption: 598,
    consumptionChange: -5.1,
    cost: 1350,
    costPerUnit: 2.26,
    costChange: null,
  },
]

const mockMonths2025 = [
  {
    month: new Date(2025, 0, 1),
    consumption: 700,
    consumptionChange: null,
    cost: 1600,
    costPerUnit: 2.29,
    costChange: null,
  },
]

const mockYears = [
  {
    year: 2025,
    isCurrentYear: false,
    totalConsumption: 8400,
    avgMonthly: 700,
    consumptionChange: null,
    totalCost: 19200,
    avgCost: 1600,
    avgCostPerUnit: 2.29,
    costChange: null,
    months: mockMonths2025,
  },
  {
    year: 2026,
    isCurrentYear: true,
    totalConsumption: 1842,
    avgMonthly: 614,
    consumptionChange: 3.2,
    totalCost: 4200,
    avgCost: 1400,
    avgCostPerUnit: 2.28,
    costChange: -1.5,
    months: mockMonths2026,
  },
]

describe('CollapsibleYearTable', () => {
  describe('rendering', () => {
    it('renders table with header columns', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      expect(screen.getByText('Period')).toBeInTheDocument()
      expect(screen.getByText('Consumption')).toBeInTheDocument()
      expect(screen.getByText('Avg/Month')).toBeInTheDocument()
      expect(screen.getByText('Cost')).toBeInTheDocument()
      expect(screen.getByText('Avg Cost')).toBeInTheDocument()
      expect(screen.getByText('Cost/Unit')).toBeInTheDocument()
    })

    it('renders year rows', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      expect(screen.getByText('2026 (YTD)')).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
    })

    it('sorts years descending (most recent first)', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRows = screen.getAllByTestId(/^year-row-/)
      expect(yearRows[0]).toHaveAttribute('data-testid', 'year-row-2026')
      expect(yearRows[1]).toHaveAttribute('data-testid', 'year-row-2025')
    })
  })

  describe('year row display', () => {
    it('shows (YTD) suffix for current year', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      expect(screen.getByText('2026 (YTD)')).toBeInTheDocument()
    })

    it('does not show (YTD) for past years', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      expect(screen.getByText('2025')).toBeInTheDocument()
      expect(screen.queryByText('2025 (YTD)')).not.toBeInTheDocument()
    })

    it('displays year totals with unit', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(within(yearRow).getByText('1.842 kWh')).toBeInTheDocument()
    })

    it('displays year averages', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(within(yearRow).getByText('614 kWh')).toBeInTheDocument()
    })

    it('displays cost with currency', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(within(yearRow).getByText('4.200 DKK')).toBeInTheDocument()
    })

    it('displays cost per unit with 2 decimals', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(within(yearRow).getByText('2,28 DKK')).toBeInTheDocument()
    })

    it('uses custom currency when provided', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" currency="EUR" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(within(yearRow).getByText('4.200 EUR')).toBeInTheDocument()
    })
  })

  describe('change indicators', () => {
    it('renders ChangeIndicator for non-null consumption change', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      // 2026 has consumptionChange: 3.2 — should render an indicator
      const yearRow = screen.getByTestId('year-row-2026')
      const indicators = within(yearRow).getAllByText(/3,20%/)
      expect(indicators.length).toBeGreaterThan(0)
    })

    it('does not render ChangeIndicator for null changes', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      // 2025 has consumptionChange: null and costChange: null
      const yearRow = screen.getByTestId('year-row-2025')
      // Should have no change indicator arrows
      const indicators = yearRow.querySelectorAll('svg.w-3.h-3')
      expect(indicators).toHaveLength(0)
    })
  })

  describe('expand/collapse', () => {
    it('starts with all years collapsed (no monthly rows visible)', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      expect(screen.queryByTestId(/^month-row-/)).not.toBeInTheDocument()
    })

    it('expands year on click to show monthly rows', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      const monthRows = screen.getAllByTestId(/^month-row-/)
      expect(monthRows).toHaveLength(3)
    })

    it('collapses year on second click', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))
      expect(screen.getAllByTestId(/^month-row-/)).toHaveLength(3)

      await user.click(screen.getByTestId('year-row-2026'))
      expect(screen.queryByTestId(/^month-row-/)).not.toBeInTheDocument()
    })

    it('allows multiple years to be expanded simultaneously', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))
      await user.click(screen.getByTestId('year-row-2025'))

      const monthRows = screen.getAllByTestId(/^month-row-/)
      // 3 months from 2026 + 1 month from 2025
      expect(monthRows).toHaveLength(4)
    })

    it('rotates chevron when expanded', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      // Initially collapsed — chevron at 0deg
      const yearRow2026 = screen.getByTestId('year-row-2026')
      const chevron = yearRow2026.querySelector('svg')!
      expect(chevron.style.transform).toBe('rotate(0deg)')

      await user.click(yearRow2026)
      expect(chevron.style.transform).toBe('rotate(90deg)')
    })
  })

  describe('monthly rows', () => {
    it('displays month labels', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      expect(screen.getByText('Jan 2026')).toBeInTheDocument()
      expect(screen.getByText('Feb 2026')).toBeInTheDocument()
      expect(screen.getByText('Mar 2026')).toBeInTheDocument()
    })

    it('displays monthly consumption with unit', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      expect(screen.getByText('650 kWh')).toBeInTheDocument()
      expect(screen.getByText('598 kWh')).toBeInTheDocument()
    })

    it('displays monthly cost', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      expect(screen.getByText('1.500 DKK')).toBeInTheDocument()
    })

    it('displays monthly cost per unit with 2 decimals', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      expect(screen.getByText('2,31 DKK')).toBeInTheDocument()
    })

    it('renders change indicator for monthly rows with non-null changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      // Month 0 has consumptionChange: 3.2
      expect(screen.getAllByText(/3,20%/).length).toBeGreaterThan(0)
    })

    it('does not render change indicator for null monthly changes', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      // Feb 2026 has consumptionChange: null — row should exist but no consumption arrow
      const febRow = screen.getByTestId(
        `month-row-${new Date(2026, 1, 1).toISOString()}`,
      )
      expect(febRow).toBeInTheDocument()
    })

    it('applies indented styling to month rows', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      const monthRow = screen.getAllByTestId(/^month-row-/)[0]!
      expect(monthRow.className).toContain('bg-base-50/40')
      expect(monthRow.className).toContain('dark:bg-base-800/50')
    })

    it('leaves Avg/Month and Avg Cost columns empty for months', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      await user.click(screen.getByTestId('year-row-2026'))

      const monthRow = screen.getAllByTestId(/^month-row-/)[0]!
      const cells = monthRow.querySelectorAll('td')
      // Cells: month-label, consumption, empty(avg/month), change%, cost, empty(avg cost), costPerUnit, change%
      expect(cells[2]!.textContent).toBe('')
      expect(cells[5]!.textContent).toBe('')
    })
  })

  describe('styling', () => {
    it('wraps table in overflow-x-auto', () => {
      const { container } = renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      expect(container.querySelector('.overflow-x-auto')).not.toBeNull()
    })

    it('applies cursor-pointer to year rows', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(yearRow.className).toContain('cursor-pointer')
    })

    it('applies hover styles to year rows', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const yearRow = screen.getByTestId('year-row-2026')
      expect(yearRow.className).toContain('hover:bg-base-50/50')
      expect(yearRow.className).toContain('dark:hover:bg-base-700/30')
    })

    it('applies header border styling', () => {
      const { container } = renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const headerRow = container.querySelector('thead tr')!
      expect(headerRow.className).toContain('border-b')
      expect(headerRow.className).toContain('border-base-200')
      expect(headerRow.className).toContain('dark:border-base-700')
    })

    it('applies year row font-semibold to year label', () => {
      renderWithProviders(
        <CollapsibleYearTable years={mockYears} unit="kWh" />,
      )

      const label = screen.getByText('2026 (YTD)')
      expect(label.className).toContain('font-semibold')
      expect(label.className).toContain('text-base-900')
      expect(label.className).toContain('dark:text-white')
    })
  })
})
