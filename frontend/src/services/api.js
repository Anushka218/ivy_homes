/**
 * Centralized API Client (Fetch Wrapper)
 * Features:
 * - Directs calls through /api/* proxy
 * - Injects Authorization: Bearer <access_token> automatically
 * - Handles non-2xx errors cleanly
 * - Intercepts 401 to execute token refresh
 * - Coordinates simultaneous requests via a singleton refresh promise
 * - Retries the original request once upon successful refresh
 * - Guards against infinite refresh loops
 * - Notifies auth failure and clears session if refresh fails
 */

import { authService } from './authService.js';

let activeRefreshPromise = null;

export async function apiClient(endpoint, options = {}, isRetry = false) {
  // Ensure path starts with /api
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = normalizedEndpoint.startsWith('/api')
    ? normalizedEndpoint
    : `/api${normalizedEndpoint}`;

  const headers = { ...(options.headers || {}) };

  // Set default Content-Type for JSON payloads
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach access token if available and not overridden
  const session = authService.getSession();
  if (session?.accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    const error = new Error(`Network error: ${networkError.message}`);
    error.isNetworkError = true;
    throw error;
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    const isAuthRoute =
      url.includes('/auth/login') || url.includes('/auth/refresh');

    // Never attempt token refresh on login/refresh routes or on repeated failure
    if (isAuthRoute || isRetry) {
      if (!isAuthRoute) {
        authService.notifyAuthFailure();
      }
      const errData = await parseResponseData(response);
      const err = new Error(
        errData?.detail || errData?.message || 'Authentication session has expired.'
      );
      err.status = 401;
      err.data = errData;
      throw err;
    }

    // Proactively coordinate token refresh across any concurrent requests
    try {
      if (!activeRefreshPromise) {
        activeRefreshPromise = (async () => {
          try {
            const currentSession = authService.getSession();
            if (!currentSession?.refreshToken) {
              throw new Error('No refresh token available');
            }
            const newSession = await authService.refresh(currentSession.refreshToken);
            return newSession;
          } finally {
            activeRefreshPromise = null;
          }
        })();
      }

      // Wait for the singleton refresh to complete
      const refreshedSession = await activeRefreshPromise;

      // Retry the original request once with the new access token
      const retryHeaders = {
        ...options.headers,
        Authorization: `Bearer ${refreshedSession.accessToken}`,
      };

      if (options.body && typeof options.body === 'string' && !retryHeaders['Content-Type']) {
        retryHeaders['Content-Type'] = 'application/json';
      }

      return apiClient(endpoint, { ...options, headers: retryHeaders }, true);
    } catch (refreshErr) {
      authService.notifyAuthFailure();
      const err = new Error('Session could not be renewed. Please log in again.');
      err.status = 401;
      err.cause = refreshErr;
      throw err;
    }
  }

  const data = await parseResponseData(response);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status} (${response.statusText})`;
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message));
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Helper to safely extract response body (JSON or text)
 */
async function parseResponseData(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    return await response.text();
  } catch {
    return null;
  }
}

