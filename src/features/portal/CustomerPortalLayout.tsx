import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Bell,
  Calendar,
  Heart,
  LayoutDashboard,
  MailWarning,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { customerApi } from '../../api/customerApi';
import { useAuth } from '../auth/useAuth';

export function CustomerPortalLayout() {
  const { user } = useAuth();
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => customerApi.getUnreadNotificationCount(),
  });
  const unreadCount = unreadQuery.data?.unreadCount ?? 0;

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: (res) => {
      setResendFeedback(res.message);
    },
  });

  const navItems = [
    { to: '/portal', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/portal/favourites', label: 'Saved Favourites', icon: Heart },
    { to: '/portal/enquiries', label: 'My Enquiries', icon: MessageSquare },
    { to: '/portal/viewings', label: 'Viewing Requests', icon: Calendar },
    {
      to: '/portal/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { to: '/portal/settings', label: 'Profile & Security', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Customer Account Portal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">{user?.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`px-3 py-1 rounded-full font-semibold ${
              user?.emailVerified
                ? 'bg-emerald-100 text-emerald-900'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {user?.emailVerified ? 'Email Verified' : 'Email Unverified'}
          </span>
          <span className="px-3 py-1 rounded-full font-semibold bg-slate-100 text-slate-700">
            {user?.roles.join(' · ')}
          </span>
        </div>
      </div>

      {user && !user.emailVerified && (
        <div
          role="region"
          aria-label="Email verification reminder"
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <MailWarning className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-amber-950">
              <p className="font-semibold">Verify your email address</p>
              <p className="text-xs text-amber-900 mt-0.5">
                {resendFeedback ??
                  'Confirming your email strengthens account security and unlocks verified contact badges.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
            className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white text-xs font-semibold shrink-0"
          >
            {resendMutation.isPending ? 'Sending…' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <nav
          aria-label="Customer portal navigation"
          className="bg-white rounded-2xl border border-slate-200 p-3 flex lg:flex-col gap-1 overflow-x-auto"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
