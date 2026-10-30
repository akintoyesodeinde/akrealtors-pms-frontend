import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, MessageSquare, Video } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatDate } from '../../lib/formatters';

export function PortalEnquiriesPage() {
  const [page, setPage] = useState(0);

  const enquiriesQuery = useQuery({
    queryKey: ['customer', 'enquiries', page],
    queryFn: () => customerApi.listMyEnquiries(page, 15),
  });

  return (
    <div className="space-y-6">
      <SeoHead title="My Property Enquiries" canonicalPath="/portal/enquiries" />

      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          Submitted Enquiries &amp; Replies
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Track advertiser responses to your property questions in one place.
        </p>
      </div>

      {enquiriesQuery.isLoading ? (
        <LoadingSkeletonGrid count={3} />
      ) : enquiriesQuery.isError ? (
        <ErrorStateBox
          title="Unable to load enquiries"
          error={enquiriesQuery.error}
          onRetry={() => void enquiriesQuery.refetch()}
        />
      ) : (enquiriesQuery.data?.content ?? []).length === 0 ? (
        <EmptyStateBox
          title="No enquiries sent yet"
          description="Open any published property listing and click 'Send Structured Enquiry' to contact the advertiser."
        />
      ) : (
        <div className="space-y-4">
          {(enquiriesQuery.data?.content ?? []).map((enq) => (
            <article
              key={enq.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/properties/${enq.offerId}`}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700"
                  >
                    {enq.offerTitle}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    To {enq.advertiserName} ({enq.advertiserType}) · Sent{' '}
                    {formatDate(enq.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    enq.status === 'RESPONDED'
                      ? 'bg-emerald-100 text-emerald-900'
                      : enq.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {enq.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm space-y-1">
                <p className="font-semibold text-slate-800">{enq.subject}</p>
                <p className="text-slate-700 whitespace-pre-line">{enq.message}</p>
              </div>

              {enq.realtorReply && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-sm space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span>Reply from {enq.advertiserName}</span>
                    {enq.respondedAt && <span>{formatDate(enq.respondedAt)}</span>}
                  </div>
                  <p className="text-slate-800 whitespace-pre-line">{enq.realtorReply}</p>
                </div>
              )}
            </article>
          ))}

          {enquiriesQuery.data && (
            <PaginationBar
              page={enquiriesQuery.data.page}
              totalPages={enquiriesQuery.data.totalPages}
              totalElements={enquiriesQuery.data.totalElements}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function PortalViewingsPage() {
  const [page, setPage] = useState(0);
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newProposedDateTime, setNewProposedDateTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const queryClient = useQueryClient();

  const viewingsQuery = useQuery({
    queryKey: ['customer', 'viewings', page],
    queryFn: () => customerApi.listMyViewingRequests(page, 15),
  });

  const cancelMutation = useMutation({
    mutationFn: (viewingId: string) =>
      customerApi.updateMyViewingRequest(viewingId, {
        action: 'CANCEL',
        customerNotes: 'Cancelled by customer from portal',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'viewings'] });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, proposedAt, notes }: { id: string; proposedAt: string; notes: string }) =>
      customerApi.updateMyViewingRequest(id, {
        action: 'RESCHEDULE',
        proposedAt,
        customerNotes: notes || undefined,
      }),
    onSuccess: () => {
      setReschedulingId(null);
      setNewProposedDateTime('');
      setRescheduleNotes('');
      void queryClient.invalidateQueries({ queryKey: ['customer', 'viewings'] });
    },
  });

  const handleRescheduleSubmit = (e: FormEvent, viewingId: string) => {
    e.preventDefault();
    if (!newProposedDateTime) return;
    rescheduleMutation.mutate({
      id: viewingId,
      proposedAt: new Date(newProposedDateTime).toISOString(),
      notes: rescheduleNotes.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Property Viewing Requests" canonicalPath="/portal/viewings" />

      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          Property Viewing Schedule
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Manage your physical inspection and virtual video tour appointments.
        </p>
      </div>

      {viewingsQuery.isLoading ? (
        <LoadingSkeletonGrid count={3} />
      ) : viewingsQuery.isError ? (
        <ErrorStateBox
          title="Unable to load viewing requests"
          error={viewingsQuery.error}
          onRetry={() => void viewingsQuery.refetch()}
        />
      ) : (viewingsQuery.data?.content ?? []).length === 0 ? (
        <EmptyStateBox
          title="No property viewings requested"
          description="Request an in-person inspection or virtual video tour directly from any published property page."
        />
      ) : (
        <div className="space-y-4">
          {(viewingsQuery.data?.content ?? []).map((vr) => {
            const canModify = ['REQUESTED', 'CONFIRMED', 'RESCHEDULED'].includes(vr.status);
            return (
              <article
                key={vr.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`/properties/${vr.offerId}`}
                      className="text-base font-bold text-slate-900 hover:text-emerald-700"
                    >
                      {vr.offerTitle}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      With {vr.advertiserName} ({vr.advertiserType})
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vr.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : vr.status === 'RESCHEDULED'
                          ? 'bg-amber-100 text-amber-900'
                          : vr.status === 'DECLINED' || vr.status === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {vr.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                    Proposed: {new Date(vr.proposedAt).toLocaleString()} ({vr.timezone})
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Video className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    {vr.viewingMode === 'VIRTUAL' ? 'Virtual Video Tour' : 'In-Person Inspection'}
                  </span>
                  {vr.rescheduledAt && (
                    <span className="font-semibold text-amber-800">
                      Advertiser Proposed Slot: {new Date(vr.rescheduledAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {vr.customerNotes && (
                  <p className="text-xs text-slate-600">
                    <strong>Your notes:</strong> {vr.customerNotes}
                  </p>
                )}

                {(vr.realtorResponse || vr.meetingInstructions) && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                    {vr.realtorResponse && (
                      <p className="text-slate-800">
                        <strong>Advertiser response:</strong> {vr.realtorResponse}
                      </p>
                    )}
                    {vr.meetingInstructions && (
                      <p className="text-emerald-950 font-medium">
                        <strong>Meeting / Dial-in Instructions:</strong> {vr.meetingInstructions}
                      </p>
                    )}
                  </div>
                )}

                {canModify && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setReschedulingId((prev) => (prev === vr.id ? null : vr.id))
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Propose New Time
                    </button>
                    <button
                      type="button"
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(vr.id)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Cancel Viewing
                    </button>
                  </div>
                )}

                {reschedulingId === vr.id && (
                  <form
                    onSubmit={(e) => handleRescheduleSubmit(e, vr.id)}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    {rescheduleMutation.isError && (
                      <p role="alert" className="text-xs text-rose-700">
                        {rescheduleMutation.error instanceof ApiClientError
                          ? rescheduleMutation.error.message
                          : 'Reschedule failed.'}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label
                          htmlFor={`resched-${vr.id}`}
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          New Date &amp; Time
                        </label>
                        <input
                          id={`resched-${vr.id}`}
                          type="datetime-local"
                          required
                          value={newProposedDateTime}
                          onChange={(e) => setNewProposedDateTime(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`resched-note-${vr.id}`}
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Reason / Note
                        </label>
                        <input
                          id={`resched-note-${vr.id}`}
                          type="text"
                          value={rescheduleNotes}
                          onChange={(e) => setRescheduleNotes(e.target.value)}
                          placeholder="Optional note…"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={rescheduleMutation.isPending}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                    >
                      {rescheduleMutation.isPending ? 'Updating…' : 'Confirm Reschedule'}
                    </button>
                  </form>
                )}
              </article>
            );
          })}

          {viewingsQuery.data && (
            <PaginationBar
              page={viewingsQuery.data.page}
              totalPages={viewingsQuery.data.totalPages}
              totalElements={viewingsQuery.data.totalElements}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
