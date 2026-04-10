import { useState, useEffect } from 'react'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput } from '@/components/shared/inputs'
import type { Portfolio } from '@/types/investment'

interface PortfolioDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; ownerName: string; isDefault: boolean }) => void
  portfolio?: Portfolio
  isOnlyDefault?: boolean
  loading?: boolean
  onDelete?: () => void
}

function PortfolioDialog({
  isOpen,
  onClose,
  onSave,
  portfolio,
  isOnlyDefault = false,
  loading = false,
  onDelete,
}: PortfolioDialogProps) {
  const [name, setName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; ownerName?: string }>({})

  // Reset form when dialog opens or portfolio changes
  useEffect(() => {
    if (isOpen) {
      setName(portfolio?.name ?? '')
      setOwnerName(portfolio?.ownerName ?? '')
      setIsDefault(portfolio?.isDefault ?? false)
      setErrors({})
    }
  }, [isOpen, portfolio])

  const handleSave = () => {
    const newErrors: { name?: string; ownerName?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({ name: name.trim(), ownerName: ownerName.trim(), isDefault })
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={portfolio ? 'Edit Portfolio' : 'Add Portfolio'}
      onSave={handleSave}
      loading={loading}
    >
      <FormField label="Name" required error={errors.name} htmlFor="portfolio-name">
        <TextInput
          id="portfolio-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          placeholder="e.g. My Portfolio"
          error={!!errors.name}
        />
      </FormField>

      <FormField label="Owner" required error={errors.ownerName} htmlFor="portfolio-owner">
        <TextInput
          id="portfolio-owner"
          value={ownerName}
          onChange={(e) => {
            setOwnerName(e.target.value)
            if (errors.ownerName) setErrors((prev) => ({ ...prev, ownerName: undefined }))
          }}
          placeholder="e.g. Me, Erik"
          error={!!errors.ownerName}
        />
      </FormField>

      {portfolio && (
        <label className="flex items-center gap-2 text-sm text-base-600 dark:text-base-300">
          <input
            type="checkbox"
            checked={isDefault}
            disabled={isOnlyDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-base-300 dark:border-base-600 text-accent-600 dark:text-accent-400 focus:ring-accent-500 dark:focus:ring-accent-400"
          />
          Set as default portfolio
        </label>
      )}

      {portfolio && onDelete && !portfolio.isDefault && (
        <div className="border-t border-base-150 dark:border-base-700 pt-4 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Delete Portfolio</div>
              <div className="text-xs text-base-400 mt-0.5">Permanently remove this portfolio and all its data</div>
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

export { PortfolioDialog }
export type { PortfolioDialogProps }
