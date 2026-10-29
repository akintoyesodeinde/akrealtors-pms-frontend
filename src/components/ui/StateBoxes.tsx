import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { ApiClientError } from '../../api/types';

export function LoadingSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading properties"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
        >
          <div className="h-52 bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-10 bg-slate-100 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorStateBox({
  title = 'Unable to load data',
  error,
  onRetry,
}: {
  title?: string;
  error: unknown;
  onRetry?: () => void;
}) {
  const apiErr = error instanceof ApiClientError ? error : null;
  const message =
    apiErr?.message ??
    (error instanceof Error ? error.message : 'An unexpected error occurred while contacting the server.');

  return (
    <div
      role="alert"
      className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-sm text-rose-800 mt-1">{message}</p>
          {apiErr?.correlationId && (
            <p className="text-xs text-rose-600 mt-1 font-mono">
              Ref ID: {apiErr.correlationId}
            </p>
          )}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-900 text-sm font-medium hover:bg-rose-100 transition shrink-0"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyStateBox({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-xl mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
        <Inbox className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function PaginationBar({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (nextPage: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200"
    >
      <p className="text-sm text-slate-600">
        Page <span className="font-semibold text-slate-900">{page + 1}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span> ({totalElements} total)
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
