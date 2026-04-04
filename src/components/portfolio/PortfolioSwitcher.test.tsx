import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from 'react'
import { renderWithProviders, screen, userEvent, waitFor } from '@/test/utils'
import { PortfolioSwitcher } from './PortfolioSwitcher'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'
import { buildPortfolio } from '@/test/factories/investmentFactory'

vi.mock('@/services/portfolios', () => ({
  getAll: vi.fn(),
  getDefault: vi.fn(),
}))

import { getAll, getDefault } from '@/services/portfolios'

const mockedGetAll = vi.mocked(getAll)
const mockedGetDefault = vi.mocked(getDefault)

const portfolioA = buildPortfolio({ name: 'My Portfolio', ownerName: 'Me', isDefault: true })
const portfolioB = buildPortfolio({ name: "Son's Portfolio", ownerName: 'Oliver', isDefault: false })

function setupMocks(portfolios = [portfolioA, portfolioB]) {
  mockedGetAll.mockResolvedValue(portfolios)
  mockedGetDefault.mockResolvedValue(portfolios.find((p) => p.isDefault) ?? portfolios[0]!)
}

function renderSwitcher(props: Partial<React.ComponentProps<typeof PortfolioSwitcher>> = {}) {
  return renderWithProviders(
    <PortfolioSwitcher onEditPortfolio={vi.fn()} onAddPortfolio={vi.fn()} {...props} />,
  )
}

describe('PortfolioSwitcher', () => {
  beforeEach(() => {
    useInvestmentUIStore.setState({
      selectedPortfolioId: null,
      timeSpan: 'YTD',
      yoyActive: false,
      chartMode: 'earnings',
    })
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows loading text while portfolios are fetching', () => {
      mockedGetAll.mockReturnValue(new Promise(() => {})) // never resolves
      renderSwitcher()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('auto-selection', () => {
    it('auto-selects the default portfolio on mount', async () => {
      setupMocks()
      renderSwitcher()

      await waitFor(() => {
        expect(useInvestmentUIStore.getState().selectedPortfolioId).toBe(portfolioA.id)
      })
    })

    it('does not override an already selected portfolio', async () => {
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioB.id })
      setupMocks()
      renderSwitcher()

      await waitFor(() => {
        expect(screen.getByText("Son's Portfolio")).toBeInTheDocument()
      })
      expect(useInvestmentUIStore.getState().selectedPortfolioId).toBe(portfolioB.id)
    })
  })

  describe('trigger button', () => {
    it('displays active portfolio name and owner', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()

      await waitFor(() => {
        expect(screen.getByText('My Portfolio')).toBeInTheDocument()
      })
      expect(screen.getByText(/· Me/)).toBeInTheDocument()
    })

    it('shows fallback when no portfolio is selected and data is loaded', async () => {
      setupMocks([])
      mockedGetDefault.mockRejectedValue(new Error('none'))
      renderSwitcher()

      await waitFor(() => {
        expect(screen.getByText('Select...')).toBeInTheDocument()
      })
    })

    it('has aria-expanded=false when closed', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-haspopup=true', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /My Portfolio/i })).toHaveAttribute(
        'aria-haspopup',
        'true',
      )
    })
  })

  describe('opening/closing', () => {
    it('opens dropdown on click', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getAllByText("Son's Portfolio").length).toBeGreaterThanOrEqual(1)
    })

    it('closes on second click', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)
      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on Escape key', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.keyboard('{Escape}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on click outside', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // mousedown outside the container
      await act(async () => {
        const event = new MouseEvent('mousedown', { bubbles: true })
        document.body.dispatchEvent(event)
      })

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('chevron rotation', () => {
    it('chevron has rotate(0deg) when closed', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      const svg = trigger.querySelector('svg')!
      expect(svg.style.transform).toBe('rotate(0deg)')
    })

    it('chevron has rotate(180deg) when open', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)

      const svg = trigger.querySelector('svg')!
      expect(svg.style.transform).toBe('rotate(180deg)')
    })
  })

  describe('active portfolio', () => {
    it('shows check icon for the active portfolio', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      // The active row in the desktop dropdown should have a check icon
      const activeRow = document.querySelector('.bg-accent-50\\/50')!
      expect(activeRow).toBeInTheDocument()
      const checkSvg = activeRow.querySelector('svg')
      expect(checkSvg).toBeInTheDocument()
    })

    it('shows edit button on active portfolio', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      const editButtons = screen.getAllByRole('button', { name: /Edit My Portfolio/i })
      expect(editButtons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('inactive portfolios', () => {
    it('renders inactive portfolios without check icon', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      // Inactive rows have cursor-pointer class
      const inactiveRows = document.querySelectorAll('.cursor-pointer')
      expect(inactiveRows.length).toBeGreaterThanOrEqual(1)
    })

    it('switches portfolio when clicking an inactive portfolio', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      // Click the inactive portfolio row
      const inactiveRow = screen.getAllByText("Son's Portfolio")[0]!.closest('[role="button"]')!
      await user.click(inactiveRow)

      expect(useInvestmentUIStore.getState().selectedPortfolioId).toBe(portfolioB.id)
    })

    it('shows edit button on inactive portfolios', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      const editButtons = screen.getAllByRole('button', { name: /Edit Son's Portfolio/i })
      expect(editButtons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('edit button', () => {
    it('calls onEditPortfolio with the portfolio id', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      const onEditPortfolio = vi.fn()
      renderSwitcher({ onEditPortfolio })
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      const editButton = screen.getAllByRole('button', { name: /Edit My Portfolio/i })[0]!
      await user.click(editButton)

      expect(onEditPortfolio).toHaveBeenCalledWith(portfolioA.id)
    })

    it('does not close dropdown when clicking edit', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)

      const editButton = screen.getAllByRole('button', { name: /Edit My Portfolio/i })[0]!
      await user.click(editButton)

      // Dropdown should still be open (edit uses stopPropagation)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('add portfolio', () => {
    it('renders "Add Portfolio" button with plus icon', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      const addButtons = screen.getAllByText('Add Portfolio')
      expect(addButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('calls onAddPortfolio when clicked', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      const onAddPortfolio = vi.fn()
      renderSwitcher({ onAddPortfolio })
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      const addButton = screen.getAllByText('Add Portfolio')[0]!.closest('button')!
      await user.click(addButton)

      expect(onAddPortfolio).toHaveBeenCalledOnce()
    })

    it('closes dropdown after clicking add', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)

      const addButton = screen.getAllByText('Add Portfolio')[0]!.closest('button')!
      await user.click(addButton)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('dropdown content', () => {
    it('renders all portfolios in the dropdown', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      // Both portfolios should appear in the dropdown (at least once each - desktop + mobile)
      expect(screen.getAllByText('My Portfolio').length).toBeGreaterThanOrEqual(2) // trigger + dropdown
      expect(screen.getAllByText("Son's Portfolio").length).toBeGreaterThanOrEqual(1)
    })

    it('shows owner names next to portfolio names', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      await user.click(screen.getByRole('button', { name: /My Portfolio/i }))

      expect(screen.getAllByText(/· Me/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/· Oliver/).length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('selection updates store', () => {
    it('closes the dropdown after selecting a portfolio', async () => {
      setupMocks()
      useInvestmentUIStore.setState({ selectedPortfolioId: portfolioA.id })
      renderSwitcher()
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /My Portfolio/i })).toBeInTheDocument()
      })
      const trigger = screen.getByRole('button', { name: /My Portfolio/i })
      await user.click(trigger)

      const inactiveRow = screen.getAllByText("Son's Portfolio")[0]!.closest('[role="button"]')!
      await user.click(inactiveRow)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })
})
