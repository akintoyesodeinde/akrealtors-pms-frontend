import { ShieldOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import type { RoleCode } from '../api/contracts';
import { useAuth } from '../features/auth/useAuth';

/**
 * UX-level route guard (Part 11.5: authorization is always enforced on the backend).
 */
export function RequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles?: RoleCode[];
  children: ReactNode;
}) {
  const { user, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        role="status"
        className="min-h-[50vh] flex items-center justify-center text-sm text-slate-600"
      >
        Verifying session…
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(...allowedRoles)) {
    return (
      <div
        role="alert"
        className="max-w-lg mx-auto my-16 bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldOff className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your account does not hold the required authorization ({allowedRoles.join(' / ')}) to
          open this workspace.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
