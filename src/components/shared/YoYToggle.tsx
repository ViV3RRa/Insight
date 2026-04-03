import { ArrowLeftRight } from 'lucide-react'

interface YoYToggleProps {
  active: boolean
  onChange: (active: boolean) => void
}

function YoYToggle({ active, onChange }: YoYToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onChange(!active)}
      className={
        active
          ? 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-700 transition-colors duration-150'
          : 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-base-200 dark:border-base-600 text-base-400 dark:text-base-400 hover:text-base-600 hover:border-base-300 dark:hover:text-base-300 dark:hover:border-base-500 transition-colors duration-150'
      }
    >
      <ArrowLeftRight className="w-3.5 h-3.5" />
      YoY
    </button>
  )
}

export { YoYToggle }
