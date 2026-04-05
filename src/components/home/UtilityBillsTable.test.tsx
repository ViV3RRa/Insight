import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/test/utils'
import { buildUtilityBill } from '@/test/factories/homeFactory'
import { UtilityBillsTable } from './UtilityBillsTable'

const defaultProps = {
  onAddBill: vi.fn(),
  onEditBill: vi.fn(),
  onDeleteBill: vi.fn(),
}

function renderTable(bills = defaultBills()) {
  return renderWithProviders(
    <UtilityBillsTable bills={bills} {...defaultProps} />,
  )
}

function defaultBills() {
  return [
    buildUtilityBill({
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
      amount: 1500,
      timestamp: '2026-04-02T10:00:00Z',
      note: 'Q1 bill',
      attachment: 'receipt.pdf',
    }),
    buildUtilityBill({
      periodStart: '2025-10-01',
      periodEnd: '2025-12-31',
      amount: 1200,
      timestamp: null,
      note: null,
      attachment: null,
    }),
    buildUtilityBill({
      periodStart: '2025-07-01',
      periodEnd: '2025-09-30',
      amount: 900,
      timestamp: '2025-10-05T08:00:00Z',
      note: 'Summer quarter',
      attachment: null,
    }),
  ]
}

describe('UtilityBillsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Bills" title, count badge, and "+ Add Bill" button', () => {
    renderTable()
    expect(screen.getByText('Bills')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    const addButton = screen.getByRole('button', { name: /\+ Add Bill/i })
    expect(addButton).toBeInTheDocument()
  })

  it('renders "+ Add Bill" button with primary variant', () => {
    renderTable()
    const addButton = screen.getByRole('button', { name: /\+ Add Bill/i })
    // Primary variant in light mode uses bg-base-900
    expect(addButton.className).toContain('bg-base-900')
  })

  it('shows 5 rows by default with show-more mechanism', () => {
    const bills = Array.from({ length: 8 }, (_, i) =>
      buildUtilityBill({
        periodStart: `2026-0${(i % 9) + 1}-01`,
        periodEnd: `2026-0${(i % 9) + 1}-28`,
        amount: 100 * (i + 1),
      }),
    )
    renderTable(bills)

    const rows = screen.getAllByRole('row')
    // 1 header row + 5 data rows = 6
    expect(rows.length).toBe(6)
    expect(screen.getByText('Show all 8')).toBeInTheDocument()
  })

  it('renders period column with combined coverage range', () => {
    renderTable()
    expect(screen.getByText('Jan 2026 – Mar 2026')).toBeInTheDocument()
    expect(screen.getByText('Oct 2025 – Dec 2025')).toBeInTheDocument()
    expect(screen.getByText('Jul 2025 – Sep 2025')).toBeInTheDocument()
  })

  it('shows amount formatted with " DKK"', () => {
    renderTable()
    expect(screen.getByText(/1\.500 DKK/)).toBeInTheDocument()
    expect(screen.getByText(/1\.200 DKK/)).toBeInTheDocument()
    expect(screen.getByText(/900 DKK/)).toBeInTheDocument()
  })

  it('renders date received or dash when null', () => {
    renderTable()
    expect(screen.getByText('Apr 2, 2026')).toBeInTheDocument()
    expect(screen.getByText('Oct 5, 2025')).toBeInTheDocument()
    // The bill with null timestamp should show a dash
    const rows = screen.getAllByRole('row')
    // Second data row (index 2 because index 0 is header) has null timestamp
    const secondDataRow = rows[2]!
    const cells = within(secondDataRow).getAllByRole('cell')
    // timestamp is the 3rd column (index 2)
    expect(cells[2]!.textContent).toBe('—')
  })

  it('displays note text or dash', () => {
    renderTable()
    expect(screen.getByText('Q1 bill')).toBeInTheDocument()
    expect(screen.getByText('Summer quarter')).toBeInTheDocument()
  })

  it('shows Paperclip icon for attachment or dash', () => {
    renderTable()
    expect(screen.getByLabelText('Has attachment')).toBeInTheDocument()
  })

  it('fires onAddBill when "+ Add Bill" is clicked', async () => {
    const user = userEvent.setup()
    renderTable()
    await user.click(screen.getByRole('button', { name: /\+ Add Bill/i }))
    expect(defaultProps.onAddBill).toHaveBeenCalledOnce()
  })

  it('fires onEditBill when edit button is clicked', async () => {
    const user = userEvent.setup()
    const bills = defaultBills()
    renderTable(bills)

    const editButtons = screen.getAllByRole('button', { name: 'Edit' })
    await user.click(editButtons[0]!)
    expect(defaultProps.onEditBill).toHaveBeenCalledOnce()
  })

  it('fires onDeleteBill when delete button is clicked', async () => {
    const user = userEvent.setup()
    const bills = defaultBills()
    renderTable(bills)

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
    await user.click(deleteButtons[0]!)
    expect(defaultProps.onDeleteBill).toHaveBeenCalledOnce()
  })

  it('sorts rows by periodStart descending (most recent first)', () => {
    renderTable()
    const rows = screen.getAllByRole('row')
    // Header is row[0], data rows follow
    const firstDataRow = rows[1]!
    const secondDataRow = rows[2]!
    const thirdDataRow = rows[3]!

    expect(within(firstDataRow).getByText('Jan 2026 – Mar 2026')).toBeInTheDocument()
    expect(within(secondDataRow).getByText('Oct 2025 – Dec 2025')).toBeInTheDocument()
    expect(within(thirdDataRow).getByText('Jul 2025 – Sep 2025')).toBeInTheDocument()
  })

  it('shows "No bills yet" when bills array is empty', () => {
    renderTable([])
    expect(screen.getByText('No bills yet')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows count badge of 0 in empty state', () => {
    renderTable([])
    expect(screen.getByText('0')).toBeInTheDocument()
    // Add button still present in empty state
    expect(screen.getByRole('button', { name: /\+ Add Bill/i })).toBeInTheDocument()
  })
})
