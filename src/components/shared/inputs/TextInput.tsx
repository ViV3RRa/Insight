import { forwardRef, type InputHTMLAttributes } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const baseClasses = [
  'w-full px-3 py-2.5',
  'border rounded-lg',
  'bg-white dark:bg-base-900',
  'text-sm text-base-900 dark:text-white',
  'placeholder:text-base-300 dark:placeholder:text-base-500',
  'transition-colors duration-150',
  'outline-none',
].join(' ')

const normalBorder =
  'border-base-200 dark:border-base-600 focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:focus:ring-accent-400/30 dark:focus:border-accent-400'

const errorBorder =
  'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        className={`${baseClasses} ${error ? errorBorder : normalBorder} ${className}`}
        {...props}
      />
    )
  },
)

TextInput.displayName = 'TextInput'

export { TextInput, baseClasses, normalBorder, errorBorder }
export type { TextInputProps }
