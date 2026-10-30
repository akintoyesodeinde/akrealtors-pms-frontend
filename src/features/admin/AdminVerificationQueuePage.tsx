import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileLock2, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import type {
  VerificationCaseResponse,
  VerificationCaseStatus,
  VerificationCaseType,
  VerificationDecisionOutcome,
} from '../../api/contracts';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { useAuth } from '../auth/useAuth';
import { formatDateTime, humanizeEnum } from './adminFormatting';
import { InlineMutationError, ReasonActionForm, StatusPill } from './AdminUi';

const CASE_TYPES: VerificationCaseType[] = [
  'REALTOR_IDENTITY',
  'AGENCY_CORPORATE',
  'PROPERTY_AUTHORIZATION',
  'PROPERTY_LEGAL_TITLE',
];
const CASE_STATUSES: VerificationCaseStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'REVOKED',
];

function VerificationCaseCard({ vc }: { vc: VerificationCaseResponse }) {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const isPlatformAdmin = hasRole('PLATFORM_ADMIN');
  const [pendingOutcome, setPendingOutcome] = useState<VerificationDecisionOutcome | null>(null);
  const [evidenceUrlError, setEvidenceUrlError] = useState<unknown>(null);

  const isAssignedToMe = vc.assignedModeratorId !== null && vc.assignedModeratorId === user?.id;
  const isOwnCase = vc.submittedByUserId === user?.id;
  const canSeeEvidence = isPlatformAdmin || isAssignedToMe;
  const isOpen = vc.status === 'SUBMITTED' || vc.status === 'UNDER_REVIEW';

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['admin'] });

  const assignMutation = useMutation({
    mutationFn: () => adminApi.assignVerificationCase(vc.id),
    onSuccess: invalidate,
  });

  const decisionMutation = useMutation({
    mutationFn: ({ outcome, reason }: { outcome: VerificationDecisionOutcome; reason: string }) =>
      adminApi.decideVerificationCase(vc.id, { outcome, reason: reason || undefined }),
    onSuccess: () => {
      setPendingOutcome(null);
      invalidate();
    },
  });

  const openEvidence = async (evidenceId: string) => {
    setEvidenceUrlError(null);
    try {
      const res = await adminApi.getEvidenceAccessUrl(vc.id, evidenceId);
      window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setEvidenceUrlError(err);
    }
  };

  return (
    <article
      aria-label={`Verification case ${humanizeEnum(vc.caseType)} for ${vc.submittedByEmail}`}
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusPill status={vc.status} />
            <span className="text-xs font-bold text-slate-800">{humanizeEnum(vc.caseType)}</span>
          </div>
          <p className="text-sm text-slate-900">
            {vc.agencyName ?? vc.realtorDisplayName ?? vc.submittedByEmail}
          </p>
          <p className="text-xs text-slate-500">
            Submitted by {vc.submittedByEmail} · {formatDateTime(vc.submittedAt)}
          </p>
          {vc.targetPropertyId && (
            <p className="text-xs text-slate-500 font-mono">Property: {vc.targetPropertyId}</p>
          )}
        </div>
        <p className="text-xs text-slate-600">
          {vc.assignedModeratorId
            ? isAssignedToMe
              ? 'Assigned to you'
              : 'Assigned to another reviewer'
            : 'Unassigned'}
        </p>
      </div>

      {vc.notes && <p className="text-xs text-slate-700">Submitter notes: {vc.notes}</p>}
      {vc.decisionReason && (
        <p className="text-xs text-slate-700">Decision reason: {vc.decisionReason}</p>
      )}

      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-700">Private evidence</p>
        {!canSeeEvidence ? (
          <p className="text-xs text-slate-500 italic">
            Evidence files are only visible to the assigned reviewer or a Platform Administrator.
          </p>
        ) : vc.evidence.length === 0 ? (
          <p className="text-xs text-slate-500">No evidence documents uploaded.</p>
        ) : (
          <ul className="space-y-1">
            {vc.evidence.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-center gap-2 text-xs">
                <FileLock2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span className="font-medium text-slate-800">{ev.originalFilename}</span>
                <span className="text-slate-500">
                  {humanizeEnum(ev.documentType)} · {humanizeEnum(ev.validationStatus)}
                </span>
                {ev.validationStatus === 'READY' && (
                  <button
                    type="button"
                    onClick={() => void openEvidence(ev.id)}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    Open (audited, short-lived link)
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <InlineMutationError error={evidenceUrlError} />
      </div>

      {isOwnCase ? (
        <p className="text-xs text-rose-700 font-medium">
          You submitted this case — self-review is not permitted.
        </p>
      ) : pendingOutcome ? (
        <ReasonActionForm
          label={
            pendingOutcome === 'APPROVE'
              ? 'Approval note (optional)'
              : `Reason for ${humanizeEnum(pendingOutcome).toLowerCase()} (shared with submitter)`
          }
          confirmLabel={`Confirm ${humanizeEnum(pendingOutcome)}`}
          tone={pendingOutcome === 'APPROVE' ? 'primary' : 'danger'}
          requireReason={pendingOutcome !== 'APPROVE'}
          isPending={decisionMutation.isPending}
          onSubmit={(reason) => decisionMutation.mutate({ outcome: pendingOutcome, reason })}
          onCancel={() => setPendingOutcome(null)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {isOpen && !isAssignedToMe && (
            <button
              type="button"
              disabled={assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Assign to me
            </button>
          )}
          {isOpen && (
            <>
              <button
                type="button"
                onClick={() => setPendingOutcome('APPROVE')}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => setPendingOutcome('REJECT')}
                className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 bg-white hover:bg-rose-50 text-xs font-semibold"
              >
                Reject
              </button>
            </>
          )}
          {vc.status === 'APPROVED' && (
            <button
              type="button"
              onClick={() => setPendingOutcome('REVOKE')}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
            >
              Revoke Verification
            </button>
          )}
        </div>
      )}
      <InlineMutationError error={assignMutation.error ?? decisionMutation.error} />
    </article>
  );
}

export function AdminVerificationQueuePage() {
  const [caseType, setCaseType] = useState<VerificationCaseType | ''>('');
  const [status, setStatus] = useState<VerificationCaseStatus | ''>('SUBMITTED');
  const [page, setPage] = useState(0);

  const casesQuery = useQuery({
    queryKey: ['admin', 'verification-cases', caseType, status, page],
    queryFn: () =>
      adminApi.listVerificationCases({
        caseType: caseType || undefined,
        status: status || undefined,
        page,
        size: 10,
      }),
  });
  const pageData = casesQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Verification Review Queue</h2>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs font-semibold text-slate-700">
            Tier
            <select
              value={caseType}
              onChange={(e) => {
                setCaseType(e.target.value as VerificationCaseType | '');
                setPage(0);
              }}
              className="ml-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
            >
              <option value="">All tiers</option>
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {humanizeEnum(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Status
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as VerificationCaseStatus | '');
                setPage(0);
              }}
              className="ml-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
            >
              <option value="">All statuses</option>
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {humanizeEnum(s)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="text-xs text-slate-600">
        Verification tiers are independent: approving a realtor identity never implies marketing
        authorization or legal title verification for any property.
      </p>

      {casesQuery.isLoading ? (
        <LoadingSkeletonGrid count={2} />
      ) : casesQuery.isError ? (
        <ErrorStateBox
          title="Unable to load verification queue"
          error={casesQuery.error}
          onRetry={() => void casesQuery.refetch()}
        />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyStateBox
          title="No verification cases"
          description="No cases match the selected tier and status filters."
        />
      ) : (
        <>
          {pageData.content.map((vc) => (
            <VerificationCaseCard key={vc.id} vc={vc} />
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
