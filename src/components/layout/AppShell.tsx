import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import BottomTabBar from './BottomTabBar'
import { useSettingsStore } from '@/stores/settingsStore'

const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/investment', label: 'Investment' },
  { to: '/vehicles', label: 'Vehicles' },
] as const

export default function AppShell() {
  const navigate = useNavigate()
  const demoMode = useSettingsStore((s) => s.demoMode)

  return (
    <div className="min-h-screen bg-base-100 dark:bg-base-900 text-base-900 dark:text-white">
      {/* Desktop top navigation */}
      <nav className="bg-white dark:bg-base-800 shadow-card dark:shadow-card-dark sticky top-0 z-30 relative">
        <div className="max-w-[1440px] mx-auto px-3 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <div className="hidden lg:block text-xl font-bold tracking-tight">Insight</div>
              <div className="hidden lg:flex gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? 'px-4 py-2 text-sm rounded-lg font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-700/20'
                        : 'px-4 py-2 text-sm rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-200 transition-colors'
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => navigate('/settings')}
                className="w-9 h-9 rounded-xl bg-base-150 dark:bg-base-700 flex items-center justify-center text-base-500 dark:text-base-300 hover:bg-base-200 dark:hover:bg-base-600 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo mode banner */}
      {demoMode && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-2 text-center">
          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Demo Mode — Showing sample data
          </span>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  )
}
