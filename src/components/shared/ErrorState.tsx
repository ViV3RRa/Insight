import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/shared/Button'

interface ErrorStateProps {
  variant: 'card' | 'page'
  title: string
  message: string
  onRetry?: () => void
  serverUrl?: string
}

function ErrorState({ variant, title, message, onRetry, serverUrl }: ErrorStateProps) {
  if (variant === 'card') {
    return (
      <div className="flex flex-col items-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-500" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-base-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-base-400 dark:text-base-400 max-w-xs mb-4">
          {message}
        </p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-base-100 dark:bg-base-700 flex items-center justify-center mb-6">
        <WifiOff className="w-8 h-8 text-base-400 dark:text-base-400" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-base-900 dark:text-white mb-2">
        {title}
      </h2>
      {serverUrl && (
        <p className="font-mono-data text-xs text-base-300 dark:text-base-500 mb-1">
          {serverUrl}
        </p>
      )}
      <p className="text-sm text-base-400 dark:text-base-400 max-w-sm mb-6">
        {message}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </Button>
      )}
    </div>
  )
}

export { ErrorState }
export type { ErrorStateProps }
