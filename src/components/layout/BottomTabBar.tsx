import { NavLink } from 'react-router-dom'
import { Home, TrendingUp, Car, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/investment', label: 'Investment', icon: TrendingUp },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-base-800 border-t border-base-150 dark:border-base-700 z-30 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 ${
                isActive
                  ? 'text-accent-600 dark:text-accent-400'
                  : 'text-base-400'
              }`
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
