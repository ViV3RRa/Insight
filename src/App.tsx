import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '@/components/layout/Login'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import { PWAUpdatePrompt } from '@/components/shared/PWAUpdatePrompt'
import { PWAInstallPrompt } from '@/components/shared/PWAInstallPrompt'
import { HomeOverview } from '@/components/home/HomeOverview'
import { UtilityDetail } from '@/components/home/UtilityDetail'
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview'
import { PlatformDetail } from '@/components/portfolio/PlatformDetail'
import { VehiclesOverview } from '@/components/vehicles/VehiclesOverview'
import { VehicleDetail } from '@/components/vehicles/VehicleDetail'
import Settings from '@/components/layout/Settings'

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
      <PWAUpdatePrompt />
      <PWAInstallPrompt />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeOverview />} />
            <Route path="/home/utility/:utilityId" element={<UtilityDetail />} />
            <Route path="/investment" element={<PortfolioOverview />} />
            <Route path="/investment/platform/:platformId" element={<PlatformDetail />} />
            <Route path="/investment/cash/:platformId" element={<PlatformDetail />} />
            <Route path="/vehicles" element={<VehiclesOverview />} />
            <Route path="/vehicles/:vehicleId" element={<VehicleDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App
