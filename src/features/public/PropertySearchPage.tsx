import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, RotateCcw, Scale, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  BillingPeriod,
  PropertySearchParams,
  PropertyType,
  PublicPropertySearchItem,
  TransactionType,
} from '../../api/contracts';
import { customerApi } from '../../api/customerApi';
import { marketplaceApi } from '../../api/marketplaceApi';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatPropertyType } from '../../lib/formatters';
import { useAuth } from '../auth/useAuth';
import { ListingCompareModal } from './ListingCompareModal';

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

const SORT_OPTIONS = [
  { value: 'publishedAt,desc', label: 'Newest Published' },
  { value: 'price,asc', label: 'Price: Low to High' },
  { value: 'price,desc', label: 'Price: High to Low' },
  { value: 'bedrooms,desc', label: 'Most Bedrooms' },
  { value: 'bathrooms,desc', label: 'Most Bathrooms' },
];

function parseOptionalNumber(raw: string | null): number | undefined {
  if (!raw || raw.trim() === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function PropertySearchPage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [comparedItems, setComparedItems] = useState<PublicPropertySearchItem[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const favouriteIdsQuery = useQuery({
    queryKey: ['favourites', 'ids'],
    queryFn: () => customerApi.listFavouriteIds(),
    enabled: isAuthenticated,
  });

  const favouriteSet = useMemo(
    () => new Set(favouriteIdsQuery.data ?? []),
    [favouriteIdsQuery.data],
  );

  const toggleFavouriteMutation = useMutation({
    mutationFn: async (offerId: string) => {
      if (favouriteSet.has(offerId)) {
        await customerApi.removeFavourite(offerId);
      } else {
        await customerApi.saveFavourite(offerId);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const criteria: PropertySearchParams = useMemo(() => {
    const tx = searchParams.get('transactionType') as TransactionType | null;
    const pt = searchParams.get('propertyType') as PropertyType | null;
    const bp = searchParams.get('billingPeriod') as BillingPeriod | null;
    const rawAmenities = searchParams.get('amenities');
    const amenities = rawAmenities
      ? rawAmenities
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    return {
      transactionType: tx && ['SALE', 'RENT', 'LEASE'].includes(tx) ? tx : undefined,
      state: searchParams.get('state') || undefined,
      city: searchParams.get('city') || undefined,
      propertyType: pt && PROPERTY_TYPES.includes(pt) ? pt : undefined,
      billingPeriod:
        bp && ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'].includes(bp) ? bp : undefined,
      minPrice: parseOptionalNumber(searchParams.get('minPrice')),
      maxPrice: parseOptionalNumber(searchParams.get('maxPrice')),
      minBedrooms: parseOptionalNumber(searchParams.get('minBedrooms')),
      minBathrooms: parseOptionalNumber(searchParams.get('minBathrooms')),
      amenities,
      q: searchParams.get('q') || undefined,
      latitude: parseOptionalNumber(searchParams.get('latitude')),
      longitude: parseOptionalNumber(searchParams.get('longitude')),
      radiusKm: parseOptionalNumber(searchParams.get('radiusKm')),
      page: parseOptionalNumber(searchParams.get('page')) ?? 0,
      size: 12,
      sort: searchParams.get('sort') || 'publishedAt,desc',
    };
  }, [searchParams]);

  const statesQuery = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: () => marketplaceApi.getStates(),
    staleTime: 300_000,
  });

  const citiesQuery = useQuery({
    queryKey: ['locations', 'cities', criteria.state ?? 'ALL'],
    queryFn: () => marketplaceApi.getCities(criteria.state),
    enabled: Boolean(criteria.state),
    staleTime: 300_000,
  });

  const amenitiesQuery = useQuery({
    queryKey: ['amenities'],
    queryFn: () => marketplaceApi.getAmenities(),
    staleTime: 300_000,
  });

  const searchQuery = useQuery({
    queryKey: ['properties', 'search', criteria],
    queryFn: () => marketplaceApi.searchProperties(criteria),
  });

  const updateParam = (updates: Record<string, string | null | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    }
    if (resetPage) {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleToggleAmenity = (code: string) => {
    const current = new Set(criteria.amenities ?? []);
    if (current.has(code)) {
      current.delete(code);
    } else {
      current.add(code);
    }
    const joined = Array.from(current).join(',');
    updateParam({ amenities: joined || null });
  };

  const handleCitySelect = (cityName: string) => {
    if (!cityName) {
      updateParam({ city: null, latitude: null, longitude: null, radiusKm: null });
      return;
    }
    const matched = (citiesQuery.data ?? []).find((c) => c.name === cityName);
    if (criteria.radiusKm && matched?.latitude != null && matched?.longitude != null) {
      updateParam({
        city: cityName,
        latitude: String(matched.latitude),
        longitude: String(matched.longitude),
      });
    } else {
      updateParam({ city: cityName });
    }
  };

  const handleRadiusChange = (rawRadius: string) => {
    if (!rawRadius) {
      updateParam({ radiusKm: null, latitude: null, longitude: null });
      return;
    }
    const matched = (citiesQuery.data ?? []).find((c) => c.name === criteria.city);
    if (matched?.latitude != null && matched?.longitude != null) {
      updateParam({
        city: null, // radius search spans across nearby localities around the city center
        latitude: String(matched.latitude),
        longitude: String(matched.longitude),
        radiusKm: rawRadius,
      });
    } else if (criteria.latitude != null && criteria.longitude != null) {
      updateParam({ radiusKm: rawRadius });
    }
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleToggleCompare = (item: PublicPropertySearchItem) => {
    setComparedItems((prev) => {
      if (prev.some((p) => p.id === item.id)) {
        return prev.filter((p) => p.id !== item.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), item];
      }
      return [...prev, item];
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SeoHead
        title="Search Properties for Sale, Rent & Lease"
        canonicalPath="/properties"
        description="Filter published Nigerian property offers by state, city, radius, transaction type, price range, bedrooms, and verified amenities."
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Property Offers</h1>
          <p className="text-sm text-slate-600 mt-1">
            {searchQuery.data
              ? `${searchQuery.data.totalElements} published ${
                  searchQuery.data.totalElements === 1 ? 'offer' : 'offers'
                } matching your criteria`
              : 'Loading published marketplace offers…'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFiltersMobile((v) => !v)}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {showFiltersMobile ? 'Hide Filters' : 'Filters'}
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-semibold text-slate-600">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={criteria.sort ?? 'publishedAt,desc'}
              onChange={(e) => updateParam({ sort: e.target.value }, false)}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <aside
          aria-label="Search filters"
          className={`bg-white rounded-2xl border border-slate-200 p-5 space-y-5 ${
            showFiltersMobile ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              Filter Offers
            </h2>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div>
            <label htmlFor="filter-q" className="block text-xs font-semibold text-slate-700 mb-1">
              Keyword / Locality
            </label>
            <input
              id="filter-q"
              type="search"
              value={criteria.q ?? ''}
              onChange={(e) => updateParam({ q: e.target.value })}
              placeholder="Search title, locality…"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="filter-transaction"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Transaction Type
            </label>
            <select
              id="filter-transaction"
              value={criteria.transactionType ?? ''}
              onChange={(e) => updateParam({ transactionType: e.target.value || null })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="">All Transactions</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
              <option value="LEASE">Commercial Lease</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-billing"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Billing Period
            </label>
            <select
              id="filter-billing"
              value={criteria.billingPeriod ?? ''}
              onChange={(e) => updateParam({ billingPeriod: e.target.value || null })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="">Any Billing Period</option>
              <option value="ONE_TIME">One-Time (Outright Sale)</option>
              <option value="YEARLY">Yearly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-state"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              State
            </label>
            <select
              id="filter-state"
              value={criteria.state ?? ''}
              onChange={(e) =>
                updateParam({
                  state: e.target.value || null,
                  city: null,
                  latitude: null,
                  longitude: null,
                  radiusKm: null,
                })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="">All States</option>
              {(statesQuery.data ?? []).map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {criteria.state && (
            <div>
              <label
                htmlFor="filter-city"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                City / Area
              </label>
              <select
                id="filter-city"
                value={criteria.city ?? ''}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="">All Cities in {criteria.state}</option>
                {(citiesQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(criteria.city || (criteria.latitude != null && criteria.longitude != null)) && (
            <div>
              <label
                htmlFor="filter-radius"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Proximity Radius
              </label>
              <select
                id="filter-radius"
                value={criteria.radiusKm ? String(criteria.radiusKm) : ''}
                onChange={(e) => handleRadiusChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="">Exact City Match</option>
                <option value="5">Within 5 km</option>
                <option value="15">Within 15 km</option>
                <option value="30">Within 30 km</option>
                <option value="50">Within 50 km</option>
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="filter-property-type"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Property Type
            </label>
            <select
              id="filter-property-type"
              value={criteria.propertyType ?? ''}
              onChange={(e) => updateParam({ propertyType: e.target.value || null })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
            >
              <option value="">All Property Types</option>
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {formatPropertyType(pt)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="filter-min-price"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Min Price (NGN)
              </label>
              <input
                id="filter-min-price"
                type="number"
                min={0}
                value={criteria.minPrice ?? ''}
                onChange={(e) => updateParam({ minPrice: e.target.value || null })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="filter-max-price"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Max Price (NGN)
              </label>
              <input
                id="filter-max-price"
                type="number"
                min={0}
                value={criteria.maxPrice ?? ''}
                onChange={(e) => updateParam({ maxPrice: e.target.value || null })}
                placeholder="Any"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="filter-beds"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Min Bedrooms
              </label>
              <select
                id="filter-beds"
                value={criteria.minBedrooms ?? ''}
                onChange={(e) => updateParam({ minBedrooms: e.target.value || null })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="filter-baths"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Min Bathrooms
              </label>
              <select
                id="filter-baths"
                value={criteria.minBathrooms ?? ''}
                onChange={(e) => updateParam({ minBathrooms: e.target.value || null })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}+
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(amenitiesQuery.data ?? []).length > 0 && (
            <fieldset>
              <legend className="text-xs font-semibold text-slate-700 mb-2">Amenities</legend>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {(amenitiesQuery.data ?? []).map((am) => {
                  const checked = (criteria.amenities ?? []).includes(am.code);
                  return (
                    <label
                      key={am.code}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleAmenity(am.code)}
                        className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{am.name}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </aside>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-6">
          {searchQuery.isLoading ? (
            <LoadingSkeletonGrid count={6} />
          ) : searchQuery.isError ? (
            <ErrorStateBox
              title="Search request failed"
              error={searchQuery.error}
              onRetry={() => void searchQuery.refetch()}
            />
          ) : (searchQuery.data?.content ?? []).length === 0 ? (
            <EmptyStateBox
              title="No matching published offers found"
              description="Try broadening your price range, clearing amenity filters, or selecting a wider location."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(searchQuery.data?.content ?? []).map((item) => (
                  <PropertyCard
                    key={item.id}
                    item={item}
                    isCompared={comparedItems.some((c) => c.id === item.id)}
                    onToggleCompare={handleToggleCompare}
                    isFavourite={favouriteSet.has(item.id)}
                    onToggleFavourite={
                      isAuthenticated
                        ? (offerId) => toggleFavouriteMutation.mutate(offerId)
                        : undefined
                    }
                  />
                ))}
              </div>

              {searchQuery.data && (
                <PaginationBar
                  page={searchQuery.data.page}
                  totalPages={searchQuery.data.totalPages}
                  totalElements={searchQuery.data.totalElements}
                  onPageChange={(nextPage) => updateParam({ page: String(nextPage) }, false)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Compare Bar */}
      {comparedItems.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 z-40 max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <Scale className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>
              <strong>{comparedItems.length}</strong> of 3 offers selected for comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setComparedItems([])}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setCompareModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {compareModalOpen && (
        <ListingCompareModal
          items={comparedItems}
          onClose={() => setCompareModalOpen(false)}
          onRemove={(offerId) =>
            setComparedItems((prev) => prev.filter((item) => item.id !== offerId))
          }
        />
      )}
    </div>
  );
}
