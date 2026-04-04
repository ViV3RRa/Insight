import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '@/components/layout/Login'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import AppShell from '@/components/layout/AppShell'
import Settings from '@/components/layout/Settings'
import { PortfolioOverview } from '@/components/portfolio/PortfolioOverview'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div data-testid={`page-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<PlaceholderPage title="Home" />} />
            <Route path="/home/:utilityId" element={<PlaceholderPage title="Utility Detail" />} />
            <Route path="/investment" element={<PortfolioOverview />} />
            <Route path="/investment/platform/:platformId" element={<PlaceholderPage title="Platform Detail" />} />
            <Route path="/vehicles" element={<PlaceholderPage title="Vehicles" />} />
            <Route path="/vehicles/:vehicleId" element={<PlaceholderPage title="Vehicle Detail" />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App
