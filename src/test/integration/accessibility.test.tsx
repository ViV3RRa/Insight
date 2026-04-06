import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { renderWithProviders, screen, userEvent } from '../utils'
import { Dialog } from '@/components/shared/Dialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { TabBar } from '@/components/shared/TabBar'
import { DropdownSwitcher } from '@/components/shared/DropdownSwitcher'
import { ChartCard } from '@/components/shared/ChartCard'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'
import { CollapsibleYearTable } from '@/components/shared/CollapsibleYearTable'
import { MobileDrawer } from '@/components/shared/MobileDrawer'
import { DataTable } from '@/components/shared/DataTable'

// --- Dialog ---

describe('Dialog accessibility', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Dialog',
    onSave: vi.fn(),
  }

  it('has role=dialog and aria-modal', () => {
    renderWithProviders(
      <Dialog {...defaultProps}>
        <input type="text" />
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-labelledby pointing to the title', () => {
    renderWithProviders(
      <Dialog {...defaultProps}>
        <input type="text" />
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
    expect(document.getElementById('dialog-title')).toHaveTextContent('Test Dialog')
  })

  it('closes on Escape key', async () => {
    const onClose = vi.fn()
    renderWithProviders(
      <Dialog {...defaultProps} onClose={onClose}>
        <input type="text" />
      </Dialog>,
    )
    const user = userEvent.setup()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Dialog {...defaultProps}>
        <label htmlFor="test-input">Name</label>
        <input id="test-input" type="text" />
      </Dialog>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// --- DeleteConfirmDialog ---

describe('DeleteConfirmDialog accessibility', () => {
  const defaultProps = {
    isOpen: true,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    description: 'Are you sure you want to delete this?',
  }

  it('has role=dialog and aria-modal', () => {
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-labelledby pointing to the title', () => {
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-dialog-title')
    expect(document.getElementById('delete-dialog-title')).toHaveTextContent('Delete Item')
  })

  it('closes on Escape key', async () => {
    const onCancel = vi.fn()
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} onCancel={onCancel} />)
    const user = userEvent.setup()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<DeleteConfirmDialog {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// --- TabBar ---

describe('TabBar accessibility', () => {
  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Detail', value: 'detail' },
    { label: 'Settings', value: 'settings' },
  ]
  const defaultProps = {
    tabs,
    activeTab: 'overview',
    onChange: vi.fn(),
  }

  it('has role=tablist and role=tab', () => {
    renderWithProviders(<TabBar {...defaultProps} />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('has aria-selected on the active tab', () => {
    renderWithProviders(<TabBar {...defaultProps} />)
    const activetab = screen.getByRole('tab', { name: 'Overview' })
    expect(activetab).toHaveAttribute('aria-selected', 'true')

    const inactiveTab = screen.getByRole('tab', { name: 'Detail' })
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false')
  })

  it('supports keyboard navigation with arrow keys', async () => {
    const onChange = vi.fn()
    renderWithProviders(<TabBar {...defaultProps} onChange={onChange} />)
    const user = userEvent.setup()

    // Focus the active tab
    const activeTab = screen.getByRole('tab', { name: 'Overview' })
    activeTab.focus()

    // Arrow right should move focus to next tab
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Detail' }))

    // Enter activates the tab
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('detail')
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<TabBar {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// --- DropdownSwitcher ---

describe('DropdownSwitcher accessibility', () => {
  const items = [
    { id: '1', name: 'Portfolio A' },
    { id: '2', name: 'Portfolio B' },
  ]
  const defaultProps = {
    currentId: '1',
    items,
    onSelect: vi.fn(),
    overviewHref: '/portfolios',
    overviewLabel: 'All Portfolios',
  }

  it('has aria-expanded and aria-haspopup on trigger', () => {
    renderWithProviders(<DropdownSwitcher {...defaultProps} />)
    const trigger = screen.getByRole('button', { name: /Portfolio A/i })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
  })

  it('sets aria-expanded=true when open', async () => {
    renderWithProviders(<DropdownSwitcher {...defaultProps} />)
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: /Portfolio A/i })

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape key', async () => {
    renderWithProviders(<DropdownSwitcher {...defaultProps} />)
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: /Portfolio A/i })

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

// --- ChartCard ---

describe('ChartCard accessibility', () => {
  it('chart container has role=img and aria-label', () => {
    renderWithProviders(
      <ChartCard title="Portfolio Value">
        <div>chart content</div>
      </ChartCard>,
    )
    const chartContainer = screen.getByRole('img')
    expect(chartContainer).toHaveAttribute('aria-label', 'Portfolio Value chart')
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <ChartCard title="Portfolio Value">
        <div>chart content</div>
      </ChartCard>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// --- CollapsibleSection ---

describe('CollapsibleSection accessibility', () => {
  it('toggle button has aria-expanded=false when collapsed', () => {
    renderWithProviders(
      <CollapsibleSection title="Recent Bills">
        <div>Content</div>
      </CollapsibleSection>,
    )
    const toggle = screen.getByRole('button', { name: /Recent Bills/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggle button has aria-expanded=true when expanded', async () => {
    renderWithProviders(
      <CollapsibleSection title="Recent Bills" defaultExpanded>
        <div>Content</div>
      </CollapsibleSection>,
    )
    const toggle = screen.getByRole('button', { name: /Recent Bills/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles aria-expanded on click', async () => {
    renderWithProviders(
      <CollapsibleSection title="Recent Bills">
        <div>Content</div>
      </CollapsibleSection>,
    )
    const user = userEvent.setup()
    const toggle = screen.getByRole('button', { name: /Recent Bills/i })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <CollapsibleSection title="Recent Bills" defaultExpanded>
        <p>Some content here</p>
      </CollapsibleSection>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// --- CollapsibleYearTable ---

describe('CollapsibleYearTable accessibility', () => {
  const years = [
    {
      year: 2025,
      isCurrentYear: true,
      totalConsumption: 1200,
      avgMonthly: 100,
      consumptionChange: 5,
      totalCost: 6000,
      avgCost: 500,
      avgCostPerUnit: 5,
      costChange: 3,
      months: [
        {
          month: new Date(2025, 0, 1),
          consumption: 120,
          consumptionChange: null,
          cost: 600,
          costPerUnit: 5,
          costChange: null,
        },
      ],
    },
  ]

  it('year row has aria-expanded', () => {
    renderWithProviders(
      <CollapsibleYearTable years={years} unit="kWh" />,
    )
    const yearRow = screen.getByTestId('year-row-2025')
    expect(yearRow).toHaveAttribute('aria-expanded', 'false')
  })

  it('sets aria-expanded=true when year is expanded', async () => {
    renderWithProviders(
      <CollapsibleYearTable years={years} unit="kWh" />,
    )
    const user = userEvent.setup()
    const yearRow = screen.getByTestId('year-row-2025')

    await user.click(yearRow)
    expect(yearRow).toHaveAttribute('aria-expanded', 'true')
  })
})

// --- MobileDrawer ---

describe('MobileDrawer accessibility', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Refueling Details',
    fields: [
      { label: 'Date', value: '2025-01-15' },
      { label: 'Amount', value: '42.5 L' },
    ],
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }

  it('has role=dialog and aria-modal', () => {
    renderWithProviders(<MobileDrawer {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-label matching title', () => {
    renderWithProviders(<MobileDrawer {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Refueling Details')
  })

  it('closes on Escape key', async () => {
    const onClose = vi.fn()
    renderWithProviders(<MobileDrawer {...defaultProps} onClose={onClose} />)
    const user = userEvent.setup()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('prev/next buttons have aria-labels', () => {
    renderWithProviders(
      <MobileDrawer {...defaultProps} hasPrev hasNext onPrev={vi.fn()} onNext={vi.fn()} />,
    )
    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })
})

// --- DataTable ---

describe('DataTable accessibility', () => {
  interface TestRow {
    id: string
    name: string
    value: number
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'value', label: 'Value', align: 'right' as const },
  ]

  const data: TestRow[] = [
    { id: '1', name: 'Electricity', value: 1200 },
    { id: '2', name: 'Water', value: 450 },
  ]

  it('uses proper table semantics', () => {
    renderWithProviders(
      <DataTable columns={columns} data={data} keyExtractor={(r) => r.id} />,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(screen.getAllByRole('row')).toHaveLength(3) // header + 2 data rows
  })

  it('edit and delete buttons have aria-labels', () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    const editButtons = screen.getAllByLabelText('Edit')
    const deleteButtons = screen.getAllByLabelText('Delete')
    expect(editButtons).toHaveLength(2)
    expect(deleteButtons).toHaveLength(2)
  })

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(r) => r.id}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
