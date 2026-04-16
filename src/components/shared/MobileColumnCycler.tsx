import type { ReactNode } from 'react'

interface MobileColumnCyclerHeaderProps {
  columns: Array<{ label: string }>
  activeIndex: number
  onCycle: () => void
  /** Breakpoint above which this column hides. Default 'sm' (640px). Use 'lg' for tables with many columns. */
  hideAbove?: 'sm' | 'lg'
}

function MobileColumnCyclerHeader({ columns, activeIndex, onCycle, hideAbove = 'sm' }: MobileColumnCyclerHeaderProps) {
  const hiddenClass = hideAbove === 'lg' ? 'lg:hidden' : 'sm:hidden'
  return (
    <th className={`${hiddenClass} px-4 py-2.5 text-right`}>
      <button
        className="inline-flex flex-col items-end gap-0.5 text-xs font-medium text-base-300 dark:text-base-400"
        onClick={onCycle}
      >
        <span>{columns[activeIndex]!.label}</span>
        <div className="flex items-center gap-1">
          {columns.map((_, i) => (
            <span
              key={i}
              className={`w-1 h-1 rounded-full ${i === activeIndex ? 'bg-accent-500' : 'bg-base-300 dark:bg-base-500'}`}
            />
          ))}
        </div>
      </button>
    </th>
  )
}

interface MobileColumnCyclerCellProps {
  values: Array<ReactNode>
  activeIndex: number
  /** Breakpoint above which this cell hides. Default 'sm'. Use 'lg' for tables with many columns. */
  hideAbove?: 'sm' | 'lg'
}

function MobileColumnCyclerCell({ values, activeIndex, hideAbove = 'sm' }: MobileColumnCyclerCellProps) {
  const hiddenClass = hideAbove === 'lg' ? 'lg:hidden' : 'sm:hidden'
  return (
    <td className={`${hiddenClass} px-4 py-3 text-right align-middle`}>
      <div className="relative">
        {values.map((value, i) => (
          <div
            key={i}
            className={[
              'font-mono-data text-sm text-base-900 dark:text-white transition-opacity duration-150 text-right',
              i !== activeIndex && 'absolute top-0 right-0 pointer-events-none',
            ].filter(Boolean).join(' ')}
            style={{ opacity: i === activeIndex ? 1 : 0 }}
            aria-hidden={i !== activeIndex}
          >
            {value}
          </div>
        ))}
      </div>
    </td>
  )
}

export { MobileColumnCyclerHeader, MobileColumnCyclerCell }
