import { describe, it, expect, beforeEach } from 'vitest'
import { useInvestmentUIStore } from './investmentUIStore'

describe('investmentUIStore', () => {
  beforeEach(() => {
    useInvestmentUIStore.setState({
      selectedPortfolioId: null,
      timeSpan: 'YTD',
      yoyActive: false,
      chartMode: 'earnings',
    })
  })

  it('has correct initial state', () => {
    const state = useInvestmentUIStore.getState()
    expect(state.selectedPortfolioId).toBeNull()
    expect(state.timeSpan).toBe('YTD')
    expect(state.yoyActive).toBe(false)
    expect(state.chartMode).toBe('earnings')
  })

  describe('setSelectedPortfolioId', () => {
    it('sets a portfolio id', () => {
      useInvestmentUIStore.getState().setSelectedPortfolioId('portfolio_1')
      expect(useInvestmentUIStore.getState().selectedPortfolioId).toBe('portfolio_1')
    })

    it('clears portfolio id with null', () => {
      useInvestmentUIStore.getState().setSelectedPortfolioId('portfolio_1')
      useInvestmentUIStore.getState().setSelectedPortfolioId(null)
      expect(useInvestmentUIStore.getState().selectedPortfolioId).toBeNull()
    })
  })

  describe('setTimeSpan', () => {
    it('updates time span', () => {
      useInvestmentUIStore.getState().setTimeSpan('1Y')
      expect(useInvestmentUIStore.getState().timeSpan).toBe('1Y')
    })

    it('updates back to default', () => {
      useInvestmentUIStore.getState().setTimeSpan('3M')
      useInvestmentUIStore.getState().setTimeSpan('YTD')
      expect(useInvestmentUIStore.getState().timeSpan).toBe('YTD')
    })
  })

  describe('setYoyActive', () => {
    it('enables YoY', () => {
      useInvestmentUIStore.getState().setYoyActive(true)
      expect(useInvestmentUIStore.getState().yoyActive).toBe(true)
    })

    it('disables YoY', () => {
      useInvestmentUIStore.getState().setYoyActive(true)
      useInvestmentUIStore.getState().setYoyActive(false)
      expect(useInvestmentUIStore.getState().yoyActive).toBe(false)
    })
  })

  describe('setChartMode', () => {
    it('sets chart mode to xirr', () => {
      useInvestmentUIStore.getState().setChartMode('xirr')
      expect(useInvestmentUIStore.getState().chartMode).toBe('xirr')
    })

    it('sets chart mode back to earnings', () => {
      useInvestmentUIStore.getState().setChartMode('xirr')
      useInvestmentUIStore.getState().setChartMode('earnings')
      expect(useInvestmentUIStore.getState().chartMode).toBe('earnings')
    })
  })

  it('does not affect other state when updating a single field', () => {
    useInvestmentUIStore.getState().setSelectedPortfolioId('portfolio_1')
    useInvestmentUIStore.getState().setTimeSpan('3Y')
    useInvestmentUIStore.getState().setYoyActive(true)
    useInvestmentUIStore.getState().setChartMode('xirr')

    useInvestmentUIStore.getState().setTimeSpan('1M')

    const state = useInvestmentUIStore.getState()
    expect(state.selectedPortfolioId).toBe('portfolio_1')
    expect(state.timeSpan).toBe('1M')
    expect(state.yoyActive).toBe(true)
    expect(state.chartMode).toBe('xirr')
  })
})
