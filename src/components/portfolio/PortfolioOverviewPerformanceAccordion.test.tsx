import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { PortfolioOverviewPerformanceAccordion } from './PortfolioOverviewPerformanceAccordion'

describe('PortfolioOverviewPerformanceAccordion', () => {
  it('renders the title', () => {
    renderWithProviders(
      <PortfolioOverviewPerformanceAccordion>
        <div>Chart Content</div>
      </PortfolioOverviewPerformanceAccordion>
    )
    expect(screen.getByText('Performance Charts & Analysis')).toBeInTheDocument()
  })

  it('renders collapsed by default', () => {
    renderWithProviders(
      <PortfolioOverviewPerformanceAccordion>
        <div>Chart Content</div>
      </PortfolioOverviewPerformanceAccordion>
    )
    expect(screen.queryByText('Chart Content')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
  })

  it('expands on click to reveal children', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewPerformanceAccordion>
        <div>Chart Content</div>
      </PortfolioOverviewPerformanceAccordion>
    )
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Chart Content')).toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
  })

  it('collapses on second click', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewPerformanceAccordion>
        <div>Chart Content</div>
      </PortfolioOverviewPerformanceAccordion>
    )
    const toggle = screen.getByRole('button')
    await user.click(toggle)
    expect(screen.getByText('Chart Content')).toBeInTheDocument()

    await user.click(toggle)
    expect(screen.queryByText('Chart Content')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument()
  })

  it('renders multiple children with spacing wrapper', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <PortfolioOverviewPerformanceAccordion>
        <div>First Chart</div>
        <div>Second Chart</div>
      </PortfolioOverviewPerformanceAccordion>
    )
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('First Chart')).toBeInTheDocument()
    expect(screen.getByText('Second Chart')).toBeInTheDocument()

    const firstChart = screen.getByText('First Chart')
    const spacingWrapper = firstChart.parentElement
    expect(spacingWrapper).toHaveClass('space-y-6')
  })

  it('does not render a count badge', () => {
    renderWithProviders(
      <PortfolioOverviewPerformanceAccordion>
        <div>Content</div>
      </PortfolioOverviewPerformanceAccordion>
    )
    const button = screen.getByRole('button')
    const badge = button.querySelector('.rounded-full')
    expect(badge).not.toBeInTheDocument()
  })
})
