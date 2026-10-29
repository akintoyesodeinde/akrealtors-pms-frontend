import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicPropertySearchItem } from '../../api/contracts';
import {
  formatMoney,
  formatPropertyType,
  formatTransactionLabel,
} from '../../lib/formatters';

export function ListingCompareModal({
  items,
  onClose,
  onRemove,
}: {
  items: PublicPropertySearchItem[];
  onClose: () => void;
  onRemove: (offerId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare selected property offers"
      className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[88vh] overflow-auto shadow-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Side-by-Side Offer Comparison ({items.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison dialog"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 pr-4 font-semibold text-slate-500 w-44">Attribute</th>
                {items.map((item) => (
                  <th key={item.id} className="py-3 px-4 font-semibold text-slate-900 min-w-56">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/properties/${item.id}`}
                        onClick={onClose}
                        className="hover:text-emerald-700"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="text-xs text-rose-600 hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Commercial Price</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4 font-bold text-emerald-800">
                    {formatMoney(i.price, i.currency, i.billingPeriod)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Transaction Type</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4">
                    {formatTransactionLabel(i.transactionType)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Property Type</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4">
                    {formatPropertyType(i.propertyType)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Location</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4">
                    {[i.location.locality, i.location.city, i.location.state]
                      .filter(Boolean)
                      .join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Bedrooms / Bathrooms</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4">
                    {i.bedrooms ?? '—'} Beds / {i.bathrooms ?? '—'} Baths
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Advertiser</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4">
                    {i.advertiser.displayName}{' '}
                    <span className="text-xs text-slate-500">
                      ({i.advertiser.verified ? 'Verified' : 'Unverified'})
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-600">Mandate / Legal Title</td>
                {items.map((i) => (
                  <td key={i.id} className="py-3 px-4 text-xs">
                    Mandate: {i.verification.marketingAuthorizationVerified ? 'Yes' : 'No'} · Title:{' '}
                    {i.verification.legalTitleVerified ? 'Verified' : 'Unverified'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
