import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../../test/utils'
import { PortfolioOverviewClosed } from './PortfolioOverviewClosed'

const mockClosedPlatforms = [
  {
    id: 'p1',
    name: 'Bondora',
    iconUrl: 'https://example.com/bondora.png',
    finalValue: 15000,
    allTimeGainLoss: 3500,
    allTimeGainLossPercent: 23.33,
    closedDate: '2024-06-15',
  },
  {
    id: 'p2',
    name: 'Mintos',
    finalValue: 8000,
    allTimeGainLoss: -1200,
    allTimeGainLossPercent: -15.0,
    closedDate: '2023-11-30',
  },
  {
    id: 'p3',
    name: 'Crowdestor',
    finalValue: 0,
    allTimeGainLoss: 0,
    allTimeGainLossPercent: 0,
    closedDate: '2024-01-10',
  },
]

describe('PortfolioOverviewClosed', () => {
  it('returns null when no closed platforms and not loading', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={[]} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders when loading even with empty platforms', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={[]} isLoading />,
    )

    expect(screen.getByText('Closed Platforms')).toBeInTheDocument()
  })

  it('shows section header with "Closed Platforms" text', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    expect(
      screen.getByRole('heading', { name: 'Closed Platforms' }),
    ).toBeInTheDocument()
  })

  it('shows count badge with the number of closed platforms', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('wrapper has opacity-60 class', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    const section = screen.getByTestId('closed-platforms-section')
    expect(section.className).toContain('opacity-60')
  })

  it('wrapper has hover:opacity-80 for transition', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    const section = screen.getByTestId('closed-platforms-section')
    expect(section.className).toContain('hover:opacity-80')
    expect(section.className).toContain('transition-opacity')
  })

  it('renders 4 column headers: Platform, Final Value, Gain/Loss, Closed', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Final Value')).toBeInTheDocument()
    // Gain/Loss appears both in desktop header and mobile cycler
    expect(screen.getAllByText('Gain/Loss').length).toBeGreaterThanOrEqual(1)
    // Closed appears in desktop header
    expect(screen.getAllByText('Closed').length).toBeGreaterThanOrEqual(1)
  })

  it('renders platform names with muted text color', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    const bondoraName = screen.getByText('Bondora')
    expect(bondoraName.className).toContain('text-base-700')

    const mintosName = screen.getByText('Mintos')
    expect(mintosName.className).toContain('text-base-700')
  })

  it('renders platform icons', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // Bondora has an imageUrl — should have an img
    expect(screen.getByAltText('Bondora')).toBeInTheDocument()
    // Mintos has no iconUrl — should show fallback initial
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('renders final value formatted as DKK currency', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // 15000 → "15.000,00 DKK"
    expect(screen.getByText('15.000,00 DKK')).toBeInTheDocument()
    // 8000 → "8.000,00 DKK"
    expect(screen.getByText('8.000,00 DKK')).toBeInTheDocument()
  })

  it('colors positive gain/loss with emerald', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // Bondora has +3500 gain
    const positiveGains = screen.getAllByText('3.500,00 DKK')
    const emeraldSpan = positiveGains.find((el) =>
      el.className?.includes('text-emerald'),
    )
    expect(emeraldSpan).toBeDefined()
  })

  it('colors negative gain/loss with rose', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // Mintos has -1200 loss
    const negativeGains = screen.getAllByText('-1.200,00 DKK')
    const roseSpan = negativeGains.find((el) =>
      el.className?.includes('text-rose'),
    )
    expect(roseSpan).toBeDefined()
  })

  it('renders gain/loss percentage', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // Bondora: 23.33%
    const positivePercents = screen.getAllByText('23,33%')
    expect(positivePercents.length).toBeGreaterThanOrEqual(1)

    // Mintos: -15.00%
    const negativePercents = screen.getAllByText('-15,00%')
    expect(negativePercents.length).toBeGreaterThanOrEqual(1)
  })

  it('renders closed date formatted as human date', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // "2024-06-15" → "Jun 15, 2024"
    const junDates = screen.getAllByText('Jun 15, 2024')
    expect(junDates.length).toBeGreaterThanOrEqual(1)

    // "2023-11-30" → "Nov 30, 2023"
    const novDates = screen.getAllByText('Nov 30, 2023')
    expect(novDates.length).toBeGreaterThanOrEqual(1)
  })

  it('calls onRowClick with platform id when row clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    renderWithProviders(
      <PortfolioOverviewClosed
        closedPlatforms={mockClosedPlatforms}
        onRowClick={handleClick}
      />,
    )

    await user.click(screen.getByText('Bondora'))
    expect(handleClick).toHaveBeenCalledWith('p1')

    await user.click(screen.getByText('Mintos'))
    expect(handleClick).toHaveBeenCalledWith('p2')
  })

  it('rows have cursor-pointer when onRowClick provided', () => {
    renderWithProviders(
      <PortfolioOverviewClosed
        closedPlatforms={mockClosedPlatforms}
        onRowClick={vi.fn()}
      />,
    )

    const row = screen.getByText('Bondora').closest('tr')
    expect(row?.className).toContain('cursor-pointer')
  })

  it('rows do not have cursor-pointer when onRowClick not provided', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    const row = screen.getByText('Bondora').closest('tr')
    expect(row?.className).not.toContain('cursor-pointer')
  })

  it('renders loading state with skeleton rows inside muted wrapper', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={[]} isLoading />,
    )

    const section = screen.getByTestId('closed-platforms-section')
    expect(section.className).toContain('opacity-60')

    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThan(0)

    // Table should not be rendered in loading state
    expect(container.querySelector('table')).not.toBeInTheDocument()
  })

  it('does not render table during loading', () => {
    const { container } = renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={[]} isLoading />,
    )

    expect(container.querySelector('table')).toBeNull()
  })

  it('mobile cycler header shows Gain/Loss as default active column', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // The MobileColumnCyclerHeader renders a button with the active column label
    // Default index 0 = "Gain/Loss"
    const cyclerButton = screen.getByRole('button')
    expect(cyclerButton).toHaveTextContent('Gain/Loss')
  })

  it('mobile cycler switches to Closed column on click', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    const cyclerButton = screen.getByRole('button')
    expect(cyclerButton).toHaveTextContent('Gain/Loss')

    await user.click(cyclerButton)
    expect(cyclerButton).toHaveTextContent('Closed')
  })

  it('mobile cycler wraps back to Gain/Loss after Closed', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    const cyclerButton = screen.getByRole('button')

    await user.click(cyclerButton) // → Closed
    await user.click(cyclerButton) // → Gain/Loss
    expect(cyclerButton).toHaveTextContent('Gain/Loss')
  })

  it('renders zero gain/loss without emerald or rose coloring', () => {
    renderWithProviders(
      <PortfolioOverviewClosed closedPlatforms={mockClosedPlatforms} />,
    )

    // Crowdestor has 0 gain/loss — "0,00 DKK" with neutral color
    const zeroGains = screen.getAllByText('0,00 DKK')
    const neutralSpan = zeroGains.find(
      (el) =>
        !el.className?.includes('text-emerald') &&
        !el.className?.includes('text-rose'),
    )
    expect(neutralSpan).toBeDefined()
  })
})
