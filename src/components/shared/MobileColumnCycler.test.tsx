import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import { MobileColumnCyclerHeader, MobileColumnCyclerCell } from './MobileColumnCycler'

const columns = [
  { label: 'Value' },
  { label: 'Cost' },
  { label: 'Gain' },
]

describe('MobileColumnCyclerHeader', () => {
  it('renders current column label', () => {
    renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={0} onCycle={vi.fn()} />
          </tr>
        </thead>
      </table>,
    )
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders label for non-zero activeIndex', () => {
    renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={2} onCycle={vi.fn()} />
          </tr>
        </thead>
      </table>,
    )
    expect(screen.getByText('Gain')).toBeInTheDocument()
  })

  it('calls onCycle when clicked', async () => {
    const onCycle = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={0} onCycle={onCycle} />
          </tr>
        </thead>
      </table>,
    )
    await user.click(screen.getByRole('button'))
    expect(onCycle).toHaveBeenCalledOnce()
  })

  it('dot indicator count matches columns length', () => {
    const { container } = renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={0} onCycle={vi.fn()} />
          </tr>
        </thead>
      </table>,
    )
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots).toHaveLength(3)
  })

  it('active dot has bg-accent-500, inactive dots have bg-base-300', () => {
    const { container } = renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={1} onCycle={vi.fn()} />
          </tr>
        </thead>
      </table>,
    )
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots[0]!.className).toContain('bg-base-300')
    expect(dots[1]!.className).toContain('bg-accent-500')
    expect(dots[2]!.className).toContain('bg-base-300')
  })

  it('header cell has sm:hidden class', () => {
    const { container } = renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={0} onCycle={vi.fn()} />
          </tr>
        </thead>
      </table>,
    )
    const th = container.querySelector('th')
    expect(th!.className).toContain('sm:hidden')
  })

  it('button has correct styling classes', () => {
    renderWithProviders(
      <table>
        <thead>
          <tr>
            <MobileColumnCyclerHeader columns={columns} activeIndex={0} onCycle={vi.fn()} />
          </tr>
        </thead>
      </table>,
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('text-base-300')
    expect(button.className).toContain('dark:text-base-400')
    expect(button.className).toContain('text-xs')
    expect(button.className).toContain('font-medium')
  })
})

describe('MobileColumnCyclerCell', () => {
  const values = ['10,000', '5,000', '2,500']

  it('renders all values in grid overlay', () => {
    renderWithProviders(
      <table>
        <tbody>
          <tr>
            <MobileColumnCyclerCell values={values} activeIndex={0} />
          </tr>
        </tbody>
      </table>,
    )
    values.forEach((value) => {
      expect(screen.getByText(value)).toBeInTheDocument()
    })
  })

  it('only active value has opacity 1, others have opacity 0', () => {
    renderWithProviders(
      <table>
        <tbody>
          <tr>
            <MobileColumnCyclerCell values={values} activeIndex={1} />
          </tr>
        </tbody>
      </table>,
    )
    const spans = screen.getAllByText(/\d+,\d+/)
    expect(spans[0]!.style.opacity).toBe('0')
    expect(spans[1]!.style.opacity).toBe('1')
    expect(spans[2]!.style.opacity).toBe('0')
  })

  it('cell has sm:hidden class', () => {
    const { container } = renderWithProviders(
      <table>
        <tbody>
          <tr>
            <MobileColumnCyclerCell values={values} activeIndex={0} />
          </tr>
        </tbody>
      </table>,
    )
    const td = container.querySelector('td')
    expect(td!.className).toContain('sm:hidden')
  })

  it('values have correct styling classes', () => {
    const { container } = renderWithProviders(
      <table>
        <tbody>
          <tr>
            <MobileColumnCyclerCell values={values} activeIndex={0} />
          </tr>
        </tbody>
      </table>,
    )
    const spans = container.querySelectorAll('.col-start-1')
    spans.forEach((span) => {
      expect(span.className).toContain('row-start-1')
      expect(span.className).toContain('font-mono-data')
      expect(span.className).toContain('text-sm')
      expect(span.className).toContain('text-base-900')
      expect(span.className).toContain('dark:text-white')
      expect(span.className).toContain('transition-opacity')
    })
  })

  it('both exports work correctly', () => {
    expect(typeof MobileColumnCyclerHeader).toBe('function')
    expect(typeof MobileColumnCyclerCell).toBe('function')
  })
})
