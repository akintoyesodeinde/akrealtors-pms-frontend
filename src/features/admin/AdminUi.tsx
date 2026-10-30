import { useState } from 'react';
import { describeApiError, humanizeEnum, statusToneClass } from './adminFormatting';

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusToneClass(status)}`}
    >
      {humanizeEnum(status)}
    </span>
  );
}

export function InlineMutationError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <p role="alert" className="text-xs font-medium text-rose-700">
      {describeApiError(error)}
    </p>
  );
}

export function PlatformAdminOnlyNotice() {
  return (
    <p className="text-xs text-slate-500 italic">
      Read-only for moderators. Platform Administrator privileges are required for this action.
    </p>
  );
}

/**
 * Small inline "reason + confirm" form used for privileged decisions that require
 * an auditable justification (reject, suspend, revoke, account suspension...).
 */
export function ReasonActionForm({
  label,
  confirmLabel,
  tone = 'danger',
  requireReason = true,
  isPending,
  onSubmit,
  onCancel,
}: {
  label: string;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  requireReason?: boolean;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const trimmed = reason.trim();
  const invalid = requireReason && trimmed.length < 5;

  return (
    <form
      className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (invalid) return;
        onSubmit(trimmed);
      }}
    >
      <label className="block text-xs font-semibold text-slate-700">
        {label}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          maxLength={1000}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </label>
      {touched && invalid && (
        <p role="alert" className="text-xs text-rose-700">
          Please provide an auditable reason (at least 5 characters).
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 ${
            tone === 'danger' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          {isPending ? 'Submitting…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 border border-slate-300 bg-white hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
