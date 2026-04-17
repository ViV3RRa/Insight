import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { FileUpload } from '@/components/shared/FileUpload'
import { DateTimeInput } from '@/components/shared/DateTimeInput'
import { NumberInput, TextInput, SelectInput } from '@/components/shared/inputs'
import * as meterReadingService from '@/services/meterReadings'
import type { MeterReading, Utility } from '@/types/home'

interface MeterReadingDialogProps {
  isOpen: boolean
  onClose: () => void
  reading?: MeterReading
  utilityId?: string
  utilities?: Utility[]
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
  utilityId?: string
  value?: string
  timestamp?: string
}

function MeterReadingDialog({
  isOpen,
  onClose,
  reading,
  utilityId,
  utilities = [],
}: MeterReadingDialogProps) {
  const isEditMode = !!reading
  const queryClient = useQueryClient()

  const [selectedUtilityId, setSelectedUtilityId] = useState('')
  const [value, setValue] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [note, setNote] = useState('')
  const [attachment, setAttachment] = useState<File | string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const showUtilitySelect = !utilityId
  const effectiveUtilityId = utilityId ?? selectedUtilityId

  // Derive unit from the effective utility
  const unit = utilities.find((u) => u.id === effectiveUtilityId)?.unit ?? ''

  // Reset form when dialog opens or reading changes
  useEffect(() => {
    if (isOpen) {
      if (reading) {
        setSelectedUtilityId(reading.utilityId)
        setValue(String(reading.value))
        setTimestamp(formatDatetimeLocal(new Date(reading.timestamp)))
        setNote(reading.note ?? '')
        setAttachment(reading.attachment ?? null)
      } else {
        setSelectedUtilityId(utilityId ?? '')
        setValue('')
        setTimestamp(getNowDatetimeLocal())
        setNote('')
        setAttachment(null)
      }
      setErrors({})
    }
  }, [isOpen, reading, utilityId])

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    if (showUtilitySelect && !selectedUtilityId) {
      newErrors.utilityId = 'Please select a utility'
    }

    if (!value.trim()) {
      newErrors.value = 'Reading value is required'
    } else if (Number(value) < 0) {
      newErrors.value = 'Reading value is required'
    }

    if (!timestamp) {
      newErrors.timestamp = 'Date is required'
    }

    return newErrors
  }, [showUtilitySelect, selectedUtilityId, value, timestamp])

  const buildFormData = (): FormData => {
    const formData = new FormData()
    formData.set('utilityId', effectiveUtilityId)
    formData.set('value', value)
    formData.set('timestamp', new Date(timestamp).toISOString())
    if (note) formData.set('note', note)
    if (attachment instanceof File) formData.set('attachment', attachment)
    else if (attachment === null && reading?.attachment) formData.set('attachment', '')
    return formData
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (reading) {
        return meterReadingService.update(reading.id, data)
      }
      return meterReadingService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meterReadings', effectiveUtilityId] })
    },
  })

  const handleSave = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    mutation.mutate(buildFormData(), {
      onSuccess: () => onClose(),
    })
  }

  const handleSaveAndAddAnother = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    mutation.mutate(buildFormData(), {
      onSuccess: () => {
        setValue('')
        setNote('')
        setAttachment(null)
        setErrors({})
      },
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Reading' : 'Add Reading'}
      onSave={handleSave}
      saveLabel={isEditMode ? 'Save' : 'Save Reading'}
      onSaveAndAddAnother={!isEditMode ? handleSaveAndAddAnother : undefined}
      showSaveAndAddAnother={!isEditMode}
      loading={mutation.isPending}
    >
      {/* Utility select */}
      {showUtilitySelect && (
        <FormField label="Utility" required error={errors.utilityId} htmlFor="reading-utility">
          <SelectInput
            id="reading-utility"
            value={selectedUtilityId}
            onChange={(e) => {
              setSelectedUtilityId(e.target.value)
              if (errors.utilityId) setErrors((prev) => ({ ...prev, utilityId: undefined }))
            }}
            error={!!errors.utilityId}
          >
            <option value="">Select utility...</option>
            {utilities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      )}

      {/* Value with unit suffix */}
      <FormField label="Meter Reading" required error={errors.value} htmlFor="reading-value">
        <div className="relative">
          <NumberInput
            id="reading-value"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (errors.value) setErrors((prev) => ({ ...prev, value: undefined }))
            }}
            min={0}
            step="any"
            error={!!errors.value}
            placeholder="0"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </FormField>

      {/* Timestamp */}
      <FormField label="Date & Time" required error={errors.timestamp} htmlFor="reading-timestamp">
        <DateTimeInput
          id="reading-timestamp"
          value={timestamp}
          onChange={(v) => {
            setTimestamp(v)
            if (errors.timestamp) setErrors((prev) => ({ ...prev, timestamp: undefined }))
          }}
        />
      </FormField>

      {/* Note */}
      <FormField label="Note" htmlFor="reading-note">
        <TextInput
          id="reading-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., meter replaced, reading reset"
        />
      </FormField>

      {/* Attachment */}
      <FormField label="Attachment">
        <FileUpload
          value={attachment ?? undefined}
          onChange={setAttachment}
          accept="image/*,.pdf"
          maxSizeMB={5}
        />
      </FormField>
    </Dialog>
  )
}

export { MeterReadingDialog }
export type { MeterReadingDialogProps }
