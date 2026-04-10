import { type ReactNode, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { MobileColumnCyclerHeader, MobileColumnCyclerCell } from '@/components/shared/MobileColumnCycler'

interface ColumnDef<T> {
  key: string
  label: string
  align?: 'left' | 'right'
  format?: (value: unknown, row: T) => ReactNode
  sortable?: boolean
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Array<ColumnDef<T>>
  data: T[]
  sortable?: boolean
  defaultSort?: { key: string; direction: 'asc' | 'desc' }
  totals?: Record<string, ReactNode>
  showMoreThreshold?: number
  mobileColumnCycling?: boolean
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onRowClick?: (row: T) => void
  keyExtractor: (row: T) => string
}

function field(row: unknown, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

function DataTable<T>({
  columns,
  data,
  sortable = false,
  defaultSort,
  totals,
  showMoreThreshold = 10,
  mobileColumnCycling = false,
  onEdit,
  onDelete,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>(
    defaultSort,
  )
  const [showAll, setShowAll] = useState(false)
  const [mobileColIndex, setMobileColIndex] = useState(0)

  const hasActions = onEdit !== undefined || onDelete !== undefined
  const mobileHiddenCols = mobileColumnCycling ? columns.filter((c) => c.hideOnMobile) : []
  const hasMobileCycling = mobileHiddenCols.length > 0

  const sortedData = useMemo(() => {
    if (!sort) return data
    const { key, direction } = sort
    return [...data].sort((a, b) => {
      const aVal = field(a, key)
      const bVal = field(b, key)
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sort])

  const visibleData =
    showAll || data.length <= showMoreThreshold
      ? sortedData
      : sortedData.slice(0, showMoreThreshold)

  function handleSort(key: string) {
    if (!sortable) return
    setSort((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  function getCellValue(row: T, col: ColumnDef<T>): ReactNode {
    const raw = field(row, col.key)
    if (col.format) return col.format(raw, row)
    if (raw == null) return ''
    return String(raw)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-base-200 dark:border-base-700">
            {columns.map((col) => {
              const isSortable = sortable && col.sortable === true
              const isSorted = sort?.key === col.key
              return (
                <th
                  key={col.key}
                  className={[
                    'px-4 py-2.5 text-xs font-medium text-base-300 dark:text-base-400',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.hideOnMobile && 'hidden sm:table-cell',
                    isSortable && 'cursor-pointer select-none hover:text-base-500',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={isSortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {isSortable && isSorted && (
                      sort.direction === 'asc' ? (
                        <ChevronUp className="w-3 h-3 text-base-300" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-base-300" />
                      )
                    )}
                  </span>
                </th>
              )
            })}
            {hasActions && (
              <th className="hidden sm:table-cell px-4 py-2.5 text-xs font-medium text-base-300 dark:text-base-400 text-right">
                Actions
              </th>
            )}
            {hasMobileCycling && (
              <MobileColumnCyclerHeader
                columns={mobileHiddenCols.map((c) => ({ label: c.label }))}
                activeIndex={mobileColIndex}
                onCycle={() => setMobileColIndex((prev) => (prev + 1) % mobileHiddenCols.length)}
              />
            )}
          </tr>
        </thead>
        <tbody>
          {visibleData.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={[
                'border-b border-base-100 dark:border-base-700/50 hover:bg-accent-50/20 dark:hover:bg-accent-900/10 transition-colors duration-100',
                onRowClick && 'cursor-pointer',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    'px-4 py-3 text-sm',
                    col.align === 'right'
                      ? 'text-right font-mono-data text-base-900 dark:text-white'
                      : 'text-base-700 dark:text-base-300',
                    col.hideOnMobile && 'hidden sm:table-cell',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {getCellValue(row, col)}
                </td>
              ))}
              {hasActions && (
                <td className="hidden sm:table-cell px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-2">
                    {onEdit && (
                      <button
                        aria-label="Edit"
                        className="p-1 text-base-400 hover:text-base-600 dark:hover:text-base-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(row)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        aria-label="Delete"
                        className="p-1 text-base-400 hover:text-rose-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </span>
                </td>
              )}
              {hasMobileCycling && (
                <MobileColumnCyclerCell
                  values={mobileHiddenCols.map((col) => getCellValue(row, col))}
                  activeIndex={mobileColIndex}
                />
              )}
            </tr>
          ))}
        </tbody>
        {totals && (
          <tfoot>
            <tr className="bg-base-50/60 dark:bg-base-700/30">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    'px-4 py-3 text-sm font-semibold',
                    col.align === 'right'
                      ? 'text-right font-mono-data text-base-900 dark:text-white'
                      : 'text-base-700 dark:text-base-300',
                    col.hideOnMobile && 'hidden sm:table-cell',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {totals[col.key] ?? ''}
                </td>
              ))}
              {hasActions && <td className="hidden sm:table-cell" />}
              {hasMobileCycling && (
                <MobileColumnCyclerCell
                  values={mobileHiddenCols.map((col) => totals[col.key] ?? '')}
                  activeIndex={mobileColIndex}
                />
              )}
            </tr>
          </tfoot>
        )}
      </table>
      {data.length > showMoreThreshold && (
        <div className="px-4 py-2 border-t border-base-100 dark:border-base-700">
          <button
            className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? 'Show less' : `Show all ${data.length}`}
          </button>
        </div>
      )}
    </div>
  )
}

export { DataTable }
export type { ColumnDef, DataTableProps }
