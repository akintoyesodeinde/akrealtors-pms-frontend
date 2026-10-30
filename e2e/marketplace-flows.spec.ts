import { test, expect, Route } from '@playwright/test';

test.describe('AkRealtors PMS End-to-End User Journeys', () => {

  const corsHeaders = (route: Route) => {
    const origin = route.request().headers()['origin'] || 'http://localhost:4173';
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Origin, Accept',
    };
  };

  async function fulfillJson(route: Route, status: number, data: unknown) {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: corsHeaders(route),
      });
      return;
    }
    await route.fulfill({
      status,
      contentType: 'application/json',
      headers: corsHeaders(route),
      body: JSON.stringify(data),
    });
  }

  const mockSearchItem = {
    id: 'offer-101',
    title: 'Luxury 4 Bedroom Detached Duplex with BQ',
    propertyType: 'DETACHED_DUPLEX',
    transactionType: 'SALE',
    price: 185000000,
    currency: 'NGN',
    billingPeriod: 'ONE_TIME',
    location: {
      state: 'Lagos',
      city: 'Lekki',
      locality: 'Lekki Phase 1',
      distanceKm: null,
    },
    bedrooms: 4,
    bathrooms: 5,
    availabilityStatus: 'AVAILABLE',
    featured: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    publishedAt: '2026-03-01T10:00:00Z',
    advertiser: {
      id: 'realtor-01',
      type: 'REALTOR',
      displayName: 'Adeola Property Consultants',
      slug: 'adeola',
      verified: true,
      verificationScope: 'REALTOR_IDENTITY',
    },
    verification: {
      advertiserVerified: true,
      marketingAuthorizationVerified: true,
      legalTitleVerified: true,
    },
  };

  const mockDetailItem = {
    id: 'offer-101',
    propertyId: 'prop-201',
    title: 'Luxury 4 Bedroom Detached Duplex with BQ',
    description: 'Contemporary architectural masterpiece located in a secure gated estate in Lekki Phase 1.',
    propertyType: 'DETACHED_DUPLEX',
    propertyCondition: 'NEWLY_BUILT',
    transactionType: 'SALE',
    price: 185000000,
    currency: 'NGN',
    billingPeriod: 'ONE_TIME',
    serviceCharge: 1200000,
    cautionFee: null,
    agencyFeePercent: 5,
    availabilityStatus: 'AVAILABLE',
    availableFrom: '2026-03-01',
    featured: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    bedrooms: 4,
    bathrooms: 5,
    toilets: 5,
    floorArea: 420.5,
    floorAreaUnit: 'SQM',
    landArea: null,
    landAreaUnit: null,
    location: {
      state: 'Lagos',
      city: 'Lekki',
      locality: 'Lekki Phase 1',
      latitude: 6.4474,
      longitude: 3.4847,
    },
    amenities: [
      { id: 'am-1', code: 'SWIMMING_POOL', name: 'Swimming Pool', category: 'LEISURE', active: true },
      { id: 'am-2', code: 'CCTV', name: '24/7 CCTV & Security', category: 'SECURITY', active: true },
    ],
    media: [
      {
        id: 'media-01',
        mediaKind: 'IMAGE',
        processingState: 'READY',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80',
        contentType: 'image/jpeg',
        fileSizeBytes: 1048576,
        width: 1920,
        height: 1080,
        durationSeconds: null,
        sortOrder: 0,
        cover: true,
        createdAt: '2026-03-01T10:00:00Z',
      },
    ],
    advertiser: {
      id: 'realtor-01',
      type: 'REALTOR',
      displayName: 'Adeola Property Consultants',
      slug: 'adeola',
      publicPhone: '+2348030000001',
      whatsappNumber: '+2348030000001',
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
    publishedAt: '2026-03-01T10:00:00Z',
    expiresAt: null,
  };

  const mockRealtorOffer = {
    id: 'off-001',
    propertyId: 'prop-001',
    advertiserRealtorId: 'realtor-001',
    advertiserAgencyId: null,
    effectiveTitle: 'Prime Lekki Duplex For Sale',
    titleOverride: 'Prime Lekki Duplex For Sale',
    transactionType: 'SALE',
    price: 95000000,
    currency: 'NGN',
    billingPeriod: 'ONE_TIME',
    serviceCharge: null,
    cautionFee: null,
    agencyFeePercent: 5,
    availabilityStatus: 'AVAILABLE',
    availableFrom: '2026-03-01',
    publicationState: 'DRAFT',
    featured: false,
    coverMediaUrl: null,
    submittedAt: null,
    publishedAt: null,
    expiresAt: null,
    moderationReason: null,
    moderatedAt: null,
    viewCount: 0,
    property: {
      id: 'prop-001',
      ownerRealtorId: 'realtor-001',
      ownerAgencyId: null,
      title: 'Prime Lekki Duplex',
      description: '4 Bedroom duplex in Lekki Phase 1',
      propertyType: 'DETACHED_DUPLEX',
      propertyCondition: 'NEWLY_BUILT',
      bedrooms: 4,
      bathrooms: 4,
      toilets: 5,
      floorArea: 380,
      floorAreaUnit: 'SQM',
      landArea: null,
      landAreaUnit: null,
      state: 'Lagos',
      city: 'Lekki',
      locality: 'Lekki Phase 1',
      privateAddress: 'Plot 12 Lekki Scheme',
      latitude: 6.448,
      longitude: 3.485,
      marketingAuthorizationVerified: true,
      legalTitleVerified: false,
      amenities: [],
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    },
    media: [],
    statusHistory: [],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  };

  const mockAdminModerationOffer = {
    id: 'off-review-001',
    propertyId: 'prop-review-001',
    advertiserRealtorId: 'realtor-001',
    advertiserAgencyId: null,
    effectiveTitle: 'Victoria Island Penthouse for Lease',
    titleOverride: 'Victoria Island Penthouse for Lease',
    transactionType: 'LEASE',
    price: 45000000,
    currency: 'NGN',
    billingPeriod: 'YEARLY',
    serviceCharge: 3500000,
    cautionFee: 2000000,
    agencyFeePercent: 10,
    availabilityStatus: 'AVAILABLE',
    availableFrom: '2026-04-01',
    publicationState: 'PENDING_REVIEW',
    featured: false,
    coverMediaUrl: null,
    submittedAt: '2026-03-01T12:00:00Z',
    publishedAt: null,
    expiresAt: null,
    moderationReason: null,
    moderatedAt: null,
    viewCount: 0,
    property: {
      id: 'prop-review-001',
      ownerRealtorId: 'realtor-001',
      ownerAgencyId: null,
      title: 'Victoria Island Penthouse',
      description: 'Stunning 3 bedroom penthouse with ocean views in Victoria Island.',
      propertyType: 'PENTHOUSE',
      propertyCondition: 'NEWLY_BUILT',
      bedrooms: 3,
      bathrooms: 4,
      toilets: 4,
      floorArea: 320,
      floorAreaUnit: 'SQM',
      landArea: null,
      landAreaUnit: null,
      state: 'Lagos',
      city: 'Victoria Island',
      locality: 'Ahmadu Bello Way',
      privateAddress: 'Tower 4',
      latitude: 6.425,
      longitude: 3.421,
      marketingAuthorizationVerified: true,
      legalTitleVerified: true,
      amenities: [],
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-01T10:00:00Z',
    },
    media: [],
    statusHistory: [],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  };

  const mockAdminDashboard = {
    pendingReviewOffers: 1,
    pendingVerificationCases: 0,
    openAbuseReports: 0,
    investigatingAbuseReports: 0,
    publishedOffers: 12,
    rejectedOffers: 1,
    suspendedOffers: 0,
    activeAgencies: 3,
    totalUsers: 15,
    activeUsers: 14,
    suspendedUsers: 1,
    totalRealtors: 5,
    pendingOutboxEvents: 2,
    deadLetterOutboxEvents: 0,
  };

  const mockRealtorDashboard = {
    realtorId: 'realtor-001',
    displayName: 'Babatunde Ojo Consultants',
    scope: 'PERSONAL',
    verificationStatus: 'VERIFIED',
    onboardingStatus: 'COMPLETED',
    offersByState: {
      DRAFT: 1,
      PENDING_REVIEW: 0,
      PUBLISHED: 2,
      REJECTED: 0,
      SUSPENDED: 0,
      EXPIRED: 0,
      ARCHIVED: 0,
    },
    totalViews: 1420,
    totalSavedFavourites: 38,
    openEnquiries: 3,
    inProgressEnquiries: 1,
    pendingViewingRequests: 2,
    confirmedViewingRequests: 1,
  };

  interface TestUserSession {
    accessToken: string;
    tokenType: string;
    expiresInSeconds: number;
    user: {
      id: string;
      email: string;
      phoneNumber?: string;
      firstName: string;
      lastName: string;
      accountStatus: string;
      emailVerified: boolean;
      phoneVerified: boolean;
      roles: string[];
      lastLoginAt: string;
      createdAt: string;
    };
  }

  // State holder for active test user session
  let activeUserSession: TestUserSession | null = null;

  test.beforeEach(async ({ page }) => {
    activeUserSession = null;

    // Master API route interceptor matching ANY request to /api/v1/
    await page.route(/\/api\/v1\//, async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const method = route.request().method();

      if (method === 'OPTIONS') {
        await fulfillJson(route, 204, {});
        return;
      }

      // 1. Session Refresh
      if (path.includes('/auth/refresh')) {
        if (activeUserSession) {
          await fulfillJson(route, 200, activeUserSession);
        } else {
          await fulfillJson(route, 401, {
            status: 401,
            errorCode: 'UNAUTHORIZED',
            detail: 'No active session cookie',
          });
        }
        return;
      }

      // 2. Authentication Login
      if (path.includes('/auth/login')) {
        await fulfillJson(route, 200, activeUserSession || {
          accessToken: 'mock-jwt-token',
          tokenType: 'Bearer',
          expiresInSeconds: 900,
          user: {
            id: 'mock-user-01',
            email: 'user@akrealtors.test',
            firstName: 'Test',
            lastName: 'User',
            accountStatus: 'ACTIVE',
            emailVerified: true,
            roles: ['CUSTOMER'],
          },
        });
        return;
      }

      // 3. Current User Profile
      if (path.includes('/auth/me')) {
        await fulfillJson(route, 200, activeUserSession?.user || {
          id: 'mock-user-01',
          email: 'user@akrealtors.test',
          firstName: 'Test',
          lastName: 'User',
          accountStatus: 'ACTIVE',
          emailVerified: true,
          roles: ['CUSTOMER'],
        });
        return;
      }

      // 4. Locations & Metadata
      if (path.includes('/locations/states')) {
        await fulfillJson(route, 200, [
          { code: 'LA', name: 'Lagos' },
          { code: 'AB', name: 'Abuja' },
        ]);
        return;
      }

      if (path.includes('/locations/cities')) {
        await fulfillJson(route, 200, [
          { id: 'ct-01', stateName: 'Lagos', name: 'Lekki', latitude: null, longitude: null },
          { id: 'ct-02', stateName: 'Lagos', name: 'Ikeja', latitude: null, longitude: null },
        ]);
        return;
      }

      if (path.includes('/amenities')) {
        await fulfillJson(route, 200, [
          { id: 'am-1', code: 'SWIMMING_POOL', name: 'Swimming Pool', category: 'LEISURE', active: true },
          { id: 'am-2', code: 'CCTV', name: '24/7 CCTV & Security', category: 'SECURITY', active: true },
        ]);
        return;
      }

      // 5. Properties & Catalogue
      if (path.includes('/properties')) {
        if (path.endsWith('/featured')) {
          await fulfillJson(route, 200, [mockSearchItem]);
        } else if (path.endsWith('/similar')) {
          await fulfillJson(route, 200, []);
        } else if (path.includes('/offer-101')) {
          await fulfillJson(route, 200, mockDetailItem);
        } else {
          await fulfillJson(route, 200, {
            content: [mockSearchItem],
            page: 0,
            size: 12,
            totalElements: 1,
            totalPages: 1,
            first: true,
            last: true,
          });
        }
        return;
      }

      // 6. Enquiries
      if (path.includes('/enquiries')) {
        if (method === 'POST') {
          await fulfillJson(route, 201, {
            id: 'enq-001',
            offerId: 'offer-101',
            offerTitle: 'Luxury 4 Bedroom Detached Duplex with BQ',
            advertiserType: 'REALTOR',
            advertiserId: 'realtor-01',
            advertiserName: 'Adeola Property Consultants',
            subject: 'Financing options for Lekki duplex',
            message: 'I am interested in this Lekki property. Can we arrange financing?',
            status: 'OPEN',
            realtorReply: null,
            respondedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          await fulfillJson(route, 200, {
            content: [],
            totalElements: 0,
            totalPages: 0,
            page: 0,
            size: 20,
            first: true,
            last: true,
          });
        }
        return;
      }

      // 7. Viewing Requests
      if (path.includes('/viewing-requests') || path.includes('/viewings')) {
        await fulfillJson(route, 200, {
          content: [],
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 20,
          first: true,
          last: true,
        });
        return;
      }

      // 8. Favourites
      if (path.includes('/favourites')) {
        if (path.endsWith('/ids')) {
          await fulfillJson(route, 200, []);
        } else {
          await fulfillJson(route, 200, {
            content: [],
            totalElements: 0,
            totalPages: 0,
            page: 0,
            size: 20,
            first: true,
            last: true,
          });
        }
        return;
      }

      // 9. Notifications
      if (path.includes('/notifications')) {
        if (path.endsWith('/unread-count')) {
          await fulfillJson(route, 200, { unreadCount: 0 });
        } else {
          await fulfillJson(route, 200, {
            content: [],
            totalElements: 0,
            totalPages: 0,
            page: 0,
            size: 20,
            first: true,
            last: true,
          });
        }
        return;
      }

      // 10. Realtor Workspace Endpoints
      if (path.includes('/realtor/dashboard')) {
        await fulfillJson(route, 200, mockRealtorDashboard);
        return;
      }

      if (path.includes('/realtor/offers')) {
        await fulfillJson(route, 200, {
          content: [mockRealtorOffer],
          page: 0,
          size: 15,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        });
        return;
      }

      if (path.includes('/realtor/agencies')) {
        await fulfillJson(route, 200, []);
        return;
      }

      if (path.includes('/realtor/properties')) {
        await fulfillJson(route, 200, []);
        return;
      }

      // 11. Platform Admin & Moderation Endpoints
      if (path.includes('/admin/dashboard')) {
        await fulfillJson(route, 200, mockAdminDashboard);
        return;
      }

      if (path.includes('/admin/moderation/duplicates')) {
        await fulfillJson(route, 200, []);
        return;
      }

      if (path.includes('/admin/moderation/offers')) {
        await fulfillJson(route, 200, {
          content: [mockAdminModerationOffer],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        });
        return;
      }

      if (path.includes('/admin/outbox/process')) {
        await fulfillJson(route, 200, { processedCount: 2 });
        return;
      }

      if (path.includes('/admin/audit-logs')) {
        await fulfillJson(route, 200, {
          content: [
            {
              id: 'audit-001',
              actorUserId: 'admin-001',
              actorEmail: 'admin@akrealtors.test',
              actionType: 'OFFER_APPROVED',
              targetType: 'OFFER',
              targetId: 'off-001',
              summary: 'Approved offer off-001 for public marketplace listing',
              clientIp: '127.0.0.1',
              createdAt: '2026-03-01T12:00:00Z',
            },
          ],
          page: 0,
          size: 25,
          totalElements: 1,
          totalPages: 1,
          first: true,
          last: true,
        });
        return;
      }

      if (path.includes('/admin/settings')) {
        await fulfillJson(route, 200, []);
        return;
      }

      // Universal Safe Fallback
      await fulfillJson(route, 200, {});
    });
  });

  test('Flow 1: Public Discovery, Marketplace Search, and Property Detail Viewing', async ({ page }) => {
    // 1. Visit Home Page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Discover Verified Homes');

    // 2. Visit Property Search Page
    await page.goto('/properties');
    await expect(page.locator('h1')).toContainText('Browse Property Offers');

    // 3. Verify search card renders
    const propertyCard = page.locator('text=Luxury 4 Bedroom Detached Duplex with BQ');
    await expect(propertyCard).toBeVisible();

    // 4. Click into property detail via title link
    await page.click('text=Luxury 4 Bedroom Detached Duplex with BQ');
    await expect(page).toHaveURL('/properties/offer-101');

    // 5. Verify commercial pricing breakdown & details
    await expect(page.locator('text=₦185,000,000').first()).toBeVisible();
    await expect(page.locator('text=Lekki Phase 1, Lekki, Lagos')).toBeVisible();
    await expect(page.locator('text=Adeola Property Consultants')).toBeVisible();
    await expect(page.locator('text=Swimming Pool')).toBeVisible();
  });

  test('Flow 2: Customer Authentication, Enquiry Submission & Viewing Flow', async ({ page }) => {
    activeUserSession = {
      accessToken: 'mock-jwt-customer-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: {
        id: 'cust-001',
        email: 'customer@akrealtors.test',
        phoneNumber: '+2348011112222',
        firstName: 'Chidinma',
        lastName: 'Eze',
        accountStatus: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        roles: ['CUSTOMER'],
        lastLoginAt: '2026-03-01T10:00:00Z',
        createdAt: '2026-03-01T10:00:00Z',
      },
    };

    // 1. Visit Login Page
    await page.goto('/login');
    await page.fill('#login-email', 'customer@akrealtors.test');
    await page.fill('#login-password', 'CustomerPass123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to customer portal
    await expect(page).toHaveURL('/portal');
    await expect(page.locator('h1')).toContainText('Welcome, Chidinma Eze');

    // 2. Navigate to property detail and submit enquiry
    await page.goto('/properties/offer-101');
    await expect(page.locator('h1')).toContainText('Luxury 4 Bedroom Detached Duplex with BQ');

    // Open structured enquiry drawer
    await page.click('button:has-text("Send Structured Enquiry")');

    // Fill enquiry fields
    await page.fill('#enquiry-subject', 'Financing options for Lekki duplex');
    await page.fill('#enquiry-message', 'I am interested in this Lekki property. Can we arrange financing?');
    await page.click('button:has-text("Submit Enquiry")');

    // Assert success feedback
    await expect(
      page.locator('text=Your structured enquiry has been delivered to the advertiser'),
    ).toBeVisible();
  });

  test('Flow 3: Realtor Portal Navigation & Managed Offers Workspace', async ({ page }) => {
    activeUserSession = {
      accessToken: 'mock-jwt-realtor-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: {
        id: 'realtor-001',
        email: 'realtor@prime.test',
        phoneNumber: '+2348030000001',
        firstName: 'Babatunde',
        lastName: 'Ojo',
        accountStatus: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        roles: ['REALTOR'],
        lastLoginAt: '2026-03-01T10:00:00Z',
        createdAt: '2026-03-01T10:00:00Z',
      },
    };

    // 1. Visit Login
    await page.goto('/login');
    await page.fill('#login-email', 'realtor@prime.test');
    await page.fill('#login-password', 'RealtorPass123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to realtor workspace
    await expect(page).toHaveURL('/realtor');
    await expect(page.locator('text=Babatunde Ojo Consultants')).toBeVisible();

    // 2. Go to Realtor Offers Workspace
    await page.goto('/realtor/offers');
    await expect(page.getByRole('heading', { name: 'Managed Property Offers' })).toBeVisible();
    await expect(page.locator('text=Prime Lekki Duplex For Sale')).toBeVisible();
    await expect(page.getByRole('article').getByText('DRAFT')).toBeVisible();
  });

  test('Flow 4: Platform Administration, Moderation Review & Outbox Processing', async ({ page }) => {
    activeUserSession = {
      accessToken: 'mock-jwt-admin-token',
      tokenType: 'Bearer',
      expiresInSeconds: 900,
      user: {
        id: 'admin-001',
        email: 'admin@akrealtors.test',
        phoneNumber: '+2348000000001',
        firstName: 'Kola',
        lastName: 'Balogun',
        accountStatus: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
        roles: ['PLATFORM_ADMIN'],
        lastLoginAt: '2026-03-01T10:00:00Z',
        createdAt: '2026-03-01T10:00:00Z',
      },
    };

    // 1. Visit Login
    await page.goto('/login');
    await page.fill('#login-email', 'admin@akrealtors.test');
    await page.fill('#login-password', 'AdminPass123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin operations dashboard
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Operations Dashboard')).toBeVisible();

    // Trigger Outbox relay processing
    const processBtn = page.locator('button:has-text("Process Outbox Batch Now")');
    await expect(processBtn).toBeVisible();
    await processBtn.click();
    await expect(page.locator('text=Processed 2 outbox event(s)')).toBeVisible();

    // 2. Go to Admin Moderation Queue
    await page.goto('/admin/offers');
    await expect(page.locator('text=Victoria Island Penthouse for Lease')).toBeVisible();
    await expect(page.getByRole('article').getByText('Pending Review')).toBeVisible();

    // 3. Go to Admin Governance & Immutable Audit Log
    await page.goto('/admin/governance');
    await expect(page.locator('h2:has-text("Immutable Audit Trail")')).toBeVisible();
    await expect(page.locator('text=Approved offer off-001 for public marketplace listing')).toBeVisible();
  });

});
