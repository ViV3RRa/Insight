import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, Droplet, Flame, Sun, Wind, Thermometer, Wifi, Trash2 } from 'lucide-react'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput } from '@/components/shared/inputs'
import * as utilityService from '@/services/utilities'
import type { Utility, UtilityIcon as UtilityIconType, UtilityColor } from '@/types/home'

interface UtilityDialogProps {
  isOpen: boolean
  onClose: () => void
  utility?: Utility
  onDelete?: () => void
}

const ICONS: { key: UtilityIconType; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'bolt', Icon: Zap },
  { key: 'droplet', Icon: Droplet },
  { key: 'flame', Icon: Flame },
  { key: 'sun', Icon: Sun },
  { key: 'wind', Icon: Wind },
  { key: 'thermometer', Icon: Thermometer },
  { key: 'wifi', Icon: Wifi },
  { key: 'trash', Icon: Trash2 },
]

const COLORS: UtilityColor[] = ['amber', 'blue', 'orange', 'emerald', 'violet', 'rose', 'cyan', 'slate']

const COLOR_BG: Record<UtilityColor, string> = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  slate: 'bg-slate-500',
}

interface FormErrors {
  icon?: string
  color?: string
  name?: string
  unit?: string
}

function UtilityDialog({ isOpen, onClose, utility, onDelete }: UtilityDialogProps) {
  const queryClient = useQueryClient()

  const [selectedIcon, setSelectedIcon] = useState<UtilityIconType | null>(null)
  const [selectedColor, setSelectedColor] = useState<UtilityColor | null>(null)
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setSelectedIcon(utility?.icon ?? null)
      setSelectedColor(utility?.color ?? null)
      setName(utility?.name ?? '')
      setUnit(utility?.unit ?? '')
      setErrors({})
    }
  }, [isOpen, utility])

  const mutation = useMutation({
    mutationFn: (data: { name: string; unit: string; icon: UtilityIconType; color: UtilityColor }) => {
      if (utility) {
        return utilityService.update(utility.id, data)
      }
      return utilityService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilities'] })
      onClose()
    },
  })

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {}
    if (!selectedIcon) newErrors.icon = 'Please select an icon'
    if (!selectedColor) newErrors.color = 'Please select a color'
    if (!name.trim()) newErrors.name = 'Name is required'
    if (!unit.trim()) newErrors.unit = 'Unit is required'
    return newErrors
  }

  const handleSave = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    mutation.mutate({
      name: name.trim(),
      unit: unit.trim(),
      icon: selectedIcon!,
      color: selectedColor!,
    })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={utility ? 'Edit Utility' : 'Add Utility'}
      onSave={handleSave}
      loading={mutation.isPending}
    >
      <FormField label="Icon" required error={errors.icon}>
        <div className="grid grid-cols-4 gap-2">
          {ICONS.map(({ key, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setSelectedIcon(key)
                if (errors.icon) setErrors((prev) => ({ ...prev, icon: undefined }))
              }}
              className={`p-3 rounded-xl border-2 transition-colors flex items-center justify-center
                ${selectedIcon === key
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                  : 'border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500'}`}
              aria-label={key}
            >
              <Icon className="w-5 h-5 text-base-600 dark:text-base-300" />
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Color" required error={errors.color}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                setSelectedColor(color)
                if (errors.color) setErrors((prev) => ({ ...prev, color: undefined }))
              }}
              className={`w-8 h-8 rounded-full ${COLOR_BG[color]}
                ${selectedColor === color
                  ? 'ring-2 ring-offset-2 ring-accent-500 dark:ring-offset-base-800'
                  : ''}`}
              aria-label={color}
            />
          ))}
        </div>
      </FormField>

      <FormField label="Name" required error={errors.name} htmlFor="utility-name">
        <TextInput
          id="utility-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          placeholder="e.g. Electricity"
          error={!!errors.name}
        />
      </FormField>

      <FormField label="Unit" required error={errors.unit} htmlFor="utility-unit">
        <TextInput
          id="utility-unit"
          value={unit}
          onChange={(e) => {
            setUnit(e.target.value)
            if (errors.unit) setErrors((prev) => ({ ...prev, unit: undefined }))
          }}
          placeholder="e.g. kWh, m³"
          error={!!errors.unit}
        />
      </FormField>

      {mutation.isError && (
        <p className="text-sm text-rose-500">
          {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
        </p>
      )}

      {utility && onDelete && (
        <div className="border-t border-base-150 dark:border-base-700 pt-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Delete Utility</div>
              <div className="text-xs text-base-400 mt-0.5">Permanently remove this utility and all its data</div>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              Delete...
            </button>
          </div>
        </div>
      )}
    </Dialog>
  )
}

export { UtilityDialog }
export type { UtilityDialogProps }
