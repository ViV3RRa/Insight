import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import AppShell from './AppShell'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function getDesktopNav() {
  // The desktop nav is the first <nav> (sticky top), mobile is second (fixed bottom)
  const navs = screen.getAllByRole('navigation')
  return navs[0]!
}

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the desktop navigation with brand text', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    expect(screen.getByText('Insight')).toBeInTheDocument()
  })

  it('renders three section nav links in desktop nav', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const desktopNav = getDesktopNav()
    const links = desktopNav.querySelectorAll('a')
    const labels = Array.from(links).map((a) => a.textContent)
    expect(labels).toEqual(['Home', 'Investment', 'Vehicles'])
  })

  it('highlights the active section link', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const desktopNav = getDesktopNav()
    const homeLink = desktopNav.querySelector('a[href="/home"]')!
    expect(homeLink.className).toContain('text-accent-700')
    expect(homeLink.className).toContain('bg-accent-50')
  })

  it('shows inactive styling for non-active sections', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const desktopNav = getDesktopNav()
    const investmentLink = desktopNav.querySelector('a[href="/investment"]')!
    expect(investmentLink.className).toContain('text-base-400')
    expect(investmentLink.className).not.toContain('bg-accent-50')
  })

  it('highlights Investment when on /investment route', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/investment'] })
    const desktopNav = getDesktopNav()
    const investmentLink = desktopNav.querySelector('a[href="/investment"]')!
    expect(investmentLink.className).toContain('text-accent-700')
    expect(investmentLink.className).toContain('bg-accent-50')
  })

  it('renders settings gear button', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('navigates to /settings when settings button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(mockNavigate).toHaveBeenCalledWith('/settings')
  })

  it('renders the nav as sticky', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const desktopNav = getDesktopNav()
    expect(desktopNav.className).toContain('sticky')
    expect(desktopNav.className).toContain('top-0')
  })

  it('desktop nav has hidden class for mobile and flex for lg', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const desktopNav = getDesktopNav()
    const brandDiv = desktopNav.querySelector('.hidden.lg\\:block')
    expect(brandDiv).toBeInTheDocument()
  })

  it('renders the main content area with correct max width', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main?.className).toContain('max-w-[1440px]')
    expect(main?.className).toContain('pb-24')
  })

  it('renders both desktop nav and mobile tab bar', () => {
    renderWithProviders(<AppShell />, { initialEntries: ['/home'] })
    const navs = screen.getAllByRole('navigation')
    expect(navs).toHaveLength(2)
  })
})
