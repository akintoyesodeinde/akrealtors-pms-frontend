# AkRealtors PMS — Frontend Web Application (`akrealtors-pms-frontend`)

Standalone **React 19 + TypeScript (Strict Mode) + Vite** web application for **AkRealtors PMS**, a multi-realtor property marketplace tailored for Nigeria (`NGN`, residential & commercial sales, rentals, and leases).

## Repository Separation
This repository contains **only** the standalone frontend SPA, design system, Vitest component tests, Playwright E2E suite, and frontend deployment configuration.
- **Frontend Repository:** `https://github.com/akintoyesodeinde/akrealtors-pms-frontend`
- **Backend Repository:** `https://github.com/akintoyesodeinde/akrealtors-pms-backend`

## Prerequisites
- **Node.js 22 LTS** and **npm 10+**
- Running `akrealtors-pms-backend` instance on `http://localhost:8080` for live API workflows and E2E tests.

## Quick Local Development Setup

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Configure environment (public variables only — never store secrets in `.env`):**
   ```bash
   cp .env.example .env
   ```

3. **Start the Vite dev server (`http://localhost:5173`):**
   ```bash
   npm run dev
   ```

4. **Quality & Test Gates:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test:run
   npm run build
   npm run test:e2e
   ```
