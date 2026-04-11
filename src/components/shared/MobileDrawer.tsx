import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { useDragToDismiss } from '@/hooks/useDragToDismiss'

interface MobileDrawerField {
  label: string
  value: ReactNode
}

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: MobileDrawerField[]
  onEdit?: () => void
  onDelete?: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

function MobileDrawer({
  isOpen,
  onClose,
  title,
  fields,
  onEdit,
  onDelete,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

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

  useDragToDismiss({
    direction: 'down',
    onDismiss: onClose,
    panelRef,
    handleRef,
    isOpen,
  })

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          onClick={onClose}
          data-testid="drawer-backdrop"
        />
      )}

      {/* Drawer */}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-base-800 rounded-t-2xl shadow-xl sm:hidden transform transition-transform duration-300 ease-out"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
        data-testid="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drag handle */}
        <div
          ref={handleRef}
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          data-testid="drag-handle"
        >
          <div className="w-10 h-1 rounded-full bg-base-200 dark:bg-base-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="p-1.5 rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-semibold text-base-900 dark:text-white">
            {title}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="p-1.5 rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            {fields.map((field) => (
              <div key={field.label} className="flex justify-between">
                <span className="text-xs text-base-400">{field.label}</span>
                <span className="text-sm font-mono-data text-base-900 dark:text-white">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (only shown when edit/delete actions are available) */}
        {(onEdit || onDelete) && (
          <div className="px-5 pb-5 pt-3 border-t border-base-100 dark:border-base-700">
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="secondary" onClick={onEdit} className="flex-1">
                  <Pencil className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" onClick={onDelete} className="flex-1">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export { MobileDrawer }
