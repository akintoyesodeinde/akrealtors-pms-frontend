import type {
  BillingPeriod,
  PropertyCondition,
  PropertyType,
  TransactionType,
} from '../api/contracts';

export function formatMoney(
  amount: number | null | undefined,
  currency = 'NGN',
  billingPeriod?: BillingPeriod,
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Price on request';
  }
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'NGN';
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: safeCurrency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    formatted = `${safeCurrency} ${amount.toLocaleString('en-NG')}`;
  }

  if (!billingPeriod || billingPeriod === 'ONE_TIME') {
    return formatted;
  }
  const suffixMap: Record<BillingPeriod, string> = {
    ONE_TIME: '',
    MONTHLY: ' / month',
    QUARTERLY: ' / quarter',
    YEARLY: ' / year',
  };
  return `${formatted}${suffixMap[billingPeriod]}`;
}

export function formatTransactionLabel(type: TransactionType): string {
  switch (type) {
    case 'SALE':
      return 'For Sale';
    case 'RENT':
      return 'For Rent';
    case 'LEASE':
      return 'For Lease';
  }
}

export function formatPropertyType(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    APARTMENT: 'Apartment',
    DETACHED_DUPLEX: 'Detached Duplex',
    SEMI_DETACHED_DUPLEX: 'Semi-Detached Duplex',
    TERRACE_DUPLEX: 'Terrace Duplex',
    BUNGALOW: 'Bungalow',
    PENTHOUSE: 'Penthouse',
    STUDIO: 'Studio Apartment',
    COMMERCIAL_OFFICE: 'Commercial Office',
    RETAIL_SHOP: 'Retail Shop',
    WAREHOUSE: 'Warehouse',
    LAND: 'Land',
    SHORT_LET_APARTMENT: 'Serviced Short-Let',
  };
  return labels[type];
}

export function formatPropertyCondition(cond: PropertyCondition | null): string {
  if (!cond) return 'Standard';
  const labels: Record<PropertyCondition, string> = {
    NEWLY_BUILT: 'Newly Built',
    RENOVATED: 'Renovated',
    GOOD: 'Good Condition',
    OFF_PLAN: 'Off-Plan',
    NEEDS_RENOVATION: 'Needs Renovation',
    BARE_LAND: 'Bare Land',
  };
  return labels[cond];
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
