import { type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  htmlFor?: string
}

function FormField({ label, required, error, children, htmlFor }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-base-500 dark:text-base-400"
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export { FormField }
export type { FormFieldProps }
