import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../../../App';
import { adminApi } from '../../../api/adminApi';
import type {
  AbuseReportResponse,
  AdminDashboardResponse,
  AdminUserResponse,
  OfferResponse,
  UserProfileResponse,
} from '../../../api/contracts';
import { customerApi } from '../../../api/customerApi';
import { AuthContext } from '../../auth/useAuth';

const moderatorUser: UserProfileResponse = {
  id: 'mod-1',
  email: 'moderator@akrealtors.ng',
  phoneNumber: null,
  firstName: 'Ngozi',
  lastName: 'Eze',
  accountStatus: 'ACTIVE',
  emailVerified: true,
  phoneVerified: false,
  roles: ['MODERATOR'],
  lastLoginAt: null,
  createdAt: '2026-10-29T10:00:00Z',
};

const platformAdminUser: UserProfileResponse = {
  ...moderatorUser,
  id: 'admin-1',
  email: 'admin@akrealtors.ng',
  firstName: 'Kunle',
  lastName: 'Adeyemi',
  roles: ['PLATFORM_ADMIN'],
};

const dashboard: AdminDashboardResponse = {
  totalUsers: 120,
  activeUsers: 115,
  suspendedUsers: 5,
  totalRealtors: 30,
  activeAgencies: 6,
  publishedOffers: 48,
  pendingReviewOffers: 7,
  rejectedOffers: 3,
  suspendedOffers: 2,
  pendingVerificationCases: 4,
  openAbuseReports: 2,
  investigatingAbuseReports: 1,
  pendingOutboxEvents: 9,
  deadLetterOutboxEvents: 1,
};

const pendingOffer: OfferResponse = {
  id: 'offer-pending-1',
  propertyId: 'prop-1',
  advertiserRealtorId: 'realtor-1',
  advertiserAgencyId: null,
  effectiveTitle: '3 Bedroom Apartment in Wuse 2',
  titleOverride: null,
  transactionType: 'RENT',
  price: 9000000,
  currency: 'NGN',
  billingPeriod: 'YEARLY',
  serviceCharge: null,
  cautionFee: null,
  agencyFeePercent: 10,
  availabilityStatus: 'AVAILABLE',
  availableFrom: null,
  publicationState: 'PENDING_REVIEW',
  featured: false,
  coverMediaUrl: null,
  submittedAt: '2026-10-29T09:00:00Z',
  publishedAt: null,
  expiresAt: null,
  moderationReason: null,
  moderatedAt: null,
  viewCount: 0,
  property: {
    id: 'prop-1',
    ownerRealtorId: 'realtor-1',
    ownerAgencyId: null,
    title: '3 Bedroom Apartment in Wuse 2',
    description: 'Serviced apartment close to Banex Plaza with steady power supply.',
    propertyType: 'APARTMENT',
    propertyCondition: 'RENOVATED',
    bedrooms: 3,
    bathrooms: 3,
    toilets: 4,
    floorArea: null,
    floorAreaUnit: null,
    landArea: null,
    landAreaUnit: null,
    state: 'FCT',
    city: 'Abuja',
    locality: 'Wuse 2',
    privateAddress: null,
    latitude: null,
    longitude: null,
    marketingAuthorizationVerified: false,
    legalTitleVerified: false,
    amenities: [],
    createdAt: '2026-10-29T08:00:00Z',
    updatedAt: '2026-10-29T08:00:00Z',
  },
  media: [],
  statusHistory: [],
  createdAt: '2026-10-29T08:00:00Z',
  updatedAt: '2026-10-29T09:00:00Z',
};

const targetCustomer: AdminUserResponse = {
  id: 'cust-9',
  email: 'spammer@example.com',
  phoneNumber: null,
  firstName: 'Spam',
  lastName: 'Account',
  accountStatus: 'ACTIVE',
  emailVerified: true,
  phoneVerified: false,
  suspendedReason: null,
  suspendedAt: null,
  lastLoginAt: null,
  roles: ['CUSTOMER'],
  createdAt: '2026-10-20T08:00:00Z',
  updatedAt: '2026-10-20T08:00:00Z',
};

const openReport: AbuseReportResponse = {
  id: 'report-1',
  reporterUserId: 'cust-1',
  reporterEmail: 'amina@example.com',
  reporterName: 'Amina Bello',
  targetType: 'OFFER',
  targetOfferId: 'offer-published-1',
  targetOfferTitle: 'Luxury Waterfront Flat',
  targetRealtorId: null,
  targetRealtorName: null,
  targetAgencyId: null,
  targetAgencyName: null,
  reasonCategory: 'FRAUD_OR_SCAM',
  details: 'Advertiser demanded an inspection fee into a personal account before viewing.',
  status: 'OPEN',
  assignedModeratorId: null,
  resolutionNotes: null,
  resolvedAt: null,
  createdAt: '2026-10-29T12:00:00Z',
  updatedAt: '2026-10-29T12:00:00Z',
};

function emptyPage<T>() {
  return { content: [] as T[], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}

function renderAt(activeUser: UserProfileResponse | null, initialRoute: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: activeUser,
          isLoading: false,
          isAuthenticated: activeUser !== null,
          hasRole: (...roles) => (activeUser ? roles.some((r) => activeUser.roles.includes(r)) : false),
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

describe('Phase 8 Administration, Moderation & Trust Flows', () => {
  it('shows live queue metrics to moderators but hides platform-admin-only outbox controls', { timeout: 30_000 }, async () => {
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    const dashboardSpy = vi.spyOn(adminApi, 'getDashboard').mockResolvedValue(dashboard);

    renderAt(moderatorUser, '/admin');

    // First test in this file pays the cold React.lazy import cost of the admin chunk.
    expect(
      await screen.findByRole(
        'link',
        { name: 'Offers Pending Review: 7' },
        { timeout: 15_000 },
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Abuse Reports: 2' })).toBeInTheDocument();
    expect(dashboardSpy).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Process Outbox Batch Now/i })).not.toBeInTheDocument();
  });

  it('requires an auditable reason before rejecting an offer and sends the moderation decision', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(adminApi, 'listDuplicateOffers').mockResolvedValue([]);
    vi.spyOn(adminApi, 'listModerationOffers').mockResolvedValue({
      content: [pendingOffer],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    const moderateSpy = vi
      .spyOn(adminApi, 'moderateOffer')
      .mockResolvedValue({ ...pendingOffer, publicationState: 'REJECTED' });

    renderAt(moderatorUser, '/admin/offers');

    const card = await screen.findByRole('article', {
      name: /Moderation offer 3 Bedroom Apartment in Wuse 2/i,
    });
    await user.click(within(card).getByRole('button', { name: 'Reject' }));
    await user.click(within(card).getByRole('button', { name: /Confirm Reject/i }));

    expect(await within(card).findByRole('alert')).toHaveTextContent(/auditable reason/i);
    expect(moderateSpy).not.toHaveBeenCalled();

    await user.type(
      within(card).getByLabelText(/Reason for reject/i),
      'Photos do not match the described property.',
    );
    await user.click(within(card).getByRole('button', { name: /Confirm Reject/i }));

    await waitFor(() => {
      expect(moderateSpy).toHaveBeenCalledWith('offer-pending-1', 'reject', {
        reason: 'Photos do not match the described property.',
        featured: undefined,
      });
    });
  });

  it('keeps account suspension read-only for moderators and lets platform admins suspend with a reason', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(adminApi, 'listUsers').mockResolvedValue({
      content: [targetCustomer],
      page: 0,
      size: 15,
      totalElements: 1,
      totalPages: 1,
    });

    const { unmount } = renderAt(moderatorUser, '/admin/users');
    expect(await screen.findByRole('listitem', { name: 'User spammer@example.com' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Suspend Account/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Platform Administrator privileges are required/i)).toBeInTheDocument();
    unmount();

    const updateSpy = vi.spyOn(adminApi, 'updateUserStatus').mockResolvedValue({
      ...targetCustomer,
      accountStatus: 'SUSPENDED',
      suspendedReason: 'Confirmed spam enquiries',
    });

    renderAt(platformAdminUser, '/admin/users');
    const row = await screen.findByRole('listitem', { name: 'User spammer@example.com' });
    await user.click(within(row).getByRole('button', { name: /Suspend Account/i }));
    await user.type(within(row).getByLabelText(/Reason for suspended/i), 'Confirmed spam enquiries');
    await user.click(within(row).getByRole('button', { name: /Confirm Suspended/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('cust-9', {
        accountStatus: 'SUSPENDED',
        reason: 'Confirmed spam enquiries',
      });
    });
  });

  it('resolves an abuse report with notes and one-click suspension of the reported offer', async () => {
    const user = userEvent.setup();
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(adminApi, 'listAbuseReports').mockResolvedValue({
      content: [openReport],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });
    const resolveSpy = vi
      .spyOn(adminApi, 'resolveAbuseReport')
      .mockResolvedValue({ ...openReport, status: 'RESOLVED_ACTION_TAKEN' });

    renderAt(moderatorUser, '/admin/abuse-reports');

    const card = await screen.findByRole('article', {
      name: /Abuse report against Luxury Waterfront Flat/i,
    });
    await user.click(within(card).getByRole('button', { name: /Resolve — Action Taken/i }));
    await user.click(within(card).getByRole('button', { name: 'Confirm' }));
    expect(await within(card).findByRole('alert')).toHaveTextContent(/Resolution notes are required/i);
    expect(resolveSpy).not.toHaveBeenCalled();

    await user.type(
      within(card).getByLabelText(/Resolution notes/i),
      'Confirmed advance-fee request; listing suspended.',
    );
    await user.click(within(card).getByLabelText(/Also suspend the reported offer/i));
    await user.click(within(card).getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(resolveSpy).toHaveBeenCalledWith('report-1', {
        status: 'RESOLVED_ACTION_TAKEN',
        resolutionNotes: 'Confirmed advance-fee request; listing suspended.',
        suspendTargetOffer: true,
      });
    });
  });

  it('lets anonymous visitors submit a real abuse report from the contact page once an email is provided', async () => {
    const user = userEvent.setup();
    const offerId = '3f1c2b4a-8d7e-4f6a-9b0c-1d2e3f4a5b6c';
    const submitSpy = vi.spyOn(customerApi, 'submitAbuseReport').mockResolvedValue({
      ...openReport,
      id: 'report-anon-1',
      reporterUserId: null,
      targetOfferId: offerId,
    });

    renderAt(null, `/contact?offerId=${offerId}`);

    const form = await screen.findByRole('form', { name: /Abuse report form/i });
    expect(within(form).getByLabelText(/Reference ID/i)).toHaveValue(offerId);

    await user.type(
      within(form).getByLabelText(/Details/i),
      'Advertiser asked for a commitment fee before any inspection.',
    );
    await user.click(within(form).getByRole('button', { name: /Submit Report/i }));
    expect(await within(form).findByText(/valid email is required/i)).toBeInTheDocument();
    expect(submitSpy).not.toHaveBeenCalled();

    await user.type(within(form).getByLabelText(/Your email/i), 'visitor@example.com');
    await user.click(within(form).getByRole('button', { name: /Submit Report/i }));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith({
        targetType: 'OFFER',
        reasonCategory: 'FRAUD_OR_SCAM',
        details: 'Advertiser asked for a commitment fee before any inspection.',
        targetOfferId: offerId,
        targetRealtorId: undefined,
        targetAgencyId: undefined,
        reporterEmail: 'visitor@example.com',
        reporterName: undefined,
      });
    });
    expect(await screen.findByText(/Report received/i)).toBeInTheDocument();
  });

  it('renders empty moderation queues without fabricated data', async () => {
    vi.spyOn(customerApi, 'getUnreadNotificationCount').mockResolvedValue({ unreadCount: 0 });
    vi.spyOn(adminApi, 'listVerificationCases').mockResolvedValue(emptyPage());

    renderAt(moderatorUser, '/admin/verification');

    expect(await screen.findByText(/No verification cases/i)).toBeInTheDocument();
  });
});
