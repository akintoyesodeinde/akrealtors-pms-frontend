import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../../App';
import type {
  OfferResponse,
  PropertyDetailResponse,
  UserProfileResponse,
} from '../../../api/contracts';
import { customerApi } from '../../../api/customerApi';
import { marketplaceApi } from '../../../api/marketplaceApi';
import { realtorApi } from '../../../api/realtorApi';
import { ApiClientError } from '../../../api/types';
import { AuthContext } from '../../auth/useAuth';

const sampleCustomer: UserProfileResponse = {
  id: 'cust-100',
  email: 'amina@example.com',
  phoneNumber: '+2348011112222',
  firstName: 'Amina',
  lastName: 'Bello',
  accountStatus: 'ACTIVE',
  emailVerified: true,
  phoneVerified: false,
  roles: ['CUSTOMER'],
  lastLoginAt: null,
  createdAt: '2026-10-29T10:00:00Z',
};

const sampleRealtor: UserProfileResponse = {
  id: 'realtor-200',
  email: 'tunde@akrealtors.ng',
  phoneNumber: '+2348033334444',
  firstName: 'Tunde',
  lastName: 'Bakare',
  accountStatus: 'ACTIVE',
  emailVerified: true,
  phoneVerified: false,
  roles: ['CUSTOMER', 'REALTOR'],
  lastLoginAt: null,
  createdAt: '2026-10-29T10:00:00Z',
};

const sampleOfferDetail: PropertyDetailResponse = {
  id: 'offer-777',
  propertyId: 'prop-777',
  title: '5 Bedroom Detached Duplex in Ikoyi',
  description: 'Contemporary smart-home detached duplex with private cinema and swimming pool.',
  propertyType: 'DETACHED_DUPLEX',
  propertyCondition: 'NEWLY_BUILT',
  transactionType: 'SALE',
  price: 450000000,
  currency: 'NGN',
  billingPeriod: 'ONE_TIME',
  serviceCharge: null,
  cautionFee: null,
  agencyFeePercent: 5,
  availabilityStatus: 'AVAILABLE',
  availableFrom: null,
  featured: true,
  coverImageUrl: null,
  bedrooms: 5,
  bathrooms: 5,
  toilets: 6,
  floorArea: 480,
  floorAreaUnit: 'SQM',
  landArea: 600,
  landAreaUnit: 'SQM',
  location: {
    state: 'Lagos',
    city: 'Ikoyi',
    locality: 'Old Ikoyi',
    latitude: 6.4549,
    longitude: 3.4246,
  },
  amenities: [],
  media: [],
  advertiser: {
    id: 'adv-1',
    type: 'REALTOR',
    displayName: 'Tunde Luxury Advisory',
    slug: 'tunde-luxury-advisory',
    publicPhone: '+2348033334444',
    whatsappNumber: '+2348033334444',
    verified: true,
    verificationScope: 'REALTOR_IDENTITY',
  },
  verification: {
    contactEmailVerified: true,
    realtorIdentityVerified: true,
    agencyCorporateVerified: false,
    marketingAuthorizationVerified: true,
    legalTitleVerified: true,
  },
  publishedAt: '2026-10-29T12:00:00Z',
  expiresAt: null,
};

const sampleManagedOffer: OfferResponse = {
  id: 'offer-900',
  propertyId: 'prop-900',
  advertiserRealtorId: 'adv-1',
  advertiserAgencyId: null,
  effectiveTitle: '4 Bedroom Terrace Duplex in Lekki',
  titleOverride: null,
  transactionType: 'RENT',
  price: 14000000,
  currency: 'NGN',
  billingPeriod: 'YEARLY',
  serviceCharge: 1200000,
  cautionFee: 1000000,
  agencyFeePercent: 10,
  availabilityStatus: 'AVAILABLE',
  availableFrom: '2026-11-15',
  publicationState: 'REJECTED',
  featured: false,
  coverMediaUrl: null,
  submittedAt: '2026-10-29T09:00:00Z',
  publishedAt: null,
  expiresAt: null,
  moderationReason: 'Please upload clear exterior front-elevation photographs before publication.',
  moderatedAt: '2026-10-29T11:00:00Z',
  viewCount: 0,
  property: {
    id: 'prop-900',
    ownerRealtorId: 'adv-1',
    ownerAgencyId: null,
    title: '4 Bedroom Terrace Duplex in Lekki',
    description: 'Well-finished terrace duplex in gated estate with 24/7 security.',
    propertyType: 'TERRACE_DUPLEX',
    propertyCondition: 'NEWLY_BUILT',
    bedrooms: 4,
    bathrooms: 4,
    toilets: 5,
    floorArea: 260,
    floorAreaUnit: 'SQM',
    landArea: null,
    landAreaUnit: null,
    state: 'Lagos',
    city: 'Lekki',
    locality: 'Lekki Phase 1',
    privateAddress: 'Plot 14 Admiralty Road',
    latitude: null,
    longitude: null,
    marketingAuthorizationVerified: false,
    legalTitleVerified: false,
    amenities: [],
    createdAt: '2026-10-29T08:00:00Z',
    updatedAt: '2026-10-29T08:00:00Z',
  },
  media: [],
  statusHistory: [
    {
      id: 'sh-1',
      fromState: 'PENDING_REVIEW',
      toState: 'REJECTED',
      actorUserId: 'mod-1',
      reason: 'Please upload clear exterior front-elevation photographs before publication.',
      createdAt: '2026-10-29T11:00:00Z',
    },
  ],
  createdAt: '2026-10-29T08:00:00Z',
  updatedAt: '2026-10-29T11:00:00Z',
};

function renderWithUser(activeUser: UserProfileResponse, initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: activeUser,
          isLoading: false,
          isAuthenticated: true,
          hasRole: (...roles) => roles.some((r) => activeUser.roles.includes(r)),
          login: vi.fn(),
          registerCustomer: vi.fn(),
          registerRealtor: vi.fn(),
          logout: vi.fn(),
          refreshProfile: vi.fn(),
        }}
      >
        <MemoryRouter initialEntries={[initialRoute]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Phase 7 Customer Portal & Realtor Workspace Flows', () => {
  it('allows authenticated customer to save favourite and send inline structured enquiry on PropertyDetailPage', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 2 });
    vi.spyOn(marketplaceApi, 'getPropertyDetail').mockResolvedValue(sampleOfferDetail);
    vi.spyOn(marketplaceApi, 'getSimilarProperties').mockResolvedValue([]);
    vi.spyOn(customerApi, 'listFavouriteIds')
      .mockResolvedValueOnce([])
      .mockResolvedValue(['offer-777']);

    const saveFavSpy = vi.spyOn(customerApi, 'saveFavourite').mockResolvedValue({
      favouriteId: 'fav-1',
      offerId: 'offer-777',
      title: sampleOfferDetail.title,
      propertyType: 'DETACHED_DUPLEX',
      transactionType: 'SALE',
      price: 450000000,
      currency: 'NGN',
      billingPeriod: 'ONE_TIME',
      state: 'Lagos',
      city: 'Ikoyi',
      locality: 'Old Ikoyi',
      bedrooms: 5,
      bathrooms: 5,
      availabilityStatus: 'AVAILABLE',
      publicationState: 'PUBLISHED',
      coverImageUrl: null,
      advertiserName: 'Tunde Luxury Advisory',
      savedAt: '2026-10-29T12:10:00Z',
    });

    const createEnquirySpy = vi.spyOn(customerApi, 'createEnquiry').mockResolvedValue({
      id: 'enq-1',
      offerId: 'offer-777',
      offerTitle: sampleOfferDetail.title,
      advertiserType: 'REALTOR',
      advertiserId: 'adv-1',
      advertiserName: 'Tunde Luxury Advisory',
      subject: 'Enquiry: 5 Bedroom Detached Duplex in Ikoyi',
      message: 'Is the Certificate of Occupancy available for solicitor inspection this week?',
      status: 'OPEN',
      realtorReply: null,
      respondedAt: null,
      createdAt: '2026-10-29T12:15:00Z',
      updatedAt: '2026-10-29T12:15:00Z',
    });

    renderWithUser(sampleCustomer, '/properties/offer-777');

    expect(
      await screen.findByRole('heading', { name: sampleOfferDetail.title }),
    ).toBeInTheDocument();

    // Toggle favourite
    await user.click(screen.getByRole('button', { name: /Save to Favourites/i }));
    await waitFor(() => {
      expect(saveFavSpy).toHaveBeenCalledWith('offer-777');
    });
    expect(await screen.findByRole('button', { name: /Saved in Favourites/i })).toBeInTheDocument();

    // Open inline structured enquiry form & submit
    await user.click(screen.getByRole('button', { name: /Send Structured Enquiry/i }));
    fireEvent.change(screen.getByLabelText(/Your Message/i), {
      target: {
        value: 'Is the Certificate of Occupancy available for solicitor inspection this week?',
      },
    });
    await user.click(screen.getByRole('button', { name: /Submit Enquiry/i }));

    await waitFor(() => {
      expect(createEnquirySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          offerId: 'offer-777',
          message: 'Is the Certificate of Occupancy available for solicitor inspection this week?',
        }),
      );
    });
    expect(await screen.findByText(/Your structured enquiry has been delivered/i)).toBeInTheDocument();
  });

  it('renders Customer Portal notifications inbox and marks unread notifications as read', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 1 });
    vi.spyOn(customerApi, 'listNotifications').mockResolvedValue({
      content: [
        {
          id: 'notif-1',
          category: 'ENQUIRY',
          title: 'Advertiser replied to your enquiry',
          body: 'Tunde Luxury Advisory responded regarding 5 Bedroom Detached Duplex in Ikoyi.',
          actionPath: '/portal/enquiries',
          referenceType: 'ENQUIRY',
          referenceId: 'enq-1',
          read: false,
          readAt: null,
          createdAt: '2026-10-29T12:30:00Z',
        },
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    });
    const markReadSpy = vi.spyOn(customerApi, 'markNotificationRead').mockResolvedValue({
      id: 'notif-1',
      category: 'ENQUIRY',
      title: 'Advertiser replied to your enquiry',
      body: 'Tunde Luxury Advisory responded regarding 5 Bedroom Detached Duplex in Ikoyi.',
      actionPath: '/portal/enquiries',
      referenceType: 'ENQUIRY',
      referenceId: 'enq-1',
      read: true,
      readAt: '2026-10-29T12:35:00Z',
      createdAt: '2026-10-29T12:30:00Z',
    });

    renderWithUser(sampleCustomer, '/portal/notifications');

    expect(await screen.findByText(/Advertiser replied to your enquiry/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Mark Read$/i }));

    await waitFor(() => {
      expect(markReadSpy).toHaveBeenCalledWith('notif-1');
    });
  });

  it('validates Realtor Create Offer Wizard inputs and creates draft offer on valid submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(realtorApi, 'listMyMemberships').mockResolvedValue([]);
    vi.spyOn(realtorApi, 'listManagedProperties').mockResolvedValue([]);
    vi.spyOn(marketplaceApi, 'getStates').mockResolvedValue([{ code: 'LA', name: 'Lagos' }]);
    vi.spyOn(marketplaceApi, 'getCities').mockResolvedValue([
      { id: 'c-lekki', stateName: 'Lagos', name: 'Lekki', latitude: 6.44, longitude: 3.47 },
    ]);
    vi.spyOn(marketplaceApi, 'getAmenities').mockResolvedValue([]);

    const createOfferSpy = vi.spyOn(realtorApi, 'createOffer').mockResolvedValue({
      ...sampleManagedOffer,
      publicationState: 'DRAFT',
      moderationReason: null,
    });
    vi.spyOn(realtorApi, 'getManagedOffer').mockResolvedValue({
      ...sampleManagedOffer,
      publicationState: 'DRAFT',
      moderationReason: null,
    });
    vi.spyOn(realtorApi, 'listOfferMedia').mockResolvedValue([]);

    renderWithUser(sampleRealtor, '/realtor/offers/new');

    expect(
      await screen.findByRole('heading', { name: /Create Draft Property Offer/i }),
    ).toBeInTheDocument();

    // Submit empty -> validation error
    await user.click(
      screen.getByRole('button', { name: /Save Draft & Continue to Media Upload/i }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Property title must be at least 5 characters/i,
    );
    expect(createOfferSpy).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Property Title/i), {
      target: { value: '4 Bedroom Terrace Duplex in Lekki' },
    });
    fireEvent.change(screen.getByLabelText(/Detailed Property Description/i), {
      target: {
        value: 'Well-finished terrace duplex in gated estate with 24/7 security and clean water.',
      },
    });
    await user.selectOptions(await screen.findByLabelText(/City \/ LGA/i), 'Lekki');
    fireEvent.change(screen.getByLabelText(/Headline Price/i), {
      target: { value: '185000000' },
    });

    await user.click(
      screen.getByRole('button', { name: /Save Draft & Continue to Media Upload/i }),
    );

    await waitFor(() => {
      expect(createOfferSpy).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByRole('heading', {
        name: /Property Photographs & Walkthrough Videos/i,
      }),
    ).toBeInTheDocument();
  });

  it('displays moderation rejection reason, handles presigned S3 upload failure + retry, and resubmits offer', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(realtorApi, 'listMyMemberships').mockResolvedValue([]);
    vi.spyOn(realtorApi, 'getManagedOffer').mockResolvedValue(sampleManagedOffer);
    vi.spyOn(realtorApi, 'listOfferMedia').mockResolvedValue([]);

    const uploadSpy = vi
      .spyOn(realtorApi, 'uploadOfferMediaFile')
      .mockRejectedValueOnce(
        new ApiClientError({
          status: 502,
          errorCode: 'OBJECT_STORAGE_UPLOAD_FAILED',
          detail: 'Temporary S3 network interruption',
        }),
      )
      .mockResolvedValueOnce({
        id: 'media-1',
        offerId: sampleManagedOffer.id,
        mediaKind: 'IMAGE',
        processingState: 'READY',
        url: 'http://localhost:9000/public-media/front.jpg',
        thumbnailUrl: 'http://localhost:9000/public-media/front-thumb.jpg',
        originalFilename: 'front-elevation.jpg',
        contentType: 'image/jpeg',
        actualSizeBytes: 54000,
        width: 1200,
        height: 800,
        durationSeconds: null,
        sha256Checksum: 'a'.repeat(64),
        sortOrder: 0,
        cover: true,
        failureReason: null,
        createdAt: '2026-10-29T12:40:00Z',
      });

    const submitSpy = vi.spyOn(realtorApi, 'submitOffer').mockResolvedValue({
      ...sampleManagedOffer,
      publicationState: 'PENDING_REVIEW',
    });

    renderWithUser(sampleRealtor, `/realtor/offers/${sampleManagedOffer.id}`);

    // Verify moderation rejection reason is surfaced clearly
    const reasonMatches = await screen.findAllByText(
      /Please upload clear exterior front-elevation photographs before publication/i,
    );
    expect(reasonMatches.length).toBeGreaterThanOrEqual(1);

    // Upload JPEG -> first attempt fails -> Retry Upload succeeds
    const testFile = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'front-elevation.jpg', {
      type: 'image/jpeg',
    });
    const fileInput = screen.getByLabelText(/Upload property photo or video/i);
    await user.upload(fileInput, testFile);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Temporary S3 network interruption/i,
    );
    await user.click(screen.getByRole('button', { name: /Retry Upload/i }));

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledTimes(2);
    });

    // Resubmit for moderation review
    await user.click(screen.getByRole('button', { name: /Submit for Moderation Review/i }));
    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith(sampleManagedOffer.id);
    });
  });
});
