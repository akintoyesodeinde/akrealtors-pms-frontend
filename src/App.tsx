import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoadingSkeletonGrid } from './components/ui/StateBoxes';
import { AuthProvider } from './features/auth/AuthContext';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { useAuth } from './features/auth/useAuth';
import { VerifyEmailPage } from './features/auth/VerifyEmailPage';
import { HomePage } from './features/public/HomePage';
import {
  ContactAndReportPage,
  PrivacyPolicyPage,
  TermsOfUsePage,
} from './features/public/LegalAndContactPages';
import { PropertyDetailPage } from './features/public/PropertyDetailPage';
import { PropertySearchPage } from './features/public/PropertySearchPage';
import { PublicAgencyProfilePage } from './features/public/PublicAgencyProfilePage';
import { PublicRealtorProfilePage } from './features/public/PublicRealtorProfilePage';
import { PublicLayout } from './layouts/PublicLayout';
import { RequireAuth } from './routes/RequireAuth';

const CustomerPortalRoutes = lazy(() => import('./features/portal/CustomerPortalRoutes'));
const RealtorWorkspaceRoutes = lazy(() => import('./features/realtor/RealtorWorkspaceRoutes'));

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthenticatedWorkspaceOverview({ title }: { title: string }) {
  const { user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">
          Signed in as <strong>{user?.email}</strong> ({user?.roles.join(', ')}).
        </p>
        <Link
          to="/properties"
          className="inline-block text-sm font-semibold text-emerald-700 hover:underline"
        >
          Browse Marketplace Properties →
        </Link>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-sm text-slate-600">
        The marketplace page or property offer you requested could not be found.
      </p>
      <Link
        to="/properties"
        className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
      >
        Explore Published Properties
      </Link>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-10">
          <LoadingSkeletonGrid count={3} />
        </div>
      }
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertySearchPage />} />
          <Route path="/properties/:offerId" element={<PropertyDetailPage />} />
          <Route path="/realtors/:realtorId" element={<PublicRealtorProfilePage />} />
          <Route path="/agencies/:agencyId" element={<PublicAgencyProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/contact" element={<ContactAndReportPage />} />

          <Route
            path="/portal/*"
            element={
              <RequireAuth>
                <CustomerPortalRoutes />
              </RequireAuth>
            }
          />
          <Route
            path="/realtor/*"
            element={
              <RequireAuth allowedRoles={['REALTOR', 'AGENCY_ADMIN', 'PLATFORM_ADMIN']}>
                <RealtorWorkspaceRoutes />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/*"
            element={
              <RequireAuth allowedRoles={['MODERATOR', 'PLATFORM_ADMIN']}>
                <AuthenticatedWorkspaceOverview title="Platform Administration & Moderation" />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export function App({
  queryClient = defaultQueryClient,
  initialEntries,
  skipInitialSessionBootstrap = false,
}: {
  queryClient?: QueryClient;
  initialEntries?: string[];
  skipInitialSessionBootstrap?: boolean;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider skipInitialSessionBootstrap={skipInitialSessionBootstrap}>
        {initialEntries ? (
          <MemoryRouter initialEntries={initialEntries}>
            <AppRoutes />
          </MemoryRouter>
        ) : (
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
