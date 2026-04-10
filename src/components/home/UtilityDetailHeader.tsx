import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Settings, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { StatCard } from '@/components/shared/StatCard'
import { UtilityIcon } from '@/components/shared/UtilityIcon'
import { DropdownSwitcher } from '@/components/shared/DropdownSwitcher'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { useMobileDetailNav } from '@/components/layout/useMobileDetailNav'
import { formatNumber, formatRecentUpdate } from '@/utils/formatters'
import type { Utility, UtilityMetrics } from '@/types/home'

interface UtilityDetailHeaderProps {
  utility: Utility
  allUtilities: Utility[]
  metrics: UtilityMetrics | null
  latestReadingDate: Date | null
  onSelectUtility: (id: string) => void
  onAddReading: () => void
  onAddBill: () => void
  onEdit: () => void
}

function getStaleness(latestReadingDate: Date | null): 'critical' | 'warning' | null {
  if (!latestReadingDate) return 'critical'
  const daysDiff = Math.floor(
    (Date.now() - latestReadingDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  if (daysDiff > 7) return 'critical'
  if (daysDiff > 2) return 'warning'
  return null
}

function UtilityDetailHeader({
  utility,
  allUtilities,
  metrics,
  latestReadingDate,
  onSelectUtility,
  onAddReading,
  onAddBill,
  onEdit,
}: UtilityDetailHeaderProps) {
  const navigate = useNavigate()
  const staleness = getStaleness(latestReadingDate)

  const dropdownItems = allUtilities.map((u) => ({
    id: u.id,
    name: u.name,
    icon: <UtilityIcon icon={u.icon} color={u.color} size="sm" />,
  }))

  const updatedText = latestReadingDate ? formatRecentUpdate(latestReadingDate) : '\u2014'

  // Stat card values
  const currentConsumption =
    metrics?.currentMonthConsumption != null
      ? formatNumber(metrics.currentMonthConsumption, 0)
      : '\u2014'

  const currentCost =
    metrics?.currentMonthCost != null ? formatNumber(metrics.currentMonthCost, 0) : '\u2014'

  const ytdConsumption =
    metrics != null ? formatNumber(metrics.ytdConsumption, 0) : '\u2014'

  const ytdCost = metrics != null ? formatNumber(metrics.ytdCost, 0) : '\u2014'

  const costPerUnit =
    metrics?.currentMonthCostPerUnit != null
      ? formatNumber(metrics.currentMonthCostPerUnit, 2)
      : '\u2014'

  // vs Last Month calculation
  const monthly = metrics?.monthlyConsumption ?? []
  const lastTwo = monthly.slice(-2)
  const changePercent =
    lastTwo.length === 2 && lastTwo[0]!.consumption !== 0
      ? ((lastTwo[1]!.consumption - lastTwo[0]!.consumption) / lastTwo[0]!.consumption) * 100
      : null

  const vsLastMonthValue =
    changePercent != null ? `${formatNumber(changePercent, 1)}%` : '\u2014'

  const vsLastMonthTrend =
    changePercent === null ? ('neutral' as const) : changePercent <= 0 ? ('positive' as const) : ('negative' as const)

  const vsLastMonthSublabel =
    lastTwo.length === 2
      ? `${formatNumber(lastTwo[0]!.consumption, 0)} \u2192 ${formatNumber(lastTwo[1]!.consumption, 0)} ${utility.unit}`
      : undefined

  // Mobile dropdown content for nav bar context
  const mobileDropdownContent = useMemo(() => {
    const handleSelect = (id: string) => onSelectUtility(id)

    return (
      <div className="py-1">
        <Link
          to="/home"
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-base-500 hover:bg-base-50 dark:hover:bg-base-700 border-b border-base-100 dark:border-base-700"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="font-medium">Home Overview</span>
        </Link>
        <div className="py-1">
          {allUtilities.map((u) => {
            const isActive = u.id === utility.id
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelect(u.id)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-2.5',
                  isActive
                    ? 'bg-accent-50/50 dark:bg-accent-900/20 border-l-2 border-accent-600'
                    : 'hover:bg-base-50 dark:hover:bg-base-700 border-l-2 border-transparent',
                ].join(' ')}
              >
                <UtilityIcon icon={u.icon} color={u.color} size="sm" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-base-400">{u.unit}</div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="border-t border-base-100 dark:border-base-700 pt-1">
          <button
            type="button"
            onClick={onEdit}
            className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-base-400 hover:text-base-600 hover:bg-base-50"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit Utility
          </button>
        </div>
      </div>
    )
  }, [allUtilities, utility.id, onSelectUtility, onEdit])

  // Register mobile nav content (renders in AppShell's nav bar)
  useMobileDetailNav({
    backTo: '/home',
    icon: <UtilityIcon icon={utility.icon} color={utility.color} size="sm" />,
    name: utility.name,
    subtitle: `${utility.unit} · Updated ${updatedText}`,
    dropdown: mobileDropdownContent,
    badge: staleness ? <StalenessIndicator severity={staleness} size="lg" /> : undefined,
  })

  return (
    <>
      {/* Switcher bar + action buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
        {/* Desktop switcher bar */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="w-9 h-9 rounded-xl bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 hover:border-base-300 dark:hover:border-base-500 transition-colors shadow-sm"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <UtilityIcon icon={utility.icon} color={utility.color} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <DropdownSwitcher
                  currentId={utility.id}
                  items={dropdownItems}
                  onSelect={onSelectUtility}
                  overviewHref="/home"
                  overviewLabel="Home Overview"
                  footerAction={{
                    label: 'Edit Utility',
                    icon: <Settings className="w-3.5 h-3.5" />,
                    onClick: onEdit,
                  }}
                />
                {staleness && <StalenessIndicator severity={staleness} />}
              </div>
              <div className="text-xs text-base-400 mt-0.5">
                {utility.unit} &middot; Updated {updatedText}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={onAddReading}
            className="flex-1 sm:flex-none"
          >
            + Add Reading
          </Button>
          <Button
            variant="primary"
            onClick={onAddBill}
            className="flex-1 sm:flex-none"
          >
            + Add Bill
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <StatCard label="This Month" value={currentConsumption} sublabel={utility.unit} />
        <StatCard label="This Month Cost" value={currentCost} sublabel="DKK" />
        <StatCard
          label="vs Last Month"
          value={vsLastMonthValue}
          variant="colored"
          trend={vsLastMonthTrend}
          sublabel={vsLastMonthSublabel}
        />
        <StatCard label="YTD Consumption" value={ytdConsumption} sublabel={utility.unit} />
        <StatCard label="YTD Cost" value={ytdCost} sublabel="DKK" />
        <StatCard
          label="Cost per Unit"
          value={costPerUnit}
          sublabel={`DKK/${utility.unit}`}
        />
      </div>
    </>
  )
}

export { UtilityDetailHeader }
export type { UtilityDetailHeaderProps }
