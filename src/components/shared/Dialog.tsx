import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { useDragToDismiss } from '@/hooks/useDragToDismiss'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onSave: () => void
  onSaveAndAddAnother?: () => void
  showSaveAndAddAnother?: boolean
  saveLabel?: string
  loading?: boolean
}

function Dialog({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  onSaveAndAddAnother,
  showSaveAndAddAnother = false,
  saveLabel = 'Save',
  loading = false,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const mobileHandleRef = useRef<HTMLDivElement>(null)
  const titleId = 'dialog-title'

  // Store the previously focused element when opening
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [isOpen])

  // Focus first focusable element on open, restore focus on close
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const firstEl = focusable[0]
      if (firstEl) {
        firstEl.focus()
      }
    }

    return () => {
      if (!isOpen && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    },
    [],
  )

  // Drag-to-dismiss for mobile bottom sheet
  useDragToDismiss({
    direction: 'down',
    onDismiss: onClose,
    panelRef: mobilePanelRef,
    handleRef: mobileHandleRef,
    isOpen,
  })

  if (!isOpen) return null

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 sm:backdrop-blur-sm"
        onClick={onClose}
        data-testid="dialog-backdrop"
      />

      {/* Desktop modal */}
      <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center">
        <div
          className="relative bg-white dark:bg-base-800 sm:max-w-md w-full rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          style={{ animation: 'var(--animate-dialog-in)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <h2
              id={titleId}
              className="text-base font-semibold text-base-900 dark:text-white"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">{children}</div>

          {/* Footer Desktop */}
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-0">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {showSaveAndAddAnother && onSaveAndAddAnother && (
              <Button
                variant="secondary"
                onClick={onSaveAndAddAnother}
                disabled={loading}
                loading={loading}
              >
                Save &amp; Add Another
              </Button>
            )}
            <Button variant="primary" onClick={onSave} disabled={loading} loading={loading}>
              {saveLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-50">
        <div
          ref={mobilePanelRef}
          className="bg-white dark:bg-base-800 rounded-t-2xl shadow-xl max-h-[92vh] overflow-y-auto"
          style={{ animation: 'var(--animate-dialog-mobile-in)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div
            ref={mobileHandleRef}
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            data-testid="drag-handle"
          >
            <div className="w-10 h-1 rounded-full bg-base-200 dark:bg-base-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-0">
            <h2 className="text-base font-semibold text-base-900 dark:text-white">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-300"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-4">{children}</div>

          {/* Footer Mobile */}
          <div className="px-5 pb-5 pt-0 space-y-2">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onSave}
                disabled={loading}
                loading={loading}
                className="flex-1"
              >
                {saveLabel}
              </Button>
            </div>
            {showSaveAndAddAnother && onSaveAndAddAnother && (
              <Button
                variant="secondary"
                onClick={onSaveAndAddAnother}
                disabled={loading}
                loading={loading}
                fullWidth
              >
                Save &amp; Add Another
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export { Dialog }
export type { DialogProps }
