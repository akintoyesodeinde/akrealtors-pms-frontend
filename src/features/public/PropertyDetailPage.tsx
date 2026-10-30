import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  Calendar,
  CheckCircle2,
  Flag,
  Heart,
  MapPin,
  Maximize,
  MessageSquare,
  Phone,
  X,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ViewingMode } from '../../api/contracts';
import { customerApi } from '../../api/customerApi';
import { marketplaceApi } from '../../api/marketplaceApi';
import { ApiClientError } from '../../api/types';
import { MediaGallery } from '../../components/ui/MediaGallery';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { SeoHead } from '../../components/ui/SeoHead';
import { ErrorStateBox, LoadingSkeletonGrid } from '../../components/ui/StateBoxes';
import { VerificationPanel } from '../../components/ui/VerificationBadges';
import {
  formatDate,
  formatMoney,
  formatPropertyCondition,
  formatPropertyType,
  formatTransactionLabel,
} from '../../lib/formatters';
import { useAuth } from '../auth/useAuth';

export function PropertyDetailPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [activeAction, setActiveAction] = useState<'NONE' | 'ENQUIRY' | 'VIEWING'>('NONE');
  const [enquirySubject, setEnquirySubject] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);

  const [viewingDateTime, setViewingDateTime] = useState('');
  const [viewingMode, setViewingMode] = useState<ViewingMode>('IN_PERSON');
  const [viewingNotes, setViewingNotes] = useState('');
  const [viewingSuccess, setViewingSuccess] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ['properties', 'detail', offerId],
    queryFn: () => marketplaceApi.getPropertyDetail(offerId ?? ''),
    enabled: Boolean(offerId),
  });

  const similarQuery = useQuery({
    queryKey: ['properties', 'similar', offerId],
    queryFn: () => marketplaceApi.getSimilarProperties(offerId ?? '', 3),
    enabled: Boolean(offerId) && Boolean(detailQuery.data),
  });

  const favouriteIdsQuery = useQuery({
    queryKey: ['favourites', 'ids'],
    queryFn: () => customerApi.listFavouriteIds(),
    enabled: isAuthenticated,
  });

  const isSaved = Boolean(offerId && (favouriteIdsQuery.data ?? []).includes(offerId));

  const toggleFavouriteMutation = useMutation({
    mutationFn: async () => {
      if (!offerId) return;
      if (isSaved) {
        await customerApi.removeFavourite(offerId);
      } else {
        await customerApi.saveFavourite(offerId);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const enquiryMutation = useMutation({
    mutationFn: () =>
      customerApi.createEnquiry({
        offerId: offerId ?? '',
        subject: enquirySubject.trim(),
        message: enquiryMessage.trim(),
        customerPhone: enquiryPhone.trim() || undefined,
      }),
    onSuccess: () => {
      setEnquirySuccess(
        'Your structured enquiry has been delivered to the advertiser. Track replies in your Customer Portal.',
      );
      setEnquiryMessage('');
      void queryClient.invalidateQueries({ queryKey: ['customer', 'enquiries'] });
    },
  });

  const viewingMutation = useMutation({
    mutationFn: () => {
      const isoProposed = new Date(viewingDateTime).toISOString();
      return customerApi.createViewingRequest({
        offerId: offerId ?? '',
        proposedAt: isoProposed,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos',
        viewingMode,
        customerNotes: viewingNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      setViewingSuccess(
        'Your viewing request has been submitted. You will be notified when the advertiser confirms or proposes a new slot.',
      );
      setViewingNotes('');
      void queryClient.invalidateQueries({ queryKey: ['customer', 'viewings'] });
    },
  });

  if (detailQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeletonGrid count={3} />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Search Results
        </Link>
        <ErrorStateBox
          title="Property offer unavailable"
          error={detailQuery.error}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    );
  }

  const offer = detailQuery.data;
  const advertiserPath =
    offer.advertiser.type === 'AGENCY'
      ? `/agencies/${offer.advertiser.id}`
      : `/realtors/${offer.advertiser.id}`;
  const loginRedirectPath = `/login?redirect=${encodeURIComponent(`/properties/${offer.id}`)}`;

  const openEnquiryDrawer = () => {
    setEnquirySuccess(null);
    if (!enquirySubject) {
      setEnquirySubject(`Enquiry: ${offer.title.slice(0, 120)}`);
    }
    if (!enquiryPhone && user?.phoneNumber) {
      setEnquiryPhone(user.phoneNumber);
    }
    setActiveAction((prev) => (prev === 'ENQUIRY' ? 'NONE' : 'ENQUIRY'));
  };

  const openViewingDrawer = () => {
    setViewingSuccess(null);
    setActiveAction((prev) => (prev === 'VIEWING' ? 'NONE' : 'VIEWING'));
  };

  const handleEnquirySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (enquirySubject.trim().length < 3 || enquiryMessage.trim().length < 10) {
      return;
    }
    enquiryMutation.mutate();
  };

  const handleViewingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!viewingDateTime) return;
    viewingMutation.mutate();
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: offer.title,
    description: offer.description,
    datePosted: offer.publishedAt ?? undefined,
    image: offer.coverImageUrl ?? undefined,
    offers: {
      '@type': 'Offer',
      price: offer.price,
      priceCurrency: offer.currency,
      availability:
        offer.availabilityStatus === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: offer.location.city,
      addressRegion: offer.location.state,
      addressCountry: 'NG',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <SeoHead
        title={`${offer.title} — ${offer.location.city}, ${offer.location.state}`}
        description={offer.description.slice(0, 155)}
        canonicalPath={`/properties/${offer.id}`}
        ogImage={offer.coverImageUrl}
        jsonLd={jsonLd}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/properties"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Marketplace Search
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-900">
            {formatTransactionLabel(offer.transactionType)}
          </span>
          <span className="px-3 py-1 rounded-full font-semibold bg-slate-200 text-slate-800">
            {offer.availabilityStatus.replace('_', ' ')}
          </span>
          {offer.featured && (
            <span className="px-3 py-1 rounded-full font-semibold bg-amber-300 text-slate-950">
              Featured Offer
            </span>
          )}
        </div>
      </div>

      {/* Header Title & Price */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{offer.title}</h1>
          <p className="mt-2 text-sm text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>
              {[offer.location.locality, offer.location.city, offer.location.state]
                .filter(Boolean)
                .join(', ')}
            </span>
          </p>
        </div>

        <div className="lg:text-right">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
            {formatMoney(offer.price, offer.currency, offer.billingPeriod)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Published {formatDate(offer.publishedAt)}
            {offer.availableFrom ? ` · Available from ${formatDate(offer.availableFrom)}` : ''}
          </p>
        </div>
      </header>

      {/* Media Gallery (Photos + Videos + Lightbox) */}
      <MediaGallery title={offer.title} media={offer.media} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Specifications */}
          <section
            aria-label="Key property specifications"
            className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div>
              <span className="text-xs text-slate-500 block">Property Type</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                {formatPropertyType(offer.propertyType)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Condition</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                {formatPropertyCondition(offer.propertyCondition)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Bedrooms / Baths</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <BedDouble className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  {offer.bedrooms ?? '—'}
                </span>
                <span>/</span>
                <span className="inline-flex items-center gap-1">
                  <Bath className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  {offer.bathrooms ?? '—'}
                </span>
                {offer.toilets !== null && (
                  <span className="text-xs text-slate-500">({offer.toilets} toilets)</span>
                )}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Area Size</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                <Maximize className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {offer.floorArea
                  ? `${offer.floorArea} ${offer.floorAreaUnit ?? 'SQM'}`
                  : offer.landArea
                    ? `${offer.landArea} ${offer.landAreaUnit ?? 'SQM'}`
                    : 'Not specified'}
              </span>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">Property &amp; Offer Description</h2>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {offer.description}
            </p>
          </section>

          {/* Commercial Terms Breakdown */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Transparent Commercial Breakdown</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <dt className="text-xs text-slate-500">Headline Offer Price</dt>
                <dd className="font-bold text-slate-900 mt-0.5">
                  {formatMoney(offer.price, offer.currency, offer.billingPeriod)}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <dt className="text-xs text-slate-500">Service Charge</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {offer.serviceCharge !== null
                    ? formatMoney(offer.serviceCharge, offer.currency)
                    : 'Not applicable / Not stated'}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <dt className="text-xs text-slate-500">Caution / Refundable Deposit</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {offer.cautionFee !== null
                    ? formatMoney(offer.cautionFee, offer.currency)
                    : 'Not applicable / Not stated'}
                </dd>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <dt className="text-xs text-slate-500">Agency / Commission Fee</dt>
                <dd className="font-semibold text-slate-900 mt-0.5">
                  {offer.agencyFeePercent !== null ? `${offer.agencyFeePercent}%` : 'Not stated'}
                </dd>
              </div>
            </dl>
          </section>

          {/* Amenities */}
          {offer.amenities.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Property Amenities &amp; Features</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {offer.amenities.map((am) => (
                  <li
                    key={am.id}
                    className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{am.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Sidebar: Advertiser + Verification + Engagement */}
        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Advertised By ({offer.advertiser.type})
              </span>
              <Link
                to={advertiserPath}
                className="mt-1 flex items-center gap-2 text-lg font-bold text-slate-900 hover:text-emerald-700 transition"
              >
                <span>{offer.advertiser.displayName}</span>
                {offer.advertiser.verified && (
                  <BadgeCheck
                    className="w-5 h-5 text-emerald-600 shrink-0"
                    aria-label="Advertiser verified"
                  />
                )}
              </Link>
              <Link
                to={advertiserPath}
                className="text-xs font-semibold text-emerald-700 hover:underline mt-0.5 inline-block"
              >
                View advertiser profile &amp; active offers →
              </Link>
            </div>

            {offer.advertiser.publicPhone && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <Phone className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  {offer.advertiser.publicPhone}
                </span>
                <a
                  href={`tel:${offer.advertiser.publicPhone}`}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Call
                </a>
              </div>
            )}

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={openEnquiryDrawer}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    Send Structured Enquiry
                  </button>

                  <button
                    type="button"
                    onClick={openViewingDrawer}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-sm font-semibold transition"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Request Property Viewing
                  </button>

                  <button
                    type="button"
                    disabled={toggleFavouriteMutation.isPending}
                    aria-pressed={isSaved}
                    onClick={() => toggleFavouriteMutation.mutate()}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition ${
                      isSaved
                        ? 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : 'text-rose-600'}`}
                      aria-hidden="true"
                    />
                    {isSaved ? 'Saved in Favourites' : 'Save to Favourites'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={loginRedirectPath}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    Sign In to Enquire
                  </Link>

                  <Link
                    to={loginRedirectPath}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-sm font-semibold transition"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    Sign In to Request Viewing
                  </Link>

                  <Link
                    to={loginRedirectPath}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                  >
                    <Heart className="w-4 h-4 text-rose-600" aria-hidden="true" />
                    Sign In to Save Favourite
                  </Link>
                </>
              )}
            </div>

            {/* Inline Enquiry Form */}
            {isAuthenticated && activeAction === 'ENQUIRY' && (
              <form
                onSubmit={handleEnquirySubmit}
                aria-label="Send structured enquiry form"
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Send Enquiry to Advertiser</h3>
                  <button
                    type="button"
                    onClick={() => setActiveAction('NONE')}
                    aria-label="Close enquiry form"
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {enquirySuccess ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <p>{enquirySuccess}</p>
                    <Link
                      to="/portal/enquiries"
                      className="inline-block font-semibold text-emerald-800 underline"
                    >
                      Open My Enquiries →
                    </Link>
                  </div>
                ) : (
                  <>
                    {enquiryMutation.isError && (
                      <p role="alert" className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg">
                        {enquiryMutation.error instanceof ApiClientError
                          ? enquiryMutation.error.message
                          : 'Could not submit enquiry.'}
                      </p>
                    )}

                    <div>
                      <label
                        htmlFor="enquiry-subject"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Subject
                      </label>
                      <input
                        id="enquiry-subject"
                        type="text"
                        required
                        minLength={3}
                        maxLength={200}
                        value={enquirySubject}
                        onChange={(e) => setEnquirySubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-phone"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Callback Phone (optional)
                      </label>
                      <input
                        id="enquiry-phone"
                        type="tel"
                        maxLength={32}
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="+2348012345678"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="enquiry-message"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Your Message (min 10 chars)
                      </label>
                      <textarea
                        id="enquiry-message"
                        required
                        minLength={10}
                        maxLength={3000}
                        rows={4}
                        value={enquiryMessage}
                        onChange={(e) => setEnquiryMessage(e.target.value)}
                        placeholder="Ask about availability, inspection schedule, payment terms, or legal documentation…"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={enquiryMutation.isPending}
                      className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-semibold"
                    >
                      {enquiryMutation.isPending ? 'Sending Enquiry…' : 'Submit Enquiry'}
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Inline Viewing Request Form */}
            {isAuthenticated && activeAction === 'VIEWING' && (
              <form
                onSubmit={handleViewingSubmit}
                aria-label="Request property viewing form"
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Schedule Property Viewing</h3>
                  <button
                    type="button"
                    onClick={() => setActiveAction('NONE')}
                    aria-label="Close viewing request form"
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {viewingSuccess ? (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                    <p>{viewingSuccess}</p>
                    <Link
                      to="/portal/viewings"
                      className="inline-block font-semibold text-emerald-800 underline"
                    >
                      Open My Viewing Requests →
                    </Link>
                  </div>
                ) : (
                  <>
                    {viewingMutation.isError && (
                      <p role="alert" className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg">
                        {viewingMutation.error instanceof ApiClientError
                          ? viewingMutation.error.message
                          : 'Could not submit viewing request.'}
                      </p>
                    )}

                    <div>
                      <label
                        htmlFor="viewing-datetime"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Preferred Date &amp; Time
                      </label>
                      <input
                        id="viewing-datetime"
                        type="datetime-local"
                        required
                        value={viewingDateTime}
                        onChange={(e) => setViewingDateTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="viewing-mode"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Viewing Mode
                      </label>
                      <select
                        id="viewing-mode"
                        value={viewingMode}
                        onChange={(e) => setViewingMode(e.target.value as ViewingMode)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="IN_PERSON">In-Person Physical Inspection</option>
                        <option value="VIRTUAL">Live Virtual Video Tour</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="viewing-notes"
                        className="block text-xs font-semibold text-slate-700 mb-1"
                      >
                        Notes for Advertiser (optional)
                      </label>
                      <textarea
                        id="viewing-notes"
                        rows={3}
                        maxLength={1500}
                        value={viewingNotes}
                        onChange={(e) => setViewingNotes(e.target.value)}
                        placeholder="Any preferred time window or questions ahead of the inspection…"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={viewingMutation.isPending}
                      className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-semibold"
                    >
                      {viewingMutation.isPending ? 'Submitting Request…' : 'Request Viewing Slot'}
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 text-center">
              <Link
                to={`/contact?offerId=${offer.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-700"
              >
                <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                Report suspicious listing or inaccurate details
              </Link>
            </div>
          </div>

          <VerificationPanel
            contactEmailVerified={offer.verification.contactEmailVerified}
            realtorIdentityVerified={offer.verification.realtorIdentityVerified}
            agencyCorporateVerified={offer.verification.agencyCorporateVerified}
            marketingAuthorizationVerified={offer.verification.marketingAuthorizationVerified}
            legalTitleVerified={offer.verification.legalTitleVerified}
            advertiserType={offer.advertiser.type}
          />
        </aside>
      </div>

      {/* Similar Properties */}
      {(similarQuery.data ?? []).length > 0 && (
        <section
          aria-labelledby="similar-properties-heading"
          className="pt-8 border-t border-slate-200 space-y-6"
        >
          <h2 id="similar-properties-heading" className="text-xl font-bold text-slate-900">
            Similar Published Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(similarQuery.data ?? []).map((sim) => (
              <PropertyCard key={sim.id} item={sim} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
