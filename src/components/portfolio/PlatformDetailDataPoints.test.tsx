import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import {
  PlatformDetailDataPoints,
  type DataPointRow,
} from './PlatformDetailDataPoints'

function buildDataPointRow(overrides: Partial<DataPointRow> = {}): DataPointRow {
  return {
    id: 'dp_1',
    date: '2026-03-15',
    value: 150000,
    currency: 'DKK',
    isInterpolated: false,
    ...overrides,
  }
}

const dp1 = buildDataPointRow()
const dp2 = buildDataPointRow({
  id: 'dp_2',
  date: '2026-02-15',
  value: 145000,
  isInterpolated: true,
  note: 'Monthly interpolation',
})
const dp3 = buildDataPointRow({
  id: 'dp_3',
  date: '2026-01-15',
  value: 140000,
})
const dp4 = buildDataPointRow({
  id: 'dp_4',
  date: '2025-12-15',
  value: 135000,
})
const dp5 = buildDataPointRow({
  id: 'dp_5',
  date: '2025-11-15',
  value: 130000,
})
const dp6 = buildDataPointRow({
  id: 'dp_6',
  date: '2025-10-15',
  value: 125000,
})
const dp7 = buildDataPointRow({
  id: 'dp_7',
  date: '2025-09-15',
  value: 120000,
})

const sixDataPoints = [dp1, dp2, dp3, dp4, dp5, dp6]
const sevenDataPoints = [dp1, dp2, dp3, dp4, dp5, dp6, dp7]

const defaultProps = {
  dataPoints: [dp1, dp2, dp3],
  currency: 'DKK',
}

function expandSection() {
  const button = screen.getByRole('button', { name: /data points/i })
  return userEvent.setup().click(button)
}

describe('PlatformDetailDataPoints', () => {
  describe('CollapsibleSection', () => {
    it('wraps the table in a CollapsibleSection', () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      expect(screen.getByText('Data Points')).toBeInTheDocument()
    })

    it('is collapsed by default', () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      const trigger = screen.getByRole('button', { name: /data points/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows count badge matching number of data points', () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows 0 count when no data points', () => {
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={[]} currency="DKK" />,
      )
      expect(screen.getByText('0')).toBeInTheDocument()
    })
  })

  describe('table rows', () => {
    it('shows 5 rows by default when more than 5 exist', async () => {
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={sixDataPoints} currency="DKK" />,
      )
      await expandSection()
      // 5 visible rows + 1 header row = 6 tr elements
      const rows = screen.getAllByRole('row')
      // Header + 5 data rows = 6
      expect(rows).toHaveLength(6)
    })

    it('shows "Show all N" toggle when more than 5 data points', async () => {
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={sixDataPoints} currency="DKK" />,
      )
      await expandSection()
      expect(screen.getByText('Show all 6')).toBeInTheDocument()
    })

    it('shows all rows after clicking "Show all"', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={sevenDataPoints} currency="DKK" />,
      )
      await expandSection()
      await user.click(screen.getByText('Show all 7'))
      // Header + 7 data rows = 8
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(8)
    })
  })

  describe('source column', () => {
    it('shows "est." badge for interpolated data points', async () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      await expandSection()
      expect(screen.getByText('est.')).toBeInTheDocument()
    })

    it('shows "Manual" text for manual data points', async () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      await expandSection()
      const manualLabels = screen.getAllByText('Manual')
      expect(manualLabels.length).toBeGreaterThanOrEqual(1)
    })

    it('applies amber badge styling to interpolated badge', async () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      await expandSection()
      const badge = screen.getByText('est.')
      expect(badge.className).toContain('bg-amber-50')
      expect(badge.className).toContain('text-amber-600')
    })
  })

  describe('value column', () => {
    it('renders CurrencyDisplay for value column', async () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      await expandSection()
      expect(screen.getByText(/150\.000,00 DKK/)).toBeInTheDocument()
    })

    it('shows DKK equivalent for non-DKK platforms', async () => {
      const nonDkkDp = buildDataPointRow({
        id: 'dp_eur',
        date: '2026-03-10',
        value: 20000,
        currency: 'EUR',
        valueDkk: 149000,
      })
      renderWithProviders(
        <PlatformDetailDataPoints
          dataPoints={[nonDkkDp]}
          currency="EUR"
        />,
      )
      await expandSection()
      expect(screen.getByText(/20\.000,00 EUR/)).toBeInTheDocument()
      expect(screen.getByText(/149\.000,00 DKK/)).toBeInTheDocument()
    })
  })

  describe('note column', () => {
    it('displays note as italic muted text', async () => {
      renderWithProviders(<PlatformDetailDataPoints {...defaultProps} />)
      await expandSection()
      const note = screen.getByText('Monthly interpolation')
      expect(note.tagName).toBe('SPAN')
      expect(note.className).toContain('italic')
      expect(note.className).toContain('text-base-300')
    })
  })

  describe('callbacks', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      renderWithProviders(
        <PlatformDetailDataPoints {...defaultProps} onEdit={handler} />,
      )
      await expandSection()
      const editButtons = screen.getAllByLabelText('Edit')
      await user.click(editButtons[0]!)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'dp_1' }),
      )
    })

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      renderWithProviders(
        <PlatformDetailDataPoints {...defaultProps} onDelete={handler} />,
      )
      await expandSection()
      const deleteButtons = screen.getAllByLabelText('Delete')
      await user.click(deleteButtons[0]!)
      expect(handler).toHaveBeenCalledOnce()
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'dp_1' }),
      )
    })

    it('calls onAdd when add button is clicked', async () => {
      const user = userEvent.setup()
      const handler = vi.fn()
      renderWithProviders(
        <PlatformDetailDataPoints {...defaultProps} onAdd={handler} />,
      )
      await expandSection()
      await user.click(screen.getByText('+ Add Data Point'))
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  describe('loading state', () => {
    it('shows skeleton when loading', async () => {
      const { container } = renderWithProviders(
        <PlatformDetailDataPoints {...defaultProps} isLoading />,
      )
      await expandSection()
      const skeleton = container.querySelector('[aria-hidden="true"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('does not render table rows when loading', async () => {
      renderWithProviders(
        <PlatformDetailDataPoints {...defaultProps} isLoading />,
      )
      await expandSection()
      expect(screen.queryByText(/150\.000,00/)).not.toBeInTheDocument()
    })

    it('still shows section header when loading', () => {
      renderWithProviders(
        <PlatformDetailDataPoints {...defaultProps} isLoading />,
      )
      expect(screen.getByText('Data Points')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no data points', async () => {
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={[]} currency="DKK" />,
      )
      await expandSection()
      expect(screen.getByText('No data points yet')).toBeInTheDocument()
    })

    it('still shows section header when empty', () => {
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={[]} currency="DKK" />,
      )
      expect(screen.getByText('Data Points')).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('sorts rows by date descending (most recent first)', async () => {
      // Pass data points in non-sorted order
      const unsorted = [dp3, dp1, dp2] // Jan, Mar, Feb
      renderWithProviders(
        <PlatformDetailDataPoints dataPoints={unsorted} currency="DKK" />,
      )
      await expandSection()
      const rows = screen.getAllByRole('row')
      // rows[0] is header, rows[1] should be dp1 (Mar 15), rows[2] dp2 (Feb 15), rows[3] dp3 (Jan 15)
      const cells = rows.slice(1).map((row) => row.querySelector('td')?.textContent)
      expect(cells[0]).toBe('2026-03-15')
      expect(cells[1]).toBe('2026-02-15')
      expect(cells[2]).toBe('2026-01-15')
    })
  })
})
