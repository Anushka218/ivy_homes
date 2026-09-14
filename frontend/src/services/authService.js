/**
 * Authentication Service
 * Manages API calls for login/refresh and localStorage token persistence.
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ivy_access_token',
  REFRESH_TOKEN: 'ivy_refresh_token',
  USER: 'ivy_user',
  EXPIRES_AT: 'ivy_expires_at',
};

let authFailureListeners = [];

export const authService = {
  /**
   * Register a listener for auth failure events (e.g., failed refresh)
   */
  onAuthFailure(listener) {
    authFailureListeners.push(listener);
    return () => {
      authFailureListeners = authFailureListeners.filter((l) => l !== listener);
    };
  },

  /**
   * Notify all registered listeners that authentication has failed
   */
  notifyAuthFailure() {
    this.clearSession();
    authFailureListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in auth failure listener:', err);
      }
    });
  },

  /**
   * Save session data into localStorage
   */
  saveSession(authData) {
    if (!authData?.access_token) return;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.access_token);

    if (authData.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
    }

    if (authData.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
    }

    const expiresInSec = Number(authData.expires_in) || 900;
    const expiresAt = Date.now() + expiresInSec * 1000;
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));

    return {
      accessToken: authData.access_token,
      refreshToken: authData.refresh_token,
      user: authData.user,
      expiresAt,
    };
  },

  /**
   * Retrieve current session from localStorage
   */
  getSession() {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !refreshToken) {
      return null;
    }

    let user = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson);
      } catch {
        user = null;
      }
    }

    const expiresAt = expiresAtStr ? Number(expiresAtStr) : 0;

    return {
      accessToken,
      refreshToken,
      user,
      expiresAt,
    };
  },

  /**
   * Clear session data from localStorage
   */
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  },

  /**
   * Check if the current access token is expired or expiring within bufferSeconds
   */
  isTokenExpired(bufferSeconds = 60) {
    const session = this.getSession();
    if (!session || !session.expiresAt) return true;
    return Date.now() >= session.expiresAt - bufferSeconds * 1000;
  },

  /**
   * Perform real login against /api/auth/login
   */
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.error ||
        data?.message ||
        `Login failed with status ${response.status}`;
      throw new Error(message);
    }

    return this.saveSession(data);
  },

  /**
   * Perform refresh against /api/auth/refresh
   */
  async refresh(refreshToken) {
    const token = refreshToken || this.getSession()?.refreshToken;

    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: token }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.error ||
        data?.message ||
        `Refresh failed with status ${response.status}`;
      throw new Error(message);
    }

    return this.saveSession(data);
  },
};

