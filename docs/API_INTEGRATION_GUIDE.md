# AkRealtors PMS — Frontend API Integration Guide

## 1. HTTP Client & Token Memory Architecture

The application communicates with the backend via a centralized Axios instance configured with `withCredentials: true`:

```typescript
// src/api/client.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});
```

### 1.1 In-Memory Bearer Token Injection
Access tokens are held strictly in memory by a module-level variable and injected dynamically:
```typescript
let inMemoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

apiClient.interceptors.request.use((config) => {
  if (inMemoryAccessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});
```

### 1.2 Automatic Refresh Mutex
When an API request returns `401 Unauthorized`, an Axios response interceptor prevents cascading login prompts by queuing requests and executing a single background refresh:
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { accessToken } = await refreshAuthToken();
        setAccessToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 2. Direct S3 Upload Pipeline with Web Crypto SHA-256

Listing media and private verification evidence are uploaded directly to S3 storage to avoid overloading the application server:

1. **Upload Intent Request**:
   The client requests a presigned S3 URL from the backend:
   ```typescript
   const intent = await requestUploadIntent(propertyId, {
     category: 'INTERIOR',
     fileName: file.name,
     contentType: file.type,
     sizeBytes: file.size,
   });
   ```
2. **Direct PUT to S3**:
   The file bytes are streamed directly to the S3 bucket using the presigned URL:
   ```typescript
   await axios.put(intent.presignedUploadUrl, file, {
     headers: {
       'Content-Type': file.type,
     },
   });
   ```
3. **Client-Side SHA-256 Checksum Calculation**:
   ```typescript
   const buffer = await file.arrayBuffer();
   const digest = await window.crypto.subtle.digest('SHA-256', buffer);
   const hashHex = Array.from(new Uint8Array(digest))
     .map((b) => b.toString(16).padStart(2, '0'))
     .join('');
   ```
4. **Backend Confirmation**:
   The client confirms the upload with the computed hash, prompting the backend to verify the file and generate thumbnails:
   ```typescript
   await confirmMediaUpload(propertyId, intent.mediaId, { sha256Checksum: hashHex });
   ```

---

## 3. RFC 9457 ProblemDetail Handling

API error responses return RFC 9457 `ProblemDetail`. Frontend services parse `error.response?.data` to surface user-friendly toast alerts and highlight specific form inputs matching `fieldErrors`:

```typescript
export interface ProblemDetail {
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errorCode: string;
  fieldErrors?: Array<{ field: string; message: string }>;
}
```
