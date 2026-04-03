import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, within } from '@/test/utils'
import { DataTable, type ColumnDef } from './DataTable'

interface TestRow {
  id: string
  name: string
  value: number
  cost: number
  [key: string]: unknown
}

const columns: Array<ColumnDef<TestRow>> = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value', align: 'right', sortable: true },
  { key: 'cost', label: 'Cost', align: 'right', hideOnMobile: true },
]

const data: TestRow[] = [
  { id: '1', name: 'Alpha', value: 100, cost: 50 },
  { id: '2', name: 'Beta', value: 300, cost: 30 },
  { id: '3', name: 'Gamma', value: 200, cost: 70 },
]

const keyExtractor = (row: TestRow) => row.id

function renderTable(props: Partial<Parameters<typeof DataTable<TestRow>>[0]> = {}) {
  return renderWithProviders(
    <DataTable<TestRow>
      columns={columns}
      data={data}
      keyExtractor={keyExtractor}
      {...props}
    />,
  )
}

describe('DataTable', () => {
  it('renders column headers with correct labels', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
    expect(screen.getByText('Cost')).toBeInTheDocument()
  })

  it('renders data rows with correct cell content', () => {
    renderTable()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('renders empty data array without crash', () => {
    renderTable({ data: [] })
    expect(screen.getByText('Name')).toBeInTheDocument()
    // No rows rendered
    const rows = screen.queryAllByRole('row')
    // Only header row
    expect(rows).toHaveLength(1)
  })

  it('header row has correct styling classes', () => {
    const { container } = renderTable()
    const headerRow = container.querySelector('thead tr')
    expect(headerRow!.className).toContain('border-b')
    expect(headerRow!.className).toContain('border-base-200')
    expect(headerRow!.className).toContain('dark:border-base-700')
  })

  it('header cells have correct styling classes', () => {
    const { container } = renderTable()
    const ths = container.querySelectorAll('th')
    expect(ths[0]!.className).toContain('px-4')
    expect(ths[0]!.className).toContain('py-2.5')
    expect(ths[0]!.className).toContain('text-xs')
    expect(ths[0]!.className).toContain('font-medium')
    expect(ths[0]!.className).toContain('text-base-300')
    expect(ths[0]!.className).toContain('dark:text-base-400')
  })

  it('body rows have correct styling classes', () => {
    const { container } = renderTable()
    const bodyRows = container.querySelectorAll('tbody tr')
    expect(bodyRows[0]!.className).toContain('border-b')
    expect(bodyRows[0]!.className).toContain('border-base-100')
    expect(bodyRows[0]!.className).toContain('dark:border-base-700/50')
    expect(bodyRows[0]!.className).toContain('hover:bg-accent-50/20')
    expect(bodyRows[0]!.className).toContain('dark:hover:bg-accent-900/10')
    expect(bodyRows[0]!.className).toContain('transition-colors')
  })

  it('numeric cells are right-aligned with font-mono-data', () => {
    const { container } = renderTable()
    const firstRow = container.querySelectorAll('tbody tr')[0]!
    const cells = firstRow.querySelectorAll('td')
    // Value column (index 1) is right-aligned
    expect(cells[1]!.className).toContain('text-right')
    expect(cells[1]!.className).toContain('font-mono-data')
    expect(cells[1]!.className).toContain('text-base-900')
    expect(cells[1]!.className).toContain('dark:text-white')
  })

  it('left-aligned cells have correct styling', () => {
    const { container } = renderTable()
    const firstRow = container.querySelectorAll('tbody tr')[0]!
    const nameCell = firstRow.querySelectorAll('td')[0]!
    expect(nameCell.className).toContain('text-base-700')
    expect(nameCell.className).toContain('dark:text-base-300')
    expect(nameCell.className).not.toContain('font-mono-data')
  })

  it('hideOnMobile columns have hidden sm:table-cell classes', () => {
    const { container } = renderTable()
    // Cost column (th index 2) should have hidden sm:table-cell
    const ths = container.querySelectorAll('th')
    expect(ths[2]!.className).toContain('hidden')
    expect(ths[2]!.className).toContain('sm:table-cell')

    // Cost td cells also
    const firstRow = container.querySelectorAll('tbody tr')[0]!
    const cells = firstRow.querySelectorAll('td')
    expect(cells[2]!.className).toContain('hidden')
    expect(cells[2]!.className).toContain('sm:table-cell')
  })
})

describe('DataTable — sorting', () => {
  it('sortable columns show chevron when sorted, clicking toggles direction', async () => {
    const user = userEvent.setup()
    renderTable({ sortable: true })

    // Click Value header to sort ascending
    await user.click(screen.getByText('Value'))
    // Should show ChevronUp (ascending)
    const valueHeader = screen.getByText('Value').closest('th')!
    expect(valueHeader.querySelector('svg')).toBeInTheDocument()

    // Verify sorted ascending: Alpha (100), Gamma (200), Beta (300)
    const rows = screen.getAllByRole('row').slice(1) // skip header
    expect(within(rows[0]!).getByText('Alpha')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Gamma')).toBeInTheDocument()
    expect(within(rows[2]!).getByText('Beta')).toBeInTheDocument()

    // Click again to sort descending
    await user.click(screen.getByText('Value'))
    const rowsDesc = screen.getAllByRole('row').slice(1)
    expect(within(rowsDesc[0]!).getByText('Beta')).toBeInTheDocument()
    expect(within(rowsDesc[1]!).getByText('Gamma')).toBeInTheDocument()
    expect(within(rowsDesc[2]!).getByText('Alpha')).toBeInTheDocument()
  })

  it('sortable header has cursor-pointer and select-none', () => {
    const { container } = renderTable({ sortable: true })
    // Value column (index 1) is sortable
    const ths = container.querySelectorAll('th')
    expect(ths[1]!.className).toContain('cursor-pointer')
    expect(ths[1]!.className).toContain('select-none')
    expect(ths[1]!.className).toContain('hover:text-base-500')
  })

  it('non-sortable column does not have cursor-pointer', () => {
    const { container } = renderTable({ sortable: true })
    // Name column (index 0) has no sortable prop
    const ths = container.querySelectorAll('th')
    expect(ths[0]!.className).not.toContain('cursor-pointer')
  })

  it('defaultSort applies initial sort order', () => {
    renderTable({ sortable: true, defaultSort: { key: 'value', direction: 'desc' } })
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]!).getByText('Beta')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('Gamma')).toBeInTheDocument()
    expect(within(rows[2]!).getByText('Alpha')).toBeInTheDocument()
  })
})

describe('DataTable — totals row', () => {
  it('renders totals row when provided', () => {
    renderTable({ totals: { name: 'Total', value: '600', cost: '150' } })
    const tfoot = screen.getByRole('table').querySelector('tfoot')
    expect(tfoot).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('600')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
  })

  it('totals row has correct styling', () => {
    const { container } = renderTable({ totals: { name: 'Total' } })
    const tfootRow = container.querySelector('tfoot tr')
    expect(tfootRow!.className).toContain('bg-base-50/60')
    expect(tfootRow!.className).toContain('dark:bg-base-700/30')
  })

  it('totals row is absent when not provided', () => {
    const { container } = renderTable()
    expect(container.querySelector('tfoot')).not.toBeInTheDocument()
  })
})

describe('DataTable — actions', () => {
  it('edit/delete buttons appear per row', () => {
    renderTable({ onEdit: vi.fn(), onDelete: vi.fn() })
    const editButtons = screen.getAllByLabelText('Edit')
    const deleteButtons = screen.getAllByLabelText('Delete')
    expect(editButtons).toHaveLength(3)
    expect(deleteButtons).toHaveLength(3)
  })

  it('action column header shows Actions text', () => {
    renderTable({ onEdit: vi.fn() })
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('action column is hidden on mobile (hidden sm:table-cell)', () => {
    const { container } = renderTable({ onEdit: vi.fn() })
    const actionTh = Array.from(container.querySelectorAll('th')).find(
      (th) => th.textContent === 'Actions',
    )
    expect(actionTh!.className).toContain('hidden')
    expect(actionTh!.className).toContain('sm:table-cell')
  })

  it('onEdit callback fires with correct row', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderTable({ onEdit })

    const editButtons = screen.getAllByLabelText('Edit')
    await user.click(editButtons[1]!)
    expect(onEdit).toHaveBeenCalledWith(data[1])
  })

  it('onDelete callback fires with correct row', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    renderTable({ onDelete })

    const deleteButtons = screen.getAllByLabelText('Delete')
    await user.click(deleteButtons[2]!)
    expect(onDelete).toHaveBeenCalledWith(data[2])
  })

  it('no action column when neither onEdit nor onDelete provided', () => {
    renderTable()
    expect(screen.queryByText('Actions')).not.toBeInTheDocument()
  })
})

describe('DataTable — onRowClick', () => {
  it('fires when row clicked', async () => {
    const onRowClick = vi.fn()
    const user = userEvent.setup()
    renderTable({ onRowClick })

    const rows = screen.getAllByRole('row').slice(1)
    await user.click(rows[0]!)
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('row has cursor-pointer class when onRowClick provided', () => {
    const { container } = renderTable({ onRowClick: vi.fn() })
    const bodyRow = container.querySelectorAll('tbody tr')[0]!
    expect(bodyRow.className).toContain('cursor-pointer')
  })

  it('edit button click does not trigger onRowClick', async () => {
    const onRowClick = vi.fn()
    const onEdit = vi.fn()
    const user = userEvent.setup()
    renderTable({ onRowClick, onEdit })

    const editButtons = screen.getAllByLabelText('Edit')
    await user.click(editButtons[0]!)
    expect(onEdit).toHaveBeenCalled()
    expect(onRowClick).not.toHaveBeenCalled()
  })
})

describe('DataTable — show more', () => {
  const manyRows: TestRow[] = Array.from({ length: 15 }, (_, i) => ({
    id: String(i),
    name: `Item ${i}`,
    value: i * 100,
    cost: i * 10,
  }))

  it('show-more toggle appears at threshold', () => {
    renderTable({ data: manyRows })
    expect(screen.getByText('Show all 15')).toBeInTheDocument()
  })

  it('initially shows only threshold rows', () => {
    const { container } = renderTable({ data: manyRows })
    const bodyRows = container.querySelectorAll('tbody tr')
    expect(bodyRows).toHaveLength(10)
  })

  it('show-more text toggles between "Show all N" and "Show less"', async () => {
    const user = userEvent.setup()
    renderTable({ data: manyRows })

    expect(screen.getByText('Show all 15')).toBeInTheDocument()
    await user.click(screen.getByText('Show all 15'))
    expect(screen.getByText('Show less')).toBeInTheDocument()

    await user.click(screen.getByText('Show less'))
    expect(screen.getByText('Show all 15')).toBeInTheDocument()
  })

  it('clicking show all reveals all rows', async () => {
    const user = userEvent.setup()
    const { container } = renderTable({ data: manyRows })

    await user.click(screen.getByText('Show all 15'))
    const bodyRows = container.querySelectorAll('tbody tr')
    expect(bodyRows).toHaveLength(15)
  })

  it('no show-more button when data length <= threshold', () => {
    renderTable({ data: data })
    expect(screen.queryByText(/Show all/)).not.toBeInTheDocument()
  })

  it('custom showMoreThreshold works', () => {
    const { container } = renderTable({ data: manyRows, showMoreThreshold: 5 })
    const bodyRows = container.querySelectorAll('tbody tr')
    expect(bodyRows).toHaveLength(5)
    expect(screen.getByText('Show all 15')).toBeInTheDocument()
  })

  it('show-more container has correct styling', () => {
    renderTable({ data: manyRows })
    const showMoreDiv = screen.getByText('Show all 15').closest('div')!
    expect(showMoreDiv.className).toContain('px-4')
    expect(showMoreDiv.className).toContain('py-2')
    expect(showMoreDiv.className).toContain('border-t')
    expect(showMoreDiv.className).toContain('border-base-100')
    expect(showMoreDiv.className).toContain('dark:border-base-700')
  })
})

describe('DataTable — format function', () => {
  it('uses format function when provided', () => {
    const formatColumns: Array<ColumnDef<TestRow>> = [
      { key: 'name', label: 'Name' },
      {
        key: 'value',
        label: 'Value',
        align: 'right',
        format: (val) => `$${val}`,
      },
    ]
    renderWithProviders(
      <DataTable<TestRow>
        columns={formatColumns}
        data={[{ id: '1', name: 'Test', value: 42, cost: 0 }]}
        keyExtractor={(r) => r.id}
      />,
    )
    expect(screen.getByText('$42')).toBeInTheDocument()
  })
})

describe('DataTable — dark mode classes', () => {
  it('has dark mode classes on header row', () => {
    const { container } = renderTable()
    const headerRow = container.querySelector('thead tr')
    expect(headerRow!.className).toContain('dark:border-base-700')
  })

  it('has dark mode classes on body rows', () => {
    const { container } = renderTable()
    const bodyRow = container.querySelectorAll('tbody tr')[0]!
    expect(bodyRow.className).toContain('dark:border-base-700/50')
    expect(bodyRow.className).toContain('dark:hover:bg-accent-900/10')
  })

  it('has dark mode classes on header cells', () => {
    const { container } = renderTable()
    const th = container.querySelectorAll('th')[0]!
    expect(th.className).toContain('dark:text-base-400')
  })
})
