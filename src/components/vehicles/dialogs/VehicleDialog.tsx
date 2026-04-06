import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Car } from 'lucide-react'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput, SelectInput } from '@/components/shared/inputs'
import { Button } from '@/components/shared/Button'
import * as vehicleService from '@/services/vehicles'
import type { Vehicle, FuelType } from '@/types/vehicles'

interface VehicleDialogProps {
  isOpen: boolean
  onClose: () => void
  vehicle?: Vehicle
  onDelete?: () => void
}

const VEHICLE_TYPES = ['Car', 'Motorcycle'] as const
const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid']

function VehicleDialog({ isOpen, onClose, vehicle, onDelete }: VehicleDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!vehicle

  const [name, setName] = useState('')
  const [type, setType] = useState('Car')
  const [fuelType, setFuelType] = useState<FuelType>('Petrol')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [photo, setPhoto] = useState<File | string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mark as sold state
  const [showSoldSection, setShowSoldSection] = useState(false)
  const [saleDate, setSaleDate] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [saleNote, setSaleNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(vehicle?.name ?? '')
      setType(vehicle?.type ?? 'Car')
      setFuelType(vehicle?.fuelType ?? 'Petrol')
      setMake(vehicle?.make ?? '')
      setModel(vehicle?.model ?? '')
      setYear(vehicle?.year?.toString() ?? '')
      setLicensePlate(vehicle?.licensePlate ?? '')
      setPurchaseDate(vehicle?.purchaseDate ?? '')
      setPurchasePrice(vehicle?.purchasePrice?.toString() ?? '')
      setPhoto(vehicle?.photo ?? null)
      setPhotoPreview(vehicle?.photo ? vehicleService.getVehiclePhotoUrl(vehicle) : null)
      setErrors({})
      setShowSoldSection(false)
      setSaleDate('')
      setSalePrice('')
      setSaleNote('')
    }
  }, [isOpen, vehicle])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview && photo instanceof File) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview, photo])

  const createMutation = useMutation({
    mutationFn: (data: FormData) => vehicleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      vehicleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      onClose()
    },
  })

  const markAsSoldMutation = useMutation({
    mutationFn: ({
      id,
      date,
      price,
      note,
    }: {
      id: string
      date: string
      price?: number
      note?: string
    }) => vehicleService.markAsSold(id, date, price, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      onClose()
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => vehicleService.reactivateVehicle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      onClose()
    },
  })

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (showSoldSection && !saleDate) newErrors.saleDate = 'Sale date is required'
    return newErrors
  }

  function buildFormData(): FormData {
    const fd = new FormData()
    fd.set('name', name.trim())
    fd.set('type', type)
    fd.set('fuelType', fuelType)
    fd.set('status', vehicle?.status ?? 'active')
    if (make.trim()) fd.set('make', make.trim())
    if (model.trim()) fd.set('model', model.trim())
    if (year) fd.set('year', year)
    if (licensePlate.trim()) fd.set('licensePlate', licensePlate.trim())
    if (purchaseDate) fd.set('purchaseDate', purchaseDate)
    if (purchasePrice) fd.set('purchasePrice', purchasePrice)
    if (photo instanceof File) fd.set('photo', photo)
    return fd
  }

  function handleSave() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (showSoldSection && vehicle) {
      markAsSoldMutation.mutate({
        id: vehicle.id,
        date: saleDate,
        price: salePrice ? Number(salePrice) : undefined,
        note: saleNote.trim() || undefined,
      })
      return
    }

    const fd = buildFormData()
    if (isEdit) {
      updateMutation.mutate({ id: vehicle.id, data: fd })
    } else {
      createMutation.mutate(fd)
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (photoPreview && photo instanceof File) {
        URL.revokeObjectURL(photoPreview)
      }
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    markAsSoldMutation.isPending ||
    reactivateMutation.isPending

  const mutationError =
    createMutation.error ?? updateMutation.error ?? markAsSoldMutation.error ?? reactivateMutation.error

  const isSoldVehicle = isEdit && vehicle.status === 'sold'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
      onSave={handleSave}
      saveLabel={isEdit ? 'Save Changes' : 'Add Vehicle'}
      loading={isPending}
    >
      {/* Row 1: Photo + Name + Type/FuelType */}
      <div className="flex gap-4">
        {/* Photo thumbnail */}
        <label className="group relative flex items-center justify-center w-[72px] h-[72px] rounded-xl border-2 border-dashed border-base-300 dark:border-base-500 hover:border-accent-500 dark:hover:border-accent-400 bg-sky-50 dark:bg-sky-950/30 cursor-pointer transition-colors overflow-hidden flex-shrink-0">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Vehicle photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <Car
              className="w-7 h-7 text-sky-300 dark:text-sky-600"
              aria-hidden="true"
            />
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handlePhotoChange}
            data-testid="photo-upload"
          />
        </label>

        <div className="flex-1 space-y-3">
          <FormField label="Name" required error={errors.name} htmlFor="vehicle-name">
            <TextInput
              id="vehicle-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => { const { name: _, ...rest } = prev; return rest })
              }}
              placeholder="e.g. Family Car"
              error={!!errors.name}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" htmlFor="vehicle-type">
              <SelectInput
                id="vehicle-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            <FormField label="Fuel Type" htmlFor="vehicle-fuel-type">
              <SelectInput
                id="vehicle-fuel-type"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
              >
                {FUEL_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </div>
        </div>
      </div>

      {/* Row 2: Make, Model, Year */}
      <div className="grid grid-cols-3 gap-3" data-testid="make-model-year-grid">
        <FormField label="Make" htmlFor="vehicle-make">
          <TextInput
            id="vehicle-make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g. Toyota"
          />
        </FormField>

        <FormField label="Model" htmlFor="vehicle-model">
          <TextInput
            id="vehicle-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Corolla"
          />
        </FormField>

        <FormField label="Year" htmlFor="vehicle-year">
          <TextInput
            id="vehicle-year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2022"
          />
        </FormField>
      </div>

      {/* Row 3: License Plate */}
      <FormField label="License Plate" htmlFor="vehicle-license-plate">
        <TextInput
          id="vehicle-license-plate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder="e.g. AB 12 345"
        />
      </FormField>

      {/* Mark as Sold section (edit mode, active vehicles only) */}
      {isEdit && vehicle.status === 'active' && (
        <>
          <div className="border-t border-base-200 dark:border-base-600" />

          {!showSoldSection ? (
            <button
              type="button"
              onClick={() => setShowSoldSection(true)}
              className="text-sm font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              data-testid="mark-as-sold-button"
            >
              Mark as Sold...
            </button>
          ) : (
            <div className="space-y-3" data-testid="sold-section">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This will mark the vehicle as sold and move it to the sold section.
                </p>
              </div>

              <FormField
                label="Sale Date"
                required
                error={errors.saleDate}
                htmlFor="vehicle-sale-date"
              >
                <TextInput
                  id="vehicle-sale-date"
                  type="date"
                  value={saleDate}
                  onChange={(e) => {
                    setSaleDate(e.target.value)
                    if (errors.saleDate)
                      setErrors((prev) => { const { saleDate: _, ...rest } = prev; return rest })
                  }}
                  error={!!errors.saleDate}
                />
              </FormField>

              <FormField label="Sale Price (DKK)" htmlFor="vehicle-sale-price">
                <TextInput
                  id="vehicle-sale-price"
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="e.g. 180000"
                />
              </FormField>

              <FormField label="Sale Note" htmlFor="vehicle-sale-note">
                <TextInput
                  id="vehicle-sale-note"
                  value={saleNote}
                  onChange={(e) => setSaleNote(e.target.value)}
                  placeholder="e.g. Sold to dealer"
                />
              </FormField>
            </div>
          )}
        </>
      )}

      {/* Sold vehicle info (read-only) + reactivate */}
      {isSoldVehicle && (
        <>
          <div className="border-t border-base-200 dark:border-base-600" />

          <div className="space-y-2">
            <p className="text-xs font-medium text-base-500 dark:text-base-400">
              Sale Information
            </p>
            <div className="rounded-lg bg-base-50 dark:bg-base-900 border border-base-200 dark:border-base-600 px-3 py-2 space-y-1">
              <p className="text-sm text-base-700 dark:text-base-300">
                <span className="text-base-500 dark:text-base-400">Date:</span>{' '}
                {vehicle.saleDate}
              </p>
              {vehicle.salePrice != null && (
                <p className="text-sm text-base-700 dark:text-base-300">
                  <span className="text-base-500 dark:text-base-400">Price:</span>{' '}
                  {vehicle.salePrice.toLocaleString()} DKK
                </p>
              )}
              {vehicle.saleNote && (
                <p className="text-sm text-base-700 dark:text-base-300">
                  <span className="text-base-500 dark:text-base-400">Note:</span>{' '}
                  {vehicle.saleNote}
                </p>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => reactivateMutation.mutate(vehicle.id)}
              loading={reactivateMutation.isPending}
            >
              Reactivate Vehicle
            </Button>
          </div>
        </>
      )}

      {/* Error display */}
      {mutationError && (
        <p className="text-sm text-rose-500">
          {mutationError instanceof Error ? mutationError.message : 'An error occurred'}
        </p>
      )}

      {/* Delete button (edit mode only) */}
      {isEdit && onDelete && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onDelete}
            className="text-sm font-medium text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            Delete Vehicle
          </button>
        </div>
      )}
    </Dialog>
  )
}

export { VehicleDialog }
export type { VehicleDialogProps }
