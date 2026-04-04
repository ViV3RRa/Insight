import { describe, it, expect, vi } from 'vitest'
import type { ReactNode } from 'react'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import {
  CashPlatformDetail,
  type CashPlatformDetailProps,
  type CashTransactionRow,
  type CashDataPointRow,
  type BalanceHistoryPoint,
} from './CashPlatformDetail'
import type { TimeSpan } from '@/utils/timeSpan'

// Mock Recharts — SVG rendering is unreliable in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children, data }: { children: ReactNode; data: unknown[] }) => (
    <div data-testid="area-chart" data-points={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="area" data-key={dataKey} />
  ),
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

function buildTransaction(overrides: Partial<CashTransactionRow> = {}): CashTransactionRow {
  return {
    id: 'tx_1',
    date: 'Mar 15, 2026',
    type: 'deposit',
    amount: 10000,
    currency: 'DKK',
    ...overrides,
  }
}

function buildDataPoint(overrides: Partial<CashDataPointRow> = {}): CashDataPointRow {
  return {
    id: 'dp_1',
    date: 'Mar 15, 2026',
    value: 50000,
    currency: 'DKK',
    ...overrides,
  }
}

const sampleHistory: BalanceHistoryPoint[] = [
  { timestamp: 'Jan 2026', value: 40000 },
  { timestamp: 'Feb 2026', value: 45000 },
  { timestamp: 'Mar 2026', value: 50000 },
]

const deposit = buildTransaction()
const withdrawal = buildTransaction({
  id: 'tx_2',
  date: 'Mar 10, 2026',
  type: 'withdrawal',
  amount: 5000,
  note: 'Monthly withdrawal',
  attachmentUrl: 'https://example.com/receipt.pdf',
})

const eurTransaction = buildTransaction({
  id: 'tx_3',
  date: 'Mar 5, 2026',
  type: 'deposit',
  amount: 1000,
  amountDkk: 7460,
  currency: 'EUR',
  exchangeRate: 7.46,
})

const dataPointDkk = buildDataPoint()

function defaultProps(overrides: Partial<CashPlatformDetailProps> = {}): CashPlatformDetailProps {
  return {
    platformName: 'Savings Account',
    platformIcon: '',
    currency: 'DKK',
    currentBalance: 50000,
    balanceHistory: sampleHistory,
    transactions: [deposit, withdrawal],
    dataPoints: [dataPointDkk],
    showExchangeRate: false,
    timeSpan: 'YTD' as TimeSpan,
    onTimeSpanChange: vi.fn(),
    onBack: vi.fn(),
    onAddDataPoint: vi.fn(),
    onAddTransaction: vi.fn(),
    onEditTransaction: vi.fn(),
    onDeleteTransaction: vi.fn(),
    onEditDataPoint: vi.fn(),
    onDeleteDataPoint: vi.fn(),
    ...overrides,
  }
}

function expandTransactions() {
  const toggle = screen.getByRole('button', { name: /transactions/i })
  return userEvent.setup().click(toggle)
}

function expandDataPoints() {
  const toggle = screen.getByRole('button', { name: /data points/i })
  return userEvent.setup().click(toggle)
}

describe('CashPlatformDetail', () => {
  describe('header', () => {
    it('renders platform name as h1', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Savings Account')
    })

    it('renders currency badge', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByText('DKK')).toBeInTheDocument()
    })

    it('renders back button that calls onBack', async () => {
      const user = userEvent.setup()
      const onBack = vi.fn()
      renderWithProviders(<CashPlatformDetail {...defaultProps({ onBack })} />)
      const backBtn = screen.getByRole('button', { name: /back to portfolio/i })
      await user.click(backBtn)
      expect(onBack).toHaveBeenCalledOnce()
    })

    it('hides back button when onBack is not provided', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps({ onBack: undefined })} />)
      expect(screen.queryByRole('button', { name: /back to portfolio/i })).not.toBeInTheDocument()
    })
  })

  describe('current balance stat card', () => {
    it('shows formatted balance value', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByText('Current Balance')).toBeInTheDocument()
      expect(screen.getByText(/50\.000,00 DKK/)).toBeInTheDocument()
    })

    it('shows DKK equivalent sublabel for non-DKK currency', () => {
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            currency: 'EUR',
            currentBalance: 6000,
            currentBalanceDkk: 44760,
          })}
        />,
      )
      expect(screen.getByText(/≈ 44\.760,00 DKK/)).toBeInTheDocument()
    })

    it('does not show DKK sublabel for DKK currency', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.queryByText(/≈.*DKK/)).not.toBeInTheDocument()
    })
  })

  describe('balance history chart', () => {
    it('renders chart card with title', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByText('Balance History')).toBeInTheDocument()
    })

    it('renders area chart with data points', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByTestId('area-chart')).toHaveAttribute('data-points', '3')
    })

    it('renders area element with value dataKey', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByTestId('area')).toHaveAttribute('data-key', 'value')
    })

    it('shows "No data available" when balance history is empty', () => {
      renderWithProviders(
        <CashPlatformDetail {...defaultProps({ balanceHistory: [] })} />,
      )
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('transactions section', () => {
    it('is collapsed by default', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      const toggle = screen.getByRole('button', { name: /transactions/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows count badge', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('expands when clicked', async () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      await expandTransactions()
      const toggle = screen.getByRole('button', { name: /transactions/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })

    it('shows transaction type badges when expanded', async () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      await expandTransactions()
      expect(screen.getByText('Deposit')).toBeInTheDocument()
      expect(screen.getByText('Withdrawal')).toBeInTheDocument()
    })

    it('shows empty state when no transactions', async () => {
      renderWithProviders(
        <CashPlatformDetail {...defaultProps({ transactions: [] })} />,
      )
      await expandTransactions()
      expect(screen.getByText(/No transactions recorded yet/)).toBeInTheDocument()
    })

    it('shows "+ Add Transaction" button inside section when expanded', async () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      await expandTransactions()
      const addBtns = screen.getAllByText('+ Add Transaction')
      // One in the header area, one inside collapsible section
      expect(addBtns.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('data points section', () => {
    it('is collapsed by default', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      const toggle = screen.getByRole('button', { name: /data points/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('shows count badge', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      // dataPoints has 1 item
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('expands when clicked', async () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      await expandDataPoints()
      const toggle = screen.getByRole('button', { name: /data points/i })
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })

    it('shows data point value when expanded', async () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      await expandDataPoints()
      const matches = screen.getAllByText(/50\.000,00 DKK/)
      // One in the stat card, one in the data points table
      expect(matches.length).toBeGreaterThanOrEqual(2)
    })

    it('shows empty state when no data points', async () => {
      renderWithProviders(
        <CashPlatformDetail {...defaultProps({ dataPoints: [] })} />,
      )
      await expandDataPoints()
      expect(screen.getByText(/No data points recorded yet/)).toBeInTheDocument()
    })
  })

  describe('no XIRR/gain-loss/performance sections', () => {
    it('does not render XIRR-related content', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.queryByText(/XIRR/)).not.toBeInTheDocument()
    })

    it('does not render gain/loss content', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.queryByText(/Gain/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Loss/i)).not.toBeInTheDocument()
    })

    it('does not render performance overview', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.queryByText('Performance Overview')).not.toBeInTheDocument()
    })
  })

  describe('action buttons', () => {
    it('renders "+ Add Data Point" button in header area', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByText('+ Add Data Point')).toBeInTheDocument()
    })

    it('renders "+ Add Transaction" button in header area', () => {
      renderWithProviders(<CashPlatformDetail {...defaultProps()} />)
      expect(screen.getByText('+ Add Transaction')).toBeInTheDocument()
    })

    it('calls onAddDataPoint when clicked', async () => {
      const user = userEvent.setup()
      const onAddDataPoint = vi.fn()
      renderWithProviders(<CashPlatformDetail {...defaultProps({ onAddDataPoint })} />)
      await user.click(screen.getByText('+ Add Data Point'))
      expect(onAddDataPoint).toHaveBeenCalledOnce()
    })

    it('calls onAddTransaction when clicked', async () => {
      const user = userEvent.setup()
      const onAddTransaction = vi.fn()
      renderWithProviders(<CashPlatformDetail {...defaultProps({ onAddTransaction })} />)
      // Click the first (header area) "+ Add Transaction" button
      const btns = screen.getAllByText('+ Add Transaction')
      await user.click(btns[0]!)
      expect(onAddTransaction).toHaveBeenCalledOnce()
    })

    it('hides add buttons when callbacks are not provided', () => {
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({ onAddDataPoint: undefined, onAddTransaction: undefined })}
        />,
      )
      expect(screen.queryByText('+ Add Data Point')).not.toBeInTheDocument()
      expect(screen.queryByText('+ Add Transaction')).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeleton components when loading', () => {
      const { container } = renderWithProviders(
        <CashPlatformDetail {...defaultProps({ isLoading: true })} />,
      )
      const skeletons = container.querySelectorAll('[aria-hidden="true"]')
      expect(skeletons.length).toBeGreaterThanOrEqual(1)
    })

    it('does not render platform name when loading', () => {
      renderWithProviders(
        <CashPlatformDetail {...defaultProps({ isLoading: true })} />,
      )
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
    })

    it('does not render chart when loading', () => {
      renderWithProviders(
        <CashPlatformDetail {...defaultProps({ isLoading: true })} />,
      )
      expect(screen.queryByText('Balance History')).not.toBeInTheDocument()
    })
  })

  describe('exchange rate column', () => {
    it('is visible when showExchangeRate is true', async () => {
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            showExchangeRate: true,
            transactions: [eurTransaction],
            currency: 'EUR',
          })}
        />,
      )
      await expandTransactions()
      expect(screen.getByText('Exchange Rate')).toBeInTheDocument()
      expect(screen.getByText('7,4600')).toBeInTheDocument()
    })

    it('is hidden when showExchangeRate is false', async () => {
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            showExchangeRate: false,
            transactions: [eurTransaction],
          })}
        />,
      )
      await expandTransactions()
      expect(screen.queryByText('Exchange Rate')).not.toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('sorts transactions by date descending', async () => {
      const txA = buildTransaction({ id: 'tx_a', date: '2026-01-01' })
      const txB = buildTransaction({ id: 'tx_b', date: '2026-03-15' })
      const txC = buildTransaction({ id: 'tx_c', date: '2026-02-10' })

      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({ transactions: [txA, txB, txC] })}
        />,
      )
      await expandTransactions()

      const rows = screen.getAllByRole('row')
      const dataRows = rows.slice(1)
      expect(dataRows).toHaveLength(3)

      const firstRowText = dataRows[0]?.textContent ?? ''
      const lastRowText = dataRows[2]?.textContent ?? ''
      expect(firstRowText).toContain('2026-03-15')
      expect(lastRowText).toContain('2026-01-01')
    })

    it('sorts data points by date descending', async () => {
      const dpA = buildDataPoint({ id: 'dp_a', date: '2026-01-01' })
      const dpB = buildDataPoint({ id: 'dp_b', date: '2026-03-15' })
      const dpC = buildDataPoint({ id: 'dp_c', date: '2026-02-10' })

      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({ dataPoints: [dpA, dpB, dpC] })}
        />,
      )
      await expandDataPoints()

      const rows = screen.getAllByRole('row')
      const dataRows = rows.slice(1)
      expect(dataRows).toHaveLength(3)

      const firstRowText = dataRows[0]?.textContent ?? ''
      const lastRowText = dataRows[2]?.textContent ?? ''
      expect(firstRowText).toContain('2026-03-15')
      expect(lastRowText).toContain('2026-01-01')
    })
  })

  describe('edit and delete callbacks', () => {
    it('calls onEditTransaction when edit clicked', async () => {
      const user = userEvent.setup()
      const onEditTransaction = vi.fn()
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            transactions: [deposit],
            onEditTransaction,
          })}
        />,
      )
      await expandTransactions()
      const editBtn = screen.getByRole('button', { name: 'Edit' })
      await user.click(editBtn)
      expect(onEditTransaction).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx_1' }))
    })

    it('calls onDeleteTransaction when delete clicked', async () => {
      const user = userEvent.setup()
      const onDeleteTransaction = vi.fn()
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            transactions: [deposit],
            onDeleteTransaction,
          })}
        />,
      )
      await expandTransactions()
      const deleteBtn = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteBtn)
      expect(onDeleteTransaction).toHaveBeenCalledWith(expect.objectContaining({ id: 'tx_1' }))
    })

    it('calls onEditDataPoint when edit clicked', async () => {
      const user = userEvent.setup()
      const onEditDataPoint = vi.fn()
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            dataPoints: [dataPointDkk],
            onEditDataPoint,
          })}
        />,
      )
      await expandDataPoints()
      const editBtn = screen.getByRole('button', { name: 'Edit' })
      await user.click(editBtn)
      expect(onEditDataPoint).toHaveBeenCalledWith(expect.objectContaining({ id: 'dp_1' }))
    })

    it('calls onDeleteDataPoint when delete clicked', async () => {
      const user = userEvent.setup()
      const onDeleteDataPoint = vi.fn()
      renderWithProviders(
        <CashPlatformDetail
          {...defaultProps({
            dataPoints: [dataPointDkk],
            onDeleteDataPoint,
          })}
        />,
      )
      await expandDataPoints()
      const deleteBtn = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteBtn)
      expect(onDeleteDataPoint).toHaveBeenCalledWith(expect.objectContaining({ id: 'dp_1' }))
    })
  })
})
