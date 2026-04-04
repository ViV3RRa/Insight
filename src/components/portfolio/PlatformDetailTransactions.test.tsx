import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils'
import {
  PlatformDetailTransactions,
  type TransactionRow,
} from './PlatformDetailTransactions'

function buildTransaction(overrides: Partial<TransactionRow> = {}): TransactionRow {
  return {
    id: 'tx_1',
    date: 'Mar 15, 2026',
    type: 'deposit',
    amount: 10000,
    currency: 'DKK',
    ...overrides,
  }
}

const deposit = buildTransaction()

const withdrawal = buildTransaction({
  id: 'tx_2',
  date: 'Mar 10, 2026',
  type: 'withdrawal',
  amount: 5000,
  note: 'Monthly withdrawal',
  attachmentUrl: 'https://example.com/receipt.pdf',
})

const eurDeposit = buildTransaction({
  id: 'tx_3',
  date: 'Mar 5, 2026',
  type: 'deposit',
  amount: 1000,
  amountDkk: 7460,
  currency: 'EUR',
  exchangeRate: 7.46,
})

const eurWithdrawal = buildTransaction({
  id: 'tx_4',
  date: 'Feb 20, 2026',
  type: 'withdrawal',
  amount: 500,
  amountDkk: 3730,
  currency: 'EUR',
  exchangeRate: 7.46,
})

const allTransactions = [deposit, withdrawal, eurDeposit, eurWithdrawal]

const defaultProps = {
  transactions: allTransactions,
  currency: 'DKK',
  showExchangeRate: false,
}

function expandSection() {
  const toggleButton = screen.getByRole('button', { name: /transactions/i })
  return userEvent.setup().click(toggleButton)
}

describe('PlatformDetailTransactions', () => {
  describe('CollapsibleSection', () => {
    it('is collapsed by default', () => {
      renderWithProviders(<PlatformDetailTransactions {...defaultProps} />)
      const toggle = screen.getByRole('button', { name: /transactions/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows "Transactions" title', () => {
      renderWithProviders(<PlatformDetailTransactions {...defaultProps} />)
      expect(screen.getByText('Transactions')).toBeInTheDocument()
    })

    it('shows count badge matching number of transactions', () => {
      renderWithProviders(<PlatformDetailTransactions {...defaultProps} />)
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('shows count 0 when no transactions', () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[]} />,
      )
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('expands to show table when clicked', async () => {
      renderWithProviders(<PlatformDetailTransactions {...defaultProps} />)
      await expandSection()
      const toggle = screen.getByRole('button', { name: /transactions/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('transaction type badges', () => {
    it('shows Deposit badge for deposit type', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[deposit]} />,
      )
      await expandSection()
      expect(screen.getByText('Deposit')).toBeInTheDocument()
    })

    it('shows Withdrawal badge for withdrawal type', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[withdrawal]} />,
      )
      await expandSection()
      expect(screen.getByText('Withdrawal')).toBeInTheDocument()
    })

    it('renders deposit badge with emerald styling', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[deposit]} />,
      )
      await expandSection()
      const badge = screen.getByText('Deposit')
      // The text is inside <span className="hidden sm:inline"> nested in the outer badge <span>
      const outerBadge = badge.parentElement
      expect(outerBadge?.className).toContain('emerald')
    })

    it('renders withdrawal badge with rose styling', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[withdrawal]} />,
      )
      await expandSection()
      const badge = screen.getByText('Withdrawal')
      const outerBadge = badge.parentElement
      expect(outerBadge?.className).toContain('rose')
    })
  })

  describe('amount column', () => {
    it('renders CurrencyDisplay with amount', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[deposit]} />,
      )
      await expandSection()
      expect(screen.getByText(/10\.000,00 DKK/)).toBeInTheDocument()
    })

    it('shows DKK equivalent for non-DKK transactions', async () => {
      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[eurDeposit]}
          currency="EUR"
          showExchangeRate
        />,
      )
      await expandSection()
      expect(screen.getByText(/1\.000,00 EUR/)).toBeInTheDocument()
      expect(screen.getByText(/7\.460,00 DKK/)).toBeInTheDocument()
    })
  })

  describe('exchange rate column', () => {
    it('is visible when showExchangeRate is true', async () => {
      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[eurDeposit]}
          currency="EUR"
          showExchangeRate
        />,
      )
      await expandSection()
      expect(screen.getByText('Exchange Rate')).toBeInTheDocument()
      expect(screen.getByText('7,4600')).toBeInTheDocument()
    })

    it('is hidden when showExchangeRate is false', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[eurDeposit]} />,
      )
      await expandSection()
      expect(screen.queryByText('Exchange Rate')).not.toBeInTheDocument()
    })

    it('formats exchange rate with 4 decimals', async () => {
      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[eurDeposit]}
          currency="EUR"
          showExchangeRate
        />,
      )
      await expandSection()
      const rate = screen.getByText('7,4600')
      expect(rate.className).toContain('font-mono-data')
      expect(rate.className).toContain('text-base-500')
    })
  })

  describe('note column', () => {
    it('displays note as italic muted text', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[withdrawal]} />,
      )
      await expandSection()
      const note = screen.getByText('Monthly withdrawal')
      expect(note.className).toContain('italic')
      expect(note.className).toContain('text-xs')
      expect(note.className).toContain('text-base-300')
    })

    it('shows dash when no note', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[deposit]} />,
      )
      await expandSection()
      // Note column shows "—" for items without notes
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('attachment column', () => {
    it('shows Paperclip icon when attachmentUrl present', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[withdrawal]} />,
      )
      await expandSection()
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', 'https://example.com/receipt.pdf')
    })

    it('shows dash when no attachment', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[deposit]} />,
      )
      await expandSection()
      // Attachment column shows "—" for items without attachments
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('callbacks', () => {
    it('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[deposit]}
          onEdit={onEdit}
        />,
      )
      await expandSection()
      const editBtn = screen.getByRole('button', { name: 'Edit' })
      await user.click(editBtn)
      expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx_1' }))
    })

    it('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[deposit]}
          onDelete={onDelete}
        />,
      )
      await expandSection()
      const deleteBtn = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteBtn)
      expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx_1' }))
    })

    it('calls onAdd when add button is clicked', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[deposit]}
          onAdd={onAdd}
        />,
      )
      await expandSection()
      const addBtn = screen.getByText('+ Add Transaction')
      await user.click(addBtn)
      expect(onAdd).toHaveBeenCalledOnce()
    })
  })

  describe('loading state', () => {
    it('renders skeleton when loading', async () => {
      const { container } = renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} isLoading />,
      )
      await expandSection()
      const skeleton = container.querySelector('[aria-hidden="true"]')
      expect(skeleton).toBeInTheDocument()
    })

    it('does not render table rows when loading', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} isLoading />,
      )
      await expandSection()
      expect(screen.queryByText('Deposit')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('renders empty state when no transactions', async () => {
      renderWithProviders(
        <PlatformDetailTransactions {...defaultProps} transactions={[]} />,
      )
      await expandSection()
      expect(screen.getByText(/No transactions recorded yet/)).toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('sorts rows by date descending', async () => {
      const txA = buildTransaction({ id: 'tx_a', date: '2026-01-01' })
      const txB = buildTransaction({ id: 'tx_b', date: '2026-03-15' })
      const txC = buildTransaction({ id: 'tx_c', date: '2026-02-10' })

      renderWithProviders(
        <PlatformDetailTransactions
          {...defaultProps}
          transactions={[txA, txB, txC]}
        />,
      )
      await expandSection()

      const rows = screen.getAllByRole('row')
      // First row is the header, then data rows in sorted order
      const dataRows = rows.slice(1)
      expect(dataRows).toHaveLength(3)

      // Check that the dates appear in descending order within the rows
      const firstRowText = dataRows[0]?.textContent ?? ''
      const lastRowText = dataRows[2]?.textContent ?? ''
      expect(firstRowText).toContain('2026-03-15')
      expect(lastRowText).toContain('2026-01-01')
    })
  })
})
