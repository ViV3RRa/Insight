import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface MobileColumnCyclerHeaderProps {
  columns: Array<{ label: string }>
  activeIndex: number
  onCycle: () => void
}

function MobileColumnCyclerHeader({ columns, activeIndex, onCycle }: MobileColumnCyclerHeaderProps) {
  return (
    <th className="sm:hidden px-4 py-2.5 text-right">
      <button
        className="inline-flex flex-col items-end gap-0.5 text-xs font-medium text-base-300 dark:text-base-400"
        onClick={onCycle}
      >
        <div className="flex items-center gap-1">
          <span>{columns[activeIndex]!.label}</span>
          <ChevronDown className="w-3 h-3 text-base-300" />
        </div>
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
}

function MobileColumnCyclerCell({ values, activeIndex }: MobileColumnCyclerCellProps) {
  return (
    <td className="sm:hidden px-4 py-3 text-right">
      <div className="grid">
        {values.map((value, i) => (
          <span
            key={i}
            className="col-start-1 row-start-1 font-mono-data text-sm text-base-900 dark:text-white transition-opacity duration-150"
            style={{ opacity: i === activeIndex ? 1 : 0 }}
          >
            {value}
          </span>
        ))}
      </div>
    </td>
  )
}

export { MobileColumnCyclerHeader, MobileColumnCyclerCell }
