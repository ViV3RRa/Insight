import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import BottomTabBar from './BottomTabBar'

describe('BottomTabBar', () => {
  it('renders four tab links', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Investment/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Vehicles/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument()
  })

  it('highlights active tab with accent color', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    const homeLink = screen.getByRole('link', { name: /Home/i })
    expect(homeLink.className).toContain('text-accent-600')
  })

  it('shows inactive styling for non-active tabs', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    const investmentLink = screen.getByRole('link', { name: /Investment/i })
    expect(investmentLink.className).toContain('text-base-400')
    expect(investmentLink.className).not.toContain('text-accent-600')
  })

  it('highlights Investment tab when on /investment', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/investment'] })
    const investmentLink = screen.getByRole('link', { name: /Investment/i })
    expect(investmentLink.className).toContain('text-accent-600')
  })

  it('renders icons for each tab', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    // Each tab has an SVG icon
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('renders tab labels', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Investment')).toBeInTheDocument()
    expect(screen.getByText('Vehicles')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('has fixed positioning and correct z-index', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('fixed')
    expect(nav.className).toContain('bottom-0')
    expect(nav.className).toContain('z-30')
  })

  it('is hidden on desktop (has lg:hidden class)', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    const nav = screen.getByRole('navigation')
    expect(nav.className).toContain('lg:hidden')
  })

  it('links to correct routes', () => {
    renderWithProviders(<BottomTabBar />, { initialEntries: ['/home'] })
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('link', { name: /Investment/i })).toHaveAttribute('href', '/investment')
    expect(screen.getByRole('link', { name: /Vehicles/i })).toHaveAttribute('href', '/vehicles')
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute('href', '/settings')
  })
})
