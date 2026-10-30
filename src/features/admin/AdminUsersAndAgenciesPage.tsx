import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import type {
  AccountStatus,
  AdminUserResponse,
  AgencyResponse,
  AgencyStatus,
} from '../../api/contracts';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { useAuth } from '../auth/useAuth';
import { formatDateTime, humanizeEnum } from './adminFormatting';
import {
  InlineMutationError,
  PlatformAdminOnlyNotice,
  ReasonActionForm,
  StatusPill,
} from './AdminUi';

function UserRow({ account, isPlatformAdmin }: { account: AdminUserResponse; isPlatformAdmin: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<AccountStatus | null>(null);
  const isSelf = account.id === user?.id;
  const isModerator = account.roles.includes('MODERATOR');

  const mutation = useMutation({
    mutationFn: (payload: { accountStatus: AccountStatus; reason?: string; grantModeratorRole?: boolean }) =>
      adminApi.updateUserStatus(account.id, payload),
    onSuccess: () => {
      setPending(null);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  return (
    <li
      aria-label={`User ${account.email}`}
      className="bg-white rounded-xl border border-slate-200 p-4 space-y-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {account.firstName} {account.lastName}{' '}
            <span className="font-normal text-slate-500">· {account.email}</span>
          </p>
          <p className="text-xs text-slate-500">
            Roles: {account.roles.map(humanizeEnum).join(', ') || '—'} · Joined{' '}
            {formatDateTime(account.createdAt)} · Last login {formatDateTime(account.lastLoginAt)}
          </p>
          {account.suspendedReason && (
            <p className="text-xs text-rose-700">Reason: {account.suspendedReason}</p>
          )}
        </div>
        <StatusPill status={account.accountStatus} />
      </div>

      {isPlatformAdmin && !isSelf && (
        <>
          {pending ? (
            <ReasonActionForm
              label={`Reason for ${humanizeEnum(pending).toLowerCase()} (recorded in audit log)`}
              confirmLabel={`Confirm ${humanizeEnum(pending)}`}
              tone={pending === 'ACTIVE' ? 'primary' : 'danger'}
              requireReason={pending !== 'ACTIVE'}
              isPending={mutation.isPending}
              onSubmit={(reason) => mutation.mutate({ accountStatus: pending, reason: reason || undefined })}
              onCancel={() => setPending(null)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {account.accountStatus === 'ACTIVE' ? (
                <button
                  type="button"
                  onClick={() => setPending('SUSPENDED')}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
                >
                  Suspend Account
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPending('ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  Reactivate Account
                </button>
              )}
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({
                    accountStatus: account.accountStatus,
                    grantModeratorRole: !isModerator,
                  })
                }
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                {isModerator ? 'Revoke Moderator Role' : 'Grant Moderator Role'}
              </button>
            </div>
          )}
        </>
      )}
      <InlineMutationError error={mutation.error} />
    </li>
  );
}

function AgencyRow({ agency, isPlatformAdmin }: { agency: AgencyResponse; isPlatformAdmin: boolean }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<AgencyStatus | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: { status: AgencyStatus; reason?: string }) =>
      adminApi.updateAgencyStatus(agency.id, payload),
    onSuccess: () => {
      setPending(null);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  return (
    <li
      aria-label={`Agency ${agency.name}`}
      className="bg-white rounded-xl border border-slate-200 p-4 space-y-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{agency.name}</p>
          <p className="text-xs text-slate-500">
            {agency.city}, {agency.state} · RC {agency.rcNumber ?? '—'} · Corporate verification:{' '}
            {humanizeEnum(agency.verificationStatus)}
          </p>
        </div>
        <StatusPill status={agency.status} />
      </div>
      {isPlatformAdmin &&
        (pending ? (
          <ReasonActionForm
            label={`Reason for setting agency to ${humanizeEnum(pending).toLowerCase()}`}
            confirmLabel="Confirm"
            tone={pending === 'ACTIVE' ? 'primary' : 'danger'}
            requireReason={pending !== 'ACTIVE'}
            isPending={mutation.isPending}
            onSubmit={(reason) => mutation.mutate({ status: pending, reason: reason || undefined })}
            onCancel={() => setPending(null)}
          />
        ) : (
          <div className="flex gap-2">
            {agency.status === 'ACTIVE' ? (
              <button
                type="button"
                onClick={() => setPending('SUSPENDED')}
                className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
              >
                Suspend Agency
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPending('ACTIVE')}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                Reinstate Agency
              </button>
            )}
          </div>
        ))}
      <InlineMutationError error={mutation.error} />
    </li>
  );
}

export function AdminUsersAndAgenciesPage() {
  const { hasRole } = useAuth();
  const isPlatformAdmin = hasRole('PLATFORM_ADMIN');
  const [tab, setTab] = useState<'users' | 'agencies'>('users');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', query, page],
    queryFn: () => adminApi.listUsers({ query, page, size: 15 }),
    enabled: tab === 'users',
  });
  const agenciesQuery = useQuery({
    queryKey: ['admin', 'agencies', query, page],
    queryFn: () => adminApi.listAgencies({ query, page, size: 15 }),
    enabled: tab === 'agencies',
  });
  const activeQuery = tab === 'users' ? usersQuery : agenciesQuery;
  const pageData = activeQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Users &amp; Agencies</h2>
        <div role="tablist" aria-label="Account directory" className="flex gap-1">
          {(['users', 'agencies'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                tab === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              {t === 'users' ? 'User Accounts' : 'Agencies'}
            </button>
          ))}
        </div>
      </div>

      {!isPlatformAdmin && <PlatformAdminOnlyNotice />}

      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(queryInput.trim());
          setPage(0);
        }}
      >
        <label className="sr-only" htmlFor="admin-directory-search">
          Search
        </label>
        <input
          id="admin-directory-search"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder={tab === 'users' ? 'Search by name or email' : 'Search by agency name or city'}
          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          Search
        </button>
      </form>

      {activeQuery.isLoading ? (
        <LoadingSkeletonGrid count={2} />
      ) : activeQuery.isError ? (
        <ErrorStateBox
          title="Unable to load directory"
          error={activeQuery.error}
          onRetry={() => void activeQuery.refetch()}
        />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyStateBox title="No results" description="No records match your search." />
      ) : (
        <>
          <ul className="space-y-2">
            {tab === 'users'
              ? (usersQuery.data?.content ?? []).map((u) => (
                  <UserRow key={u.id} account={u} isPlatformAdmin={isPlatformAdmin} />
                ))
              : (agenciesQuery.data?.content ?? []).map((a) => (
                  <AgencyRow key={a.id} agency={a} isPlatformAdmin={isPlatformAdmin} />
                ))}
          </ul>
          <PaginationBar
            page={pageData.page}
            totalPages={pageData.totalPages}
            totalElements={pageData.totalElements}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
