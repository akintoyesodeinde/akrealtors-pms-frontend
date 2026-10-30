import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  CalendarCheck,
  CheckCircle2,
  FilePlus2,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { realtorApi } from '../../api/realtorApi';
import { useAuth } from '../auth/useAuth';
import { RealtorScopeContext } from './useRealtorScope';

export function RealtorWorkspaceLayout() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAgencyId, setSelectedAgencyId] = useState<string | undefined>(undefined);

  const membershipsQuery = useQuery({
    queryKey: ['realtor', 'memberships'],
    queryFn: () => realtorApi.listMyMemberships(),
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (agencyId: string) => realtorApi.acceptAgencyInvitation(agencyId),
    onSuccess: (accepted) => {
      setSelectedAgencyId(accepted.agencyId);
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const allMemberships = membershipsQuery.data ?? [];
  const activeMemberships = allMemberships.filter((m) => m.status === 'ACTIVE');
  const pendingInvitations = allMemberships.filter((m) => m.status === 'INVITED');
  const selectedMembership = activeMemberships.find((m) => m.agencyId === selectedAgencyId);

  const navItems = [
    { to: '/realtor', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/realtor/offers', label: 'Property Offers', icon: FolderKanban },
    { to: '/realtor/offers/new', label: 'Create Offer', icon: FilePlus2 },
    { to: '/realtor/enquiries', label: 'Enquiries Inbox', icon: MessageSquare },
    { to: '/realtor/viewings', label: 'Viewing Requests', icon: CalendarCheck },
    { to: '/realtor/profile', label: 'Profile & Verification', icon: ShieldCheck },
    { to: '/realtor/agencies', label: 'Agencies & Staff', icon: Building },
  ];

  return (
    <RealtorScopeContext.Provider
      value={{
        selectedAgencyId,
        setSelectedAgencyId,
        activeMemberships,
        selectedMembership,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Advertiser &amp; Agency Workspace
            </span>
            <h1 className="text-2xl font-extrabold mt-0.5">
              {selectedMembership
                ? `${selectedMembership.agencyName} (${selectedMembership.role}) — Realtor & Agency Workspace`
                : `${user?.firstName} ${user?.lastName} — Realtor & Agency Workspace`}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              {selectedMembership
                ? `Permissions: ${selectedMembership.canManageOffers ? 'Manage Offers' : 'Read-Only Offers'} · ${selectedMembership.canManageEnquiries ? 'Manage Enquiries' : 'No Enquiry Access'}`
                : 'Managing your personal realtor catalogue, commercial offers, and verification credentials.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="workspace-scope-select" className="text-xs font-semibold text-slate-300">
              Operating Scope:
            </label>
            <select
              id="workspace-scope-select"
              value={selectedAgencyId ?? ''}
              onChange={(e) => setSelectedAgencyId(e.target.value || undefined)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Independent Realtor Profile</option>
              {activeMemberships.map((m) => (
                <option key={m.agencyId} value={m.agencyId}>
                  Agency: {m.agencyName} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pending Agency Invitations Banner */}
        {pendingInvitations.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Pending Agency Staff Invitations
            </p>
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl p-3 border border-emerald-100"
              >
                <div className="text-xs text-slate-800">
                  <strong>{inv.agencyName}</strong> invited you as <strong>{inv.role}</strong> (
                  {inv.canManageOffers ? 'Offers' : ''}
                  {inv.canManageOffers && inv.canManageEnquiries ? ' + ' : ''}
                  {inv.canManageEnquiries ? 'Enquiries' : ''})
                </div>
                <button
                  type="button"
                  disabled={acceptInviteMutation.isPending}
                  onClick={() => acceptInviteMutation.mutate(inv.agencyId)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Accept Invitation
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <nav
            aria-label="Realtor workspace navigation"
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
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
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

          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </RealtorScopeContext.Provider>
  );
}
