import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/shared/Button'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
  description: string
  loading?: boolean
}

function DeleteConfirmDialog({
  isOpen,
  onCancel,
  onConfirm,
  title,
  description,
  loading = false,
}: DeleteConfirmDialogProps) {
  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 sm:backdrop-blur-sm"
        onClick={onCancel}
        data-testid="delete-dialog-backdrop"
      />

      {/* Centered dialog */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div
          className="relative max-w-sm w-full bg-white dark:bg-base-800 rounded-2xl shadow-xl p-6 text-center"
          style={{ animation: 'var(--animate-dialog-in)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rose trash icon */}
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>

          {/* Title */}
          <h2 id="delete-dialog-title" className="text-base font-semibold text-base-900 dark:text-white mb-1">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-base-400 dark:text-base-400 mb-6">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              loading={loading}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export { DeleteConfirmDialog }
