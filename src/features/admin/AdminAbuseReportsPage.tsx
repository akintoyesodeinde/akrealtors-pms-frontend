import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import type { AbuseReportResponse, AbuseReportStatus } from '../../api/contracts';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatDateTime, humanizeEnum } from './adminFormatting';
import { InlineMutationError, StatusPill } from './AdminUi';

const REPORT_STATUSES: AbuseReportStatus[] = [
  'OPEN',
  'UNDER_INVESTIGATION',
  'RESOLVED_ACTION_TAKEN',
  'DISMISSED',
];

function AbuseReportCard({ report }: { report: AbuseReportResponse }) {
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState<AbuseReportStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [suspendOffer, setSuspendOffer] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (status: AbuseReportStatus) =>
      adminApi.resolveAbuseReport(report.id, {
        status,
        resolutionNotes: notes.trim() || undefined,
        suspendTargetOffer: status === 'RESOLVED_ACTION_TAKEN' && suspendOffer,
      }),
    onSuccess: () => {
      setNextStatus(null);
      setNotes('');
      setSuspendOffer(false);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const isClosed = report.status === 'RESOLVED_ACTION_TAKEN' || report.status === 'DISMISSED';
  const targetLabel =
    report.targetOfferTitle ?? report.targetRealtorName ?? report.targetAgencyName ?? 'Unknown target';

  const submit = () => {
    if (!nextStatus) return;
    const needsNotes = nextStatus === 'RESOLVED_ACTION_TAKEN' || nextStatus === 'DISMISSED';
    if (needsNotes && notes.trim().length < 5) {
      setValidationError('Resolution notes are required when resolving or dismissing a report.');
      return;
    }
    setValidationError(null);
    mutation.mutate(nextStatus);
  };

  return (
    <article
      aria-label={`Abuse report against ${targetLabel}`}
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusPill status={report.status} />
            <span className="text-xs font-bold text-rose-800">
              {humanizeEnum(report.reasonCategory)}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {humanizeEnum(report.targetType)}: {targetLabel}
          </p>
          <p className="text-xs text-slate-500">
            Reported by {report.reporterName ?? 'Anonymous'}
            {report.reporterEmail ? ` (${report.reporterEmail})` : ''} ·{' '}
            {formatDateTime(report.createdAt)}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-700 whitespace-pre-line">{report.details}</p>

      {report.resolutionNotes && (
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Resolution notes:</span> {report.resolutionNotes}
        </p>
      )}

      {!isClosed && !nextStatus && (
        <div className="flex flex-wrap gap-2">
          {report.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => setNextStatus('UNDER_INVESTIGATION')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Start Investigation
            </button>
          )}
          <button
            type="button"
            onClick={() => setNextStatus('RESOLVED_ACTION_TAKEN')}
            className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
          >
            Resolve — Action Taken
          </button>
          <button
            type="button"
            onClick={() => setNextStatus('DISMISSED')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Dismiss
          </button>
        </div>
      )}

      {nextStatus && (
        <form
          className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p className="text-xs font-semibold text-slate-800">
            Set status to {humanizeEnum(nextStatus)}
          </p>
          <label className="block text-xs font-semibold text-slate-700">
            Resolution notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          {nextStatus === 'RESOLVED_ACTION_TAKEN' && report.targetOfferId && (
            <label className="inline-flex items-center gap-2 text-xs text-slate-800">
              <input
                type="checkbox"
                checked={suspendOffer}
                onChange={(e) => setSuspendOffer(e.target.checked)}
              />
              Also suspend the reported offer immediately
            </label>
          )}
          {validationError && (
            <p role="alert" className="text-xs text-rose-700">
              {validationError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => {
                setNextStatus(null);
                setValidationError(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <InlineMutationError error={mutation.error} />
    </article>
  );
}

export function AdminAbuseReportsPage() {
  const [status, setStatus] = useState<AbuseReportStatus | ''>('OPEN');
  const [page, setPage] = useState(0);

  const reportsQuery = useQuery({
    queryKey: ['admin', 'abuse-reports', status, page],
    queryFn: () => adminApi.listAbuseReports({ status: status || undefined, page, size: 10 }),
  });
  const pageData = reportsQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Abuse Reports &amp; Trust Investigations</h2>
        <label className="text-xs font-semibold text-slate-700">
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AbuseReportStatus | '');
              setPage(0);
            }}
            className="ml-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
          >
            <option value="">All</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanizeEnum(s)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {reportsQuery.isLoading ? (
        <LoadingSkeletonGrid count={2} />
      ) : reportsQuery.isError ? (
        <ErrorStateBox
          title="Unable to load abuse reports"
          error={reportsQuery.error}
          onRetry={() => void reportsQuery.refetch()}
        />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyStateBox title="No abuse reports" description="No reports match this status filter." />
      ) : (
        <>
          {pageData.content.map((r) => (
            <AbuseReportCard key={r.id} report={r} />
          ))}
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
