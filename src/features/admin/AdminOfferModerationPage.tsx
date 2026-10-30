import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type OfferModerationAction } from '../../api/adminApi';
import type { OfferPublicationState, OfferResponse } from '../../api/contracts';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatMoney, formatTransactionLabel } from '../../lib/formatters';
import { formatDateTime, humanizeEnum } from './adminFormatting';
import { InlineMutationError, ReasonActionForm, StatusPill } from './AdminUi';

const QUEUE_STATES: OfferPublicationState[] = ['PENDING_REVIEW', 'PUBLISHED', 'SUSPENDED', 'REJECTED'];

function OfferModerationCard({ offer }: { offer: OfferResponse }) {
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<OfferModerationAction | null>(null);
  const [featured, setFeatured] = useState(offer.featured);

  const mutation = useMutation({
    mutationFn: ({ action, reason }: { action: OfferModerationAction; reason: string }) =>
      adminApi.moderateOffer(offer.id, action, {
        reason: reason || undefined,
        featured: action === 'approve' ? featured : undefined,
      }),
    onSuccess: () => {
      setPendingAction(null);
      void queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const canApprove = offer.publicationState === 'PENDING_REVIEW';
  const canReject = offer.publicationState === 'PENDING_REVIEW';
  const canSuspend = offer.publicationState === 'PUBLISHED' || offer.publicationState === 'PENDING_REVIEW';
  const canReinstate = offer.publicationState === 'SUSPENDED';
  const imageCount = offer.media.filter((m) => m.mediaKind === 'IMAGE').length;
  const videoCount = offer.media.filter((m) => m.mediaKind === 'VIDEO').length;

  return (
    <article
      aria-label={`Moderation offer ${offer.effectiveTitle}`}
      className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={offer.publicationState} />
            <span className="text-xs font-semibold text-slate-500">
              {formatTransactionLabel(offer.transactionType)}
            </span>
            {offer.featured && (
              <span className="text-[11px] font-semibold text-amber-700">★ Featured</span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900">{offer.effectiveTitle}</h3>
          <p className="text-xs text-slate-600">
            {offer.property.locality ? `${offer.property.locality}, ` : ''}
            {offer.property.city}, {offer.property.state} · {humanizeEnum(offer.property.propertyType)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-emerald-800">
            {formatMoney(offer.price, offer.currency, offer.billingPeriod)}
          </p>
          <p className="text-[11px] text-slate-500">Submitted {formatDateTime(offer.submittedAt)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div>
          <dt className="text-slate-500">Media</dt>
          <dd className="font-semibold text-slate-900">
            {imageCount} photo(s) · {videoCount} video(s)
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Marketing Authorization</dt>
          <dd className="font-semibold text-slate-900">
            {offer.property.marketingAuthorizationVerified ? 'Verified' : 'Not verified'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Legal Title</dt>
          <dd className="font-semibold text-slate-900">
            {offer.property.legalTitleVerified ? 'Verified' : 'Not verified'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Advertiser</dt>
          <dd className="font-semibold text-slate-900">
            {offer.advertiserAgencyId ? 'Agency listing' : 'Independent realtor'}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-slate-700 line-clamp-3">{offer.property.description}</p>

      {offer.moderationReason && (
        <p className="text-xs text-slate-600">
          <span className="font-semibold">Last moderation note:</span> {offer.moderationReason}
        </p>
      )}

      {offer.media.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {offer.media
            .filter((m) => m.mediaKind === 'IMAGE')
            .slice(0, 6)
            .map((m) => (
              <img
                key={m.id}
                src={m.thumbnailUrl ?? m.url ?? undefined}
                alt={`Offer media ${m.sortOrder + 1}`}
                className="h-16 w-24 rounded-lg object-cover border border-slate-200"
                loading="lazy"
              />
            ))}
        </div>
      )}

      {pendingAction ? (
        <ReasonActionForm
          label={
            pendingAction === 'approve'
              ? 'Approval note (optional)'
              : pendingAction === 'reinstate'
                ? 'Reinstatement note (optional)'
                : `Reason for ${pendingAction} (shared with the advertiser)`
          }
          confirmLabel={`Confirm ${humanizeEnum(pendingAction)}`}
          tone={pendingAction === 'approve' || pendingAction === 'reinstate' ? 'primary' : 'danger'}
          requireReason={pendingAction === 'reject' || pendingAction === 'suspend'}
          isPending={mutation.isPending}
          onSubmit={(reason) => mutation.mutate({ action: pendingAction, reason })}
          onCancel={() => setPendingAction(null)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {canApprove && (
            <>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                Feature on homepage
              </label>
              <button
                type="button"
                onClick={() => setPendingAction('approve')}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
              >
                Approve
              </button>
            </>
          )}
          {canReject && (
            <button
              type="button"
              onClick={() => setPendingAction('reject')}
              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-800 bg-white hover:bg-rose-50 text-xs font-semibold"
            >
              Reject
            </button>
          )}
          {canSuspend && (
            <button
              type="button"
              onClick={() => setPendingAction('suspend')}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
            >
              Suspend
            </button>
          )}
          {canReinstate && (
            <button
              type="button"
              onClick={() => setPendingAction('reinstate')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Reinstate
            </button>
          )}
          {offer.publicationState === 'PUBLISHED' && (
            <Link
              to={`/properties/${offer.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
            >
              View public page <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
      <InlineMutationError error={mutation.error} />
    </article>
  );
}

function DuplicateCandidatesPanel() {
  const duplicatesQuery = useQuery({
    queryKey: ['admin', 'duplicates'],
    queryFn: () => adminApi.listDuplicateOffers(),
  });

  if (duplicatesQuery.isLoading) return null;
  if (duplicatesQuery.isError) {
    return (
      <ErrorStateBox
        title="Unable to run duplicate detection"
        error={duplicatesQuery.error}
        onRetry={() => void duplicatesQuery.refetch()}
      />
    );
  }
  const groups = duplicatesQuery.data ?? [];
  if (groups.length === 0) {
    return (
      <p className="text-xs text-slate-500">
        Duplicate detection: no overlapping active or pending offers found.
      </p>
    );
  }

  return (
    <section
      aria-label="Duplicate offer candidates"
      className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-amber-900">
        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        {groups.length} potential duplicate group(s)
      </h3>
      {groups.map((g) => (
        <div key={`${g.matchReason}-${g.fingerprintKey}`} className="bg-white rounded-xl border border-amber-100 p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-900">{humanizeEnum(g.matchReason)}</p>
          <ul className="text-xs text-slate-700 space-y-0.5">
            {g.offers.map((o) => (
              <li key={o.offerId}>
                <StatusPill status={o.publicationState} /> {o.title} — {o.city}, {o.state} ·{' '}
                {formatMoney(o.price, o.currency)} · {o.advertiserDisplayName}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function AdminOfferModerationPage() {
  const [state, setState] = useState<OfferPublicationState>('PENDING_REVIEW');
  const [page, setPage] = useState(0);

  const offersQuery = useQuery({
    queryKey: ['admin', 'moderation-offers', state, page],
    queryFn: () => adminApi.listModerationOffers({ state, page, size: 10 }),
  });
  const pageData = offersQuery.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Offer Moderation Queue</h2>
        <div role="tablist" aria-label="Offer publication state" className="flex flex-wrap gap-1">
          {QUEUE_STATES.map((s) => (
            <button
              key={s}
              role="tab"
              type="button"
              aria-selected={state === s}
              onClick={() => {
                setState(s);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                state === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700'
              }`}
            >
              {humanizeEnum(s)}
            </button>
          ))}
        </div>
      </div>

      {state === 'PENDING_REVIEW' && <DuplicateCandidatesPanel />}

      {offersQuery.isLoading ? (
        <LoadingSkeletonGrid count={2} />
      ) : offersQuery.isError ? (
        <ErrorStateBox
          title="Unable to load moderation queue"
          error={offersQuery.error}
          onRetry={() => void offersQuery.refetch()}
        />
      ) : !pageData || pageData.content.length === 0 ? (
        <EmptyStateBox
          title="Queue is clear"
          description={`There are no ${humanizeEnum(state).toLowerCase()} offers right now.`}
        />
      ) : (
        <>
          {pageData.content.map((offer) => (
            <OfferModerationCard key={offer.id} offer={offer} />
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
