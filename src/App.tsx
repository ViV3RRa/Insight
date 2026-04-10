import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '@/components/layout/Login'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'

// Lazy-load page components for code splitting
const PortfolioOverview = lazy(() =>
  import('@/components/portfolio/PortfolioOverview').then((m) => ({ default: m.PortfolioOverview }))
)
const HomeOverview = lazy(() =>
  import('@/components/home/HomeOverview').then((m) => ({ default: m.HomeOverview }))
)
const UtilityDetail = lazy(() =>
  import('@/components/home/UtilityDetail').then((m) => ({ default: m.UtilityDetail }))
)
const PlatformDetail = lazy(() =>
  import('@/components/portfolio/PlatformDetail').then((m) => ({ default: m.PlatformDetail }))
)
const CashPlatformDetail = lazy(() =>
  import('@/components/portfolio/CashPlatformDetail').then((m) => ({ default: m.CashPlatformDetail }))
)
const VehiclesOverview = lazy(() =>
  import('@/components/vehicles/VehiclesOverview').then((m) => ({ default: m.VehiclesOverview }))
)
const VehicleDetail = lazy(() =>
  import('@/components/vehicles/VehicleDetail').then((m) => ({ default: m.VehicleDetail }))
)
const Settings = lazy(() => import('@/components/layout/Settings'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><HomeOverview /></Suspense>} />
            <Route path="/home/utility/:utilityId" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><UtilityDetail /></Suspense>} />
            <Route path="/investment" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><PortfolioOverview /></Suspense>} />
            <Route path="/investment/platform/:platformId" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><PlatformDetail /></Suspense>} />
            <Route path="/investment/cash/:platformId" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><CashPlatformDetail /></Suspense>} />
            <Route path="/vehicles" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><VehiclesOverview /></Suspense>} />
            <Route path="/vehicles/:vehicleId" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><VehicleDetail /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><Settings /></Suspense>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App
