import { forwardRef, type SelectHTMLAttributes } from 'react'
import { baseClasses, normalBorder, errorBorder } from './TextInput'

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ error, className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`form-select appearance-none ${baseClasses} ${error ? errorBorder : normalBorder} ${className}`}
        {...props}
      >
        {children}
      </select>
    )
  },
)

SelectInput.displayName = 'SelectInput'

export { SelectInput }
export type { SelectInputProps }
