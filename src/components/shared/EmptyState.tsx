import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/shared/Button'

interface EmptyStateProps {
  variant: 'page' | 'section'
  icon: LucideIcon
  heading?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function EmptyState({
  variant,
  icon: Icon,
  heading,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  if (variant === 'section') {
    return (
      <div className="flex flex-col items-center py-8 px-4 text-center">
        <Icon className="w-6 h-6 text-base-300 dark:text-base-500 mb-3" aria-hidden="true" />
        {description && (
          <p className="text-sm text-base-300 dark:text-base-500">{description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-accent-600 dark:text-accent-400" aria-hidden="true" />
      </div>
      {heading && (
        <h2 className="text-lg font-semibold text-base-900 dark:text-white mb-2">
          {heading}
        </h2>
      )}
      {description && (
        <p className="text-sm text-base-400 dark:text-base-400 max-w-xs mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
export type { EmptyStateProps }
