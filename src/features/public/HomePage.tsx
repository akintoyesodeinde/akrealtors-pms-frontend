import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PropertyType, TransactionType } from '../../api/contracts';
import { marketplaceApi } from '../../api/marketplaceApi';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
} from '../../components/ui/StateBoxes';
import { formatPropertyType } from '../../lib/formatters';

const HERO_PROPERTY_TYPES: PropertyType[] = [
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

export function HomePage() {
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState<TransactionType | ''>('');
  const [selectedState, setSelectedState] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [keyword, setKeyword] = useState('');

  const statesQuery = useQuery({
    queryKey: ['locations', 'states'],
    queryFn: () => marketplaceApi.getStates(),
    staleTime: 300_000,
  });

  const featuredQuery = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => marketplaceApi.getFeaturedProperties(6),
  });

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (transactionType) params.set('transactionType', transactionType);
    if (selectedState) params.set('state', selectedState);
    if (propertyType) params.set('propertyType', propertyType);
    if (keyword.trim()) params.set('q', keyword.trim());
    const qs = params.toString();
    navigate(qs ? `/properties?${qs}` : '/properties');
  };

  return (
    <div>
      <SeoHead
        title="Verified Multi-Realtor Property Marketplace in Nigeria"
        canonicalPath="/"
        description="Browse published residential and commercial property sales, rentals, and leases across Nigeria with transparent pricing and non-interchangeable verification badges."
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              Transparent Commercial Offers · Multi-Realtor Marketplace
            </span>
            <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Discover Verified Homes, Land &amp; Commercial Properties Across Nigeria
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Compare sales, long-term rentals, and commercial leases from independent realtors and
              registered agencies—with clear billing periods and explicit distinction between
              identity, mandate, and title verification.
            </p>
          </div>

          <form
            onSubmit={handleHeroSearch}
            aria-label="Search marketplace properties"
            className="mt-8 bg-white text-slate-900 rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200 max-w-5xl"
          >
            <div
              role="group"
              aria-label="Transaction type filter"
              className="flex flex-wrap gap-2 pb-4 border-b border-slate-100"
            >
              {(
                [
                  { value: '', label: 'All Offers' },
                  { value: 'SALE', label: 'Buy (For Sale)' },
                  { value: 'RENT', label: 'Rent' },
                  { value: 'LEASE', label: 'Commercial Lease' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setTransactionType(tab.value)}
                  aria-pressed={transactionType === tab.value}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition ${
                    transactionType === tab.value
                      ? 'bg-emerald-800 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label htmlFor="hero-state" className="block text-xs font-semibold text-slate-600 mb-1">
                  State
                </label>
                <div className="relative">
                  <MapPin
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <select
                    id="hero-state"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">All Nigerian States</option>
                    {(statesQuery.data ?? []).map((st) => (
                      <option key={st.code} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="hero-property-type"
                  className="block text-xs font-semibold text-slate-600 mb-1"
                >
                  Property Category
                </label>
                <select
                  id="hero-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType | '')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Any Property Type</option>
                  {HERO_PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {formatPropertyType(pt)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hero-keyword" className="block text-xs font-semibold text-slate-600 mb-1">
                  Locality or Keyword
                </label>
                <input
                  id="hero-keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Lekki, Maitama, 4 bedroom"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-xs transition"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                  Search Offers
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Published Listings */}
      <section
        aria-labelledby="featured-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 id="featured-heading" className="text-2xl font-bold text-slate-900">
              Featured &amp; Recently Published Offers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Live moderated offers currently active on the marketplace. Unpublished, expired, and
              suspended listings are automatically excluded.
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Explore all published offers
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {featuredQuery.isLoading ? (
          <LoadingSkeletonGrid count={6} />
        ) : featuredQuery.isError ? (
          <ErrorStateBox
            title="Could not load featured marketplace listings"
            error={featuredQuery.error}
            onRetry={() => void featuredQuery.refetch()}
          />
        ) : (featuredQuery.data ?? []).length === 0 ? (
          <EmptyStateBox
            title="No published property offers yet"
            description="Only moderator-approved, non-expired offers appear publicly. Register as a realtor to submit a listing or adjust your search filters."
            actionLabel="Browse Marketplace Search"
            onAction={() => navigate('/properties')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(featuredQuery.data ?? []).map((item) => (
              <PropertyCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Verification Transparency Explainer (Part 14) */}
      <section
        aria-labelledby="trust-tiers-heading"
        className="bg-white border-y border-slate-200 py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 id="trust-tiers-heading" className="text-2xl font-bold text-slate-900">
              Honest, Non-Interchangeable Verification Tiers
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              AkRealtors PMS never conflates an advertiser’s identity check with legal property
              ownership. Every listing displays each trust check independently so buyers and tenants
              know exactly what has been reviewed.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <BadgeCheck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900 text-sm">
                1. Realtor Identity Verification
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Confirms government-issued identification and professional profile details of the
                individual estate agent.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Building2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900 text-sm">
                2. Agency Corporate Registration
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Confirms CAC incorporation evidence and authorized principal representation for a
                real estate company.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <FileCheck2 className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900 text-sm">
                3. Marketing Mandate Evidence
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Confirms documentary authorization from the landlord, developer, or owner permitting
                the advertiser to market the property.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <Scale className="w-6 h-6 text-emerald-700" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900 text-sm">
                4. Independent Legal Title Check
              </h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Tracked separately from identity or mandate. Buyers and tenants should always
                complete independent legal due diligence before payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Audience CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              For Buyers &amp; Tenants
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Save Favourites, Compare Offers &amp; Schedule Viewings
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Create a customer account to bookmark properties, compare multiple realtors’ offers
              side-by-side, send structured enquiries, and request physical or virtual inspections.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition"
            >
              Create Customer Account
            </Link>
            <Link
              to="/properties"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Browse Properties
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              For Realtors, Agencies &amp; Developers
            </span>
            <h2 className="mt-2 text-xl font-bold">
              Publish Verified Listings &amp; Manage Client Enquiries
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Onboard as an independent realtor or form an agency with role-scoped staff
              permissions, direct cloud media uploads, moderation feedback, and viewing management.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/register?tab=realtor"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400 transition"
            >
              Register as a Realtor
            </Link>
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition"
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
