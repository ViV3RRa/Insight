import type { UtilityIcon as UtilityIconType, UtilityColor } from '@/types/home'
import {
  Zap,
  Droplet,
  Flame,
  Sun,
  Wind,
  Thermometer,
  Wifi,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

export interface UtilityIconProps {
  icon: UtilityIconType
  color: UtilityColor
  size?: 'sm' | 'md' | 'lg'
}

const iconMap: Record<UtilityIconType, LucideIcon> = {
  bolt: Zap,
  droplet: Droplet,
  flame: Flame,
  sun: Sun,
  wind: Wind,
  thermometer: Thermometer,
  wifi: Wifi,
  trash: Trash2,
}

const colorMap: Record<UtilityColor, { bg: string; text: string }> = {
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/30',
    text: 'text-violet-600 dark:text-violet-400',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/30',
    text: 'text-rose-600 dark:text-rose-400',
  },
  cyan: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
    text: 'text-cyan-600 dark:text-cyan-400',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800/50',
    text: 'text-slate-600 dark:text-slate-400',
  },
}

const sizeMap: Record<'sm' | 'md' | 'lg', { container: string; icon: string }> = {
  sm: { container: 'w-6 h-6', icon: 'w-3.5 h-3.5' },
  md: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  lg: { container: 'w-10 h-10', icon: 'w-5 h-5' },
}

export function UtilityIcon({ icon, color, size = 'md' }: UtilityIconProps) {
  const IconComponent = iconMap[icon]
  const colorClasses = colorMap[color]
  const sizeClasses = sizeMap[size]

  return (
    <div
      className={`${sizeClasses.container} ${colorClasses.bg} rounded-lg flex items-center justify-center`}
    >
      <IconComponent className={`${sizeClasses.icon} ${colorClasses.text}`} />
    </div>
  )
}

export default UtilityIcon
