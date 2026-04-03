import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/services/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/home', { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 dark:bg-base-900 px-4">
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold tracking-tight text-center mb-8 text-base-900 dark:text-white">
          Insight
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-base-700 dark:text-base-200 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-base-200 dark:border-base-600 rounded-lg bg-white dark:bg-base-900 text-sm text-base-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-base-700 dark:text-base-200 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-base-200 dark:border-base-600 rounded-lg bg-white dark:bg-base-900 text-sm text-base-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg hover:bg-base-800 dark:hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in\u2026' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
