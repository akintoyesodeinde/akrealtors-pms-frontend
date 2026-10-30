# AkRealtors PMS — Frontend Web Application (`akrealtors-pms-frontend`)

Standalone **React 19 + TypeScript (Strict Mode) + Vite 6 + Tailwind CSS v4** web application for **AkRealtors PMS**, a production-grade multi-realtor property marketplace tailored for Nigeria (`NGN`, residential & commercial sales, rentals, and leases).

## Repository Separation
This repository contains **only** the standalone frontend SPA, design system, Vitest component tests, Playwright E2E suite, and frontend deployment configuration.
- **Frontend Repository:** `https://github.com/akintoyesodeinde/akrealtors-pms-frontend`
- **Backend Repository:** `https://github.com/akintoyesodeinde/akrealtors-pms-backend`

---

## Technical Documentation
Detailed architectural and operational documentation is available in [`docs/`](./docs):
- [Frontend Architecture & Component System](./docs/FRONTEND_ARCHITECTURE.md)
- [API Integration & S3 Direct Upload Guide](./docs/API_INTEGRATION_GUIDE.md)
- [Production Deployment & Nginx Configuration](./docs/DEPLOYMENT_GUIDE.md)

---

## Prerequisites
- **Node.js 22 LTS** and **npm 10+**
- Running `akrealtors-pms-backend` API on `http://localhost:8080/api/v1`

---

## Quick Local Development Setup

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Start the Vite development server (`http://localhost:5173`):**
   ```bash
   npm run dev
   ```

3. **Quality & Test Commands:**
   ```bash
   # Run ESLint checks
   npm run lint

   # Type-check with TypeScript compiler
   npm run typecheck

   # Run Vitest test suite
   npm run test:run

   # Build optimized production bundle
   npm run build

   # Run Playwright end-to-end tests
   npm run test:e2e
   ```
