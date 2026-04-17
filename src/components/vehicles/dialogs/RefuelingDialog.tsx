import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput, NumberInput, SelectInput } from '@/components/shared/inputs'
import { FileUpload } from '@/components/shared/FileUpload'
import { DateTimeInput } from '@/components/shared/DateTimeInput'
import * as refuelingService from '@/services/refuelings'
import type { Refueling, Vehicle, FuelType } from '@/types/vehicles'

interface RefuelingDialogProps {
  isOpen: boolean
  onClose: () => void
  refueling?: Refueling
  vehicleId?: string
  vehicles?: Vehicle[]
  vehicleFuelType?: FuelType
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

interface FormErrors {
  vehicleId?: string
  date?: string
  fuelAmount?: string
  costPerUnit?: string
  totalCost?: string
  odometerReading?: string
}

function RefuelingDialog({
  isOpen,
  onClose,
  refueling,
  vehicleId,
  vehicles = [],
  vehicleFuelType,
}: RefuelingDialogProps) {
  const isEditMode = !!refueling
  const queryClient = useQueryClient()

  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [date, setDate] = useState('')
  const [fuelAmount, setFuelAmount] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [totalCostManual, setTotalCostManual] = useState(false)
  const [odometerReading, setOdometerReading] = useState('')
  const [station, setStation] = useState('')
  const [chargedAtHome, setChargedAtHome] = useState(false)
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState<File | string | null>(null)
  const [tripCounterPhoto, setTripCounterPhoto] = useState<File | string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const showVehicleSelect = !vehicleId

  // Determine current fuel type
  const currentFuelType: FuelType | undefined = vehicleFuelType
    ?? vehicles.find((v) => v.id === selectedVehicleId)?.fuelType

  const isElectric = currentFuelType === 'Electric'
  const fuelAmountLabel = isElectric ? 'Energy (kWh)' : 'Fuel (L)'
  const costPerUnitLabel = isElectric ? 'DKK / kWh' : 'DKK / L'

  // Reset form when dialog opens or refueling changes
  useEffect(() => {
    if (isOpen) {
      if (refueling) {
        setSelectedVehicleId(refueling.vehicleId)
        setDate(formatDatetimeLocal(new Date(refueling.date)))
        setFuelAmount(String(refueling.fuelAmount))
        setCostPerUnit(String(refueling.costPerUnit))
        setTotalCost(String(refueling.totalCost))
        setTotalCostManual(true) // prevent auto-compute overwrite
        setOdometerReading(String(refueling.odometerReading))
        setStation(refueling.station ?? '')
        setChargedAtHome(refueling.chargedAtHome)
        setNote(refueling.note ?? '')
        setReceipt(refueling.receipt ? refuelingService.getReceiptUrl(refueling) : null)
        setTripCounterPhoto(
          refueling.tripCounterPhoto ? refuelingService.getTripCounterPhotoUrl(refueling) : null,
        )
      } else {
        setSelectedVehicleId(vehicleId ?? '')
        setDate(getNowDatetimeLocal())
        setFuelAmount('')
        setCostPerUnit('')
        setTotalCost('')
        setTotalCostManual(false)
        setOdometerReading('')
        setStation('')
        setChargedAtHome(false)
        setNote('')
        setReceipt(null)
        setTripCounterPhoto(null)
      }
      setErrors({})
    }
  }, [isOpen, refueling, vehicleId])

  // Auto-compute total cost
  useEffect(() => {
    if (totalCostManual) return
    const fuel = parseFloat(fuelAmount)
    const cpu = parseFloat(costPerUnit)
    if (!isNaN(fuel) && !isNaN(cpu) && fuel > 0 && cpu > 0) {
      setTotalCost((fuel * cpu).toFixed(2))
    }
  }, [fuelAmount, costPerUnit, totalCostManual])

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    if (showVehicleSelect && !selectedVehicleId) {
      newErrors.vehicleId = 'Please select a vehicle'
    }
    if (!date) {
      newErrors.date = 'Date is required'
    }
    if (!fuelAmount.trim() || parseFloat(fuelAmount) <= 0) {
      newErrors.fuelAmount = 'Fuel amount is required'
    }
    if (!costPerUnit.trim() || parseFloat(costPerUnit) <= 0) {
      newErrors.costPerUnit = 'Cost per unit is required'
    }
    if (!totalCost.trim() || parseFloat(totalCost) <= 0) {
      newErrors.totalCost = 'Total cost is required'
    }
    if (!odometerReading.trim() || parseFloat(odometerReading) <= 0) {
      newErrors.odometerReading = 'Odometer reading is required'
    }

    return newErrors
  }, [showVehicleSelect, selectedVehicleId, date, fuelAmount, costPerUnit, totalCost, odometerReading])

  const effectiveVehicleId = vehicleId ?? selectedVehicleId

  const buildFormData = (): FormData => {
    const formData = new FormData()
    formData.set('vehicleId', effectiveVehicleId)
    formData.set('date', new Date(date).toISOString())
    formData.set('fuelAmount', fuelAmount)
    formData.set('costPerUnit', costPerUnit)
    formData.set('totalCost', totalCost)
    formData.set('odometerReading', odometerReading)
    if (station) formData.set('station', station)
    formData.set('chargedAtHome', String(chargedAtHome))
    if (note) formData.set('note', note)
    if (receipt instanceof File) formData.set('receipt', receipt)
    if (tripCounterPhoto instanceof File) formData.set('tripCounterPhoto', tripCounterPhoto)
    return formData
  }

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (refueling) {
        return refuelingService.update(refueling.id, data)
      }
      return refuelingService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refuelings'] })
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
        setFuelAmount('')
        setCostPerUnit('')
        setTotalCost('')
        setTotalCostManual(false)
        setOdometerReading('')
        setStation('')
        setChargedAtHome(false)
        setNote('')
        setReceipt(null)
        setTripCounterPhoto(null)
        setErrors({})
      },
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Refueling' : 'Add Refueling'}
      onSave={handleSave}
      onSaveAndAddAnother={!isEditMode ? handleSaveAndAddAnother : undefined}
      showSaveAndAddAnother={!isEditMode}
      saveLabel={isEditMode ? 'Save Changes' : 'Add Refueling'}
      loading={mutation.isPending}
    >
      {/* Vehicle select */}
      {showVehicleSelect && (
        <FormField label="Vehicle" required error={errors.vehicleId} htmlFor="refueling-vehicle">
          <SelectInput
            id="refueling-vehicle"
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value)
              if (errors.vehicleId) setErrors((prev) => ({ ...prev, vehicleId: undefined }))
            }}
            error={!!errors.vehicleId}
          >
            <option value="">Select vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </SelectInput>
        </FormField>
      )}

      {/* Date & Time */}
      <FormField label="Date & Time" required error={errors.date} htmlFor="refueling-date">
        <DateTimeInput
          id="refueling-date"
          value={date}
          onChange={(v) => {
            setDate(v)
            if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }))
          }}
        />
      </FormField>

      {/* Fuel Amount | Cost per Unit — 2-col grid */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label={fuelAmountLabel} required error={errors.fuelAmount} htmlFor="refueling-fuelAmount">
          <NumberInput
            id="refueling-fuelAmount"
            value={fuelAmount}
            onChange={(e) => {
              setFuelAmount(e.target.value)
              if (errors.fuelAmount) setErrors((prev) => ({ ...prev, fuelAmount: undefined }))
            }}
            min={0}
            step="any"
            error={!!errors.fuelAmount}
            placeholder="0"
          />
        </FormField>

        <FormField label={costPerUnitLabel} required error={errors.costPerUnit} htmlFor="refueling-costPerUnit">
          <NumberInput
            id="refueling-costPerUnit"
            value={costPerUnit}
            onChange={(e) => {
              setCostPerUnit(e.target.value)
              if (errors.costPerUnit) setErrors((prev) => ({ ...prev, costPerUnit: undefined }))
            }}
            min={0}
            step="any"
            error={!!errors.costPerUnit}
            placeholder="0.00"
          />
        </FormField>
      </div>

      {/* Total Cost with DKK suffix */}
      <FormField label="Total Cost" required error={errors.totalCost} htmlFor="refueling-totalCost">
        <div className="relative">
          <NumberInput
            id="refueling-totalCost"
            value={totalCost}
            onChange={(e) => {
              setTotalCost(e.target.value)
              setTotalCostManual(true)
              if (errors.totalCost) setErrors((prev) => ({ ...prev, totalCost: undefined }))
            }}
            min={0}
            step="any"
            error={!!errors.totalCost}
            placeholder="0.00"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data pointer-events-none">
            DKK
          </span>
        </div>
      </FormField>

      {/* Odometer with km suffix */}
      <FormField label="Odometer" required error={errors.odometerReading} htmlFor="refueling-odometer">
        <div className="relative">
          <NumberInput
            id="refueling-odometer"
            value={odometerReading}
            onChange={(e) => {
              setOdometerReading(e.target.value)
              if (errors.odometerReading) setErrors((prev) => ({ ...prev, odometerReading: undefined }))
            }}
            min={0}
            step="any"
            error={!!errors.odometerReading}
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data pointer-events-none">
            km
          </span>
        </div>
      </FormField>

      {/* Station | Note — 2-col grid */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Station" htmlFor="refueling-station">
          <TextInput
            id="refueling-station"
            value={station}
            onChange={(e) => setStation(e.target.value)}
            placeholder="e.g., Shell, Q8"
          />
        </FormField>

        <FormField label="Note" htmlFor="refueling-note">
          <TextInput
            id="refueling-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
          />
        </FormField>
      </div>

      {/* Charged at Home checkbox — Electric only */}
      {currentFuelType === 'Electric' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={chargedAtHome}
            onChange={(e) => setChargedAtHome(e.target.checked)}
            className="w-4 h-4 rounded border-base-300 dark:border-base-600 text-accent-600 focus:ring-accent-500"
          />
          <span className="text-sm text-base-600 dark:text-base-300">Charged at home</span>
        </label>
      )}

      {/* Attachments: Receipt | Odometer Photo — 2-col grid */}
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Receipt">
          <FileUpload
            value={receipt ?? undefined}
            onChange={(f) => setReceipt(f)}
            accept="image/*,.pdf"
            maxSizeMB={5}
          />
        </FormField>

        <FormField label="Odometer Photo">
          <FileUpload
            value={tripCounterPhoto ?? undefined}
            onChange={(f) => setTripCounterPhoto(f)}
            accept="image/*"
            maxSizeMB={5}
          />
        </FormField>
      </div>
    </Dialog>
  )
}

export { RefuelingDialog }
export type { RefuelingDialogProps }
