import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ShellStatusView() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Multi-Realtor Property Marketplace
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          AkRealtors PMS
        </h1>
        <p className="mt-2 text-slate-600">
          Verified residential and commercial property sales, rentals, and leases across Nigeria.
        </p>
      </div>
    </main>
  );
}

export function App({ queryClient = defaultQueryClient }: { queryClient?: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ShellStatusView />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
