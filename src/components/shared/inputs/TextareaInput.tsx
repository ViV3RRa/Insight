import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { baseClasses, normalBorder, errorBorder } from './TextInput'

interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ error, rows = 3, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`resize-none ${baseClasses} ${error ? errorBorder : normalBorder} ${className}`}
        {...props}
      />
    )
  },
)

TextareaInput.displayName = 'TextareaInput'

export { TextareaInput }
export type { TextareaInputProps }
