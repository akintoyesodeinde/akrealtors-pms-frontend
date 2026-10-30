# AkRealtors PMS — Frontend Architecture Document

## 1. Architectural Philosophy & Technology Stack

The AkRealtors PMS frontend is built as a standalone Single Page Application (SPA) using **React 19**, **TypeScript** (with `strict: true` and `noUncheckedIndexedAccess: true`), **Vite 6**, and **Tailwind CSS v4**.

- **Zero Global State Bloat**: Server state is managed via **TanStack Query v5** (React Query). Form state is managed via **React Hook Form** paired with **Zod** schema validation. Authentication session is stored in memory via a dedicated React Context (`AuthContext`). Redux and other bulky global state stores are intentionally omitted.
- **Client Route Separation**:
  - `/` — Public marketplace, search filters, side-by-side comparison, photo/video gallery, legal/NDPA pages.
  - `/portal/*` — Authenticated customer portal (favourites, enquiries, viewing requests, notifications).
  - `/realtor/*` — Authenticated realtor workspace (dashboard, property creator wizard, offer wizard, direct S3 upload).
  - `/agency/*` — Authenticated agency management workspace (staff roster, invite members).
  - `/admin/*` — Authenticated moderation and platform management (moderation queue, verification review, abuse reports, audit log viewer, platform settings).

---

## 2. Directory Layout & Module Structure

```
src/
├── api/              # Axios HTTP client, token memory interceptor, API contracts
│   ├── client.ts         # Axios instance, refresh mutex, 401 interception
│   ├── contracts.ts      # TypeScript interfaces matching backend DTOs & RFC 9457
│   ├── authApi.ts        # Login, register, refresh, logout, password recovery
│   ├── publicApi.ts      # Public discovery, search criteria, featured offers
│   ├── customerApi.ts    # Favourites, enquiries, viewing bookings, notifications
│   ├── realtorApi.ts     # Property & offer creation, dashboard, S3 upload confirmation
│   └── adminApi.ts       # Moderation, verification audit, abuse resolution, settings
├── components/       # Reusable UI components (buttons, badges, modals, pagination)
├── context/          # AuthContext (in-memory access token, user profile, logout)
├── features/         # Feature-specific page components and workflows
│   ├── public/           # Marketplace, SearchResults, OfferDetail, CompareModal
│   ├── customer/         # CustomerDashboard, FavouritesList, EnquiriesView
│   ├── realtor/          # RealtorDashboard, PropertyWizard, OfferWizard, S3Dropzone
│   ├── agency/           # AgencyDashboard, MemberManagement
│   └── admin/            # AdminDashboard, OfferModeration, VerificationQueue, AbuseReports
├── routes/           # Role-gated route guards (ProtectedRoute, AdminRoutes, RealtorRoutes)
└── test/             # Vitest test setup, mock data factories, and MSW handlers
```

---

## 3. Server State & Cache Management

TanStack Query manages all remote asynchronous data with deterministic invalidation keys:
- `['properties', 'search', criteria]` — Cached public search queries.
- `['properties', 'detail', id]` — Individual listing detail and gallery.
- `['me', 'favourites']` — Saved favourite properties list.
- `['me', 'enquiries']` — Customer enquiry conversation threads.
- `['realtor', 'dashboard']` — Realtor workspace analytics.
- `['admin', 'moderation', 'pending']` — Unreviewed listings queue.

Mutating operations (e.g. submitting an offer, sending an enquiry) automatically invalidate their respective query keys, guaranteeing UI freshness without manual page refreshes.

---

## 4. Form Validation & Security Standards

All user-submitted forms use **React Hook Form** with **Zod** resolvers:
1. Every input constraint (pricing positive numbers, valid currency, date ranges, bio lengths) mirrors backend Jakarta Bean Validation rules.
2. Direct S3 media uploads compute client-side SHA-256 hashes via `window.crypto.subtle.digest("SHA-256", bytes)` to guarantee payload integrity during upload confirmation.
3. Access tokens are held **strictly in JavaScript memory**; no tokens are stored in `localStorage` or `sessionStorage`.
