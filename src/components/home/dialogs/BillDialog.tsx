import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@/components/shared/Dialog'
import { FormField } from '@/components/shared/FormField'
import { FileUpload } from '@/components/shared/FileUpload'
import * as utilityBillService from '@/services/utilityBills'
import type { UtilityBill, Utility } from '@/types/home'
import { format } from 'date-fns'

interface BillDialogProps {
  isOpen: boolean
  onClose: () => void
  bill?: UtilityBill
  utilityId?: string
  utilities?: Utility[]
}

function nowTimestamp(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm")
}

const inputClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-base-200 dark:border-base-600 bg-white dark:bg-base-900 text-base-900 dark:text-white focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:focus:ring-accent-400/30 dark:focus:border-accent-400 outline-none transition-colors duration-150'

function BillDialog({ isOpen, onClose, bill, utilityId, utilities }: BillDialogProps) {
  const queryClient = useQueryClient()

  const [selectedUtilityId, setSelectedUtilityId] = useState('')
  const [amount, setAmount] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [note, setNote] = useState('')
  const [attachment, setAttachment] = useState<File | string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!bill
  const effectiveUtilityId = utilityId ?? selectedUtilityId

  useEffect(() => {
    if (isOpen) {
      if (bill) {
        setSelectedUtilityId(bill.utilityId)
        setAmount(String(bill.amount))
        setPeriodStart(bill.periodStart)
        setPeriodEnd(bill.periodEnd)
        setTimestamp(bill.timestamp ? format(new Date(bill.timestamp), "yyyy-MM-dd'T'HH:mm") : '')
        setNote(bill.note ?? '')
        setAttachment(bill.attachment ?? null)
      } else {
        setSelectedUtilityId('')
        setAmount('')
        setPeriodStart('')
        setPeriodEnd('')
        setTimestamp(nowTimestamp())
        setNote('')
        setAttachment(null)
      }
      setErrors({})
    }
  }, [isOpen, bill])

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (bill) {
        return utilityBillService.update(bill.id, data)
      }
      return utilityBillService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilityBills', effectiveUtilityId] })
    },
  })

  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {}
    if (!utilityId && !selectedUtilityId) {
      newErrors.utility = 'Please select a utility'
    }
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (Number(amount) <= 0) {
      newErrors.amount = 'Amount must be positive'
    }
    if (!periodStart) {
      newErrors.periodStart = 'Period start is required'
    }
    if (!periodEnd) {
      newErrors.periodEnd = 'Period end is required'
    }
    if (periodStart && periodEnd && periodEnd < periodStart) {
      newErrors.periodEnd = 'Period end must be on or after period start'
    }
    return newErrors
  }

  function buildFormData(): FormData {
    const formData = new FormData()
    formData.set('utilityId', effectiveUtilityId)
    formData.set('amount', amount)
    formData.set('periodStart', periodStart)
    formData.set('periodEnd', periodEnd)
    if (timestamp) formData.set('timestamp', new Date(timestamp).toISOString())
    if (note) formData.set('note', note)
    if (attachment instanceof File) formData.set('attachment', attachment)
    else if (attachment === null && bill?.attachment) formData.set('attachment', '')
    return formData
  }

  function resetForAnother() {
    setAmount('')
    setPeriodStart('')
    setPeriodEnd('')
    setTimestamp(nowTimestamp())
    setNote('')
    setAttachment(null)
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
      title={isEdit ? 'Edit Bill' : 'Add Bill'}
      onSave={handleSave}
      saveLabel={isEdit ? 'Save' : 'Save Bill'}
      onSaveAndAddAnother={handleSaveAndAddAnother}
      showSaveAndAddAnother={!isEdit}
      loading={mutation.isPending}
    >
      {/* Utility select — only when no utilityId prop */}
      {!utilityId && (
        <FormField label="Utility" required htmlFor="bill-utility" error={errors.utility}>
          <select
            id="bill-utility"
            value={selectedUtilityId}
            onChange={(e) => {
              setSelectedUtilityId(e.target.value)
              if (errors.utility) setErrors((prev) => ({ ...prev, utility: undefined as never }))
            }}
            className={inputClass}
          >
            <option value="">Select utility...</option>
            {utilities?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {/* Amount */}
      <FormField label="Amount" required htmlFor="bill-amount" error={errors.amount}>
        <div className="relative">
          <input
            id="bill-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined as never }))
            }}
            className={`${inputClass} pr-14 font-mono-data`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data">
            DKK
          </span>
        </div>
      </FormField>

      {/* Period start + end */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Period Start" required htmlFor="bill-period-start" error={errors.periodStart}>
          <input
            id="bill-period-start"
            type="date"
            value={periodStart}
            onChange={(e) => {
              setPeriodStart(e.target.value)
              if (errors.periodStart) setErrors((prev) => ({ ...prev, periodStart: undefined as never }))
            }}
            className={inputClass}
          />
        </FormField>
        <FormField label="Period End" required htmlFor="bill-period-end" error={errors.periodEnd}>
          <input
            id="bill-period-end"
            type="date"
            value={periodEnd}
            onChange={(e) => {
              setPeriodEnd(e.target.value)
              if (errors.periodEnd) setErrors((prev) => ({ ...prev, periodEnd: undefined as never }))
            }}
            className={inputClass}
          />
        </FormField>
      </div>

      {/* Date received */}
      <FormField label="Date Received" htmlFor="bill-timestamp">
        <input
          id="bill-timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className={inputClass}
        />
      </FormField>

      {/* Note */}
      <FormField label="Note" htmlFor="bill-note">
        <input
          id="bill-note"
          type="text"
          placeholder="e.g., annual settlement"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClass}
        />
      </FormField>

      {/* Attachment */}
      <FormField label="Attachment">
        <FileUpload value={attachment ?? undefined} onChange={setAttachment} accept="image/*,.pdf" maxSizeMB={10} />
      </FormField>

      {mutation.isError && (
        <p className="text-sm text-rose-500">
          {mutation.error instanceof Error ? mutation.error.message : 'An error occurred'}
        </p>
      )}
    </Dialog>
  )
}

export { BillDialog }
export type { BillDialogProps }
