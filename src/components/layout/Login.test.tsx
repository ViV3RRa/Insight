import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import Login from './Login'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockLogin = vi.fn()
vi.mock('@/services/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with email and password fields', () => {
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    expect(screen.getByText('Insight')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('accepts email and password input', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')

    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')
    expect(screen.getByLabelText('Password')).toHaveValue('password123')
  })

  it('shows error when submitting with empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter both email and password.')
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('shows error when submitting with only email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter both email and password.')
  })

  it('navigates to /home on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ token: 'jwt', record: { email: 'test@example.com' } })
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password')
    expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true })
  })

  it('shows error on failed login with auth error', async () => {
    mockLogin.mockRejectedValueOnce({ status: 401, message: 'Invalid credentials' })
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows server error message for 500 errors', async () => {
    mockLogin.mockRejectedValueOnce({ status: 500, message: 'Internal server error' })
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server error. Please try again later.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows connection error for network failures', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to connect to the server.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows loading state during authentication', async () => {
    let resolveLogin: (value: unknown) => void
    mockLogin.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('button')).toHaveTextContent('Signing in\u2026')
    expect(screen.getByRole('button')).toBeDisabled()

    // Resolve the pending login and wait for state to settle
    await vi.waitFor(() => {
      resolveLogin!({ token: 'jwt', record: {} })
    })
  })

  it('clears error when resubmitting', async () => {
    mockLogin.mockRejectedValueOnce(new Error('fail'))
    const user = userEvent.setup()
    renderWithProviders(<Login />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    mockLogin.mockResolvedValueOnce({ token: 'jwt', record: {} })
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
