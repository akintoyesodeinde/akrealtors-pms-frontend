import { BadgeCheck, Bath, BedDouble, Building2, Heart, MapPin, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicPropertySearchItem } from '../../api/contracts';
import {
  formatMoney,
  formatPropertyType,
  formatTransactionLabel,
} from '../../lib/formatters';

interface PropertyCardProps {
  item: PublicPropertySearchItem;
  isCompared?: boolean;
  onToggleCompare?: (item: PublicPropertySearchItem) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (offerId: string) => void;
}

export function PropertyCard({
  item,
  isCompared = false,
  onToggleCompare,
  isFavourite = false,
  onToggleFavourite,
}: PropertyCardProps) {
  const advertiserProfilePath =
    item.advertiser.type === 'AGENCY'
      ? `/agencies/${item.advertiser.id}`
      : `/realtors/${item.advertiser.id}`;

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative h-52 bg-slate-100 overflow-hidden">
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/10 to-slate-200 text-slate-500">
            <Building2 className="w-10 h-10 text-emerald-800/40" aria-hidden="true" />
            <span className="text-xs font-medium mt-1.5">Photo pending</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/85 text-white backdrop-blur-xs">
            {formatTransactionLabel(item.transactionType)}
          </span>
          {item.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
              Featured
            </span>
          )}
        </div>

        {onToggleFavourite && (
          <button
            type="button"
            aria-label={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
            aria-pressed={isFavourite}
            onClick={() => onToggleFavourite(item.id)}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition"
          >
            <Heart
              className={`w-4 h-4 ${isFavourite ? 'fill-rose-600 text-rose-600' : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-emerald-800">
            {formatMoney(item.price, item.currency, item.billingPeriod)}
          </p>
          <span className="text-xs font-medium text-slate-500">
            {formatPropertyType(item.propertyType)}
          </span>
        </div>

        <h3 className="mt-1.5 text-base font-semibold text-slate-900 line-clamp-2">
          <Link to={`/properties/${item.id}`} className="hover:text-emerald-700 transition">
            {item.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-sm text-slate-600 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {[item.location.locality, item.location.city, item.location.state]
              .filter(Boolean)
              .join(', ')}
          </span>
          {item.location.distanceKm !== null && (
            <span className="text-xs text-emerald-700 font-medium shrink-0">
              ({item.location.distanceKm} km)
            </span>
          )}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
          {item.bedrooms !== null && (
            <span className="inline-flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-slate-400" aria-hidden="true" />
              {item.bedrooms} {item.bedrooms === 1 ? 'Bed' : 'Beds'}
            </span>
          )}
          {item.bathrooms !== null && (
            <span className="inline-flex items-center gap-1">
              <Bath className="w-4 h-4 text-slate-400" aria-hidden="true" />
              {item.bathrooms} {item.bathrooms === 1 ? 'Bath' : 'Baths'}
            </span>
          )}
          {item.verification.legalTitleVerified && (
            <span
              title="Independent legal title verified"
              className="inline-flex items-center gap-1 text-emerald-700 font-medium"
            >
              <Scale className="w-3.5 h-3.5" aria-hidden="true" />
              Title Verified
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <Link
            to={advertiserProfilePath}
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-medium truncate"
          >
            <span className="truncate">{item.advertiser.displayName}</span>
            {item.advertiser.verified && (
              <BadgeCheck
                className="w-4 h-4 text-emerald-600 shrink-0"
                aria-label={
                  item.advertiser.type === 'AGENCY'
                    ? 'Corporate registration verified'
                    : 'Realtor identity verified'
                }
              />
            )}
          </Link>

          {onToggleCompare && (
            <label className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer shrink-0 select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onToggleCompare(item)}
                className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
              />
              <span>Compare</span>
            </label>
          )}
        </div>
      </div>
    </article>
  );
}
