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

// --- Phase 7: Customer Engagement & Notifications ---

export type EnquiryStatus = 'OPEN' | 'IN_PROGRESS' | 'RESPONDED' | 'CLOSED';
export type ViewingMode = 'IN_PERSON' | 'VIRTUAL';
export type ViewingRequestStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED';

export type NotificationCategory =
  | 'ACCOUNT'
  | 'ENQUIRY'
  | 'VIEWING'
  | 'MODERATION'
  | 'VERIFICATION'
  | 'AGENCY'
  | 'SYSTEM';

export interface FavouriteOfferResponse {
  favouriteId: string;
  offerId: string;
  title: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  state: string;
  city: string;
  locality: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  availabilityStatus: AvailabilityStatus;
  publicationState: OfferPublicationState;
  coverImageUrl: string | null;
  advertiserName: string;
  savedAt: string;
}

export interface CreateEnquiryRequest {
  offerId: string;
  subject: string;
  message: string;
  customerPhone?: string;
}

export interface CustomerEnquiryResponse {
  id: string;
  offerId: string;
  offerTitle: string;
  advertiserType: 'REALTOR' | 'AGENCY';
  advertiserId: string;
  advertiserName: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  realtorReply: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RealtorEnquiryResponse {
  id: string;
  offerId: string;
  offerTitle: string;
  targetAgencyId: string | null;
  targetRealtorId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string;
  message: string;
  status: EnquiryStatus;
  realtorReply: string | null;
  internalNotes: string | null;
  respondedByUserId: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRealtorEnquiryRequest {
  status?: EnquiryStatus;
  realtorReply?: string;
  internalNotes?: string;
}

export interface CreateViewingRequestDto {
  offerId: string;
  proposedAt: string;
  timezone?: string;
  viewingMode?: ViewingMode;
  customerNotes?: string;
}

export interface CustomerUpdateViewingRequestDto {
  action: 'CANCEL' | 'RESCHEDULE';
  proposedAt?: string;
  customerNotes?: string;
}

export interface RealtorUpdateViewingRequestDto {
  status: 'CONFIRMED' | 'RESCHEDULED' | 'DECLINED';
  rescheduledAt?: string;
  realtorResponse?: string;
  meetingInstructions?: string;
}

export interface ViewingRequestResponse {
  id: string;
  offerId: string;
  offerTitle: string;
  advertiserType: 'REALTOR' | 'AGENCY';
  advertiserId: string;
  advertiserName: string;
  customerUserId: string;
  customerName: string;
  customerEmail: string;
  proposedAt: string;
  timezone: string;
  viewingMode: ViewingMode;
  customerNotes: string | null;
  status: ViewingRequestStatus;
  rescheduledAt: string | null;
  realtorResponse: string | null;
  meetingInstructions: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionPath: string | null;
  referenceType: string | null;
  referenceId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

// --- Phase 7: Realtor, Agency, Verification, Catalogue, Offer & Media Workspace ---

export interface RealtorProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  licenseNumber: string | null;
  bio: string | null;
  yearsOfExperience: number | null;
  specializations: string | null;
  operatingStates: string[];
  officeState: string | null;
  officeCity: string | null;
  publicPhone: string | null;
  whatsappNumber: string | null;
  onboardingStatus: RealtorOnboardingStatus;
  identityVerificationStatus: VerificationTierStatus;
  contactEmailVerified: boolean;
  contactPhoneVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertRealtorProfileRequest {
  displayName: string;
  licenseNumber?: string;
  bio?: string;
  yearsOfExperience?: number;
  specializations?: string;
  operatingStates?: string[];
  officeState?: string;
  officeCity?: string;
  publicPhone?: string;
  whatsappNumber?: string;
}

export type AgencyStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type AgencyMembershipRole = 'OWNER' | 'ADMIN' | 'AGENT';
export type AgencyMembershipStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface AgencyResponse {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  rcNumber: string | null;
  description: string | null;
  email: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  state: string;
  city: string;
  addressLine: string | null;
  status: AgencyStatus;
  verificationStatus: VerificationTierStatus;
  corporateVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgencyRequest {
  name: string;
  rcNumber?: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  state: string;
  city: string;
  addressLine?: string;
}

export interface UpdateAgencyRequest {
  name?: string;
  rcNumber?: string;
  description?: string;
  email?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  state?: string;
  city?: string;
  addressLine?: string;
}

export interface AgencyMembershipResponse {
  id: string;
  agencyId: string;
  agencyName: string;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  role: AgencyMembershipRole;
  status: AgencyMembershipStatus;
  canManageOffers: boolean;
  canManageEnquiries: boolean;
  invitedAt: string;
  activatedAt: string | null;
  revokedAt: string | null;
}

export interface InviteAgencyMemberRequest {
  email: string;
  role: 'ADMIN' | 'AGENT';
  canManageOffers: boolean;
  canManageEnquiries: boolean;
}

export interface UpdateAgencyMembershipRequest {
  role?: 'ADMIN' | 'AGENT';
  status?: AgencyMembershipStatus;
  canManageOffers?: boolean;
  canManageEnquiries?: boolean;
}

export type VerificationCaseType =
  | 'REALTOR_IDENTITY'
  | 'AGENCY_CORPORATE'
  | 'PROPERTY_AUTHORIZATION'
  | 'PROPERTY_LEGAL_TITLE';

export type VerificationCaseStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVOKED';

export type EvidenceValidationStatus =
  | 'PENDING_UPLOAD'
  | 'UPLOADED'
  | 'READY'
  | 'FAILED';

export interface EvidenceMetadataItem {
  id: string;
  documentType: string;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  validationStatus: EvidenceValidationStatus;
  createdAt: string;
}

export interface VerificationCaseResponse {
  id: string;
  caseType: VerificationCaseType;
  status: VerificationCaseStatus;
  submittedByUserId: string;
  submittedByEmail: string;
  realtorProfileId: string | null;
  realtorDisplayName: string | null;
  agencyId: string | null;
  agencyName: string | null;
  targetPropertyId: string | null;
  assignedModeratorId: string | null;
  notes: string | null;
  decisionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  evidence: EvidenceMetadataItem[];
}

export interface CreateVerificationCaseRequest {
  caseType: VerificationCaseType;
  agencyId?: string;
  targetPropertyId?: string;
  notes?: string;
}

export interface EvidenceUploadIntentResponse {
  evidenceId: string;
  uploadUrl: string;
  httpMethod: string;
  requiredHeaders: Record<string, string>;
  expiresInSeconds: number;
}

export interface PrivateEvidenceAccessUrlResponse {
  evidenceId: string;
  downloadUrl: string;
  expiresInSeconds: number;
}

export interface CreatePropertyRequest {
  agencyId?: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  propertyCondition?: PropertyCondition;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  floorArea?: number;
  floorAreaUnit?: FloorAreaUnit;
  landArea?: number;
  landAreaUnit?: LandAreaUnit;
  state: string;
  city: string;
  locality?: string;
  privateAddress?: string;
  latitude?: number;
  longitude?: number;
  amenityCodes?: string[];
}

export interface PropertyResponse {
  id: string;
  ownerRealtorId: string | null;
  ownerAgencyId: string | null;
  title: string;
  description: string;
  propertyType: PropertyType;
  propertyCondition: PropertyCondition | null;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  floorArea: number | null;
  floorAreaUnit: FloorAreaUnit | null;
  landArea: number | null;
  landAreaUnit: LandAreaUnit | null;
  state: string;
  city: string;
  locality: string | null;
  privateAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  marketingAuthorizationVerified: boolean;
  legalTitleVerified: boolean;
  amenities: AmenityResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferRequest {
  propertyId?: string;
  property?: CreatePropertyRequest;
  agencyId?: string;
  titleOverride?: string;
  transactionType: TransactionType;
  price: number;
  currency?: string;
  billingPeriod: BillingPeriod;
  serviceCharge?: number;
  cautionFee?: number;
  agencyFeePercent?: number;
  availabilityStatus?: AvailabilityStatus;
  availableFrom?: string;
  expiresAt?: string;
}

export interface UpdateOfferRequest {
  titleOverride?: string;
  transactionType?: TransactionType;
  price?: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  serviceCharge?: number;
  cautionFee?: number;
  agencyFeePercent?: number;
  availabilityStatus?: AvailabilityStatus;
  availableFrom?: string;
  expiresAt?: string;
}

export interface OfferStatusHistoryResponse {
  id: string;
  fromState: OfferPublicationState | null;
  toState: OfferPublicationState;
  actorUserId: string | null;
  reason: string | null;
  createdAt: string;
}

export interface OfferResponse {
  id: string;
  propertyId: string;
  advertiserRealtorId: string | null;
  advertiserAgencyId: string | null;
  effectiveTitle: string;
  titleOverride: string | null;
  transactionType: TransactionType;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  serviceCharge: number | null;
  cautionFee: number | null;
  agencyFeePercent: number | null;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string | null;
  publicationState: OfferPublicationState;
  featured: boolean;
  coverMediaUrl: string | null;
  submittedAt: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  moderationReason: string | null;
  moderatedAt: string | null;
  viewCount: number;
  property: PropertyResponse;
  media: PublicMediaItem[];
  statusHistory: OfferStatusHistoryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadIntentRequest {
  mediaKind: MediaKind;
  originalFilename: string;
  contentType: string;
  fileSizeBytes: number;
  sortOrder?: number;
}

export interface MediaUploadIntentResponse {
  mediaId: string;
  mediaKind: MediaKind;
  processingState: MediaProcessingState;
  uploadUrl: string;
  httpMethod: string;
  requiredHeaders: Record<string, string>;
  expiresInSeconds: number;
}

export interface PropertyMediaResponse {
  id: string;
  offerId: string;
  mediaKind: MediaKind;
  processingState: MediaProcessingState;
  url: string | null;
  thumbnailUrl: string | null;
  originalFilename: string;
  contentType: string;
  actualSizeBytes: number | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sha256Checksum: string | null;
  sortOrder: number;
  cover: boolean;
  failureReason: string | null;
  createdAt: string;
}

export interface RealtorDashboardResponse {
  scope: 'REALTOR' | 'AGENCY';
  scopeId: string;
  displayName: string;
  onboardingStatus: RealtorOnboardingStatus | null;
  verificationStatus: VerificationTierStatus;
  offersByState: Record<string, number>;
  totalViews: number;
  totalSavedFavourites: number;
  openEnquiries: number;
  inProgressEnquiries: number;
  pendingViewingRequests: number;
  confirmedViewingRequests: number;
}

// ---------------------------------------------------------------------------
// Phase 8 — Trust & Safety (Abuse Reports) and Platform Administration
// ---------------------------------------------------------------------------

export type AbuseTargetType = 'OFFER' | 'REALTOR' | 'AGENCY';

export type AbuseReasonCategory =
  | 'FRAUD_OR_SCAM'
  | 'DUPLICATE_OR_SPAM'
  | 'MISLEADING_PRICE_OR_FEES'
  | 'UNAUTHORIZED_MARKETING'
  | 'INAPPROPRIATE_MEDIA'
  | 'IMPERSONATION'
  | 'OTHER';

export type AbuseReportStatus =
  | 'OPEN'
  | 'UNDER_INVESTIGATION'
  | 'RESOLVED_ACTION_TAKEN'
  | 'DISMISSED';

export interface CreateAbuseReportRequest {
  targetType: AbuseTargetType;
  targetOfferId?: string;
  targetRealtorId?: string;
  targetAgencyId?: string;
  reasonCategory: AbuseReasonCategory;
  details: string;
  reporterEmail?: string;
  reporterName?: string;
}

export interface AbuseReportResponse {
  id: string;
  reporterUserId: string | null;
  reporterEmail: string | null;
  reporterName: string | null;
  targetType: AbuseTargetType;
  targetOfferId: string | null;
  targetOfferTitle: string | null;
  targetRealtorId: string | null;
  targetRealtorName: string | null;
  targetAgencyId: string | null;
  targetAgencyName: string | null;
  reasonCategory: AbuseReasonCategory;
  details: string;
  status: AbuseReportStatus;
  assignedModeratorId: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResolveAbuseReportRequest {
  status: AbuseReportStatus;
  resolutionNotes?: string;
  suspendTargetOffer: boolean;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalRealtors: number;
  activeAgencies: number;
  publishedOffers: number;
  pendingReviewOffers: number;
  rejectedOffers: number;
  suspendedOffers: number;
  pendingVerificationCases: number;
  openAbuseReports: number;
  investigatingAbuseReports: number;
  pendingOutboxEvents: number;
  deadLetterOutboxEvents: number;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  suspendedReason: string | null;
  suspendedAt: string | null;
  lastLoginAt: string | null;
  roles: RoleCode[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserStatusRequest {
  accountStatus: AccountStatus;
  reason?: string;
  grantModeratorRole?: boolean;
}

export interface UpdateAgencyStatusRequest {
  status: AgencyStatus;
  reason?: string;
}

export interface CreateAmenityRequest {
  code: string;
  name: string;
  category: string;
}

export interface UpdateAmenityRequest {
  name?: string;
  category?: string;
  active?: boolean;
}

export type PlatformSettingValueType = 'BOOLEAN' | 'INTEGER' | 'STRING';

export interface PlatformSettingResponse {
  settingKey: string;
  settingValue: string;
  valueType: PlatformSettingValueType;
  description: string;
  updatedByUserId: string | null;
  updatedAt: string;
}

export interface AuditLogResponse {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actionType: string;
  targetType: string;
  targetId: string | null;
  agencyId: string | null;
  correlationId: string | null;
  summary: string;
  metadataJson: string | null;
  createdAt: string;
}

export interface DuplicateOfferItem {
  offerId: string;
  propertyId: string;
  title: string;
  state: string;
  city: string;
  transactionType: TransactionType;
  price: number;
  currency: string;
  publicationState: OfferPublicationState;
  advertiserDisplayName: string;
  createdAt: string;
}

export interface DuplicateOfferGroupResponse {
  matchReason: 'SAME_PROPERTY_AND_TRANSACTION' | 'MATCHING_HEADLINE_AND_LOCATION';
  fingerprintKey: string;
  offers: DuplicateOfferItem[];
}

export interface ModerationDecisionRequest {
  reason?: string;
  featured?: boolean;
  expiresAt?: string;
}

export type VerificationDecisionOutcome = 'APPROVE' | 'REJECT' | 'REVOKE';

export interface VerificationDecisionRequest {
  outcome: VerificationDecisionOutcome;
  reason?: string;
}
