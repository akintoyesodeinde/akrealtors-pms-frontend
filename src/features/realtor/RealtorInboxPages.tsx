import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, Clock, MessageSquare, Phone } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  EnquiryStatus,
  RealtorEnquiryResponse,
  ViewingRequestResponse,
  ViewingRequestStatus,
} from '../../api/contracts';
import { realtorApi } from '../../api/realtorApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatDate } from '../../lib/formatters';
import { useRealtorScope } from './useRealtorScope';

export function RealtorEnquiriesInboxPage() {
  const { selectedAgencyId } = useRealtorScope();
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | ''>('');
  const [page, setPage] = useState(0);
  const [activeEnquiry, setActiveEnquiry] = useState<RealtorEnquiryResponse | null>(null);
  const [replyText, setReplyText] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [nextStatus, setNextStatus] = useState<EnquiryStatus>('RESPONDED');
  const queryClient = useQueryClient();

  const enquiriesQuery = useQuery({
    queryKey: ['realtor', 'enquiries', selectedAgencyId ?? 'PERSONAL', statusFilter, page],
    queryFn: () =>
      realtorApi.listEnquiries({
        agencyId: selectedAgencyId,
        status: statusFilter || undefined,
        page,
        size: 15,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      realtorApi.updateEnquiry(activeEnquiry?.id ?? '', {
        status: nextStatus,
        realtorReply: replyText.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
      }),
    onSuccess: () => {
      setActiveEnquiry(null);
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const openEditor = (enq: RealtorEnquiryResponse) => {
    setActiveEnquiry(enq);
    setReplyText(enq.realtorReply ?? '');
    setInternalNotes(enq.internalNotes ?? '');
    setNextStatus(enq.status === 'OPEN' ? 'RESPONDED' : enq.status);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!activeEnquiry) return;
    updateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Realtor Enquiries Inbox" canonicalPath="/realtor/enquiries" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            Customer Enquiries Inbox
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Respond to prospective buyers and tenants and record private team notes.
          </p>
        </div>

        <select
          aria-label="Filter enquiries by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as EnquiryStatus | '');
            setPage(0);
          }}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESPONDED">RESPONDED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      {enquiriesQuery.isLoading ? (
        <LoadingSkeletonGrid count={3} />
      ) : enquiriesQuery.isError ? (
        <ErrorStateBox
          title="Unable to load enquiries inbox"
          error={enquiriesQuery.error}
          onRetry={() => void enquiriesQuery.refetch()}
        />
      ) : (enquiriesQuery.data?.content ?? []).length === 0 ? (
        <EmptyStateBox
          title="No customer enquiries in this scope"
          description="Customer enquiries on your published offers appear here automatically."
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
                    to={`/realtor/offers/${enq.offerId}`}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700"
                  >
                    {enq.offerTitle}
                  </Link>
                  <p className="text-xs text-slate-600 mt-0.5">
                    From <strong>{enq.customerName}</strong> ({enq.customerEmail})
                    {enq.customerPhone ? (
                      <span className="inline-flex items-center gap-1 ml-2 text-emerald-800 font-medium">
                        <Phone className="w-3 h-3" aria-hidden="true" />
                        {enq.customerPhone}
                      </span>
                    ) : null}{' '}
                    · {formatDate(enq.createdAt)}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                  {enq.status}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm space-y-1">
                <p className="font-semibold text-slate-900">{enq.subject}</p>
                <p className="text-slate-700 whitespace-pre-line">{enq.message}</p>
              </div>

              {enq.realtorReply && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                  <strong>Sent Reply:</strong> {enq.realtorReply}
                </div>
              )}

              {enq.internalNotes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                  <strong>Internal Staff Notes (Private):</strong> {enq.internalNotes}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditor(enq)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                >
                  {enq.realtorReply ? 'Update Reply / Notes' : 'Reply to Customer'}
                </button>
              </div>

              {activeEnquiry?.id === enq.id && (
                <form
                  onSubmit={handleSave}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  {updateMutation.isError && (
                    <p role="alert" className="text-xs text-rose-700">
                      {updateMutation.error instanceof ApiClientError
                        ? updateMutation.error.message
                        : 'Update failed.'}
                    </p>
                  )}

                  <div>
                    <label htmlFor={`reply-${enq.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Reply (Visible to Customer)
                    </label>
                    <textarea
                      id={`reply-${enq.id}`}
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a clear, helpful response…"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`notes-${enq.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
                        Private Internal Notes (Hidden from Customer)
                      </label>
                      <input
                        id={`notes-${enq.id}`}
                        type="text"
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Internal qualification or follow-up note…"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor={`status-${enq.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        id={`status-${enq.id}`}
                        value={nextStatus}
                        onChange={(e) => setNextStatus(e.target.value as EnquiryStatus)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESPONDED">RESPONDED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                    >
                      {updateMutation.isPending ? 'Saving…' : 'Send Update'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEnquiry(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
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

export function RealtorViewingInboxPage() {
  const { selectedAgencyId } = useRealtorScope();
  const [statusFilter, setStatusFilter] = useState<ViewingRequestStatus | ''>('');
  const [page, setPage] = useState(0);
  const [activeViewing, setActiveViewing] = useState<ViewingRequestResponse | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<'CONFIRMED' | 'RESCHEDULED' | 'DECLINED'>(
    'CONFIRMED',
  );
  const [rescheduledDateTime, setRescheduledDateTime] = useState('');
  const [realtorResponse, setRealtorResponse] = useState('');
  const [meetingInstructions, setMeetingInstructions] = useState('');
  const queryClient = useQueryClient();

  const viewingsQuery = useQuery({
    queryKey: ['realtor', 'viewings', selectedAgencyId ?? 'PERSONAL', statusFilter, page],
    queryFn: () =>
      realtorApi.listViewingRequests({
        agencyId: selectedAgencyId,
        status: statusFilter || undefined,
        page,
        size: 15,
      }),
  });

  const respondMutation = useMutation({
    mutationFn: () =>
      realtorApi.respondToViewingRequest(activeViewing?.id ?? '', {
        status: decisionStatus,
        rescheduledAt:
          decisionStatus === 'RESCHEDULED' && rescheduledDateTime
            ? new Date(rescheduledDateTime).toISOString()
            : undefined,
        realtorResponse: realtorResponse.trim() || undefined,
        meetingInstructions: meetingInstructions.trim() || undefined,
      }),
    onSuccess: () => {
      setActiveViewing(null);
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const openRespondForm = (
    vr: ViewingRequestResponse,
    preset: 'CONFIRMED' | 'RESCHEDULED' | 'DECLINED',
  ) => {
    setActiveViewing(vr);
    setDecisionStatus(preset);
    setRealtorResponse(vr.realtorResponse ?? '');
    setMeetingInstructions(vr.meetingInstructions ?? '');
    setRescheduledDateTime('');
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Viewing Requests Management" canonicalPath="/realtor/viewings" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
            Viewing Appointments Pipeline
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Confirm inspections, propose alternative slots, or share meeting gate instructions.
          </p>
        </div>

        <select
          aria-label="Filter viewing requests by status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as ViewingRequestStatus | '');
            setPage(0);
          }}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
        >
          <option value="">All Statuses</option>
          <option value="REQUESTED">REQUESTED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="RESCHEDULED">RESCHEDULED</option>
          <option value="DECLINED">DECLINED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
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
          title="No viewing requests yet"
          description="Incoming physical inspection and virtual video tour requests appear here."
        />
      ) : (
        <div className="space-y-4">
          {(viewingsQuery.data?.content ?? []).map((vr) => (
            <article
              key={vr.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/realtor/offers/${vr.offerId}`}
                    className="text-base font-bold text-slate-900 hover:text-emerald-700"
                  >
                    {vr.offerTitle}
                  </Link>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Customer: <strong>{vr.customerName}</strong> ({vr.customerEmail})
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                  {vr.status}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  Requested: {new Date(vr.proposedAt).toLocaleString()} ({vr.timezone})
                </span>
                <span>Mode: {vr.viewingMode}</span>
              </div>

              {vr.customerNotes && (
                <p className="text-xs text-slate-700">
                  <strong>Customer notes:</strong> {vr.customerNotes}
                </p>
              )}

              {!['CANCELLED', 'DECLINED', 'COMPLETED'].includes(vr.status) && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openRespondForm(vr, 'CONFIRMED')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                  >
                    Confirm Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => openRespondForm(vr, 'RESCHEDULED')}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    Propose New Time
                  </button>
                  <button
                    type="button"
                    onClick={() => openRespondForm(vr, 'DECLINED')}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-700"
                  >
                    Decline
                  </button>
                </div>
              )}

              {activeViewing?.id === vr.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    respondMutation.mutate();
                  }}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-900">
                    Action: {decisionStatus} Viewing Request
                  </p>
                  {respondMutation.isError && (
                    <p role="alert" className="text-xs text-rose-700">
                      {respondMutation.error instanceof ApiClientError
                        ? respondMutation.error.message
                        : 'Action failed.'}
                    </p>
                  )}

                  {decisionStatus === 'RESCHEDULED' && (
                    <div>
                      <label htmlFor={`vr-resched-${vr.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
                        Alternative Date &amp; Time *
                      </label>
                      <input
                        id={`vr-resched-${vr.id}`}
                        type="datetime-local"
                        required
                        value={rescheduledDateTime}
                        onChange={(e) => setRescheduledDateTime(e.target.value)}
                        className="w-full max-w-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor={`vr-resp-${vr.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
                      Message to Customer
                    </label>
                    <input
                      id={`vr-resp-${vr.id}`}
                      type="text"
                      value={realtorResponse}
                      onChange={(e) => setRealtorResponse(e.target.value)}
                      placeholder="Confirming availability or reason for change…"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  {decisionStatus !== 'DECLINED' && (
                    <div>
                      <label htmlFor={`vr-meet-${vr.id}`} className="block text-xs font-semibold text-slate-700 mb-1">
                        Meeting Point / Estate Gate / Video Link Instructions
                      </label>
                      <input
                        id={`vr-meet-${vr.id}`}
                        type="text"
                        value={meetingInstructions}
                        onChange={(e) => setMeetingInstructions(e.target.value)}
                        placeholder="e.g. Meet at Estate Main Gate security post or Google Meet URL…"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={respondMutation.isPending}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                    >
                      {respondMutation.isPending ? 'Saving…' : `Submit ${decisionStatus}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewing(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </article>
          ))}

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
