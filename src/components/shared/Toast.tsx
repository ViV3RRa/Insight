import { useEffect, useRef } from 'react'
import { CheckCircle, Info, AlertCircle, Trash2, X } from 'lucide-react'
import { useToastStore, type ToastItem } from '@/stores/toastStore'

const AUTO_DISMISS_MS = 4000

const variantIcons = {
  success: CheckCircle,
  info: Info,
  error: AlertCircle,
  undo: Trash2,
} as const

const variantIconClasses = {
  success: 'w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0',
  info: 'w-4 h-4 text-blue-400 dark:text-blue-600 flex-shrink-0',
  error: 'w-4 h-4 text-rose-400 dark:text-rose-600 flex-shrink-0',
  undo: 'w-4 h-4 text-base-400 flex-shrink-0',
} as const

interface ToastProps {
  item: ToastItem
  onDismiss: (id: string) => void
}

function Toast({ item, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const Icon = variantIcons[item.variant]

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(item.id)
    }, AUTO_DISMISS_MS)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [item.id, onDismiss])

  const handleDismiss = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    onDismiss(item.id)
  }

  const handleUndo = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    item.onUndo?.()
    onDismiss(item.id)
  }

  return (
    <div
      role="status"
      className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-base-900 dark:bg-base-100 text-white dark:text-base-900 rounded-xl shadow-lg min-w-[280px] max-w-sm animate-toast-in"
    >
      <Icon className={variantIconClasses[item.variant]} aria-hidden="true" />
      <span className="text-sm font-medium flex-1">{item.message}</span>
      {item.variant === 'undo' && item.onUndo && (
        <button
          onClick={handleUndo}
          className="text-sm font-semibold text-accent-400 dark:text-accent-600 hover:text-accent-300 dark:hover:text-accent-700 flex-shrink-0"
        >
          Undo
        </button>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="p-0.5 text-base-400 hover:text-white dark:hover:text-base-900 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

function ToastRenderer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={removeToast} />
      ))}
    </div>
  )
}

export { Toast, ToastRenderer }
