import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { TimeSpanSelector } from './TimeSpanSelector'

// Default to wide viewport (pills mode)
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 409px)' ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('TimeSpanSelector — pill mode', () => {
  it('renders all 9 time span options', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(9)
    expect(tabs.map((t) => t.textContent)).toEqual([
      '1M', '3M', '6M', 'MTD', 'YTD', '1Y', '3Y', '5Y', 'All',
    ])
  })

  it('marks YTD as active by default with correct classes', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const ytd = screen.getByRole('tab', { name: 'YTD' })
    expect(ytd).toHaveAttribute('aria-selected', 'true')
    expect(ytd.className).toContain('bg-white')
    expect(ytd.className).toContain('shadow-sm')
    expect(ytd.className).toContain('text-base-900')
    expect(ytd.className).toContain('dark:bg-base-600')
  })

  it('marks inactive tabs with text-base-400', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const oneM = screen.getByRole('tab', { name: '1M' })
    expect(oneM).toHaveAttribute('aria-selected', 'false')
    expect(oneM.className).toContain('text-base-400')
    expect(oneM.className).not.toContain('bg-white')
  })

  it('calls onChange with correct value when clicking a pill', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={handleChange} />)

    await user.click(screen.getByRole('tab', { name: '1Y' }))
    expect(handleChange).toHaveBeenCalledWith('1Y')
  })

  it('has role="tablist" on the container', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('container has correct styling classes', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const tablist = screen.getByRole('tablist')
    expect(tablist.className).toContain('bg-base-100')
    expect(tablist.className).toContain('dark:bg-base-700')
    expect(tablist.className).toContain('rounded-lg')
    expect(tablist.className).toContain('p-0.5')
  })

  it('navigates with ArrowRight key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={handleChange} />)

    // Focus the active tab (YTD, index 4)
    screen.getByRole('tab', { name: 'YTD' }).focus()
    await user.keyboard('{ArrowRight}')

    // Focus should move to next pill (1Y)
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: '1Y' }))
  })

  it('navigates with ArrowLeft key', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)

    screen.getByRole('tab', { name: 'YTD' }).focus()
    await user.keyboard('{ArrowLeft}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'MTD' }))
  })

  it('selects focused pill on Enter key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={handleChange} />)

    screen.getByRole('tab', { name: 'YTD' }).focus()
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Enter}')

    expect(handleChange).toHaveBeenCalledWith('1Y')
  })

  it('selects focused pill on Space key', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={handleChange} />)

    screen.getByRole('tab', { name: 'YTD' }).focus()
    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')

    expect(handleChange).toHaveBeenCalledWith('1Y')
  })

  it('wraps around from last to first with ArrowRight', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="All" onChange={vi.fn()} />)

    screen.getByRole('tab', { name: 'All' }).focus()
    await user.keyboard('{ArrowRight}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: '1M' }))
  })

  it('wraps around from first to last with ArrowLeft', async () => {
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="1M" onChange={vi.fn()} />)

    screen.getByRole('tab', { name: '1M' }).focus()
    await user.keyboard('{ArrowLeft}')

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'All' }))
  })

  it('only active tab has tabIndex 0, others have -1', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const tabs = screen.getAllByRole('tab')
    tabs.forEach((tab) => {
      if (tab.textContent === 'YTD') {
        expect(tab).toHaveAttribute('tabindex', '0')
      } else {
        expect(tab).toHaveAttribute('tabindex', '-1')
      }
    })
  })
})

describe('TimeSpanSelector — dropdown mode', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(max-width: 409px)' ? true : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('renders a select dropdown in narrow mode', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select.tagName).toBe('SELECT')
  })

  it('has all 9 options in the dropdown', () => {
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={vi.fn()} />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(9)
  })

  it('calls onChange when dropdown selection changes', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<TimeSpanSelector value="YTD" onChange={handleChange} />)

    await user.selectOptions(screen.getByRole('combobox'), '1Y')
    expect(handleChange).toHaveBeenCalledWith('1Y')
  })
})
