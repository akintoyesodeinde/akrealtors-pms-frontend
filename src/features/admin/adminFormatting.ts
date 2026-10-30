import { ApiClientError } from '../../api/types';

export function describeApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'The request could not be completed.';
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => (w.length > 0 ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(' ');
}

const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  RESOLVED_ACTION_TAKEN: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PENDING_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  OPEN: 'bg-amber-50 text-amber-800 border-amber-200',
  UNDER_INVESTIGATION: 'bg-sky-50 text-sky-800 border-sky-200',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200',
  SUSPENDED: 'bg-rose-50 text-rose-800 border-rose-200',
  REVOKED: 'bg-rose-50 text-rose-800 border-rose-200',
  DEACTIVATED: 'bg-slate-100 text-slate-700 border-slate-300',
  ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-300',
  DISMISSED: 'bg-slate-100 text-slate-700 border-slate-300',
  EXPIRED: 'bg-slate-100 text-slate-700 border-slate-300',
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function statusToneClass(status: string): string {
  return STATUS_TONES[status] ?? 'bg-slate-100 text-slate-700 border-slate-300';
}
