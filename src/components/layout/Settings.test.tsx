import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent, waitFor } from '@/test/utils'
import Settings from './Settings'
import { useSettingsStore } from '@/stores/settingsStore'
import { buildSettings } from '@/test/factories'

const mockGetOrCreateSettings = vi.fn()
const mockUpdateSettings = vi.fn()

vi.mock('@/services/settings', () => ({
  getOrCreateSettings: () => mockGetOrCreateSettings(),
  updateSettings: (...args: unknown[]) => mockUpdateSettings(...args),
}))

const mockSetTheme = vi.fn()
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

const defaultSettings = buildSettings({
  dateFormat: 'yyyy-MM-dd',
  theme: 'light',
  demoMode: false,
})

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({
      dateFormat: 'yyyy-MM-dd',
      theme: 'light',
      demoMode: false,
      isHydrated: false,
    })
    mockGetOrCreateSettings.mockResolvedValue(defaultSettings)
    mockUpdateSettings.mockResolvedValue(defaultSettings)
  })

  it('renders settings page with title "Settings"', async () => {
    renderWithProviders(<Settings />)

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('shows loading state while fetching', () => {
    mockGetOrCreateSettings.mockReturnValue(new Promise(() => {})) // never resolves
    renderWithProviders(<Settings />)

    expect(screen.getByTestId('settings-loading')).toBeInTheDocument()
  })

  it('renders date format segmented control', async () => {
    renderWithProviders(<Settings />)

    await waitFor(() => {
      expect(screen.getByText('Date format')).toBeInTheDocument()
    })

    expect(screen.getByText('yyyy-MM-dd')).toBeInTheDocument()
    expect(screen.getByText('dd/MM/yyyy')).toBeInTheDocument()
  })

  it('date format segmented control toggles between options', async () => {
    renderWithProviders(<Settings />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('dd/MM/yyyy')).toBeInTheDocument()
    })

    const updatedSettings = { ...defaultSettings, dateFormat: 'dd/MM/yyyy' as const }
    mockUpdateSettings.mockResolvedValueOnce(updatedSettings)

    await user.click(screen.getByText('dd/MM/yyyy'))

    expect(mockUpdateSettings.mock.calls[0]![0]).toEqual({ dateFormat: 'dd/MM/yyyy' })
    expect(useSettingsStore.getState().dateFormat).toBe('dd/MM/yyyy')
  })

  it('theme toggle works', async () => {
    renderWithProviders(<Settings />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Dark mode')).toBeInTheDocument()
    })

    const toggle = screen.getByRole('switch', { name: 'Dark mode' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    const updatedSettings = { ...defaultSettings, theme: 'dark' as const }
    mockUpdateSettings.mockResolvedValueOnce(updatedSettings)

    await user.click(toggle)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
    expect(mockUpdateSettings.mock.calls[0]![0]).toEqual({ theme: 'dark' })
    expect(useSettingsStore.getState().theme).toBe('dark')
  })

  it('DKK currency shown read-only', async () => {
    renderWithProviders(<Settings />)

    await waitFor(() => {
      expect(screen.getByText('Home currency')).toBeInTheDocument()
    })

    expect(screen.getByText('DKK')).toBeInTheDocument()
  })

  it('demo mode toggle works', async () => {
    renderWithProviders(<Settings />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Demo mode')).toBeInTheDocument()
    })

    const toggle = screen.getByRole('switch', { name: 'Demo mode' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    const updatedSettings = { ...defaultSettings, demoMode: true }
    mockUpdateSettings.mockResolvedValueOnce(updatedSettings)

    await user.click(toggle)

    expect(mockUpdateSettings.mock.calls[0]![0]).toEqual({ demoMode: true })
    expect(useSettingsStore.getState().demoMode).toBe(true)
  })

  it('hydrates settings store on data load', async () => {
    const settings = buildSettings({
      dateFormat: 'dd/MM/yyyy',
      theme: 'dark',
      demoMode: true,
    })
    mockGetOrCreateSettings.mockResolvedValue(settings)

    renderWithProviders(<Settings />)

    await waitFor(() => {
      expect(useSettingsStore.getState().isHydrated).toBe(true)
    })

    expect(useSettingsStore.getState().dateFormat).toBe('dd/MM/yyyy')
    expect(useSettingsStore.getState().theme).toBe('dark')
    expect(useSettingsStore.getState().demoMode).toBe(true)
  })

  it('active date format segment has correct styling', async () => {
    renderWithProviders(<Settings />)

    await waitFor(() => {
      expect(screen.getByText('yyyy-MM-dd')).toBeInTheDocument()
    })

    const activeBtn = screen.getByText('yyyy-MM-dd')
    expect(activeBtn.className).toContain('bg-white')
    expect(activeBtn.className).toContain('shadow-sm')

    const inactiveBtn = screen.getByText('dd/MM/yyyy')
    expect(inactiveBtn.className).toContain('text-base-400')
    expect(inactiveBtn.className).not.toContain('shadow-sm')
  })
})
