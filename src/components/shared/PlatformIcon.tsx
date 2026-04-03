import { useState } from 'react'

interface PlatformIconProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const sizeClasses = {
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-10 h-10',
} as const

const fallbackTextClasses = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const

function hashColor(name: string): string {
  const colors = [
    '#3b82f6',
    '#22c55e',
    '#a855f7',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
    '#14b8a6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]!
}

export function PlatformIcon({
  name,
  imageUrl,
  size = 'sm',
  color,
}: PlatformIconProps) {
  const [imageError, setImageError] = useState(false)
  const showImage = imageUrl && !imageError
  const bgColor = color ?? hashColor(name)

  if (showImage) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden flex-shrink-0`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex-shrink-0 flex items-center justify-center ${fallbackTextClasses[size]} font-semibold text-white shadow ring-1 ring-black/10 dark:ring-white/10`}
      style={{ backgroundColor: bgColor }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
