import { describe, it, expect, vi } from 'vitest'
import { act } from 'react'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import {
  PlatformDetailSwitcher,
  type PlatformDetailSwitcherProps,
  type PlatformSwitcherItem,
} from './PlatformDetailSwitcher'

const investmentDKK: PlatformSwitcherItem = {
  id: 'p1',
  name: 'Nordnet',
  type: 'investment',
  currency: 'DKK',
  currentValue: 842391,
  returnPercent: 11.8,
}

const investmentEUR: PlatformSwitcherItem = {
  id: 'p2',
  name: 'Mintos',
  type: 'investment',
  currency: 'EUR',
  currentValue: 58924,
  returnPercent: -18.3,
  staleness: 'critical',
}

const cashEUR: PlatformSwitcherItem = {
  id: 'p3',
  name: 'Revolut',
  type: 'cash',
  currency: 'EUR',
  currentValue: 36750,
}

const closedDKK: PlatformSwitcherItem = {
  id: 'p4',
  name: 'Old Fund',
  type: 'closed',
  currency: 'DKK',
  currentValue: 0,
}

const allPlatforms = [investmentDKK, investmentEUR, cashEUR, closedDKK]

function createProps(
  overrides: Partial<PlatformDetailSwitcherProps> = {},
): PlatformDetailSwitcherProps {
  return {
    currentPlatformId: 'p1',
    currentPlatformName: 'Nordnet',
    platforms: allPlatforms,
    totalPortfolioValue: 1759504,
    onSelect: vi.fn(),
    onOverviewClick: vi.fn(),
    onEditPlatform: vi.fn(),
    ...overrides,
  }
}

async function renderAndOpen(overrides: Partial<PlatformDetailSwitcherProps> = {}) {
  const props = createProps(overrides)
  const result = renderWithProviders(<PlatformDetailSwitcher {...props} />)
  const user = userEvent.setup()
  const trigger = screen.getByRole('button', {
    name: new RegExp(props.currentPlatformName, 'i'),
  })
  await user.click(trigger)
  return { ...result, user, trigger, props }
}

describe('PlatformDetailSwitcher', () => {
  describe('trigger', () => {
    it('renders with current platform name', () => {
      renderWithProviders(<PlatformDetailSwitcher {...createProps()} />)
      expect(screen.getByRole('button', { name: /Nordnet/i })).toBeInTheDocument()
    })

    it('shows chevron icon', () => {
      renderWithProviders(<PlatformDetailSwitcher {...createProps()} />)
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      const svg = trigger.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('has aria-expanded=false when closed', () => {
      renderWithProviders(<PlatformDetailSwitcher {...createProps()} />)
      expect(screen.getByRole('button', { name: /Nordnet/i })).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    })

    it('has aria-expanded=true when open', async () => {
      const { trigger } = await renderAndOpen()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('has aria-haspopup=true', () => {
      renderWithProviders(<PlatformDetailSwitcher {...createProps()} />)
      expect(screen.getByRole('button', { name: /Nordnet/i })).toHaveAttribute(
        'aria-haspopup',
        'true',
      )
    })

    it('chevron points down when closed', () => {
      renderWithProviders(<PlatformDetailSwitcher {...createProps()} />)
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      const svg = trigger.querySelector('svg')!
      expect(svg.style.transform).toBe('rotate(0deg)')
    })

    it('chevron rotates up when open', async () => {
      const { trigger } = await renderAndOpen()
      const svg = trigger.querySelector('svg')!
      expect(svg.style.transform).toBe('rotate(180deg)')
    })
  })

  describe('opening/closing', () => {
    it('opens dropdown on click', async () => {
      await renderAndOpen()
      expect(screen.getAllByText('Portfolio Overview').length).toBeGreaterThanOrEqual(1)
    })

    it('closes on second click', async () => {
      const { user, trigger } = await renderAndOpen()
      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on Escape key', async () => {
      const { user, trigger } = await renderAndOpen()
      await user.keyboard('{Escape}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on click outside', async () => {
      const { trigger } = await renderAndOpen()
      await act(async () => {
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Portfolio Overview link', () => {
    it('renders at the top of dropdown', async () => {
      await renderAndOpen()
      expect(screen.getAllByText('Portfolio Overview').length).toBeGreaterThanOrEqual(1)
    })

    it('shows total portfolio value in DKK', async () => {
      await renderAndOpen()
      expect(screen.getAllByText(/1.*759.*504.*DKK/).length).toBeGreaterThanOrEqual(1)
    })

    it('fires onOverviewClick when clicked', async () => {
      const { user, props } = await renderAndOpen()
      const overviewBtn = screen.getAllByText('Portfolio Overview')[0]!.closest('button')!
      await user.click(overviewBtn)
      expect(props.onOverviewClick).toHaveBeenCalledOnce()
    })

    it('closes dropdown when overview is clicked', async () => {
      const { user, trigger } = await renderAndOpen()
      const overviewBtn = screen.getAllByText('Portfolio Overview')[0]!.closest('button')!
      await user.click(overviewBtn)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not show value when totalPortfolioValue is not provided', async () => {
      await renderAndOpen({ totalPortfolioValue: undefined })
      const overviewBtn = screen.getAllByText('Portfolio Overview')[0]!.closest('button')!
      expect(overviewBtn.textContent).not.toMatch(/DKK/)
    })
  })

  describe('section headers', () => {
    it('renders Active Platforms section', async () => {
      await renderAndOpen()
      expect(screen.getAllByText('Active Platforms').length).toBeGreaterThanOrEqual(1)
    })

    it('renders Cash Accounts section', async () => {
      await renderAndOpen()
      expect(screen.getAllByText('Cash Accounts').length).toBeGreaterThanOrEqual(1)
    })

    it('renders Closed section when closed platforms exist', async () => {
      await renderAndOpen()
      // "Closed" appears as section label (in both desktop + mobile dropdowns)
      const closedHeaders = screen.getAllByText('Closed')
      expect(closedHeaders.length).toBeGreaterThanOrEqual(1)
    })

    it('omits Closed section when no closed platforms exist', async () => {
      await renderAndOpen({ platforms: [investmentDKK, cashEUR] })
      expect(screen.queryAllByText('Closed')).toHaveLength(0)
    })

    it('section headers use uppercase styling', async () => {
      await renderAndOpen()
      const header = screen.getAllByText('Active Platforms')[0]!
      expect(header.className).toContain('uppercase')
      expect(header.className).toContain('tracking-wider')
      expect(header.className).toContain('text-[10px]')
    })
  })

  describe('current platform highlighting', () => {
    it('highlights the current platform with accent background', async () => {
      await renderAndOpen()
      const activeItem = screen.getAllByTestId('platform-item-p1')[0]!
      expect(activeItem.className).toContain('bg-accent-50/50')
    })

    it('highlights the current platform with accent border', async () => {
      await renderAndOpen()
      const activeItem = screen.getAllByTestId('platform-item-p1')[0]!
      expect(activeItem.className).toContain('border-accent-600')
    })

    it('does not highlight non-current platforms', async () => {
      await renderAndOpen()
      const inactiveItem = screen.getAllByTestId('platform-item-p2')[0]!
      expect(inactiveItem.className).not.toContain('bg-accent-50/50')
      expect(inactiveItem.className).toContain('border-transparent')
    })
  })

  describe('platform selection', () => {
    it('fires onSelect with platform id when clicking a different platform', async () => {
      const { user, props } = await renderAndOpen()
      const mintosItem = screen.getAllByTestId('platform-item-p2')[0]!
      await user.click(mintosItem)
      expect(props.onSelect).toHaveBeenCalledWith('p2')
    })

    it('does not fire onSelect when clicking the current platform', async () => {
      const { user, props } = await renderAndOpen()
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      await user.click(nordnetItem)
      expect(props.onSelect).not.toHaveBeenCalled()
    })

    it('closes dropdown after selection', async () => {
      const { user, trigger } = await renderAndOpen()
      const mintosItem = screen.getAllByTestId('platform-item-p2')[0]!
      await user.click(mintosItem)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('investment items', () => {
    it('shows formatted value', async () => {
      await renderAndOpen()
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      // 842391 formatted as da-DK with 0 decimals
      expect(nordnetItem.textContent).toMatch(/842/)
    })

    it('shows return percent for investment items', async () => {
      await renderAndOpen()
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      // +11.8% (formatted as +11,8%)
      expect(nordnetItem.textContent).toMatch(/11[,.]8/)
    })

    it('colors positive return green', async () => {
      await renderAndOpen()
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      const returnEl = nordnetItem.querySelector('.text-emerald-600')
      expect(returnEl).toBeInTheDocument()
    })

    it('colors negative return red', async () => {
      await renderAndOpen()
      const mintosItem = screen.getAllByTestId('platform-item-p2')[0]!
      const returnEl = mintosItem.querySelector('.text-rose-500')
      expect(returnEl).toBeInTheDocument()
    })
  })

  describe('cash items', () => {
    it('shows value without return percent', async () => {
      await renderAndOpen()
      const revolutItem = screen.getAllByTestId('platform-item-p3')[0]!
      const valueContainer = revolutItem.querySelector('.text-right')!
      // Should have only one font-mono-data element (value, no return %)
      const monoElements = valueContainer.querySelectorAll('.font-mono-data')
      expect(monoElements).toHaveLength(1)
    })

    it('shows currency badge below name', async () => {
      await renderAndOpen()
      const revolutItem = screen.getAllByTestId('platform-item-p3')[0]!
      expect(revolutItem.textContent).toContain('EUR')
    })
  })

  describe('non-DKK currency suffix', () => {
    it('shows currency suffix for non-DKK platforms in value', async () => {
      await renderAndOpen()
      const mintosItem = screen.getAllByTestId('platform-item-p2')[0]!
      const valueDiv = mintosItem.querySelector('.text-right')!
      const currencySpan = valueDiv.querySelector('span')
      expect(currencySpan).toBeInTheDocument()
      expect(currencySpan!.textContent).toBe('EUR')
    })

    it('does not show currency suffix for DKK platforms in value', async () => {
      await renderAndOpen()
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      const valueDiv = nordnetItem.querySelector('.text-right .font-mono-data')!
      // The first font-mono-data (value line) should not have a child span for DKK
      const currencySpan = valueDiv.querySelector('span')
      expect(currencySpan).toBeNull()
    })
  })

  describe('staleness badge', () => {
    it('shows staleness badge when platform has staleness', async () => {
      await renderAndOpen()
      const mintosItem = screen.getAllByTestId('platform-item-p2')[0]!
      expect(mintosItem.textContent).toContain('Stale')
    })

    it('does not show staleness badge when platform has no staleness', async () => {
      await renderAndOpen()
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      expect(nordnetItem.textContent).not.toContain('Stale')
    })
  })

  describe('Edit Platform button', () => {
    it('renders at the bottom of dropdown', async () => {
      await renderAndOpen()
      expect(screen.getAllByText('Edit Platform').length).toBeGreaterThanOrEqual(1)
    })

    it('fires onEditPlatform when clicked', async () => {
      const { user, props } = await renderAndOpen()
      const editBtn = screen.getAllByText('Edit Platform')[0]!.closest('button')!
      await user.click(editBtn)
      expect(props.onEditPlatform).toHaveBeenCalledOnce()
    })

    it('closes dropdown when edit is clicked', async () => {
      const { user, trigger } = await renderAndOpen()
      const editBtn = screen.getAllByText('Edit Platform')[0]!.closest('button')!
      await user.click(editBtn)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('is hidden when onEditPlatform is not provided', async () => {
      await renderAndOpen({ onEditPlatform: undefined })
      expect(screen.queryAllByText('Edit Platform')).toHaveLength(0)
    })
  })

  describe('closed platforms', () => {
    it('renders with muted opacity styling', async () => {
      await renderAndOpen()
      const closedItem = screen.getAllByTestId('platform-item-p4')[0]!
      expect(closedItem.className).toContain('opacity-50')
    })

    it('renders with muted text color', async () => {
      await renderAndOpen()
      const closedItem = screen.getAllByTestId('platform-item-p4')[0]!
      const nameEl = closedItem.querySelector('.text-base-400')
      expect(nameEl).toBeInTheDocument()
    })
  })

  describe('platform icons', () => {
    it('renders PlatformIcon for each platform item', async () => {
      await renderAndOpen()
      // Each platform should have a PlatformIcon (rendered as a div with rounded-full)
      const nordnetItem = screen.getAllByTestId('platform-item-p1')[0]!
      const icon = nordnetItem.querySelector('.rounded-full')
      expect(icon).toBeInTheDocument()
    })
  })
})
