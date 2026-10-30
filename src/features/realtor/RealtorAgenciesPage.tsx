import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building, Plus, UserPlus, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { marketplaceApi } from '../../api/marketplaceApi';
import { realtorApi } from '../../api/realtorApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import { useRealtorScope } from './useRealtorScope';

export function RealtorAgenciesPage() {
  const { selectedAgencyId, setSelectedAgencyId, selectedMembership } = useRealtorScope();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stateName, setStateName] = useState('Lagos');
  const [cityName, setCityName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [description, setDescription] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'AGENT'>('AGENT');
  const [canManageOffers, setCanManageOffers] = useState(true);
  const [canManageEnquiries, setCanManageEnquiries] = useState(true);

  const statesQuery = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: () => marketplaceApi.getStates(),
    staleTime: 300_000,
  });

  const canAdministerSelectedAgency =
    Boolean(selectedAgencyId) &&
    (selectedMembership?.role === 'OWNER' || selectedMembership?.role === 'ADMIN');

  const managedAgencyQuery = useQuery({
    queryKey: ['agency', 'manage', selectedAgencyId],
    queryFn: () => realtorApi.getManagedAgency(selectedAgencyId ?? ''),
    enabled: canAdministerSelectedAgency,
  });

  const membersQuery = useQuery({
    queryKey: ['agency', 'members', selectedAgencyId],
    queryFn: () => realtorApi.listAgencyMembers(selectedAgencyId ?? ''),
    enabled: canAdministerSelectedAgency,
  });

  const createAgencyMutation = useMutation({
    mutationFn: () =>
      realtorApi.createAgency({
        name: name.trim(),
        rcNumber: rcNumber.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        state: stateName,
        city: cityName.trim(),
        addressLine: addressLine.trim() || undefined,
        description: description.trim() || undefined,
      }),
    onSuccess: (created) => {
      setCreateOpen(false);
      setName('');
      setCityName('');
      setSelectedAgencyId(created.id);
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      realtorApi.inviteAgencyMember(selectedAgencyId ?? '', {
        email: inviteEmail.trim(),
        role: inviteRole,
        canManageOffers,
        canManageEnquiries,
      }),
    onSuccess: () => {
      setInviteEmail('');
      void queryClient.invalidateQueries({ queryKey: ['agency', 'members', selectedAgencyId] });
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: ({
      membershipId,
      offers,
      enquiries,
      status,
    }: {
      membershipId: string;
      offers?: boolean;
      enquiries?: boolean;
      status?: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
    }) =>
      realtorApi.updateAgencyMembership(selectedAgencyId ?? '', membershipId, {
        canManageOffers: offers,
        canManageEnquiries: enquiries,
        status,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['agency', 'members', selectedAgencyId] });
    },
  });

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cityName.trim()) return;
    createAgencyMutation.mutate();
  };

  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Agencies & Staff Management" canonicalPath="/realtor/agencies" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            Real Estate Agencies &amp; Staff Permissions
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Register a corporate real estate firm, invite agents, and control listing &amp; enquiry
            permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Register New Agency
        </button>
      </div>

      {createOpen && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
        >
          <h3 className="text-base font-bold text-slate-900">Register Corporate Real Estate Agency</h3>

          {createAgencyMutation.isError && (
            <p role="alert" className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700">
              {createAgencyMutation.error instanceof ApiClientError
                ? createAgencyMutation.error.message
                : 'Could not create agency.'}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="agency-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Agency Name *
              </label>
              <input
                id="agency-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Victoria Crest Realty Ltd"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="agency-rc" className="block text-xs font-semibold text-slate-700 mb-1">
                CAC RC / BN Number
              </label>
              <input
                id="agency-rc"
                type="text"
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                placeholder="e.g. RC-1928374"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="agency-email" className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email
              </label>
              <input
                id="agency-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="agency-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Phone
              </label>
              <input
                id="agency-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="agency-state" className="block text-xs font-semibold text-slate-700 mb-1">
                Headquarters State *
              </label>
              <select
                id="agency-state"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
              >
                {(statesQuery.data ?? [{ code: 'LA', name: 'Lagos' }]).map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="agency-city" className="block text-xs font-semibold text-slate-700 mb-1">
                City *
              </label>
              <input
                id="agency-city"
                type="text"
                required
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Ikoyi"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label htmlFor="agency-address" className="block text-xs font-semibold text-slate-700 mb-1">
                Office Address
              </label>
              <input
                id="agency-address"
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="agency-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Agency Overview
            </label>
            <textarea
              id="agency-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createAgencyMutation.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
            >
              {createAgencyMutation.isPending ? 'Creating…' : 'Create Agency'}
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Selected Agency Staff Management */}
      {!selectedAgencyId ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
          Select an active agency in the top <strong>Operating Scope</strong> selector (or register
          a new agency above) to manage staff memberships and permissions.
        </div>
      ) : !canAdministerSelectedAgency ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-600">
          You are an <strong>{selectedMembership?.role}</strong> in{' '}
          <strong>{selectedMembership?.agencyName}</strong>. Only Agency Owners and Agency Admins
          can invite staff or change member permissions.
        </div>
      ) : (
        <div className="space-y-6">
          {managedAgencyQuery.data && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {managedAgencyQuery.data.name}
                </h3>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                  Corporate Verification: {managedAgencyQuery.data.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                RC: {managedAgencyQuery.data.rcNumber ?? 'Not supplied'} ·{' '}
                {managedAgencyQuery.data.city}, {managedAgencyQuery.data.state}
              </p>
            </section>
          )}

          {/* Invite Member Form */}
          <form
            onSubmit={handleInviteSubmit}
            className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              Invite Registered Realtor / Staff Member
            </h3>

            {inviteMutation.isError && (
              <p role="alert" className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700">
                {inviteMutation.error instanceof ApiClientError
                  ? inviteMutation.error.message
                  : 'Invitation failed.'}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="invite-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  User Account Email *
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="agent@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label htmlFor="invite-role" className="block text-xs font-semibold text-slate-700 mb-1">
                  Membership Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'AGENT')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  <option value="AGENT">AGENT</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canManageOffers}
                  onChange={(e) => setCanManageOffers(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700"
                />
                <span>Can create &amp; manage agency offers</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canManageEnquiries}
                  onChange={(e) => setCanManageEnquiries(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700"
                />
                <span>Can respond to agency enquiries &amp; viewings</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              {inviteMutation.isPending ? 'Sending Invite…' : 'Send Agency Invitation'}
            </button>
          </form>

          {/* Members Roster */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              Agency Staff Roster
            </h3>

            <div className="divide-y divide-slate-100">
              {(membersQuery.data ?? []).map((m) => (
                <div
                  key={m.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {m.firstName} {m.lastName} ({m.role})
                    </p>
                    <p className="text-slate-500">
                      {m.userEmail} · Status: <strong>{m.status}</strong>
                    </p>
                  </div>

                  {m.role !== 'OWNER' && m.status !== 'REVOKED' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          togglePermissionMutation.mutate({
                            membershipId: m.id,
                            offers: !m.canManageOffers,
                            enquiries: m.canManageEnquiries,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          m.canManageOffers
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        Offers: {m.canManageOffers ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePermissionMutation.mutate({
                            membershipId: m.id,
                            offers: m.canManageOffers,
                            enquiries: !m.canManageEnquiries,
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          m.canManageEnquiries
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        Enquiries: {m.canManageEnquiries ? 'ON' : 'OFF'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePermissionMutation.mutate({
                            membershipId: m.id,
                            status: 'REVOKED',
                          })
                        }
                        className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold"
                      >
                        Revoke
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
