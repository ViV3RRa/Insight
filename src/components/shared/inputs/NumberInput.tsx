import { forwardRef, type InputHTMLAttributes } from 'react'
import { baseClasses, normalBorder, errorBorder } from './TextInput'

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="number"
        className={`${baseClasses} font-mono-data ${error ? errorBorder : normalBorder} ${className}`}
        {...props}
      />
    )
  },
)

NumberInput.displayName = 'NumberInput'

export { NumberInput }
export type { NumberInputProps }
