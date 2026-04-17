import { useState, useEffect, useCallback } from 'react'
import { Info } from 'lucide-react'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput, NumberInput, SelectInput } from '@/components/shared/inputs'
import { DateTimeInput } from '@/components/shared/DateTimeInput'
import type { DataPoint } from '@/types/investment'

interface PlatformOption {
  id: string
  name: string
  type: 'investment' | 'cash'
  currency: string
  icon: string
}

interface DataPointDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { platformId: string; value: number; timestamp: string; note: string }) => void
  onSaveAndAddAnother?: (data: { platformId: string; value: number; timestamp: string; note: string }) => void
  dataPoint?: DataPoint
  platformId?: string
  platforms: PlatformOption[]
  selectedCurrency?: string
  loading?: boolean
}

function formatDatetimeLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

function getNowDatetimeLocal(): string {
  return formatDatetimeLocal(new Date())
}

interface FormErrors {
  platformId?: string
  value?: string
  timestamp?: string
}

function DataPointDialog({
  isOpen,
  onClose,
  onSave,
  onSaveAndAddAnother,
  dataPoint,
  platformId: fixedPlatformId,
  platforms,
  selectedCurrency,
  loading = false,
}: DataPointDialogProps) {
  const isEditMode = !!dataPoint

  const [platformId, setPlatformId] = useState('')
  const [value, setValue] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const showPlatformSelect = !fixedPlatformId

  // Derive currency from selected platform or prop
  const currency = (() => {
    if (fixedPlatformId && selectedCurrency) return selectedCurrency
    const selected = platforms.find((p) => p.id === platformId)
    return selected?.currency ?? 'DKK'
  })()

  // Reset form when dialog opens or dataPoint changes
  useEffect(() => {
    if (isOpen) {
      if (dataPoint) {
        setPlatformId(dataPoint.platformId)
        setValue(String(dataPoint.value))
        setTimestamp(formatDatetimeLocal(new Date(dataPoint.timestamp)))
        setNote(dataPoint.note ?? '')
      } else {
        setPlatformId(fixedPlatformId ?? '')
        setValue('')
        setTimestamp(getNowDatetimeLocal())
        setNote('')
      }
      setErrors({})
    }
  }, [isOpen, dataPoint, fixedPlatformId])

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    if (showPlatformSelect && !platformId) {
      newErrors.platformId = 'Platform is required'
    }

    if (!value.trim()) {
      newErrors.value = 'Value is required'
    } else if (Number(value) < 0) {
      newErrors.value = 'Value must be zero or greater'
    }

    if (!timestamp) {
      newErrors.timestamp = 'Date and time is required'
    }

    return newErrors
  }, [showPlatformSelect, platformId, value, timestamp])

  const buildData = () => ({
    platformId: fixedPlatformId ?? platformId,
    value: Number(value),
    timestamp,
    note,
  })

  const handleSave = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSave(buildData())
  }

  const handleSaveAndAddAnother = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSaveAndAddAnother?.(buildData())
    // Reset value and note but keep platform selection and datetime
    setValue('')
    setNote('')
    setErrors({})
  }

  const investmentPlatforms = platforms.filter((p) => p.type === 'investment')
  const cashPlatforms = platforms.filter((p) => p.type === 'cash')

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Point' : 'Add Data Point'}
      onSave={handleSave}
      onSaveAndAddAnother={!isEditMode ? handleSaveAndAddAnother : undefined}
      showSaveAndAddAnother={!isEditMode}
      loading={loading}
    >
      {/* Interpolation banner */}
      {isEditMode && dataPoint?.isInterpolated && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            This is an interpolated (estimated) value. Saving will replace it with your actual
            observed value.
          </p>
        </div>
      )}

      {/* Platform select */}
      {showPlatformSelect && (
        <FormField label="Platform" required error={errors.platformId} htmlFor="dp-platform">
          <SelectInput
            id="dp-platform"
            value={platformId}
            onChange={(e) => {
              setPlatformId(e.target.value)
              if (errors.platformId) setErrors((prev) => ({ ...prev, platformId: undefined }))
            }}
            error={!!errors.platformId}
          >
            <option value="">Select a platform</option>
            {investmentPlatforms.length > 0 && (
              <optgroup label="Investment">
                {investmentPlatforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
            {cashPlatforms.length > 0 && (
              <optgroup label="Cash">
                {cashPlatforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            )}
          </SelectInput>
        </FormField>
      )}

      {/* Value */}
      <FormField label="Value" required error={errors.value} htmlFor="dp-value">
        <div className="relative">
          <NumberInput
            id="dp-value"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (errors.value) setErrors((prev) => ({ ...prev, value: undefined }))
            }}
            error={!!errors.value}
            placeholder="0.00"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data pointer-events-none">
            {currency}
          </span>
        </div>
      </FormField>

      {/* Timestamp */}
      <FormField label="Date & Time" required error={errors.timestamp} htmlFor="dp-timestamp">
        <DateTimeInput
          id="dp-timestamp"
          value={timestamp}
          onChange={(v) => {
            setTimestamp(v)
            if (errors.timestamp) setErrors((prev) => ({ ...prev, timestamp: undefined }))
          }}
        />
      </FormField>

      {/* Note */}
      <FormField label="Note" htmlFor="dp-note">
        <TextInput
          id="dp-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
        />
      </FormField>
    </Dialog>
  )
}

export { DataPointDialog }
export type { DataPointDialogProps, PlatformOption }
