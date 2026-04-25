import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token storage (in-memory) ────────────────────────────────────────────────
// Access token lives only in memory — never in localStorage or cookies.
// Refresh token is stored in localStorage for persistence across page refreshes.
// For an internal tool this is an acceptable tradeoff.

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  setAccessToken: (token: string | null) => { accessToken = token; },
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setRefreshToken: (token: string | null) => {
    if (token) localStorage.setItem('refreshToken', token);
    else localStorage.removeItem('refreshToken');
  },
  clear: () => {
    accessToken = null;
    localStorage.removeItem('refreshToken');
  },
};

// ─── Request interceptor — attach access token ────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401, refresh, retry ───────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // if a refresh is already in flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStore.getRefreshToken();

    if (!refreshToken) {
      // no refresh token — force logout
      tokenStore.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'}/auth/refresh`,
        { refreshToken }
      );

      const newAccessToken: string = data.data.accessToken;
      tokenStore.setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenStore.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
