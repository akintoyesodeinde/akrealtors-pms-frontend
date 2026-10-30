import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Bath, BedDouble, Building2, Heart, MapPin, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../../api/customerApi';
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
import { useAuth } from '../auth/useAuth';

export function PortalOverviewPage() {
  const { hasRole } = useAuth();

  const favouritesQuery = useQuery({
    queryKey: ['favourites', 'list', 0],
    queryFn: () => customerApi.listFavourites(0, 4),
  });
  const enquiriesQuery = useQuery({
    queryKey: ['customer', 'enquiries', 0],
    queryFn: () => customerApi.listMyEnquiries(0, 4),
  });
  const viewingsQuery = useQuery({
    queryKey: ['customer', 'viewings', 0],
    queryFn: () => customerApi.listMyViewingRequests(0, 4),
  });
  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => customerApi.getUnreadNotificationCount(),
  });

  const stats = [
    {
      label: 'Saved Favourites',
      value: favouritesQuery.data?.totalElements ?? 0,
      to: '/portal/favourites',
    },
    {
      label: 'Submitted Enquiries',
      value: enquiriesQuery.data?.totalElements ?? 0,
      to: '/portal/enquiries',
    },
    {
      label: 'Viewing Requests',
      value: viewingsQuery.data?.totalElements ?? 0,
      to: '/portal/viewings',
    },
    {
      label: 'Unread Notifications',
      value: unreadQuery.data?.unreadCount ?? 0,
      to: '/portal/notifications',
    },
  ];

  return (
    <div className="space-y-6">
      <SeoHead title="Customer Portal Overview" canonicalPath="/portal" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-400 transition"
          >
            <span className="text-xs font-medium text-slate-500 block">{stat.label}</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{stat.value}</span>
          </Link>
        ))}
      </div>

      {hasRole('REALTOR', 'AGENCY_ADMIN') && (
        <div className="bg-emerald-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Advertiser &amp; Agency Workspace</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Manage property listings, upload photos/videos, submit verification cases, and reply
              to customer enquiries.
            </p>
          </div>
          <Link
            to="/realtor"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 text-xs font-bold hover:bg-emerald-50 shrink-0"
          >
            Open Realtor Workspace
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Enquiries</h2>
          <Link
            to="/portal/enquiries"
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            View all →
          </Link>
        </div>

        {(enquiriesQuery.data?.content ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">
            You have not sent any enquiries yet. Browse{' '}
            <Link to="/properties" className="text-emerald-700 font-semibold underline">
              published properties
            </Link>{' '}
            to contact verified advertisers.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(enquiriesQuery.data?.content ?? []).map((enq) => (
              <li key={enq.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <Link
                    to={`/properties/${enq.offerId}`}
                    className="font-semibold text-slate-900 hover:text-emerald-700 truncate block"
                  >
                    {enq.offerTitle}
                  </Link>
                  <p className="text-xs text-slate-500 truncate">
                    {enq.subject} · {enq.advertiserName}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 shrink-0">
                  {enq.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function PortalFavouritesPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const favouritesQuery = useQuery({
    queryKey: ['favourites', 'list', page],
    queryFn: () => customerApi.listFavourites(page, 12),
  });

  const removeMutation = useMutation({
    mutationFn: (offerId: string) => customerApi.removeFavourite(offerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  return (
    <div className="space-y-6">
      <SeoHead title="Saved Favourites" canonicalPath="/portal/favourites" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" aria-hidden="true" />
            Saved Property Offers
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Track price, availability, and publication status across your shortlisted properties.
          </p>
        </div>
      </div>

      {favouritesQuery.isLoading ? (
        <LoadingSkeletonGrid count={4} />
      ) : favouritesQuery.isError ? (
        <ErrorStateBox
          title="Unable to load saved favourites"
          error={favouritesQuery.error}
          onRetry={() => void favouritesQuery.refetch()}
        />
      ) : (favouritesQuery.data?.content ?? []).length === 0 ? (
        <EmptyStateBox
          title="No saved favourites yet"
          description="Save published offers while browsing the marketplace to compare and revisit them anytime."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(favouritesQuery.data?.content ?? []).map((fav) => (
              <article
                key={fav.favouriteId}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="relative h-44 bg-slate-100">
                  {fav.coverImageUrl ? (
                    <img
                      src={fav.coverImageUrl}
                      alt={fav.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-8 h-8" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/85 text-white">
                      {formatTransactionLabel(fav.transactionType)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-slate-800">
                      {fav.availabilityStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-bold text-emerald-800">
                      {formatMoney(fav.price, fav.currency, fav.billingPeriod)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatPropertyType(fav.propertyType)}
                    </span>
                  </div>

                  <Link
                    to={`/properties/${fav.offerId}`}
                    className="text-base font-semibold text-slate-900 hover:text-emerald-700 line-clamp-2"
                  >
                    {fav.title}
                  </Link>

                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    {[fav.locality, fav.city, fav.state].filter(Boolean).join(', ')}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    {fav.bedrooms !== null && (
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                        {fav.bedrooms} Beds
                      </span>
                    )}
                    {fav.bathrooms !== null && (
                      <span className="inline-flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        {fav.bathrooms} Baths
                      </span>
                    )}
                    <span className="text-slate-400">Saved {formatDate(fav.savedAt)}</span>
                  </div>

                  <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate">
                      {fav.advertiserName}
                    </span>
                    <button
                      type="button"
                      disabled={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(fav.offerId)}
                      className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-800 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {favouritesQuery.data && (
            <PaginationBar
              page={favouritesQuery.data.page}
              totalPages={favouritesQuery.data.totalPages}
              totalElements={favouritesQuery.data.totalElements}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
