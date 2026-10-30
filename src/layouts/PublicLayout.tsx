import { useQuery } from '@tanstack/react-query';
import { Bell, Building2, LogOut, Menu, ShieldCheck, UserCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { customerApi } from '../api/customerApi';
import { useAuth } from '../features/auth/useAuth';

export function PublicLayout() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => customerApi.getUnreadNotificationCount(),
    enabled: isAuthenticated,
    staleTime: 20_000,
  });
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-800 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-none">
                AkRealtors
              </span>
              <span className="text-[11px] font-medium text-emerald-700 block">
                Nigeria Property Marketplace
              </span>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6 text-sm">
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive ? 'text-emerald-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Browse Properties
            </NavLink>
            <NavLink
              to="/properties?transactionType=SALE"
              className="font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Buy
            </NavLink>
            <NavLink
              to="/properties?transactionType=RENT"
              className="font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Rent
            </NavLink>
            <NavLink
              to="/properties?transactionType=LEASE"
              className="font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Commercial Lease
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive ? 'text-emerald-800 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Report & Support
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/portal/notifications"
                  aria-label={
                    unreadCount > 0
                      ? `Notifications (${unreadCount} unread)`
                      : 'Notifications'
                  }
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                >
                  <Bell className="w-4 h-4" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <UserCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  {user.firstName}
                </Link>
                {hasRole('REALTOR', 'AGENCY_ADMIN') && (
                  <Link
                    to="/realtor"
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  >
                    Realtor Workspace
                  </Link>
                )}
                {hasRole('MODERATOR', 'PLATFORM_ADMIN') && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-xs"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <Link
              to="/properties"
              onClick={() => setMobileOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-800"
            >
              Browse Properties
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="block py-1.5 text-sm font-medium text-slate-800"
            >
              Report & Support
            </Link>
            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                <Link
                  to="/portal"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm font-medium"
                >
                  Customer Portal
                </Link>
                {hasRole('REALTOR', 'AGENCY_ADMIN') && (
                  <Link
                    to="/realtor"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-medium"
                  >
                    Realtor Workspace
                  </Link>
                )}
                {hasRole('MODERATOR', 'PLATFORM_ADMIN') && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium"
                  >
                    Admin Portal
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void handleLogout();
                  }}
                  className="px-3 py-1.5 rounded-lg text-rose-700 text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl border border-slate-300 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Building2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              AkRealtors PMS
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed">
              Multi-realtor Nigerian property marketplace separating physical property records from
              transparent commercial offers, with distinct verification tiers for identity, agency
              incorporation, marketing mandate, and legal title.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold text-white">Marketplace</h2>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/properties?transactionType=SALE" className="hover:text-white">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?transactionType=RENT" className="hover:text-white">
                  Long-Term Rentals
                </Link>
              </li>
              <li>
                <Link to="/properties?transactionType=LEASE" className="hover:text-white">
                  Commercial Leases
                </Link>
              </li>
              <li>
                <Link to="/register?tab=realtor" className="hover:text-white">
                  List as a Realtor
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold text-white">Legal & Trust</h2>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link to="/privacy" className="hover:text-white">
                  Privacy Policy (NDPA 2023)
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact & Abuse Reporting
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} AkRealtors PMS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
