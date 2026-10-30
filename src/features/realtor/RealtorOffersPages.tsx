import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FilePlus2,
  ImagePlus,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  Video,
} from 'lucide-react';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type {
  AvailabilityStatus,
  BillingPeriod,
  FloorAreaUnit,
  LandAreaUnit,
  OfferPublicationState,
  PropertyCondition,
  PropertyType,
  TransactionType,
} from '../../api/contracts';
import { marketplaceApi } from '../../api/marketplaceApi';
import { realtorApi } from '../../api/realtorApi';
import { ApiClientError } from '../../api/types';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import {
  formatDate,
  formatMoney,
  formatPropertyType,
  formatTransactionLabel,
} from '../../lib/formatters';
import { useRealtorScope } from './useRealtorScope';

const PROPERTY_TYPES: PropertyType[] = [
  'APARTMENT',
  'DETACHED_DUPLEX',
  'SEMI_DETACHED_DUPLEX',
  'TERRACE_DUPLEX',
  'BUNGALOW',
  'PENTHOUSE',
  'STUDIO',
  'COMMERCIAL_OFFICE',
  'RETAIL_SHOP',
  'WAREHOUSE',
  'LAND',
  'SHORT_LET_APARTMENT',
];

const PROPERTY_CONDITIONS: PropertyCondition[] = [
  'NEWLY_BUILT',
  'RENOVATED',
  'GOOD',
  'OFF_PLAN',
  'NEEDS_RENOVATION',
  'BARE_LAND',
];

const PUBLICATION_STATES: OfferPublicationState[] = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'SUSPENDED',
  'EXPIRED',
  'ARCHIVED',
];

export function RealtorOffersListPage() {
  const { selectedAgencyId } = useRealtorScope();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const stateParam = searchParams.get('state') as OfferPublicationState | null;
  const activeState =
    stateParam && PUBLICATION_STATES.includes(stateParam) ? stateParam : undefined;

  const offersQuery = useQuery({
    queryKey: ['realtor', 'offers', selectedAgencyId ?? 'PERSONAL', activeState ?? 'ALL', page],
    queryFn: () =>
      realtorApi.listManagedOffers({
        agencyId: selectedAgencyId,
        state: activeState,
        page,
        size: 15,
      }),
  });

  const submitMutation = useMutation({
    mutationFn: (offerId: string) => realtorApi.submitOffer(offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (offerId: string) => realtorApi.archiveOffer(offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  return (
    <div className="space-y-6">
      <SeoHead title="Manage Property Offers" canonicalPath="/realtor/offers" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Managed Property Offers</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Create commercial offers, upload verified media, and submit listings for moderation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="offer-state-filter" className="sr-only">
            Filter by publication state
          </label>
          <select
            id="offer-state-filter"
            value={activeState ?? ''}
            onChange={(e) => {
              setPage(0);
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('state', e.target.value);
              else next.delete('state');
              setSearchParams(next);
            }}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
          >
            <option value="">All Lifecycle States</option>
            {PUBLICATION_STATES.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>

          <Link
            to="/realtor/offers/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
          >
            <FilePlus2 className="w-4 h-4" aria-hidden="true" />
            New Property Offer
          </Link>
        </div>
      </div>

      {submitMutation.isError && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {submitMutation.error instanceof ApiClientError
            ? submitMutation.error.message
            : 'Unable to submit offer for moderation.'}
        </div>
      )}

      {offersQuery.isLoading ? (
        <LoadingSkeletonGrid count={3} />
      ) : offersQuery.isError ? (
        <ErrorStateBox
          title="Unable to load managed offers"
          error={offersQuery.error}
          onRetry={() => void offersQuery.refetch()}
        />
      ) : (offersQuery.data?.content ?? []).length === 0 ? (
        <EmptyStateBox
          title="No property offers in this view"
          description="Create your first physical property record and commercial offer to publish on the marketplace."
        />
      ) : (
        <div className="space-y-4">
          {(offersQuery.data?.content ?? []).map((offer) => {
            const canSubmit = ['DRAFT', 'REJECTED', 'EXPIRED'].includes(offer.publicationState);
            return (
              <article
                key={offer.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          offer.publicationState === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-900'
                            : offer.publicationState === 'PENDING_REVIEW'
                              ? 'bg-amber-100 text-amber-900'
                              : offer.publicationState === 'REJECTED' ||
                                  offer.publicationState === 'SUSPENDED'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {offer.publicationState.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {formatTransactionLabel(offer.transactionType)} ·{' '}
                        {formatPropertyType(offer.property.propertyType)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        {offer.viewCount} views
                      </span>
                    </div>

                    <Link
                      to={`/realtor/offers/${offer.id}`}
                      className="text-base font-bold text-slate-900 hover:text-emerald-700 block"
                    >
                      {offer.effectiveTitle}
                    </Link>

                    <p className="text-xs text-slate-600">
                      {[offer.property.locality, offer.property.city, offer.property.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-extrabold text-emerald-800">
                      {formatMoney(offer.price, offer.currency, offer.billingPeriod)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {offer.media.length} ready media · Updated {formatDate(offer.updatedAt)}
                    </p>
                  </div>
                </div>

                {offer.moderationReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong>Moderation Decision Note:</strong> {offer.moderationReason}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/realtor/offers/${offer.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                    >
                      Manage Offer &amp; Media
                    </Link>
                    {offer.publicationState === 'PUBLISHED' && (
                      <Link
                        to={`/properties/${offer.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View Public Listing →
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canSubmit && (
                      <button
                        type="button"
                        disabled={submitMutation.isPending}
                        onClick={() => submitMutation.mutate(offer.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        Submit for Moderation
                      </button>
                    )}
                    {offer.publicationState !== 'ARCHIVED' && (
                      <button
                        type="button"
                        disabled={archiveMutation.isPending}
                        onClick={() => archiveMutation.mutate(offer.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                      >
                        <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {offersQuery.data && (
            <PaginationBar
              page={offersQuery.data.page}
              totalPages={offersQuery.data.totalPages}
              totalElements={offersQuery.data.totalElements}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function RealtorCreateOfferWizardPage() {
  const { selectedAgencyId } = useRealtorScope();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [propertyMode, setPropertyMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [existingPropertyId, setExistingPropertyId] = useState('');

  // Physical Property Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('DETACHED_DUPLEX');
  const [propertyCondition, setPropertyCondition] = useState<PropertyCondition>('NEWLY_BUILT');
  const [bedrooms, setBedrooms] = useState('4');
  const [bathrooms, setBathrooms] = useState('4');
  const [toilets, setToilets] = useState('5');
  const [floorArea, setFloorArea] = useState('');
  const [floorAreaUnit, setFloorAreaUnit] = useState<FloorAreaUnit>('SQM');
  const [landArea, setLandArea] = useState('');
  const [landAreaUnit, setLandAreaUnit] = useState<LandAreaUnit>('SQM');
  const [stateName, setStateName] = useState('Lagos');
  const [cityName, setCityName] = useState('');
  const [locality, setLocality] = useState('');
  const [privateAddress, setPrivateAddress] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Commercial Offer Fields
  const [titleOverride, setTitleOverride] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('SALE');
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('ONE_TIME');
  const [price, setPrice] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');
  const [cautionFee, setCautionFee] = useState('');
  const [agencyFeePercent, setAgencyFeePercent] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('AVAILABLE');
  const [availableFrom, setAvailableFrom] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);

  const statesQuery = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: () => marketplaceApi.getStates(),
    staleTime: 300_000,
  });

  const citiesQuery = useQuery({
    queryKey: ['locations', 'cities', stateName],
    queryFn: () => marketplaceApi.getCities(stateName),
    enabled: Boolean(stateName),
    staleTime: 300_000,
  });

  const amenitiesQuery = useQuery({
    queryKey: ['amenities'],
    queryFn: () => marketplaceApi.getAmenities(),
    staleTime: 300_000,
  });

  const existingPropertiesQuery = useQuery({
    queryKey: ['realtor', 'properties', selectedAgencyId ?? 'PERSONAL'],
    queryFn: () => realtorApi.listManagedProperties(selectedAgencyId),
  });

  const createOfferMutation = useMutation({
    mutationFn: () => {
      const numericPrice = Number(price);
      return realtorApi.createOffer({
        agencyId: selectedAgencyId,
        propertyId: propertyMode === 'EXISTING' ? existingPropertyId : undefined,
        property:
          propertyMode === 'NEW'
            ? {
                agencyId: selectedAgencyId,
                title: title.trim(),
                description: description.trim(),
                propertyType,
                propertyCondition,
                bedrooms: bedrooms !== '' ? Number(bedrooms) : undefined,
                bathrooms: bathrooms !== '' ? Number(bathrooms) : undefined,
                toilets: toilets !== '' ? Number(toilets) : undefined,
                floorArea: floorArea !== '' ? Number(floorArea) : undefined,
                floorAreaUnit: floorArea !== '' ? floorAreaUnit : undefined,
                landArea: landArea !== '' ? Number(landArea) : undefined,
                landAreaUnit: landArea !== '' ? landAreaUnit : undefined,
                state: stateName,
                city: cityName.trim(),
                locality: locality.trim() || undefined,
                privateAddress: privateAddress.trim() || undefined,
                amenityCodes: selectedAmenities,
              }
            : undefined,
        titleOverride: titleOverride.trim() || undefined,
        transactionType,
        billingPeriod,
        price: numericPrice,
        currency: 'NGN',
        serviceCharge: serviceCharge !== '' ? Number(serviceCharge) : undefined,
        cautionFee: cautionFee !== '' ? Number(cautionFee) : undefined,
        agencyFeePercent: agencyFeePercent !== '' ? Number(agencyFeePercent) : undefined,
        availabilityStatus,
        availableFrom: availableFrom || undefined,
      });
    },
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
      navigate(`/realtor/offers/${created.id}`);
    },
  });

  const handleTransactionChange = (nextTx: TransactionType) => {
    setTransactionType(nextTx);
    if (nextTx === 'SALE') {
      setBillingPeriod('ONE_TIME');
    } else if (billingPeriod === 'ONE_TIME') {
      setBillingPeriod('YEARLY');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (propertyMode === 'NEW') {
      if (title.trim().length < 5) {
        setValidationError('Property title must be at least 5 characters.');
        return;
      }
      if (description.trim().length < 20) {
        setValidationError('Property description must be at least 20 characters.');
        return;
      }
      if (!stateName || !cityName.trim()) {
        setValidationError('Please select both state and city for the property.');
        return;
      }
    } else if (!existingPropertyId) {
      setValidationError('Please select an existing physical property record.');
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setValidationError('Headline offer price must be greater than zero.');
      return;
    }
    if (transactionType === 'SALE' && billingPeriod !== 'ONE_TIME') {
      setValidationError('Sale offers must use ONE_TIME billing period.');
      return;
    }
    if (transactionType !== 'SALE' && billingPeriod === 'ONE_TIME') {
      setValidationError('Rent and lease offers require a recurring billing period (e.g., YEARLY).');
      return;
    }

    createOfferMutation.mutate();
  };

  const toggleAmenity = (code: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SeoHead title="Create Property Offer" canonicalPath="/realtor/offers/new" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create Draft Property Offer</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Step 1: Define physical property &amp; commercial terms → Step 2: Upload photos/videos &amp;
            submit for moderation.
          </p>
        </div>
        <Link
          to="/realtor/offers"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Cancel
        </Link>
      </div>

      {(validationError || createOfferMutation.isError) && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {validationError ??
            (createOfferMutation.error instanceof ApiClientError
              ? createOfferMutation.error.message
              : 'Failed to create property offer.')}
        </div>
      )}

      {/* Physical Property Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">1. Physical Property Record</h3>
          {(existingPropertiesQuery.data ?? []).length > 0 && (
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPropertyMode('NEW')}
                className={`px-3 py-1 rounded-lg ${
                  propertyMode === 'NEW' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                New Physical Property
              </button>
              <button
                type="button"
                onClick={() => setPropertyMode('EXISTING')}
                className={`px-3 py-1 rounded-lg ${
                  propertyMode === 'EXISTING'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                Existing Catalogue Property
              </button>
            </div>
          )}
        </div>

        {propertyMode === 'EXISTING' ? (
          <div>
            <label htmlFor="existing-property-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Select Managed Property
            </label>
            <select
              id="existing-property-select"
              value={existingPropertyId}
              onChange={(e) => setExistingPropertyId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="">Choose property…</option>
              {(existingPropertiesQuery.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.city}, {p.state})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="prop-title" className="block text-xs font-semibold text-slate-700 mb-1">
                Property Title *
              </label>
              <input
                id="prop-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Contemporary 4 Bedroom Detached Duplex with BQ"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label htmlFor="prop-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Property Description (min 20 characters) *
              </label>
              <textarea
                id="prop-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe architecture, power/water infrastructure, road access, neighbourhood security, and title status…"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prop-type" className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Type *
                </label>
                <select
                  id="prop-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {formatPropertyType(pt)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="prop-condition" className="block text-xs font-semibold text-slate-700 mb-1">
                  Condition
                </label>
                <select
                  id="prop-condition"
                  value={propertyCondition}
                  onChange={(e) => setPropertyCondition(e.target.value as PropertyCondition)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  {PROPERTY_CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="prop-beds" className="block text-xs font-semibold text-slate-700 mb-1">
                  Bedrooms
                </label>
                <input
                  id="prop-beds"
                  type="number"
                  min={0}
                  max={50}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label htmlFor="prop-baths" className="block text-xs font-semibold text-slate-700 mb-1">
                  Bathrooms
                </label>
                <input
                  id="prop-baths"
                  type="number"
                  min={0}
                  max={50}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label htmlFor="prop-toilets" className="block text-xs font-semibold text-slate-700 mb-1">
                  Toilets
                </label>
                <input
                  id="prop-toilets"
                  type="number"
                  min={0}
                  max={60}
                  value={toilets}
                  onChange={(e) => setToilets(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="prop-floor-area" className="block text-xs font-semibold text-slate-700 mb-1">
                    Floor Area
                  </label>
                  <input
                    id="prop-floor-area"
                    type="number"
                    min={0}
                    step="0.01"
                    value={floorArea}
                    onChange={(e) => setFloorArea(e.target.value)}
                    placeholder="e.g. 320"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="w-28">
                  <label htmlFor="prop-floor-unit" className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="prop-floor-unit"
                    value={floorAreaUnit}
                    onChange={(e) => setFloorAreaUnit(e.target.value as FloorAreaUnit)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="SQM">SQM</option>
                    <option value="SQFT">SQFT</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="prop-land-area" className="block text-xs font-semibold text-slate-700 mb-1">
                    Land Area
                  </label>
                  <input
                    id="prop-land-area"
                    type="number"
                    min={0}
                    step="0.01"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    placeholder="e.g. 600"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div className="w-32">
                  <label htmlFor="prop-land-unit" className="block text-xs font-semibold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="prop-land-unit"
                    value={landAreaUnit}
                    onChange={(e) => setLandAreaUnit(e.target.value as LandAreaUnit)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="SQM">SQM</option>
                    <option value="PLOTS">PLOTS</option>
                    <option value="ACRES">ACRES</option>
                    <option value="HECTARES">HECTARES</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="prop-state" className="block text-xs font-semibold text-slate-700 mb-1">
                  State *
                </label>
                <select
                  id="prop-state"
                  value={stateName}
                  onChange={(e) => {
                    setStateName(e.target.value);
                    setCityName('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                >
                  {(statesQuery.data ?? [{ code: 'LA', name: 'Lagos' }]).map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="prop-city" className="block text-xs font-semibold text-slate-700 mb-1">
                  City / LGA *
                </label>
                {(citiesQuery.data ?? []).length > 0 ? (
                  <select
                    id="prop-city"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                  >
                    <option value="">Select city…</option>
                    {(citiesQuery.data ?? []).map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="prop-city"
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="e.g. Lekki"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                )}
              </div>
              <div>
                <label htmlFor="prop-locality" className="block text-xs font-semibold text-slate-700 mb-1">
                  Locality / Estate
                </label>
                <input
                  id="prop-locality"
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Lekki Phase 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prop-private-address" className="block text-xs font-semibold text-slate-700 mb-1">
                Confidential Street / Plot Number (Kept private from public search)
              </label>
              <input
                id="prop-private-address"
                type="text"
                value={privateAddress}
                onChange={(e) => setPrivateAddress(e.target.value)}
                placeholder="For moderation & title verification only — never exposed publicly"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            {(amenitiesQuery.data ?? []).length > 0 && (
              <fieldset>
                <legend className="text-xs font-semibold text-slate-700 mb-2">
                  Property Amenities
                </legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(amenitiesQuery.data ?? []).map((am) => (
                    <label
                      key={am.code}
                      className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(am.code)}
                        onChange={() => toggleAmenity(am.code)}
                        className="rounded border-slate-300 text-emerald-700"
                      />
                      <span>{am.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
        )}
      </section>

      {/* Commercial Terms Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">2. Commercial Offer Terms</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offer-tx" className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Type *
            </label>
            <select
              id="offer-tx"
              value={transactionType}
              onChange={(e) => handleTransactionChange(e.target.value as TransactionType)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="SALE">For Sale</option>
              <option value="RENT">Long-Term Rent</option>
              <option value="LEASE">Commercial Lease</option>
            </select>
          </div>

          <div>
            <label htmlFor="offer-billing" className="block text-xs font-semibold text-slate-700 mb-1">
              Billing Period *
            </label>
            <select
              id="offer-billing"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              {transactionType === 'SALE' ? (
                <option value="ONE_TIME">One-Time Outright Sale</option>
              ) : (
                <>
                  <option value="YEARLY">Yearly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="MONTHLY">Monthly</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="offer-price" className="block text-xs font-semibold text-slate-700 mb-1">
              Headline Price (NGN) *
            </label>
            <input
              id="offer-price"
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 185000000"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offer-service-charge" className="block text-xs font-semibold text-slate-700 mb-1">
              Service Charge (NGN)
            </label>
            <input
              id="offer-service-charge"
              type="number"
              min="0"
              step="0.01"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="offer-caution" className="block text-xs font-semibold text-slate-700 mb-1">
              Caution / Deposit (NGN)
            </label>
            <input
              id="offer-caution"
              type="number"
              min="0"
              step="0.01"
              value={cautionFee}
              onChange={(e) => setCautionFee(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="offer-agency-fee" className="block text-xs font-semibold text-slate-700 mb-1">
              Agency / Commission (%)
            </label>
            <input
              id="offer-agency-fee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={agencyFeePercent}
              onChange={(e) => setAgencyFeePercent(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="offer-availability" className="block text-xs font-semibold text-slate-700 mb-1">
              Availability
            </label>
            <select
              id="offer-availability"
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_OFFER">Under Offer</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          <div>
            <label htmlFor="offer-available-from" className="block text-xs font-semibold text-slate-700 mb-1">
              Available From
            </label>
            <input
              id="offer-available-from"
              type="date"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="offer-title-override" className="block text-xs font-semibold text-slate-700 mb-1">
              Marketing Headline Override
            </label>
            <input
              id="offer-title-override"
              type="text"
              value={titleOverride}
              onChange={(e) => setTitleOverride(e.target.value)}
              placeholder="Optional custom offer headline"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={createOfferMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-bold"
          >
            {createOfferMutation.isPending
              ? 'Creating Draft Offer…'
              : 'Save Draft & Continue to Media Upload →'}
          </button>
        </div>
      </section>
    </form>
  );
}

const ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
]);
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function RealtorOfferManagePage() {
  const { offerId } = useParams<{ offerId: string }>();
  const queryClient = useQueryClient();

  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  const [editPrice, setEditPrice] = useState('');
  const [editAvailability, setEditAvailability] = useState<AvailabilityStatus>('AVAILABLE');
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const offerQuery = useQuery({
    queryKey: ['realtor', 'offer', offerId],
    queryFn: async () => {
      const data = await realtorApi.getManagedOffer(offerId ?? '');
      setEditPrice(String(data.price));
      setEditAvailability(data.availabilityStatus);
      return data;
    },
    enabled: Boolean(offerId),
  });

  const mediaQuery = useQuery({
    queryKey: ['realtor', 'offer', offerId, 'media'],
    queryFn: () => realtorApi.listOfferMedia(offerId ?? ''),
    enabled: Boolean(offerId),
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadError(null);
      setLastFailedFile(file);
      return realtorApi.uploadOfferMediaFile(offerId ?? '', file, undefined, (stage) => {
        if (stage === 'INTENT') setUploadStage('Requesting presigned S3 upload ticket…');
        else if (stage === 'UPLOADING') setUploadStage('Uploading directly to S3 object storage…');
        else setUploadStage('Inspecting file header & generating thumbnail…');
      });
    },
    onSuccess: () => {
      setUploadStage(null);
      setLastFailedFile(null);
      void queryClient.invalidateQueries({ queryKey: ['realtor', 'offer', offerId] });
    },
    onError: (err) => {
      setUploadStage(null);
      setUploadError(
        err instanceof ApiClientError
          ? err.message
          : 'Media upload or binary verification failed.',
      );
    },
  });

  const selectCoverMutation = useMutation({
    mutationFn: (mediaId: string) => realtorApi.selectCoverMedia(offerId ?? '', mediaId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['realtor', 'offer', offerId] });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: string) => realtorApi.deleteOfferMedia(offerId ?? '', mediaId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['realtor', 'offer', offerId] });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: () =>
      realtorApi.updateOffer(offerId ?? '', {
        price: editPrice ? Number(editPrice) : undefined,
        availabilityStatus: editAvailability,
      }),
    onSuccess: (updated) => {
      setUpdateFeedback(
        updated.publicationState === 'PENDING_REVIEW'
          ? 'Commercial terms updated. Because headline terms changed on a published listing, the offer was moved to PENDING_REVIEW.'
          : 'Offer commercial terms saved.',
      );
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const submitOfferMutation = useMutation({
    mutationFn: () => realtorApi.submitOffer(offerId ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['realtor'] });
    },
  });

  const requestPropertyVerificationMutation = useMutation({
    mutationFn: (caseType: 'PROPERTY_AUTHORIZATION' | 'PROPERTY_LEGAL_TITLE') =>
      realtorApi.createVerificationCase({
        caseType,
        agencyId: offerQuery.data?.advertiserAgencyId ?? undefined,
        targetPropertyId: offerQuery.data?.propertyId,
        notes: `Verification requested for property ${offerQuery.data?.effectiveTitle ?? ''}`,
      }),
    onSuccess: (vc) => {
      setVerificationFeedback(
        `Created ${vc.caseType} case (${vc.status}). Upload supporting PDF/image evidence in Profile & Verification.`,
      );
    },
  });

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
      setUploadError(
        `Unsupported media format "${file.type || 'unknown'}". Allowed: JPEG, PNG, WEBP, MP4, WEBM.`,
      );
      return;
    }
    const maxBytes = file.type.startsWith('video/') ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      setUploadError(
        file.type.startsWith('video/')
          ? 'Video exceeds 100 MB maximum upload size.'
          : 'Image exceeds 15 MB maximum upload size.',
      );
      return;
    }
    uploadMediaMutation.mutate(file);
  };

  if (offerQuery.isLoading) {
    return <LoadingSkeletonGrid count={3} />;
  }

  if (offerQuery.isError || !offerQuery.data) {
    return (
      <ErrorStateBox
        title="Unable to load offer"
        error={offerQuery.error}
        onRetry={() => void offerQuery.refetch()}
      />
    );
  }

  const offer = offerQuery.data;
  const mediaList = mediaQuery.data ?? [];
  const canSubmit = ['DRAFT', 'REJECTED', 'EXPIRED'].includes(offer.publicationState);

  return (
    <div className="space-y-6">
      <SeoHead title={`Manage Offer — ${offer.effectiveTitle}`} canonicalPath={`/realtor/offers/${offer.id}`} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/realtor/offers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Managed Offers
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
            {offer.publicationState.replace('_', ' ')}
          </span>
          {canSubmit && (
            <button
              type="button"
              disabled={submitOfferMutation.isPending}
              onClick={() => submitOfferMutation.mutate()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
              {submitOfferMutation.isPending ? 'Submitting…' : 'Submit for Moderation Review'}
            </button>
          )}
        </div>
      </div>

      {submitOfferMutation.isError && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {submitOfferMutation.error instanceof ApiClientError
            ? submitOfferMutation.error.message
            : 'Submission failed.'}
        </div>
      )}

      {offer.moderationReason && (
        <div
          role="region"
          aria-label="Moderation feedback"
          className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1"
        >
          <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-700" aria-hidden="true" />
            Moderator Feedback ({offer.publicationState})
          </p>
          <p className="text-xs text-rose-900">{offer.moderationReason}</p>
        </div>
      )}

      {/* Summary & Commercial Quick Update */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{offer.effectiveTitle}</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {formatPropertyType(offer.property.propertyType)} · {offer.property.city},{' '}
              {offer.property.state}
            </p>
          </div>
          <p className="text-xl font-extrabold text-emerald-800">
            {formatMoney(offer.price, offer.currency, offer.billingPeriod)}
          </p>
        </div>

        {updateFeedback && (
          <p className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            {updateFeedback}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 items-end">
          <div>
            <label htmlFor="manage-price" className="block text-xs font-semibold text-slate-700 mb-1">
              Update Headline Price ({offer.currency})
            </label>
            <input
              id="manage-price"
              type="number"
              min="1"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label htmlFor="manage-availability" className="block text-xs font-semibold text-slate-700 mb-1">
              Availability Status
            </label>
            <select
              id="manage-availability"
              value={editAvailability}
              onChange={(e) => setEditAvailability(e.target.value as AvailabilityStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_OFFER">Under Offer</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          <button
            type="button"
            disabled={updateOfferMutation.isPending}
            onClick={() => updateOfferMutation.mutate()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            {updateOfferMutation.isPending ? 'Saving…' : 'Update Commercial Terms'}
          </button>
        </div>
      </section>

      {/* Direct Presigned S3 Photo & Video Uploader */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Property Photographs &amp; Walkthrough Videos
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Direct presigned S3 upload with binary header verification &amp; automatic thumbnail
              generation.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer">
            <ImagePlus className="w-4 h-4" aria-hidden="true" />
            <span>Upload Photo / Video</span>
            <input
              type="file"
              aria-label="Upload property photo or video"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              disabled={uploadMediaMutation.isPending}
              onChange={handleFileSelected}
              className="sr-only"
            />
          </label>
        </div>

        {uploadStage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900">
            {uploadStage}
          </div>
        )}

        {uploadError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-800"
          >
            <span>{uploadError}</span>
            {lastFailedFile && (
              <button
                type="button"
                onClick={() => uploadMediaMutation.mutate(lastFailedFile)}
                className="px-3 py-1 rounded-lg bg-rose-700 text-white font-semibold hover:bg-rose-800"
              >
                Retry Upload
              </button>
            )}
          </div>
        )}

        {mediaList.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No media uploaded yet. Upload at least one verified photograph before submitting for
            moderation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mediaList.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col"
              >
                <div className="relative h-40 bg-slate-200 flex items-center justify-center">
                  {m.mediaKind === 'IMAGE' && (m.thumbnailUrl || m.url) ? (
                    <img
                      src={m.thumbnailUrl ?? m.url ?? ''}
                      alt={m.originalFilename}
                      className="w-full h-full object-cover"
                    />
                  ) : m.mediaKind === 'VIDEO' ? (
                    <div className="flex flex-col items-center text-slate-600">
                      <Video className="w-8 h-8" aria-hidden="true" />
                      <span className="text-xs font-semibold mt-1">Video Walkthrough</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">{m.processingState}</span>
                  )}

                  {m.cover && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-slate-950" aria-hidden="true" />
                      Cover Photo
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-semibold">
                    {m.processingState}
                  </span>
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800 truncate">{m.originalFilename}</p>
                    {m.failureReason && (
                      <p className="text-rose-700 text-[11px] mt-0.5">{m.failureReason}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                    {m.mediaKind === 'IMAGE' && m.processingState === 'READY' && !m.cover ? (
                      <button
                        type="button"
                        onClick={() => selectCoverMutation.mutate(m.id)}
                        className="font-semibold text-emerald-700 hover:underline"
                      >
                        Set as Cover
                      </button>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={() => deleteMediaMutation.mutate(m.id)}
                      className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Property-Level Verification Badges & Case Requests */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          Property Mandate &amp; Legal Title Verification
        </h3>
        <p className="text-xs text-slate-600">
          Marketing mandate verification and legal title verification are independent tiers from
          realtor identity.
        </p>

        {verificationFeedback && (
          <p className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            {verificationFeedback}{' '}
            <Link to="/realtor/profile" className="font-bold underline">
              Upload Evidence →
            </Link>
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          {offer.property.marketingAuthorizationVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Marketing Authorization Verified
            </span>
          ) : (
            <button
              type="button"
              disabled={requestPropertyVerificationMutation.isPending}
              onClick={() =>
                requestPropertyVerificationMutation.mutate('PROPERTY_AUTHORIZATION')
              }
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800"
            >
              Request Marketing Mandate Verification
            </button>
          )}

          {offer.property.legalTitleVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Legal Title Verified
            </span>
          ) : (
            <button
              type="button"
              disabled={requestPropertyVerificationMutation.isPending}
              onClick={() => requestPropertyVerificationMutation.mutate('PROPERTY_LEGAL_TITLE')}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800"
            >
              Request Legal Title Verification (C of O / Deed)
            </button>
          )}
        </div>
      </section>

      {/* Audit Status History */}
      {offer.statusHistory.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Publication Lifecycle History</h3>
          <ul className="divide-y divide-slate-100 text-xs">
            {offer.statusHistory.map((h) => (
              <li key={h.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong>{h.fromState ?? 'NEW'}</strong> → <strong>{h.toState}</strong>
                  {h.reason ? ` — ${h.reason}` : ''}
                </span>
                <span className="text-slate-400">{formatDate(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
