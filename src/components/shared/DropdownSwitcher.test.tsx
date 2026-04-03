import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/utils'
import { DropdownSwitcher, type DropdownItem, type DropdownSection } from './DropdownSwitcher'

const items: DropdownItem[] = [
  { id: 'nordnet', name: 'Nordnet', section: 'investment' },
  { id: 'ib', name: 'Interactive Brokers', section: 'investment' },
  { id: 'revolut', name: 'Revolut', section: 'cash' },
]

const sections: DropdownSection[] = [
  { key: 'investment', label: 'Investment Platforms' },
  { key: 'cash', label: 'Cash Platforms' },
]

function renderSwitcher(overrides: Partial<React.ComponentProps<typeof DropdownSwitcher>> = {}) {
  const defaultProps = {
    currentId: 'nordnet',
    items,
    sections,
    onSelect: vi.fn(),
    overviewHref: '/portfolio',
    overviewLabel: 'Portfolio Overview',
    ...overrides,
  }
  return {
    ...renderWithProviders(<DropdownSwitcher {...defaultProps} />),
    onSelect: defaultProps.onSelect,
  }
}

describe('DropdownSwitcher', () => {
  describe('trigger button', () => {
    it('displays current item name', () => {
      renderSwitcher()
      expect(screen.getByRole('button', { name: /Nordnet/i })).toBeInTheDocument()
    })

    it('has correct styling classes', () => {
      renderSwitcher()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      expect(trigger).toHaveClass('inline-flex', 'items-center', 'gap-1.5', 'text-base', 'font-semibold')
    })

    it('shows fallback text when currentId does not match any item', () => {
      renderSwitcher({ currentId: 'nonexistent' })
      expect(screen.getByRole('button', { name: /Select\.\.\./i })).toBeInTheDocument()
    })

    it('has aria-expanded=false when closed', () => {
      renderSwitcher()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('has aria-haspopup=true', () => {
      renderSwitcher()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    })
  })

  describe('opening/closing', () => {
    it('opens dropdown on click', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })

      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      // Items should now be visible (desktop and mobile dropdowns)
      expect(screen.getAllByText('Portfolio Overview').length).toBeGreaterThanOrEqual(1)
    })

    it('closes on second click', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })

      await user.click(trigger)
      await user.click(trigger)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on Escape key', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.keyboard('{Escape}')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes on click outside', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      // Click outside the dropdown container
      await user.click(document.body)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('chevron rotation', () => {
    it('chevron has rotate(0deg) when closed', () => {
      renderSwitcher()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      const svg = trigger.querySelector('svg')!
      expect(svg.style.transform).toBe('rotate(0deg)')
    })

    it('chevron has rotate(180deg) when open', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })

      await user.click(trigger)

      const svg = trigger.querySelector('svg')!
      expect(svg.style.transform).toBe('rotate(180deg)')
    })
  })

  describe('overview link', () => {
    it('renders overview link at the top of the list', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const links = screen.getAllByText('Portfolio Overview')
      expect(links.length).toBeGreaterThanOrEqual(1)
    })

    it('overview link has correct href', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const links = screen.getAllByRole('link', { name: /Portfolio Overview/i })
      expect(links.length).toBeGreaterThanOrEqual(1)
      expect(links[0]).toHaveAttribute('href', '/portfolio')
    })

    it('overview link has correct styling', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const link = screen.getAllByRole('link', { name: /Portfolio Overview/i })[0]!
      expect(link).toHaveClass('flex', 'items-center', 'gap-2', 'px-3', 'py-2', 'text-sm')
    })
  })

  describe('section headers', () => {
    it('renders section headers with correct text', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      expect(screen.getAllByText('Investment Platforms').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Cash Platforms').length).toBeGreaterThanOrEqual(1)
    })

    it('section headers have uppercase styling', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const headers = screen.getAllByText('Investment Platforms')
      const header = headers[0]!
      expect(header).toHaveClass('text-[10px]', 'font-medium', 'uppercase', 'tracking-wider')
    })
  })

  describe('items', () => {
    it('renders all items', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      // Items appear in both desktop and mobile dropdowns
      expect(screen.getAllByText('Interactive Brokers').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Revolut').length).toBeGreaterThanOrEqual(1)
    })

    it('active item has accent highlight styling', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      // Get item buttons from the desktop dropdown (not the trigger)
      const allNordnetButtons = screen.getAllByRole('button', { name: /Nordnet/i })
      // The first is the trigger, the rest are dropdown items
      const itemButton = allNordnetButtons.find(
        (btn) => btn.className.includes('bg-accent-50/50'),
      )!
      expect(itemButton).toBeTruthy()
      expect(itemButton.className).toContain('border-accent-600')
      expect(itemButton.className).toContain('border-l-2')
    })

    it('inactive items have transparent border', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const ibButtons = screen.getAllByRole('button', { name: /Interactive Brokers/i })
      const itemButton = ibButtons.find(
        (btn) => btn.className.includes('border-transparent'),
      )!
      expect(itemButton).toBeTruthy()
      expect(itemButton.className).toContain('border-l-2')
      expect(itemButton.className).toContain('border-transparent')
    })

    it('active item text has font-medium', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const allNordnetButtons = screen.getAllByRole('button', { name: /Nordnet/i })
      const itemButton = allNordnetButtons.find(
        (btn) => btn.className.includes('bg-accent-50/50'),
      )!
      const text = within(itemButton).getByText('Nordnet')
      expect(text).toHaveClass('text-sm', 'font-medium')
    })

    it('inactive item text has normal weight', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const ibButtons = screen.getAllByRole('button', { name: /Interactive Brokers/i })
      const itemButton = ibButtons.find(
        (btn) => btn.className.includes('border-transparent'),
      )!
      const text = within(itemButton).getByText('Interactive Brokers')
      expect(text).toHaveClass('text-sm')
      expect(text).not.toHaveClass('font-medium')
    })
  })

  describe('selection', () => {
    it('calls onSelect with the selected item id', async () => {
      const { onSelect } = renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const ibButtons = screen.getAllByRole('button', { name: /Interactive Brokers/i })
      await user.click(ibButtons[0]!)

      expect(onSelect).toHaveBeenCalledWith('ib')
    })

    it('closes the dropdown after selection', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })

      await user.click(trigger)
      const ibButtons = screen.getAllByRole('button', { name: /Interactive Brokers/i })
      await user.click(ibButtons[0]!)

      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('desktop dropdown styling', () => {
    it('has correct panel classes', async () => {
      const { container } = renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      // Find the desktop dropdown (hidden sm:block)
      const desktopDropdown = container.querySelector('.hidden.sm\\:block')
      expect(desktopDropdown).toBeInTheDocument()
      expect(desktopDropdown).toHaveClass(
        'absolute', 'z-30', 'rounded-xl', 'shadow-lg', 'max-h-80', 'overflow-y-auto',
      )
    })
  })

  describe('mobile dropdown', () => {
    it('renders mobile dropdown with fixed positioning', async () => {
      const { container } = renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const mobileDropdown = container.querySelector('.sm\\:hidden')
      expect(mobileDropdown).toBeInTheDocument()
      expect(mobileDropdown).toHaveClass('fixed', 'inset-x-0', 'top-0', 'z-30')
    })

    it('mobile dropdown has max-height style', async () => {
      const { container } = renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const mobileDropdown = container.querySelector('.sm\\:hidden') as HTMLElement
      expect(mobileDropdown.style.maxHeight).toBe('70vh')
    })
  })

  describe('dark mode', () => {
    it('trigger has dark mode text classes', () => {
      renderSwitcher()
      const trigger = screen.getByRole('button', { name: /Nordnet/i })
      expect(trigger.className).toContain('dark:text-white')
      expect(trigger.className).toContain('dark:hover:text-accent-400')
    })

    it('desktop dropdown has dark mode background', async () => {
      const { container } = renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const desktopDropdown = container.querySelector('.hidden.sm\\:block')
      expect(desktopDropdown?.className).toContain('dark:bg-base-800')
      expect(desktopDropdown?.className).toContain('dark:border-base-700')
    })

    it('active item has dark mode accent styling', async () => {
      renderSwitcher()
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Nordnet/i }))

      const allNordnetButtons = screen.getAllByRole('button', { name: /Nordnet/i })
      const itemButton = allNordnetButtons.find(
        (btn) => btn.className.includes('bg-accent-50/50'),
      )!
      expect(itemButton.className).toContain('dark:bg-accent-900/20')
      expect(itemButton.className).toContain('dark:border-accent-400')
    })
  })

  describe('without sections', () => {
    it('renders items without section headers', async () => {
      const itemsNoSections: DropdownItem[] = [
        { id: 'a', name: 'Item A' },
        { id: 'b', name: 'Item B' },
      ]
      renderSwitcher({ items: itemsNoSections, sections: undefined, currentId: 'a' })
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /Item A/i }))

      expect(screen.getAllByText('Item B').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('Investment Platforms')).not.toBeInTheDocument()
    })
  })
})
