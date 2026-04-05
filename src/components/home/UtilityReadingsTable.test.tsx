import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/utils'
import { buildMeterReading } from '@/test/factories/homeFactory'
import { UtilityReadingsTable } from './UtilityReadingsTable'
import type { MeterReading } from '@/types/home'

function buildReadings(count: number): MeterReading[] {
  return Array.from({ length: count }, (_, i) =>
    buildMeterReading({
      value: 1000 + i * 100,
      timestamp: `2026-0${Math.min(i + 1, 9)}-15T10:00:00.000Z`,
    }),
  )
}

describe('UtilityReadingsTable', () => {
  const defaultProps = {
    readings: buildReadings(3),
    unit: 'kWh',
    onAddReading: vi.fn(),
    onEditReading: vi.fn(),
    onDeleteReading: vi.fn(),
  }

  it('shows card header with title, count badge, and add button', () => {
    renderWithProviders(<UtilityReadingsTable {...defaultProps} />)

    expect(screen.getByText('Meter Readings')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('+ Add Reading')).toBeInTheDocument()
  })

  it('shows 5 rows by default and hides extras behind show-more', () => {
    const readings = buildReadings(8)
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    // DataTable shows 5 rows by default with showMoreThreshold={5}
    const rows = screen.getAllByRole('row')
    // 1 header row + 5 data rows = 6
    expect(rows).toHaveLength(6)

    // Should show "Show all 8" link
    expect(screen.getByText('Show all 8')).toBeInTheDocument()
  })

  it('formats date column correctly', () => {
    const readings = [
      buildMeterReading({ timestamp: '2026-01-15T10:00:00.000Z', value: 500 }),
    ]
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument()
  })

  it('shows reading value with unit suffix', () => {
    const readings = [
      buildMeterReading({ value: 1234, timestamp: '2026-01-15T10:00:00.000Z' }),
    ]
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} unit="m³" />,
    )

    // formatNumber(1234, 2) with da-DK locale produces "1.234,00"
    expect(screen.getByText((_content, element) => {
      return element?.textContent?.includes('m³') === true &&
        element?.tagName === 'SPAN' &&
        element?.closest('td') !== null
    })).toBeInTheDocument()
  })

  it('displays italic muted text for notes and dash when null', () => {
    const readings = [
      buildMeterReading({
        timestamp: '2026-02-15T10:00:00.000Z',
        note: 'Estimated reading',
      }),
      buildMeterReading({
        timestamp: '2026-01-15T10:00:00.000Z',
        note: null,
      }),
    ]
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    const noteElement = screen.getByText('Estimated reading')
    expect(noteElement).toHaveClass('italic', 'text-xs', 'text-base-300')
  })

  it('shows Paperclip icon when attachment is present and dash when not', () => {
    const readings = [
      buildMeterReading({
        timestamp: '2026-02-15T10:00:00.000Z',
        attachment: 'photo.jpg',
      }),
      buildMeterReading({
        timestamp: '2026-01-15T10:00:00.000Z',
        attachment: null,
      }),
    ]
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    expect(screen.getByLabelText('Has attachment')).toBeInTheDocument()
  })

  it('fires onAddReading when add button is clicked', async () => {
    const onAddReading = vi.fn()
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} onAddReading={onAddReading} />,
    )

    const user = userEvent.setup()
    await user.click(screen.getByText('+ Add Reading'))

    expect(onAddReading).toHaveBeenCalledOnce()
  })

  it('fires onEditReading when edit button is clicked', async () => {
    const onEditReading = vi.fn()
    const readings = [
      buildMeterReading({ timestamp: '2026-01-15T10:00:00.000Z', value: 500 }),
    ]
    renderWithProviders(
      <UtilityReadingsTable
        {...defaultProps}
        readings={readings}
        onEditReading={onEditReading}
      />,
    )

    const user = userEvent.setup()
    const editButton = screen.getByLabelText('Edit')
    await user.click(editButton)

    expect(onEditReading).toHaveBeenCalledOnce()
    expect(onEditReading).toHaveBeenCalledWith(
      expect.objectContaining({ value: 500 }),
    )
  })

  it('fires onDeleteReading when delete button is clicked', async () => {
    const onDeleteReading = vi.fn()
    const readings = [
      buildMeterReading({ timestamp: '2026-01-15T10:00:00.000Z', value: 500 }),
    ]
    renderWithProviders(
      <UtilityReadingsTable
        {...defaultProps}
        readings={readings}
        onDeleteReading={onDeleteReading}
      />,
    )

    const user = userEvent.setup()
    const deleteButton = screen.getByLabelText('Delete')
    await user.click(deleteButton)

    expect(onDeleteReading).toHaveBeenCalledOnce()
    expect(onDeleteReading).toHaveBeenCalledWith(
      expect.objectContaining({ value: 500 }),
    )
  })

  it('sorts rows by date descending (most recent first)', () => {
    const readings = [
      buildMeterReading({
        timestamp: '2026-01-10T10:00:00.000Z',
        value: 100,
      }),
      buildMeterReading({
        timestamp: '2026-03-20T10:00:00.000Z',
        value: 300,
      }),
      buildMeterReading({
        timestamp: '2026-02-15T10:00:00.000Z',
        value: 200,
      }),
    ]
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    const rows = screen.getAllByRole('row')
    // Skip header row (index 0), check data rows
    const firstDataRow = rows[1]
    const lastDataRow = rows[3]

    expect(within(firstDataRow!).getByText('Mar 20, 2026')).toBeInTheDocument()
    expect(within(lastDataRow!).getByText('Jan 10, 2026')).toBeInTheDocument()
  })

  it('shows empty state when readings array is empty', () => {
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={[]} />,
    )

    expect(screen.getByText('No readings yet')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('+ Add Reading')).toBeInTheDocument()
  })

  it('opens MobileDrawer on row click', async () => {
    const readings = [
      buildMeterReading({
        timestamp: '2026-01-15T10:00:00.000Z',
        value: 1234,
        note: 'Test note',
      }),
    ]
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    const user = userEvent.setup()
    const row = screen.getAllByRole('row')[1]! // first data row
    await user.click(row)

    const drawer = screen.getByTestId('mobile-drawer')
    expect(drawer).toHaveStyle({ transform: 'translateY(0)' })
    expect(within(drawer).getByText('Meter Reading')).toBeInTheDocument()
    expect(within(drawer).getByText('Jan 15, 2026')).toBeInTheDocument()
  })

  it('shows count badge matching number of readings', () => {
    const readings = buildReadings(7)
    renderWithProviders(
      <UtilityReadingsTable {...defaultProps} readings={readings} />,
    )

    expect(screen.getByText('7')).toBeInTheDocument()
  })
})
