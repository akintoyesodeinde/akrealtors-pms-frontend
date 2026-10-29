import { useQuery } from '@tanstack/react-query';
import { Building2, Globe, Mail, MapPin, Phone, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { marketplaceApi } from '../../api/marketplaceApi';
import { PropertyCard } from '../../components/ui/PropertyCard';
import { SeoHead } from '../../components/ui/SeoHead';
import {
  EmptyStateBox,
  ErrorStateBox,
  LoadingSkeletonGrid,
  PaginationBar,
} from '../../components/ui/StateBoxes';
import { formatDate } from '../../lib/formatters';

export function PublicAgencyProfilePage() {
  const { agencyId } = useParams<{ agencyId: string }>();
  const [page, setPage] = useState(0);

  const agencyQuery = useQuery({
    queryKey: ['agency', 'public', agencyId],
    queryFn: () => marketplaceApi.getPublicAgency(agencyId ?? ''),
    enabled: Boolean(agencyId),
  });

  const listingsQuery = useQuery({
    queryKey: ['properties', 'agency', agencyId, page],
    queryFn: () =>
      marketplaceApi.searchProperties({
        agencyId,
        page,
        size: 9,
        sort: 'publishedAt,desc',
      }),
    enabled: Boolean(agencyId) && Boolean(agencyQuery.data),
  });

  if (agencyQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeletonGrid count={3} />
      </div>
    );
  }

  if (agencyQuery.isError || !agencyQuery.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorStateBox
          title="Agency profile not found"
          error={agencyQuery.error}
          onRetry={() => void agencyQuery.refetch()}
        />
      </div>
    );
  }

  const agency = agencyQuery.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SeoHead
        title={`${agency.name} — Real Estate Agency`}
        canonicalPath={`/agencies/${agency.id}`}
        description={
          agency.description ??
          `Explore published property offers and corporate verification status for ${agency.name} on AkRealtors PMS.`
        }
      />

      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{agency.name}</h1>
              {agency.corporateVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
                  <Building2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  Corporate Registration Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Corporate Status: {agency.verificationStatus}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {agency.city}, {agency.state}
              </span>
              <span>On platform since {formatDate(agency.establishedOnPlatformAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {agency.phoneNumber && (
              <a
                href={`tel:${agency.phoneNumber}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                {agency.phoneNumber}
              </a>
            )}
            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                Email Agency
              </a>
            )}
            {agency.websiteUrl && (
              <a
                href={agency.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                Website
              </a>
            )}
          </div>
        </div>

        {agency.description && (
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
            {agency.description}
          </p>
        )}

        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-4 border-t border-slate-100">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>
            Agency corporate verification confirms company incorporation documents only. Check each
            property offer for individual marketing mandate and legal title status.
          </span>
        </p>
      </section>

      <section aria-labelledby="agency-listings-heading" className="space-y-6">
        <h2 id="agency-listings-heading" className="text-xl font-bold text-slate-900">
          Published Offers by {agency.name}
        </h2>

        {listingsQuery.isLoading ? (
          <LoadingSkeletonGrid count={3} />
        ) : listingsQuery.isError ? (
          <ErrorStateBox
            error={listingsQuery.error}
            onRetry={() => void listingsQuery.refetch()}
          />
        ) : (listingsQuery.data?.content ?? []).length === 0 ? (
          <EmptyStateBox
            title="No active published offers"
            description="This agency currently has no published property offers on the marketplace."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(listingsQuery.data?.content ?? []).map((item) => (
                <PropertyCard key={item.id} item={item} />
              ))}
            </div>
            {listingsQuery.data && (
              <PaginationBar
                page={listingsQuery.data.page}
                totalPages={listingsQuery.data.totalPages}
                totalElements={listingsQuery.data.totalElements}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
