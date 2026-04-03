import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
      <div className="min-h-screen bg-base-100 dark:bg-base-900 text-base-900 dark:text-white">
        <h1 className="text-2xl font-bold p-8">Insight</h1>
      </div>
    </QueryClientProvider>
  )
}

export default App
