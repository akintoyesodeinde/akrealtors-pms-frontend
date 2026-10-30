# AkRealtors PMS — Frontend Deployment Guide

## 1. Production Build & Bundling

The frontend single-page application is compiled using Vite into an optimized static distribution:

```bash
# Typecheck TypeScript codebase
npm run typecheck

# Lint source files
npm run lint

# Build production assets in dist/
npm run build
```

The output `dist/` contains minified JavaScript chunks with content hashes, compressed CSS, and static assets ready for CDN hosting.

---

## 2. Environment Variables

| Variable | Required | Default / Example | Purpose |
|---|:---:|---|---|
| `VITE_API_BASE_URL` | Yes | `https://api.akrealtors.ng/api/v1` | Backend API base path. |
| `VITE_PUBLIC_CDN_URL`| Yes | `https://cdn.akrealtors.ng` | CDN host for property photos and videos. |

---

## 3. Production Web Server (Nginx) Configuration

Because React Router uses HTML5 history mode (`createBrowserRouter`), the production web server must route all non-file requests back to `index.html`:

```nginx
server {
    listen 80;
    server_name akrealtors.ng www.akrealtors.ng;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name akrealtors.ng www.akrealtors.ng;

    ssl_certificate /etc/letsencrypt/live/akrealtors.ng/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/akrealtors.ng/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://cdn.akrealtors.ng; media-src 'self' https://cdn.akrealtors.ng; connect-src 'self' https://api.akrealtors.ng;" always;

    # Cache static assets with content hashes
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 4. Docker Containerization

```dockerfile
# Stage 1: Build static assets
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
