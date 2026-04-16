import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput, NumberInput, SelectInput } from '@/components/shared/inputs'
import { FileUpload } from '@/components/shared/FileUpload'
import { DateTimeInput } from '@/components/shared/DateTimeInput'
import * as maintenanceEventService from '@/services/maintenanceEvents'
import type { MaintenanceEvent, Vehicle } from '@/types/vehicles'
interface MaintenanceDialogProps {
  isOpen: boolean
  onClose: () => void
  event?: MaintenanceEvent
  vehicleId?: string
  vehicles?: Vehicle[]
}

function formatDatetimeLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

function getNowDatetimeLocal(): string {
  return formatDatetimeLocal(new Date())
}

function MaintenanceDialog({
  isOpen,
  onClose,
  event,
  vehicleId,
  vehicles,
}: MaintenanceDialogProps) {
  const queryClient = useQueryClient()

  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState<File | string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditMode = !!event
  const effectiveVehicleId = vehicleId ?? selectedVehicleId

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setSelectedVehicleId(event.vehicleId)
        setDate(formatDatetimeLocal(new Date(event.date)))
        setDescription(event.description)
        setCost(String(event.cost))
        setNote(event.note ?? '')
        setReceipt(event.receipt ?? null)
      } else {
        setSelectedVehicleId('')
        setDate(getNowDatetimeLocal())
        setDescription('')
        setCost('')
        setNote('')
        setReceipt(null)
      }
      setErrors({})
    }
  }, [isOpen, event])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEditMode
        ? maintenanceEventService.update(event!.id, data)
        : maintenanceEventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceEvents'] })
    },
  })

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {}
    if (!vehicleId && !selectedVehicleId) {
      newErrors.vehicle = 'Please select a vehicle'
    }
    if (!date) {
      newErrors.date = 'Date is required'
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!cost.trim()) {
      newErrors.cost = 'Cost is required'
    } else if (Number(cost) <= 0) {
      newErrors.cost = 'Cost must be positive'
    }
    return newErrors
  }

  function buildFormData(): FormData {
    const fd = new FormData()
    fd.set('vehicleId', effectiveVehicleId)
    fd.set('date', new Date(date).toISOString())
    fd.set('description', description.trim())
    fd.set('cost', cost)
    if (note.trim()) fd.set('note', note.trim())
    if (receipt instanceof File) fd.set('receipt', receipt)
    return fd
  }

  function resetForAnother() {
    setDate(getNowDatetimeLocal())
    setDescription('')
    setCost('')
    setNote('')
    setReceipt(null)
    setErrors({})
  }

  function handleSave() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    mutation.mutate(buildFormData(), {
      onSuccess: () => {
        onClose()
      },
    })
  }

  function handleSaveAndAddAnother() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    mutation.mutate(buildFormData(), {
      onSuccess: () => {
        resetForAnother()
      },
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Maintenance' : 'Add Maintenance'}
      saveLabel={isEditMode ? 'Save Changes' : 'Add Maintenance'}
      onSave={handleSave}
      onSaveAndAddAnother={handleSaveAndAddAnother}
      showSaveAndAddAnother={!isEditMode}
      loading={mutation.isPending}
    >
      {/* Vehicle select — only when no vehicleId prop */}
      {!vehicleId && (
        <FormField label="Vehicle" required htmlFor="maintenance-vehicle" error={errors.vehicle}>
          <SelectInput
            id="maintenance-vehicle"
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value)
              if (errors.vehicle) setErrors((prev) => ({ ...prev, vehicle: undefined as never }))
            }}
            error={!!errors.vehicle}
          >
            <option value="">Select vehicle...</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      )}

      {/* Date & Time */}
      <FormField label="Date & Time" required htmlFor="maintenance-date" error={errors.date}>
        <DateTimeInput
          id="maintenance-date"
          value={date}
          onChange={(v) => {
            setDate(v)
            if (errors.date) setErrors((prev) => ({ ...prev, date: undefined as never }))
          }}
        />
      </FormField>

      {/* Description */}
      <FormField label="Description" required htmlFor="maintenance-description" error={errors.description}>
        <TextInput
          id="maintenance-description"
          placeholder="e.g., Oil change, Tire rotation"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined as never }))
          }}
          error={!!errors.description}
        />
      </FormField>

      {/* Cost with DKK suffix */}
      <FormField label="Cost" required htmlFor="maintenance-cost" error={errors.cost}>
        <div className="relative">
          <NumberInput
            id="maintenance-cost"
            min="0"
            step="any"
            value={cost}
            onChange={(e) => {
              setCost(e.target.value)
              if (errors.cost) setErrors((prev) => ({ ...prev, cost: undefined as never }))
            }}
            error={!!errors.cost}
            className="pr-14"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data pointer-events-none">
            DKK
          </span>
        </div>
      </FormField>

      {/* Note */}
      <FormField label="Note" htmlFor="maintenance-note">
        <TextInput
          id="maintenance-note"
          placeholder="Optional note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </FormField>

      {/* Receipt */}
      <FormField label="Receipt">
        <FileUpload
          value={receipt ?? undefined}
          onChange={(file) => setReceipt(file)}
          accept="image/*,.pdf"
          maxSizeMB={5}
        />
      </FormField>

      {mutation.isError && (
        <p className="text-sm text-rose-500">
          {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
        </p>
      )}
    </Dialog>
  )
}

export { MaintenanceDialog }
export type { MaintenanceDialogProps }
