import { describe, it, expect } from 'vitest'

describe('Performance optimizations', () => {
  describe('Code splitting', () => {
    it('PortfolioOverview is available via dynamic import', async () => {
      const module = await import('@/components/portfolio/PortfolioOverview')
      expect(module.PortfolioOverview).toBeDefined()
    })

    it('Settings is available via dynamic import', async () => {
      const module = await import('@/components/layout/Settings')
      expect(module.default).toBeDefined()
    })
  })

  describe('React.memo on chart components', () => {
    it('PortfolioOverviewValueCharts is memoized', async () => {
      const module = await import(
        '@/components/portfolio/PortfolioOverviewValueCharts'
      )
      expect(module.PortfolioOverviewValueCharts).toBeDefined()
      // React.memo wraps the component — $$typeof is Symbol.for('react.memo')
      expect(
        (module.PortfolioOverviewValueCharts as unknown as { $$typeof: symbol })
          .$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('PlatformDetailPerfChart is memoized', async () => {
      const module = await import(
        '@/components/portfolio/PlatformDetailPerfChart'
      )
      expect(module.PlatformDetailPerfChart).toBeDefined()
      expect(
        (module.PlatformDetailPerfChart as unknown as { $$typeof: symbol })
          .$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('HomeOverviewChart is memoized', async () => {
      const module = await import('@/components/home/HomeOverviewChart')
      expect(module.HomeOverviewChart).toBeDefined()
      expect(
        (module.HomeOverviewChart as unknown as { $$typeof: symbol }).$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('UtilityDetailChart is memoized', async () => {
      const module = await import('@/components/home/UtilityDetailChart')
      expect(module.UtilityDetailChart).toBeDefined()
      expect(
        (module.UtilityDetailChart as unknown as { $$typeof: symbol }).$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('VehicleEfficiencyChart is memoized', async () => {
      const module = await import(
        '@/components/vehicles/VehicleEfficiencyChart'
      )
      expect(module.VehicleEfficiencyChart).toBeDefined()
      expect(
        (module.VehicleEfficiencyChart as unknown as { $$typeof: symbol })
          .$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('VehicleFuelCostChart is memoized', async () => {
      const module = await import('@/components/vehicles/VehicleFuelCostChart')
      expect(module.VehicleFuelCostChart).toBeDefined()
      expect(
        (module.VehicleFuelCostChart as unknown as { $$typeof: symbol })
          .$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('VehicleKmChart is memoized', async () => {
      const module = await import('@/components/vehicles/VehicleKmChart')
      expect(module.VehicleKmChart).toBeDefined()
      expect(
        (module.VehicleKmChart as unknown as { $$typeof: symbol }).$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })

    it('VehicleMaintenanceChart is memoized', async () => {
      const module = await import(
        '@/components/vehicles/VehicleMaintenanceChart'
      )
      expect(module.VehicleMaintenanceChart).toBeDefined()
      expect(
        (module.VehicleMaintenanceChart as unknown as { $$typeof: symbol })
          .$$typeof,
      ).toBe(Symbol.for('react.memo'))
    })
  })
})
