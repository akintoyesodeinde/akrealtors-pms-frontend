import {
  Activity,
  BadgeCheck,
  ClipboardList,
  Flag,
  ScrollText,
  Users,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function AdminLayout() {
  const { user, hasRole } = useAuth();
  const isPlatformAdmin = hasRole('PLATFORM_ADMIN');

  const navItems = [
    { to: '/admin', label: 'Operations Dashboard', icon: Activity, end: true },
    { to: '/admin/offers', label: 'Offer Moderation', icon: ClipboardList },
    { to: '/admin/verification', label: 'Verification Queue', icon: BadgeCheck },
    { to: '/admin/abuse-reports', label: 'Abuse Reports', icon: Flag },
    { to: '/admin/users', label: 'Users & Agencies', icon: Users },
    { to: '/admin/governance', label: 'Audit & Governance', icon: ScrollText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Trust, Safety &amp; Platform Governance
          </span>
          <h1 className="text-2xl font-extrabold mt-0.5">Administration &amp; Moderation Console</h1>
          <p className="text-xs text-slate-300 mt-1">
            Signed in as {user?.email} ·{' '}
            {isPlatformAdmin
              ? 'Platform Administrator (full governance privileges)'
              : 'Moderator (review queues; account, agency & settings changes require Platform Administrator)'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <nav
          aria-label="Administration navigation"
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
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="lg:col-span-3 space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
