import { UtilityIcon } from '@/components/shared/UtilityIcon'
import { DropdownSwitcher } from '@/components/shared/DropdownSwitcher'
import { StalenessIndicator } from '@/components/shared/StalenessIndicator'
import { formatRecentUpdate } from '@/utils/formatters'
import type { Utility, UtilityMetrics } from '@/types/home'

interface UtilityDetailSwitcherProps {
  utility: Utility
  allUtilities: Utility[]
  metricsMap: Map<string, UtilityMetrics>
  latestReadingDates: Map<string, Date | null>
  onSelectUtility: (id: string) => void
  onEditUtility: () => void
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

function UtilityDetailSwitcher({
  utility,
  allUtilities,
  latestReadingDates,
  onSelectUtility,
}: UtilityDetailSwitcherProps) {
  const staleness = getStaleness(latestReadingDates.get(utility.id) ?? null)
  const latestDate = latestReadingDates.get(utility.id)
  const updatedText = latestDate ? formatRecentUpdate(latestDate) : '\u2014'

  const dropdownItems = allUtilities.map((u) => ({
    id: u.id,
    name: u.name,
    icon: <UtilityIcon icon={u.icon} color={u.color} size="sm" />,
  }))

  return (
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
          />
          {staleness && <StalenessIndicator severity={staleness} />}
        </div>
        <div className="text-xs text-base-400 mt-0.5">
          {utility.unit} &middot; Updated {updatedText}
        </div>
      </div>
    </div>
  )
}

export { UtilityDetailSwitcher }
export type { UtilityDetailSwitcherProps }
