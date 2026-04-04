import { useState, useEffect, useCallback } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { TextInput, NumberInput, SelectInput } from '@/components/shared/inputs'
import { FileUpload } from '@/components/shared/FileUpload'
import { formatCurrency } from '@/utils/formatters'
import type { Transaction } from '@/types/investment'

interface PlatformOption {
  id: string
  name: string
  type: 'investment' | 'cash'
  currency: string
  icon: string
}

interface TransactionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    platformId: string
    type: 'deposit' | 'withdrawal'
    amount: number
    exchangeRate: number | null
    timestamp: string
    note: string
    attachment: File | null
  }) => void
  onSaveAndAddAnother?: (data: {
    platformId: string
    type: 'deposit' | 'withdrawal'
    amount: number
    exchangeRate: number | null
    timestamp: string
    note: string
    attachment: File | null
  }) => void
  transaction?: Transaction
  platformId?: string
  platforms: PlatformOption[]
  selectedCurrency?: string
  defaultExchangeRate?: number | null
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
  amount?: string
  timestamp?: string
}

function TransactionDialog({
  isOpen,
  onClose,
  onSave,
  onSaveAndAddAnother,
  transaction,
  platformId: fixedPlatformId,
  platforms,
  selectedCurrency,
  defaultExchangeRate,
  loading = false,
}: TransactionDialogProps) {
  const isEditMode = !!transaction

  const [platformId, setPlatformId] = useState('')
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [amount, setAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [note, setNote] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})

  const showPlatformSelect = !fixedPlatformId

  // Derive currency from selected platform or prop
  const currency = (() => {
    if (fixedPlatformId && selectedCurrency) return selectedCurrency
    const selected = platforms.find((p) => p.id === platformId)
    return selected?.currency ?? 'DKK'
  })()

  const showExchangeRate = currency !== 'DKK'

  // Reset form when dialog opens or transaction changes
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setPlatformId(transaction.platformId)
        setType(transaction.type)
        setAmount(String(transaction.amount))
        setExchangeRate(transaction.exchangeRate != null ? String(transaction.exchangeRate) : '')
        setTimestamp(formatDatetimeLocal(new Date(transaction.timestamp)))
        setNote(transaction.note ?? '')
        setAttachment(null)
      } else {
        setPlatformId(fixedPlatformId ?? '')
        setType('deposit')
        setAmount('')
        setExchangeRate(defaultExchangeRate != null ? String(defaultExchangeRate) : '')
        setTimestamp(getNowDatetimeLocal())
        setNote('')
        setAttachment(null)
      }
      setErrors({})
    }
  }, [isOpen, transaction, fixedPlatformId, defaultExchangeRate])

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    if (showPlatformSelect && !platformId) {
      newErrors.platformId = 'Platform is required'
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (Number(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero'
    }

    if (!timestamp) {
      newErrors.timestamp = 'Date and time is required'
    }

    return newErrors
  }, [showPlatformSelect, platformId, amount, timestamp])

  const buildData = () => ({
    platformId: fixedPlatformId ?? platformId,
    type,
    amount: Number(amount),
    exchangeRate: showExchangeRate && exchangeRate ? Number(exchangeRate) : null,
    timestamp,
    note,
    attachment,
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
    // Reset amount, note, attachment, timestamp; reset type to deposit; keep platform & exchange rate
    setAmount('')
    setNote('')
    setAttachment(null)
    setTimestamp(getNowDatetimeLocal())
    setType('deposit')
    setErrors({})
  }

  const investmentPlatforms = platforms.filter((p) => p.type === 'investment')
  const cashPlatforms = platforms.filter((p) => p.type === 'cash')

  const parsedAmount = Number(amount) || 0
  const parsedRate = Number(exchangeRate) || 0

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Transaction' : 'Add Transaction'}
      onSave={handleSave}
      onSaveAndAddAnother={!isEditMode ? handleSaveAndAddAnother : undefined}
      showSaveAndAddAnother={!isEditMode}
      loading={loading}
    >
      {/* Platform select */}
      {showPlatformSelect && (
        <FormField label="Platform" required error={errors.platformId} htmlFor="tx-platform">
          <SelectInput
            id="tx-platform"
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

      {/* Transaction type radio */}
      <FormField label="Type">
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
              type === 'deposit'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium dark:border-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'border-base-200 dark:border-base-600 text-base-500 dark:text-base-400 hover:border-base-300 dark:hover:border-base-500'
            }`}
          >
            <input
              type="radio"
              name="txType"
              value="deposit"
              checked={type === 'deposit'}
              onChange={() => setType('deposit')}
              className="sr-only"
            />
            <ArrowDownLeft className="w-4 h-4" />
            Deposit
          </label>
          <label
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
              type === 'withdrawal'
                ? 'border-rose-500 bg-rose-50 text-rose-700 font-medium dark:border-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                : 'border-base-200 dark:border-base-600 text-base-500 dark:text-base-400 hover:border-base-300 dark:hover:border-base-500'
            }`}
          >
            <input
              type="radio"
              name="txType"
              value="withdrawal"
              checked={type === 'withdrawal'}
              onChange={() => setType('withdrawal')}
              className="sr-only"
            />
            <ArrowUpRight className="w-4 h-4" />
            Withdrawal
          </label>
        </div>
      </FormField>

      {/* Amount */}
      <FormField label="Amount" required error={errors.amount} htmlFor="tx-amount">
        <div className="relative">
          <NumberInput
            id="tx-amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }))
            }}
            error={!!errors.amount}
            placeholder="0.00"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data pointer-events-none">
            {currency}
          </span>
        </div>
      </FormField>

      {/* Exchange Rate */}
      {showExchangeRate && (
        <div>
          <FormField label="Exchange Rate" htmlFor="tx-exchange-rate">
            <NumberInput
              id="tx-exchange-rate"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="0.0000"
              step="0.0001"
            />
          </FormField>
          {parsedAmount > 0 && parsedRate > 0 && (
            <p className="text-xs text-base-300 dark:text-base-500 mt-1">
              ≈ {formatCurrency(parsedAmount * parsedRate, 'DKK')} DKK
            </p>
          )}
        </div>
      )}

      {/* Timestamp */}
      <FormField label="Date & Time" required error={errors.timestamp} htmlFor="tx-timestamp">
        <input
          id="tx-timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => {
            setTimestamp(e.target.value)
            if (errors.timestamp) setErrors((prev) => ({ ...prev, timestamp: undefined }))
          }}
          className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-base-900 text-sm text-base-900 dark:text-white border-base-200 dark:border-base-600 focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:focus:ring-accent-400/30 dark:focus:border-accent-400 outline-none transition-colors duration-150"
        />
      </FormField>

      {/* Note */}
      <FormField label="Note" htmlFor="tx-note">
        <TextInput
          id="tx-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
        />
      </FormField>

      {/* Attachment */}
      <FormField label="Attachment">
        <FileUpload
          value={attachment ?? undefined}
          onChange={(file) => setAttachment(file)}
          accept="image/*,.pdf"
          maxSizeMB={10}
        />
      </FormField>
    </Dialog>
  )
}

export { TransactionDialog }
export type { TransactionDialogProps, PlatformOption }
