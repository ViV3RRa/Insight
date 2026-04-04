import { useState, useEffect, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput, SelectInput } from '@/components/shared/inputs'
import { Button } from '@/components/shared/Button'
import type { Platform } from '@/types/investment'

interface PlatformDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    name: string
    icon: File | null
    type?: 'investment' | 'cash'
    currency?: string
  }) => void
  onClosePlatform?: (data: { closedDate: string; closureNote: string }) => void
  onReopenPlatform?: () => void
  platform?: Platform
  loading?: boolean
}

interface FormErrors {
  icon?: string
  name?: string
  type?: string
  currency?: string
}

function PlatformDialog({
  isOpen,
  onClose,
  onSave,
  onClosePlatform,
  onReopenPlatform,
  platform,
  loading = false,
}: PlatformDialogProps) {
  const isEdit = !!platform
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [type, setType] = useState<'investment' | 'cash' | ''>('')
  const [currency, setCurrency] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  // Close platform fields
  const [showCloseFields, setShowCloseFields] = useState(false)
  const [closedDate, setClosedDate] = useState('')
  const [closureNote, setClosureNote] = useState('')
  const [closeDateError, setCloseDateError] = useState<string | undefined>()

  // Reset form when dialog opens or platform changes
  useEffect(() => {
    if (isOpen) {
      setName(platform?.name ?? '')
      setIconFile(null)
      setIconPreview(platform?.icon ? platform.icon : null)
      setType(platform?.type ?? '')
      setCurrency(platform?.currency ?? '')
      setErrors({})
      setShowCloseFields(false)
      setClosedDate('')
      setClosureNote('')
      setCloseDateError(undefined)
    }
  }, [isOpen, platform])

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (iconPreview && iconPreview.startsWith('blob:')) {
        URL.revokeObjectURL(iconPreview)
      }
    }
  }, [iconPreview])

  const handleIconClick = () => {
    fileInputRef.current?.click()
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIconFile(file)
      const url = URL.createObjectURL(file)
      setIconPreview(url)
      if (errors.icon) setErrors((prev) => ({ ...prev, icon: undefined }))
    }
  }

  const handleSave = () => {
    const newErrors: FormErrors = {}

    if (!isEdit && !iconFile) {
      newErrors.icon = 'Icon is required'
    }
    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!isEdit && !type) {
      newErrors.type = 'Type is required'
    }
    if (!isEdit && !currency) {
      newErrors.currency = 'Currency is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (isEdit) {
      onSave({ name: name.trim(), icon: iconFile })
    } else {
      onSave({
        name: name.trim(),
        icon: iconFile,
        type: type as 'investment' | 'cash',
        currency,
      })
    }
  }

  const handleClosePlatform = () => {
    if (!closedDate.trim()) {
      setCloseDateError('Closure date is required')
      return
    }
    setCloseDateError(undefined)
    onClosePlatform?.({ closedDate: closedDate.trim(), closureNote: closureNote.trim() })
  }

  const isClosed = platform?.status === 'closed'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Platform' : 'Add Platform'}
      onSave={handleSave}
      loading={loading}
    >
      {/* Icon upload area */}
      <div className="flex flex-col items-center mb-4">
        <button
          type="button"
          onClick={handleIconClick}
          className="relative w-16 h-16 rounded-full overflow-hidden bg-base-100 dark:bg-base-700 border-2 border-dashed border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500 transition-colors"
          aria-label="Upload icon"
        >
          {iconPreview ? (
            <img src={iconPreview} className="w-full h-full object-cover" alt="Platform icon" />
          ) : (
            <Upload className="w-5 h-5 text-base-300 dark:text-base-500 mx-auto" />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleIconChange}
          data-testid="icon-file-input"
        />
        {errors.icon && (
          <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">{errors.icon}</p>
        )}
      </div>

      {/* Name */}
      <FormField label="Name" required error={errors.name} htmlFor="platform-name">
        <TextInput
          id="platform-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          placeholder="e.g. Nordnet, Saxo Bank"
          error={!!errors.name}
        />
      </FormField>

      {/* Type */}
      {isEdit ? (
        <FormField label="Type">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-base-100 dark:bg-base-700 text-base-600 dark:text-base-300">
            {platform.type}
          </span>
        </FormField>
      ) : (
        <FormField label="Type" required error={errors.type} htmlFor="platform-type">
          <SelectInput
            id="platform-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'investment' | 'cash' | '')
              if (errors.type) setErrors((prev) => ({ ...prev, type: undefined }))
            }}
            error={!!errors.type}
          >
            <option value="">Select type</option>
            <option value="investment">Investment</option>
            <option value="cash">Cash</option>
          </SelectInput>
        </FormField>
      )}

      {/* Currency */}
      {isEdit ? (
        <FormField label="Currency">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-base-100 dark:bg-base-700 text-base-600 dark:text-base-300">
            {platform.currency}
          </span>
        </FormField>
      ) : (
        <FormField label="Currency" required error={errors.currency} htmlFor="platform-currency">
          <SelectInput
            id="platform-currency"
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value)
              if (errors.currency) setErrors((prev) => ({ ...prev, currency: undefined }))
            }}
            error={!!errors.currency}
          >
            <option value="">Select currency</option>
            <option value="DKK">DKK</option>
            <option value="EUR">EUR</option>
          </SelectInput>
        </FormField>
      )}

      {/* Close Platform danger zone (edit mode, active platforms only) */}
      {isEdit && !isClosed && (
        <div className="mt-4 pt-4 border-t border-base-100 dark:border-base-700">
          <button
            type="button"
            onClick={() => setShowCloseFields((v) => !v)}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            Close Platform
          </button>
          {showCloseFields && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 space-y-3">
              <FormField label="Closure Date" required error={closeDateError}>
                <input
                  type="date"
                  value={closedDate}
                  onChange={(e) => {
                    setClosedDate(e.target.value)
                    if (closeDateError) setCloseDateError(undefined)
                  }}
                  className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-base-900 text-sm text-base-900 dark:text-white border-base-200 dark:border-base-600 focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:focus:ring-accent-400/30 dark:focus:border-accent-400 outline-none transition-colors duration-150"
                />
              </FormField>
              <FormField label="Closure Note">
                <TextInput
                  value={closureNote}
                  onChange={(e) => setClosureNote(e.target.value)}
                  placeholder="Reason for closing"
                />
              </FormField>
              <Button variant="destructive" size="sm" onClick={handleClosePlatform}>
                Confirm Close
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Closed platform info (edit mode, closed platforms) */}
      {isEdit && isClosed && (
        <div className="mt-4 p-3 rounded-lg bg-base-50 dark:bg-base-900 border border-base-200 dark:border-base-700">
          <p className="text-xs text-base-400 dark:text-base-500">
            Closed on {platform.closedDate}
          </p>
          {platform.closureNote && (
            <p className="text-xs text-base-300 dark:text-base-500 mt-1">
              {platform.closureNote}
            </p>
          )}
          <button
            type="button"
            onClick={onReopenPlatform}
            className="mt-2 px-3 py-1.5 text-xs font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-900/40 transition-colors"
          >
            Reopen Platform
          </button>
        </div>
      )}
    </Dialog>
  )
}

export { PlatformDialog }
export type { PlatformDialogProps }
