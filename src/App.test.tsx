import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import App from './App'

let mockIsAuthenticated = false

vi.mock('@/services/settings', () => ({
  getOrCreateSettings: vi.fn().mockResolvedValue({
    id: 'settings_1',
    userId: 'user_001',
    dateFormat: 'yyyy-MM-dd',
    theme: 'light',
    demoMode: false,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
  }),
  updateSettings: vi.fn(),
}))

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: () => mockIsAuthenticated,
  getCurrentUser: vi.fn(),
  onAuthChange: vi.fn(),
  getAuthToken: vi.fn(),
}))

describe('App Router', () => {
  beforeEach(() => {
    mockIsAuthenticated = false
  })

  describe('unauthenticated', () => {
    it('redirects to /login when not authenticated', () => {
      renderWithProviders(<App />, { initialEntries: ['/home'] })
      expect(screen.getByText('Insight')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('redirects /investment to /login', () => {
      renderWithProviders(<App />, { initialEntries: ['/investment'] })
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('redirects /settings to /login', () => {
      renderWithProviders(<App />, { initialEntries: ['/settings'] })
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('shows login page at /login', () => {
      renderWithProviders(<App />, { initialEntries: ['/login'] })
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    })
  })

  describe('authenticated', () => {
    beforeEach(() => {
      mockIsAuthenticated = true
    })

    it('redirects / to /home', () => {
      renderWithProviders(<App />, { initialEntries: ['/'] })
      expect(screen.getByTestId('page-home')).toBeInTheDocument()
    })

    it('renders Home page at /home', () => {
      renderWithProviders(<App />, { initialEntries: ['/home'] })
      expect(screen.getByTestId('page-home')).toBeInTheDocument()
    })

    it('renders Investment page at /investment', () => {
      renderWithProviders(<App />, { initialEntries: ['/investment'] })
      expect(screen.getByRole('heading', { level: 1, name: 'Investment Portfolio' })).toBeInTheDocument()
    })

    it('renders Vehicles page at /vehicles', () => {
      renderWithProviders(<App />, { initialEntries: ['/vehicles'] })
      expect(screen.getByTestId('page-vehicles')).toBeInTheDocument()
    })

    it('renders Settings page at /settings', async () => {
      renderWithProviders(<App />, { initialEntries: ['/settings'] })
      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    })

    it('renders Utility Detail page at /home/:utilityId', () => {
      renderWithProviders(<App />, { initialEntries: ['/home/util-123'] })
      expect(screen.getByTestId('page-utility-detail')).toBeInTheDocument()
    })

    it('renders Platform Detail page at /investment/platform/:platformId', () => {
      renderWithProviders(<App />, { initialEntries: ['/investment/platform/plat-123'] })
      expect(screen.getByTestId('page-platform-detail')).toBeInTheDocument()
    })

    it('renders Vehicle Detail page at /vehicles/:vehicleId', () => {
      renderWithProviders(<App />, { initialEntries: ['/vehicles/veh-123'] })
      expect(screen.getByTestId('page-vehicle-detail')).toBeInTheDocument()
    })

    it('redirects unknown routes to /home', () => {
      renderWithProviders(<App />, { initialEntries: ['/nonexistent'] })
      expect(screen.getByTestId('page-home')).toBeInTheDocument()
    })
  })
})
