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
const Settings = lazy(() => import('@/components/layout/Settings'))

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
            <Route path="/investment" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><PortfolioOverview /></Suspense>} />
            <Route path="/investment/platform/:platformId" element={<PlaceholderPage title="Platform Detail" />} />
            <Route path="/vehicles" element={<PlaceholderPage title="Vehicles" />} />
            <Route path="/vehicles/:vehicleId" element={<PlaceholderPage title="Vehicle Detail" />} />
            <Route path="/settings" element={<Suspense fallback={<div className="p-8 text-center text-base-400">Loading...</div>}><Settings /></Suspense>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App
