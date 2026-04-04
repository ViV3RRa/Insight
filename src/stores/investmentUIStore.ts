import { create } from 'zustand'
import type { TimeSpan } from '@/utils/timeSpan'

interface InvestmentUIState {
  selectedPortfolioId: string | null
  timeSpan: TimeSpan
  yoyActive: boolean
  chartMode: 'earnings' | 'xirr'
  setSelectedPortfolioId: (id: string | null) => void
  setTimeSpan: (span: TimeSpan) => void
  setYoyActive: (active: boolean) => void
  setChartMode: (mode: 'earnings' | 'xirr') => void
}

export const useInvestmentUIStore = create<InvestmentUIState>()((set) => ({
  selectedPortfolioId: null,
  timeSpan: 'YTD',
  yoyActive: false,
  chartMode: 'earnings',
  setSelectedPortfolioId: (id) => set({ selectedPortfolioId: id }),
  setTimeSpan: (span) => set({ timeSpan: span }),
  setYoyActive: (active) => set({ yoyActive: active }),
  setChartMode: (mode) => set({ chartMode: mode }),
}))
