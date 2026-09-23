import axios from 'axios';
import { STORAGE_KEYS } from '../storage/storageKeys';

/**
 * Axios client — wired to the real FastAPI backend.
 *
 * Base URL is read from VITE_API_BASE_URL (set in .env).
 * The request interceptor attaches the Bearer token from bw_user on every call.
 * The response interceptor clears auth state on 401 so stale tokens don't persist.
 */

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token when present
axiosClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (raw) {
    try {
      const user = JSON.parse(raw) as { token?: string };
      if (user.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`;
      }
    } catch {
      // malformed storage — ignore
    }
  }
  return config;
});

// Response interceptor — on 401, wipe persisted auth so the next ProtectedRoute
// render redirects to /login rather than looping on the expired token.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl: string = error?.config?.url ?? '';
      const hadToken = !!(error?.config?.headers?.['Authorization']);
      // Only wipe auth if the request was authenticated AND is not the /auth/me
      // boot probe — avoids logging out when a refresh-on-load gets a stale token.
      if (hadToken && !requestUrl.includes('/auth/me')) {
        Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
      }
    }
    if (import.meta.env.DEV) {
      console.error('[axiosClient]', error?.response?.status, error?.message);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
