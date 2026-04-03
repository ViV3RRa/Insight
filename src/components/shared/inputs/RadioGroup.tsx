import { type ChangeEvent } from 'react'

interface RadioOption {
  label: string
  value: string
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: boolean
}

function RadioGroup({ name, options, value, onChange, error }: RadioGroupProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange?.(e.target.value)
  }

  return (
    <div className="flex gap-3" role="radiogroup">
      {options.map((option) => (
        <label key={option.value} className="flex-1 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleChange}
            className="peer sr-only"
          />
          <div
            className={[
              'text-center py-2.5 rounded-lg border',
              'text-sm font-medium',
              'transition-colors duration-150',
              error
                ? 'border-rose-400 dark:border-rose-500 text-base-500 dark:text-base-400'
                : 'border-base-200 dark:border-base-600 text-base-500 dark:text-base-400',
              'peer-checked:border-accent-500 peer-checked:bg-accent-50 peer-checked:text-accent-700',
              'dark:peer-checked:border-accent-400 dark:peer-checked:bg-accent-500/10 dark:peer-checked:text-accent-400',
            ].join(' ')}
          >
            {option.label}
          </div>
        </label>
      ))}
    </div>
  )
}

export { RadioGroup }
export type { RadioGroupProps, RadioOption }
