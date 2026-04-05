import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { buildUtility, buildMeterReading, buildUtilityBill } from '@/test/factories/homeFactory'
import { UtilityYearlyTable } from './UtilityYearlyTable'

describe('UtilityYearlyTable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const utility = buildUtility({ name: 'Electricity', unit: 'kWh' })

  it('renders "Yearly Summary" card header', () => {
    renderWithProviders(
      <UtilityYearlyTable utility={utility} readings={[]} bills={[]} />,
    )
    expect(screen.getByText('Yearly Summary')).toBeInTheDocument()
  })

  it('shows empty state when no readings/bills', () => {
    renderWithProviders(
      <UtilityYearlyTable utility={utility} readings={[]} bills={[]} />,
    )
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('card has correct styling classes', () => {
    const { container } = renderWithProviders(
      <UtilityYearlyTable utility={utility} readings={[]} bills={[]} />,
    )
    const card = container.firstElementChild as HTMLElement
    expect(card.classList.contains('rounded-2xl')).toBe(true)
    expect(card.classList.contains('shadow-card')).toBe(true)
  })

  describe('with data', () => {
    const readings = [
      buildMeterReading({ value: 100, timestamp: '2025-01-15T00:00:00Z', utilityId: utility.id }),
      buildMeterReading({ value: 200, timestamp: '2025-06-15T00:00:00Z', utilityId: utility.id }),
      buildMeterReading({ value: 350, timestamp: '2026-01-15T00:00:00Z', utilityId: utility.id }),
      buildMeterReading({ value: 500, timestamp: '2026-03-15T00:00:00Z', utilityId: utility.id }),
    ]

    const bills = [
      buildUtilityBill({
        utilityId: utility.id,
        amount: 600,
        periodStart: '2025-01-01',
        periodEnd: '2025-06-30',
      }),
      buildUtilityBill({
        utilityId: utility.id,
        amount: 400,
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
      }),
    ]

    it('renders CollapsibleYearTable when data available', () => {
      renderWithProviders(
        <UtilityYearlyTable utility={utility} readings={readings} bills={bills} />,
      )
      expect(screen.queryByText('No data available')).not.toBeInTheDocument()
      // Table should be rendered with year rows
      expect(screen.getByTestId('year-row-2025')).toBeInTheDocument()
      expect(screen.getByTestId('year-row-2026')).toBeInTheDocument()
    })

    it('current year is labeled with "(YTD)"', () => {
      renderWithProviders(
        <UtilityYearlyTable utility={utility} readings={readings} bills={bills} />,
      )
      const yearRow2026 = screen.getByTestId('year-row-2026')
      expect(yearRow2026.textContent).toContain('2026')
      expect(yearRow2026.textContent).toContain('YTD')
    })

    it('handles multiple years of data', () => {
      renderWithProviders(
        <UtilityYearlyTable utility={utility} readings={readings} bills={bills} />,
      )
      expect(screen.getByTestId('year-row-2025')).toBeInTheDocument()
      expect(screen.getByTestId('year-row-2026')).toBeInTheDocument()
    })

    it('passes correct unit to CollapsibleYearTable', () => {
      renderWithProviders(
        <UtilityYearlyTable utility={utility} readings={readings} bills={bills} />,
      )
      // The unit should appear in the table cells (consumption values formatted with unit)
      const yearRow2025 = screen.getByTestId('year-row-2025')
      expect(yearRow2025.textContent).toContain('kWh')
    })
  })

  describe('with single year of data', () => {
    const readings = [
      buildMeterReading({ value: 100, timestamp: '2025-01-15T00:00:00Z', utilityId: utility.id }),
      buildMeterReading({ value: 200, timestamp: '2025-06-15T00:00:00Z', utilityId: utility.id }),
    ]

    const bills = [
      buildUtilityBill({
        utilityId: utility.id,
        amount: 300,
        periodStart: '2025-01-01',
        periodEnd: '2025-06-30',
      }),
    ]

    it('handles single year of data', () => {
      renderWithProviders(
        <UtilityYearlyTable utility={utility} readings={readings} bills={bills} />,
      )
      expect(screen.getByTestId('year-row-2025')).toBeInTheDocument()
      expect(screen.queryByTestId('year-row-2026')).not.toBeInTheDocument()
    })
  })
})
