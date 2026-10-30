import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../../App';
import { authApi } from '../../../api/authApi';
import type {
  PropertyDetailResponse,
  PublicPropertySearchItem,
  UserProfileResponse,
} from '../../../api/contracts';
import { marketplaceApi } from '../../../api/marketplaceApi';
import { customerApi } from '../../../api/customerApi';
import { realtorApi } from '../../../api/realtorApi';
import { MediaGallery } from '../../../components/ui/MediaGallery';
import { VerificationPanel } from '../../../components/ui/VerificationBadges';
import { AuthContext } from '../../auth/useAuth';
import { RequireAuth } from '../../../routes/RequireAuth';

const sampleOfferItem: PublicPropertySearchItem = {
  id: '11111111-1111-1111-1111-111111111111',
  title: '4 Bedroom Terrace Duplex in Lekki Phase 1',
  propertyType: 'TERRACE_DUPLEX',
  transactionType: 'RENT',
  price: 12000000,
  currency: 'NGN',
  billingPeriod: 'YEARLY',
  location: {
    state: 'Lagos',
    city: 'Lekki',
    locality: 'Lekki Phase 1',
    distanceKm: null,
  },
  bedrooms: 4,
  bathrooms: 4,
  availabilityStatus: 'AVAILABLE',
  featured: true,
  coverImageUrl: 'http://localhost:9000/public-media/offers/cover.jpg',
  publishedAt: '2026-10-29T12:00:00Z',
  advertiser: {
    id: '22222222-2222-2222-2222-222222222222',
    type: 'REALTOR',
    displayName: 'Adewale Realty',
    slug: 'adewale-realty',
    verified: true,
    verificationScope: 'REALTOR_IDENTITY',
  },
  verification: {
    advertiserVerified: true,
    marketingAuthorizationVerified: true,
    legalTitleVerified: false,
  },
};

const sampleSecondOffer: PublicPropertySearchItem = {
  ...sampleOfferItem,
  id: '33333333-3333-3333-3333-333333333333',
  title: 'Luxury 3 Bedroom Serviced Apartment in Ikoyi',
  propertyType: 'APARTMENT',
  price: 18000000,
  location: { state: 'Lagos', city: 'Ikoyi', locality: 'Banana Island Road', distanceKm: null },
};

const sampleDetail: PropertyDetailResponse = {
  id: sampleOfferItem.id,
  propertyId: '44444444-4444-4444-4444-444444444444',
  title: sampleOfferItem.title,
  description: 'Spacious newly built 4 bedroom terrace with 24/7 power and treated water.',
  propertyType: 'TERRACE_DUPLEX',
  propertyCondition: 'NEWLY_BUILT',
  transactionType: 'RENT',
  price: 12000000,
  currency: 'NGN',
  billingPeriod: 'YEARLY',
  serviceCharge: 1500000,
  cautionFee: 1000000,
  agencyFeePercent: 10,
  availabilityStatus: 'AVAILABLE',
  availableFrom: '2026-11-01',
  featured: true,
  coverImageUrl: sampleOfferItem.coverImageUrl,
  bedrooms: 4,
  bathrooms: 4,
  toilets: 5,
  floorArea: 280,
  floorAreaUnit: 'SQM',
  landArea: null,
  landAreaUnit: null,
  location: {
    state: 'Lagos',
    city: 'Lekki',
    locality: 'Lekki Phase 1',
    latitude: 6.4478,
    longitude: 3.4723,
  },
  amenities: [
    { id: 'a1', code: 'SWIMMING_POOL', name: 'Swimming Pool', category: 'LIFESTYLE', active: true },
  ],
  media: [
    {
      id: 'm1',
      mediaKind: 'IMAGE',
      processingState: 'READY',
      url: 'http://localhost:9000/public-media/offers/photo1.jpg',
      thumbnailUrl: 'http://localhost:9000/public-media/offers/thumb1.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 120400,
      width: 1600,
      height: 1066,
      durationSeconds: null,
      sortOrder: 0,
      cover: true,
      createdAt: '2026-10-29T12:00:00Z',
    },
    {
      id: 'm2',
      mediaKind: 'IMAGE',
      processingState: 'READY',
      url: 'http://localhost:9000/public-media/offers/photo2.jpg',
      thumbnailUrl: 'http://localhost:9000/public-media/offers/thumb2.jpg',
      contentType: 'image/jpeg',
      fileSizeBytes: 98000,
      width: 1600,
      height: 1066,
      durationSeconds: null,
      sortOrder: 1,
      cover: false,
      createdAt: '2026-10-29T12:01:00Z',
    },
    {
      id: 'm3',
      mediaKind: 'VIDEO',
      processingState: 'READY',
      url: 'http://localhost:9000/public-media/offers/walkthrough.mp4',
      thumbnailUrl: null,
      contentType: 'video/mp4',
      fileSizeBytes: 2048000,
      width: 1280,
      height: 720,
      durationSeconds: 45,
      sortOrder: 2,
      cover: false,
      createdAt: '2026-10-29T12:02:00Z',
    },
  ],
  advertiser: {
    id: sampleOfferItem.advertiser.id,
    type: 'REALTOR',
    displayName: 'Adewale Realty',
    slug: 'adewale-realty',
    publicPhone: '+2348012345678',
    whatsappNumber: '+2348012345678',
    verified: true,
    verificationScope: 'REALTOR_IDENTITY',
  },
  verification: {
    contactEmailVerified: true,
    realtorIdentityVerified: true,
    agencyCorporateVerified: false,
    marketingAuthorizationVerified: true,
    legalTitleVerified: false,
  },
  publishedAt: '2026-10-29T12:00:00Z',
  expiresAt: '2027-01-29T12:00:00Z',
};

function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Phase 6 Public Marketplace & Auth Flows', () => {
  it('synchronizes URL search filters with marketplaceApi.searchProperties and supports side-by-side comparison', async () => {
    const user = userEvent.setup();
    vi.spyOn(marketplaceApi, 'getStates').mockResolvedValue([
      { code: 'LA', name: 'Lagos' },
      { code: 'FC', name: 'FCT' },
    ]);
    vi.spyOn(marketplaceApi, 'getCities').mockResolvedValue([
      { id: 'c1', stateName: 'Lagos', name: 'Lekki', latitude: 6.4478, longitude: 3.4723 },
    ]);
    vi.spyOn(marketplaceApi, 'getAmenities').mockResolvedValue([
      { id: 'a1', code: 'SWIMMING_POOL', name: 'Swimming Pool', category: 'LIFESTYLE', active: true },
    ]);
    const searchSpy = vi.spyOn(marketplaceApi, 'searchProperties').mockResolvedValue({
      content: [sampleOfferItem, sampleSecondOffer],
      page: 0,
      size: 12,
      totalElements: 2,
      totalPages: 1,
    });

    render(
      <App
        queryClient={makeTestQueryClient()}
        initialEntries={['/properties?state=Lagos&transactionType=RENT']}
        skipInitialSessionBootstrap
      />,
    );

    expect(await screen.findByText(sampleOfferItem.title)).toBeInTheDocument();
    expect(searchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'Lagos',
        transactionType: 'RENT',
      }),
    );

    // Select both listings for side-by-side comparison
    const compareBoxes = screen.getAllByRole('checkbox', { name: /Compare/i });
    await user.click(compareBoxes[0]!);
    await user.click(compareBoxes[1]!);

    const openCompareBtn = screen.getByRole('button', { name: /Compare Side-by-Side/i });
    await user.click(openCompareBtn);

    expect(
      screen.getByRole('dialog', { name: /Compare selected property offers/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Side-by-Side Offer Comparison \(2\)/i)).toBeInTheDocument();
  });

  it('explicitly distinguishes Realtor Identity, Marketing Mandate, and unverified Legal Title', () => {
    render(
      <VerificationPanel
        contactEmailVerified
        realtorIdentityVerified
        marketingAuthorizationVerified
        legalTitleVerified={false}
        advertiserType="REALTOR"
      />,
    );

    expect(screen.getByText(/Realtor Identity:/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence Reviewed/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Independently Verified/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Always conduct independent legal due diligence/i),
    ).toBeInTheDocument();
  });

  it('opens keyboard-accessible photo lightbox and renders video walkthrough player', async () => {
    const user = userEvent.setup();
    render(<MediaGallery title={sampleDetail.title} media={sampleDetail.media} />);

    expect(screen.getByLabelText(/video walkthrough 1/i)).toBeInTheDocument();

    const openBtn = screen.getByRole('button', { name: /Open photo 1 of 2 in full screen/i });
    await user.click(openBtn);

    expect(screen.getByRole('dialog', { name: /Property photo gallery viewer/i })).toBeInTheDocument();
    expect(screen.getByText(/Photo 1 of 2/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/Photo 2 of 2/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(
      screen.queryByRole('dialog', { name: /Property photo gallery viewer/i }),
    ).not.toBeInTheDocument();
  });

  it('renders full property detail commercial breakdown and Retry button on network error', async () => {
    const detailSpy = vi
      .spyOn(marketplaceApi, 'getPropertyDetail')
      .mockRejectedValueOnce(new Error('Backend temporarily unreachable'))
      .mockResolvedValueOnce(sampleDetail);
    vi.spyOn(marketplaceApi, 'getSimilarProperties').mockResolvedValue([sampleSecondOffer]);

    const user = userEvent.setup();
    render(
      <App
        queryClient={makeTestQueryClient()}
        initialEntries={[`/properties/${sampleDetail.id}`]}
        skipInitialSessionBootstrap
      />,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(/Backend temporarily unreachable/i);
    await user.click(screen.getByRole('button', { name: /Retry/i }));

    expect(await screen.findByRole('heading', { name: sampleDetail.title })).toBeInTheDocument();
    expect(detailSpy).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Swimming Pool/i)).toBeInTheDocument();
    expect(screen.getByText(/10%/i)).toBeInTheDocument();
  });

  it('validates registration form inputs with Zod and calls authApi.registerRealtor on valid submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(realtorApi, 'listMyMemberships').mockResolvedValue([]);
    vi.spyOn(realtorApi, 'getDashboard').mockResolvedValue({
      scope: 'REALTOR',
      scopeId: 'r1',
      displayName: 'Chidi Prime Estates',
      onboardingStatus: 'INCOMPLETE',
      verificationStatus: 'UNVERIFIED',
      offersByState: {},
      totalViews: 0,
      totalSavedFavourites: 0,
      openEnquiries: 0,
      inProgressEnquiries: 0,
      pendingViewingRequests: 0,
      confirmedViewingRequests: 0,
    });
    const registerSpy = vi.spyOn(authApi, 'registerRealtor').mockResolvedValue({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: {
        id: 'u1',
        email: 'agent@akrealtors.ng',
        phoneNumber: '+2348099998888',
        firstName: 'Chidi',
        lastName: 'Okafor',
        accountStatus: 'ACTIVE',
        emailVerified: false,
        phoneVerified: false,
        roles: ['CUSTOMER', 'REALTOR'],
        lastLoginAt: null,
        createdAt: '2026-10-29T12:00:00Z',
      },
    });

    render(
      <App
        queryClient={makeTestQueryClient()}
        initialEntries={['/register?tab=realtor']}
        skipInitialSessionBootstrap
      />,
    );

    // Submit empty form -> expect validation errors
    await user.click(screen.getByRole('button', { name: /Register & Onboard as Realtor/i }));
    expect(await screen.findByText(/First name is required/i)).toBeInTheDocument();
    expect(registerSpy).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/First Name/i), 'Chidi');
    await user.type(screen.getByLabelText(/Last Name/i), 'Okafor');
    await user.type(screen.getByLabelText(/Professional Display Name/i), 'Chidi Prime Estates');
    await user.type(screen.getByLabelText(/Business Email/i), 'agent@akrealtors.ng');
    await user.type(screen.getByLabelText(/Business Phone Number/i), '+2348099998888');
    await user.type(screen.getByLabelText(/^Password$/i), 'SecurePass2026');

    await user.click(screen.getByRole('button', { name: /Register & Onboard as Realtor/i }));

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByRole('heading', { name: /Realtor & Agency Workspace/i }),
    ).toBeInTheDocument();
  });

  it('blocks unauthorized role access via RequireAuth UX guard', () => {
    const customerUser: UserProfileResponse = {
      id: 'cust-1',
      email: 'customer@example.com',
      phoneNumber: null,
      firstName: 'Amina',
      lastName: 'Bello',
      accountStatus: 'ACTIVE',
      emailVerified: true,
      phoneVerified: false,
      roles: ['CUSTOMER'],
      lastLoginAt: null,
      createdAt: '2026-10-29T12:00:00Z',
    };

    render(
      <QueryClientProvider client={makeTestQueryClient()}>
        <AuthContext.Provider
          value={{
            user: customerUser,
            isLoading: false,
            isAuthenticated: true,
            hasRole: (...roles) => roles.some((r) => customerUser.roles.includes(r)),
            login: vi.fn(),
            registerCustomer: vi.fn(),
            registerRealtor: vi.fn(),
            logout: vi.fn(),
            refreshProfile: vi.fn(),
          }}
        >
          <MemoryRouter initialEntries={['/admin']}>
            <RequireAuth allowedRoles={['MODERATOR', 'PLATFORM_ADMIN']}>
              <div>Secret Admin Panel</div>
            </RequireAuth>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: /Access Restricted/i })).toBeInTheDocument();
    expect(screen.queryByText(/Secret Admin Panel/i)).not.toBeInTheDocument();
  });
});
