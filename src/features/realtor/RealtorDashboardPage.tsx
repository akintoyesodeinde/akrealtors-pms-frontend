import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Eye,
  FilePlus2,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { realtorApi } from '../../api/realtorApi';
import { SeoHead } from '../../components/ui/SeoHead';
import { ErrorStateBox, LoadingSkeletonGrid } from '../../components/ui/StateBoxes';
import { useRealtorScope } from './useRealtorScope';

const LIFECYCLE_STATES = [
  'PUBLISHED',
  'PENDING_REVIEW',
  'DRAFT',
  'REJECTED',
  'SUSPENDED',
  'EXPIRED',
  'ARCHIVED',
] as const;

export function RealtorDashboardPage() {
  const { selectedAgencyId } = useRealtorScope();

  const dashboardQuery = useQuery({
    queryKey: ['realtor', 'dashboard', selectedAgencyId ?? 'PERSONAL'],
    queryFn: () => realtorApi.getDashboard(selectedAgencyId),
  });

  if (dashboardQuery.isLoading) {
    return <LoadingSkeletonGrid count={4} />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <div className="space-y-4">
        <ErrorStateBox
          title="Complete your Realtor Profile to unlock workspace analytics"
          error={dashboardQuery.error}
          onRetry={() => void dashboardQuery.refetch()}
        />
        <Link
          to="/realtor/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
        >
          Complete Realtor Profile Setup →
        </Link>
      </div>
    );
  }

  const dash = dashboardQuery.data;
  const rejectedCount = dash.offersByState.REJECTED ?? 0;

  const kpis = [
    { label: 'Total Offer Views', value: dash.totalViews, icon: Eye },
    { label: 'Saved by Customers', value: dash.totalSavedFavourites, icon: Heart },
    {
      label: 'Active Enquiries',
      value: dash.openEnquiries + dash.inProgressEnquiries,
      sub: `${dash.openEnquiries} open · ${dash.inProgressEnquiries} in progress`,
      icon: MessageSquare,
      to: '/realtor/enquiries',
    },
    {
      label: 'Viewing Pipeline',
      value: dash.pendingViewingRequests + dash.confirmedViewingRequests,
      sub: `${dash.pendingViewingRequests} awaiting reply · ${dash.confirmedViewingRequests} confirmed`,
      icon: Calendar,
      to: '/realtor/viewings',
    },
  ];

  return (
    <div className="space-y-6">
      <SeoHead title="Realtor Performance Dashboard" canonicalPath="/realtor" />

      {/* Verification & Onboarding Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{dash.displayName}</h2>
            {dash.verificationStatus === 'VERIFIED' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                {dash.scope === 'AGENCY' ? 'Corporate Verified' : 'Identity Verified'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                Verification: {dash.verificationStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Scope: {dash.scope}
            {dash.onboardingStatus ? ` · Onboarding: ${dash.onboardingStatus}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {dash.verificationStatus !== 'VERIFIED' && (
            <Link
              to="/realtor/profile"
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Submit Verification Evidence
            </Link>
          )}
          <Link
            to="/realtor/offers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
          >
            <FilePlus2 className="w-4 h-4" aria-hidden="true" />
            New Property Offer
          </Link>
        </div>
      </div>

      {rejectedCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-rose-950">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
            <span>
              <strong>{rejectedCount}</strong> property {rejectedCount === 1 ? 'offer' : 'offers'}{' '}
              require updates after moderation review.
            </span>
          </div>
          <Link
            to="/realtor/offers?state=REJECTED"
            className="text-xs font-bold text-rose-800 hover:underline shrink-0"
          >
            Review &amp; Resubmit →
          </Link>
        </div>
      )}

      {/* Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const card = (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 h-full flex flex-col justify-between hover:border-emerald-400 transition">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">{kpi.label}</span>
                <Icon className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-extrabold text-slate-900 block">{kpi.value}</span>
                {kpi.sub && <span className="text-[11px] text-slate-500 mt-0.5 block">{kpi.sub}</span>}
              </div>
            </div>
          );
          return kpi.to ? (
            <Link key={kpi.label} to={kpi.to}>
              {card}
            </Link>
          ) : (
            <div key={kpi.label}>{card}</div>
          );
        })}
      </div>

      {/* Offer Lifecycle Breakdown */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Offer Publication Pipeline</h3>
          <Link
            to="/realtor/offers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
          >
            Manage all offers
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {LIFECYCLE_STATES.map((st) => (
            <Link
              key={st}
              to={`/realtor/offers?state=${st}`}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 text-center transition"
            >
              <span className="text-xl font-extrabold text-slate-900 block">
                {dash.offersByState[st] ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-slate-600 mt-0.5 block">
                {st.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
