import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { PlatformDetailHeader, type PlatformDetailHeaderProps } from './PlatformDetailHeader'

const defaultProps: PlatformDetailHeaderProps = {
  currency: 'DKK',
  currentValue: 500000,
  monthEarnings: 12300,
  allTimeGainLoss: 75000,
  allTimeGainLossPercent: 17.65,
  allTimeXirr: 12.45,
  ytdGainLoss: 25000,
  ytdGainLossPercent: 8.5,
  ytdXirr: 9.2,
}

describe('PlatformDetailHeader', () => {
  describe('stat cards', () => {
    it('renders all 6 stat cards', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} />)
      expect(screen.getByText('Current Value')).toBeInTheDocument()
      expect(screen.getByText('Month Earnings')).toBeInTheDocument()
      expect(screen.getByText('All-Time Gain/Loss')).toBeInTheDocument()
      expect(screen.getByText('All-Time XIRR')).toBeInTheDocument()
      expect(screen.getByText('YTD Gain/Loss')).toBeInTheDocument()
      expect(screen.getByText('YTD XIRR')).toBeInTheDocument()
    })

    it('shows loading skeleton when isLoading is true', () => {
      renderWithProviders(<PlatformDetailHeader {...defaultProps} isLoading />)
      expect(screen.queryByText('Current Value')).not.toBeInTheDocument()
    })
  })
})
