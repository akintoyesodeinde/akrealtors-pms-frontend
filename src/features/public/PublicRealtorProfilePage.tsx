import { useQuery } from '@tanstack/react-query';
import { Award, BadgeCheck, Briefcase, MapPin, Phone, ShieldAlert } from 'lucide-react';
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

export function PublicRealtorProfilePage() {
  const { realtorId } = useParams<{ realtorId: string }>();
  const [page, setPage] = useState(0);

  const profileQuery = useQuery({
    queryKey: ['realtor', 'public', realtorId],
    queryFn: () => marketplaceApi.getPublicRealtor(realtorId ?? ''),
    enabled: Boolean(realtorId),
  });

  const listingsQuery = useQuery({
    queryKey: ['properties', 'realtor', realtorId, page],
    queryFn: () =>
      marketplaceApi.searchProperties({
        realtorId,
        page,
        size: 9,
        sort: 'publishedAt,desc',
      }),
    enabled: Boolean(realtorId) && Boolean(profileQuery.data),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeletonGrid count={3} />
      </div>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorStateBox
          title="Realtor profile not found"
          error={profileQuery.error}
          onRetry={() => void profileQuery.refetch()}
        />
      </div>
    );
  }

  const realtor = profileQuery.data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SeoHead
        title={`${realtor.displayName} — Realtor Profile`}
        canonicalPath={`/realtors/${realtor.id}`}
        description={
          realtor.bio ??
          `View published property offers and verification details for ${realtor.displayName} on AkRealtors PMS.`
        }
      />

      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {realtor.displayName}
              </h1>
              {realtor.identityVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  Realtor Identity Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  Identity: {realtor.identityVerificationStatus}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {(realtor.officeCity || realtor.officeState) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  {[realtor.officeCity, realtor.officeState].filter(Boolean).join(', ')}
                </span>
              )}
              {realtor.yearsOfExperience !== null && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  {realtor.yearsOfExperience} yrs experience
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Award className="w-4 h-4 text-slate-400" aria-hidden="true" />
                Member since {formatDate(realtor.memberSince)}
              </span>
            </div>
          </div>

          {realtor.publicPhone && (
            <a
              href={`tel:${realtor.publicPhone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 shrink-0"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              {realtor.publicPhone}
            </a>
          )}
        </div>

        {realtor.bio && (
          <p className="text-sm text-slate-700 leading-relaxed max-w-4xl whitespace-pre-line">
            {realtor.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          {realtor.operatingStates.map((st) => (
            <span
              key={st}
              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-medium"
            >
              Operates in {st}
            </span>
          ))}
          {realtor.specializations && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium">
              {realtor.specializations}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-4 border-t border-slate-100">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>
            Realtor identity verification confirms personal identification only and does not imply
            marketing mandate or legal title verification on individual listings.
          </span>
        </p>
      </section>

      <section aria-labelledby="realtor-listings-heading" className="space-y-6">
        <h2 id="realtor-listings-heading" className="text-xl font-bold text-slate-900">
          Active Published Offers by {realtor.displayName}
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
            description="This realtor currently has no published property offers on the public marketplace."
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
