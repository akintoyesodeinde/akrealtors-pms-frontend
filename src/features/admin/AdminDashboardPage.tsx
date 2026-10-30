import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { ErrorStateBox, LoadingSkeletonGrid } from '../../components/ui/StateBoxes';
import { useAuth } from '../auth/useAuth';
import { InlineMutationError } from './AdminUi';

function MetricCard({
  label,
  value,
  to,
  tone = 'slate',
}: {
  label: string;
  value: number;
  to?: string;
  tone?: 'slate' | 'amber' | 'rose' | 'emerald';
}) {
  const toneClass = {
    slate: 'text-slate-900',
    amber: 'text-amber-700',
    rose: 'text-rose-700',
    emerald: 'text-emerald-700',
  }[tone];
  const body = (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 h-full hover:border-slate-300 transition">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${toneClass}`}>{value.toLocaleString('en-NG')}</p>
    </div>
  );
  return to ? (
    <Link to={to} aria-label={`${label}: ${value}`}>
      {body}
    </Link>
  ) : (
    body
  );
}

export function AdminDashboardPage() {
  const { hasRole } = useAuth();
  const isPlatformAdmin = hasRole('PLATFORM_ADMIN');
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const outboxMutation = useMutation({
    mutationFn: () => adminApi.triggerOutboxBatch(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  if (dashboardQuery.isLoading) {
    return <LoadingSkeletonGrid count={3} />;
  }
  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <ErrorStateBox
        title="Unable to load operations dashboard"
        error={dashboardQuery.error}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const d = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Moderation Queues</h2>
          <button
            type="button"
            onClick={() => void dashboardQuery.refetch()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Offers Pending Review" value={d.pendingReviewOffers} to="/admin/offers" tone="amber" />
          <MetricCard label="Verification Cases Pending" value={d.pendingVerificationCases} to="/admin/verification" tone="amber" />
          <MetricCard label="Open Abuse Reports" value={d.openAbuseReports} to="/admin/abuse-reports" tone="rose" />
          <MetricCard label="Under Investigation" value={d.investigatingAbuseReports} to="/admin/abuse-reports" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Marketplace Inventory</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Published Offers" value={d.publishedOffers} tone="emerald" />
          <MetricCard label="Rejected Offers" value={d.rejectedOffers} />
          <MetricCard label="Suspended Offers" value={d.suspendedOffers} tone="rose" />
          <MetricCard label="Active Agencies" value={d.activeAgencies} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Accounts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Total Users" value={d.totalUsers} to="/admin/users" />
          <MetricCard label="Active Users" value={d.activeUsers} tone="emerald" />
          <MetricCard label="Suspended Users" value={d.suspendedUsers} tone="rose" />
          <MetricCard label="Realtor Profiles" value={d.totalRealtors} />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Notification Outbox Health</h2>
        <p className="text-xs text-slate-600">
          Notifications are written to a transactional outbox in the same database transaction as
          the business change, then relayed by a background worker. Delivery attempts are recorded
          honestly — when SMTP or SMS providers are disabled the attempt is recorded as{' '}
          <code>PROVIDER_UNAVAILABLE</code> rather than reported as sent.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Pending Outbox Events" value={d.pendingOutboxEvents} tone="amber" />
          <MetricCard label="Dead-Letter Events" value={d.deadLetterOutboxEvents} tone="rose" />
        </div>
        {isPlatformAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={outboxMutation.isPending}
              onClick={() => outboxMutation.mutate()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              {outboxMutation.isPending ? 'Processing…' : 'Process Outbox Batch Now'}
            </button>
            {outboxMutation.isSuccess && (
              <p role="status" className="text-xs font-semibold text-emerald-700">
                Processed {outboxMutation.data.processedCount} outbox event(s).
              </p>
            )}
            <InlineMutationError error={outboxMutation.error} />
          </div>
        )}
      </section>
    </div>
  );
}
