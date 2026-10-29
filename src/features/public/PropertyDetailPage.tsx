import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { marketplaceApi } from '../../api/marketplaceApi';
import { MediaGallery } from '../../components/ui/MediaGallery';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { SeoHead } from '../../components/ui/SeoHead';
import { ErrorStateBox, LoadingSkeletonGrid } from '../../components/ui/StateBoxes';
import { VerificationPanel } from '../../components/ui/VerificationBadges';
import { useAuth } from '../auth/useAuth';
import {
  formatDate,
  formatMoney,
  formatPropertyCondition,
  formatPropertyType,
  formatTransactionLabel,
} from '../../lib/formatters';

export function PropertyDetailPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const { isAuthenticated } = useAuth();

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
              <Link
                to={
                  isAuthenticated
                    ? `/portal?action=enquiry&offerId=${offer.id}`
                    : loginRedirectPath
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold transition"
              >
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                {isAuthenticated ? 'Send Structured Enquiry' : 'Sign In to Enquire'}
              </Link>

              <Link
                to={
                  isAuthenticated
                    ? `/portal?action=viewing&offerId=${offer.id}`
                    : loginRedirectPath
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-700 text-emerald-800 hover:bg-emerald-50 text-sm font-semibold transition"
              >
                <Calendar className="w-4 h-4" aria-hidden="true" />
                {isAuthenticated ? 'Request Property Viewing' : 'Sign In to Request Viewing'}
              </Link>

              <Link
                to={
                  isAuthenticated
                    ? `/portal?action=favourite&offerId=${offer.id}`
                    : loginRedirectPath
                }
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                <Heart className="w-4 h-4 text-rose-600" aria-hidden="true" />
                {isAuthenticated ? 'Save to Favourites' : 'Sign In to Save Favourite'}
              </Link>
            </div>

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
