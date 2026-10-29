export type RoleCode =
  | 'CUSTOMER'
  | 'REALTOR'
  | 'AGENCY_ADMIN'
  | 'MODERATOR'
  | 'PLATFORM_ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export type VerificationTierStatus =
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REVOKED';

export type RealtorOnboardingStatus = 'INCOMPLETE' | 'COMPLETED' | 'SUSPENDED';

export type TransactionType = 'SALE' | 'RENT' | 'LEASE';

export type BillingPeriod = 'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type AvailabilityStatus = 'AVAILABLE' | 'UNDER_OFFER' | 'UNAVAILABLE';

export type OfferPublicationState =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'ARCHIVED';

export type PropertyType =
  | 'APARTMENT'
  | 'DETACHED_DUPLEX'
  | 'SEMI_DETACHED_DUPLEX'
  | 'TERRACE_DUPLEX'
  | 'BUNGALOW'
  | 'PENTHOUSE'
  | 'STUDIO'
  | 'COMMERCIAL_OFFICE'
  | 'RETAIL_SHOP'
  | 'WAREHOUSE'
  | 'LAND'
  | 'SHORT_LET_APARTMENT';

export type PropertyCondition =
  | 'NEWLY_BUILT'
  | 'RENOVATED'
  | 'GOOD'
  | 'OFF_PLAN'
  | 'NEEDS_RENOVATION'
  | 'BARE_LAND';

export type FloorAreaUnit = 'SQM' | 'SQFT';
export type LandAreaUnit = 'SQM' | 'PLOTS' | 'ACRES' | 'HECTARES';
export type MediaKind = 'IMAGE' | 'VIDEO';
export type MediaProcessingState =
  | 'PENDING_UPLOAD'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export interface UserProfileResponse {
  id: string;
  email: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: RoleCode[];
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserProfileResponse;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RegisterRealtorRequest extends RegisterRequest {
  displayName: string;
  licenseNumber?: string;
  bio?: string;
  yearsOfExperience?: number;
  operatingStates?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StateResponse {
  code: string;
  name: string;
}

export interface CityResponse {
  id: string;
  stateName: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

export interface AmenityResponse {
  id: string;
  code: string;
  name: string;
  category: string;
  active: boolean;
}

export interface PublicMediaItem {
  id: string;
  mediaKind: MediaKind;
  processingState: MediaProcessingState;
  url: string | null;
  thumbnailUrl: string | null;
  contentType: string;
  fileSizeBytes: number | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sortOrder: number;
  cover: boolean;
  createdAt: string;
}

export interface PublicPropertySearchItem {
  id: string;
  title: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  location: {
    state: string;
    city: string;
    locality: string | null;
    distanceKm: number | null;
  };
  bedrooms: number | null;
  bathrooms: number | null;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  coverImageUrl: string | null;
  publishedAt: string | null;
  advertiser: {
    id: string;
    type: 'REALTOR' | 'AGENCY';
    displayName: string;
    slug: string;
    verified: boolean;
    verificationScope: 'REALTOR_IDENTITY' | 'AGENCY_CORPORATE';
  };
  verification: {
    advertiserVerified: boolean;
    marketingAuthorizationVerified: boolean;
    legalTitleVerified: boolean;
  };
}

export interface PropertyDetailResponse {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  propertyCondition: PropertyCondition | null;
  transactionType: TransactionType;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  serviceCharge: number | null;
  cautionFee: number | null;
  agencyFeePercent: number | null;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string | null;
  featured: boolean;
  coverImageUrl: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  floorArea: number | null;
  floorAreaUnit: FloorAreaUnit | null;
  landArea: number | null;
  landAreaUnit: LandAreaUnit | null;
  location: {
    state: string;
    city: string;
    locality: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  amenities: AmenityResponse[];
  media: PublicMediaItem[];
  advertiser: {
    id: string;
    type: 'REALTOR' | 'AGENCY';
    displayName: string;
    slug: string;
    publicPhone: string | null;
    whatsappNumber: string | null;
    verified: boolean;
    verificationScope: 'REALTOR_IDENTITY' | 'AGENCY_CORPORATE';
  };
  verification: {
    contactEmailVerified: boolean;
    realtorIdentityVerified: boolean;
    agencyCorporateVerified: boolean;
    marketingAuthorizationVerified: boolean;
    legalTitleVerified: boolean;
  };
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface PublicRealtorProfileResponse {
  id: string;
  displayName: string;
  slug: string;
  bio: string | null;
  yearsOfExperience: number | null;
  specializations: string | null;
  operatingStates: string[];
  officeState: string | null;
  officeCity: string | null;
  publicPhone: string | null;
  whatsappNumber: string | null;
  identityVerified: boolean;
  identityVerificationStatus: VerificationTierStatus;
  contactEmailVerified: boolean;
  verifiedAt: string | null;
  memberSince: string;
}

export interface PublicAgencyResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  state: string;
  city: string;
  corporateVerified: boolean;
  verificationStatus: VerificationTierStatus;
  verifiedAt: string | null;
  establishedOnPlatformAt: string;
}

export interface PropertySearchParams {
  transactionType?: TransactionType;
  state?: string;
  city?: string;
  locality?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  bedrooms?: number;
  minBedrooms?: number;
  bathrooms?: number;
  minBathrooms?: number;
  amenities?: string[];
  availabilityStatus?: AvailabilityStatus;
  q?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  realtorId?: string;
  agencyId?: string;
  page?: number;
  size?: number;
  sort?: string;
}
