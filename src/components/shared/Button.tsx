import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-base-900 text-white',
    'hover:bg-base-800 active:bg-base-700',
    'dark:bg-accent-600 dark:hover:bg-accent-700 dark:active:bg-accent-800',
  ].join(' '),
  secondary: [
    'bg-white text-base-600 border border-base-200',
    'hover:bg-base-50 active:bg-base-100',
    'dark:bg-base-800 dark:text-base-200 dark:border-base-600',
    'dark:hover:bg-base-700 dark:active:bg-base-600',
  ].join(' '),
  ghost: [
    'text-base-600',
    'hover:text-base-800 hover:bg-base-100',
    'dark:text-base-300 dark:hover:text-base-100 dark:hover:bg-base-700',
  ].join(' '),
  destructive: [
    'bg-rose-500 text-white',
    'hover:bg-rose-600 active:bg-rose-700',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const Spinner = () => (
  <svg
    className="animate-spin w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
)

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150',
          sizeClasses[size],
          variantClasses[variant],
          loading && 'opacity-75 pointer-events-none',
          isDisabled && !loading && 'opacity-50 pointer-events-none',
          fullWidth && 'w-full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }
