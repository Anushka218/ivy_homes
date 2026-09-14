/**
 * AuthContext
 * Manages authentication state, session restoration, proactive refresh timer,
 * and user login/logout lifecycle.
 */

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const proactiveTimerRef = useRef(null);

  /**
   * Clear any existing proactive refresh timer
   */
  const clearProactiveTimer = useCallback(() => {
    if (proactiveTimerRef.current) {
      clearTimeout(proactiveTimerRef.current);
      proactiveTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule proactive refresh 2 minutes before the 15-minute access token expires
   */
  const scheduleProactiveRefresh = useCallback(
    (targetExpiresAt) => {
      clearProactiveTimer();

      if (!targetExpiresAt) return;

      // Refresh 120 seconds (2 mins) before token expiration
      const refreshBufferMs = 120 * 1000;
      const msUntilRefresh = targetExpiresAt - Date.now() - refreshBufferMs;

      const delay = Math.max(msUntilRefresh, 5000); // at least 5s in the future

      proactiveTimerRef.current = setTimeout(async () => {
        try {
          const newSession = await authService.refresh();
          if (newSession) {
            setUser(newSession.user);
            setExpiresAt(newSession.expiresAt);
            scheduleProactiveRefresh(newSession.expiresAt);
          }
        } catch (err) {
          console.warn('Proactive token refresh encountered error:', err.message);
          // If proactive fails, the reactive 401 interceptor remains as the second safety line
        }
      }, delay);
    },
    [clearProactiveTimer]
  );

  /**
   * Log out and clear state
   */
  const logout = useCallback(() => {
    clearProactiveTimer();
    authService.clearSession();
    setUser(null);
    setExpiresAt(null);
    setAuthError(null);
  }, [clearProactiveTimer]);

  /**
   * Perform login
   */
  const login = useCallback(
    async (email, password) => {
      setAuthError(null);
      try {
        const session = await authService.login(email, password);
        setUser(session.user);
        setExpiresAt(session.expiresAt);
        scheduleProactiveRefresh(session.expiresAt);
        return session;
      } catch (err) {
        setAuthError(err.message || 'Login failed');
        throw err;
      }
    },
    [scheduleProactiveRefresh]
  );

  /**
   * Explicitly refresh the current session
   */
  const refreshSession = useCallback(async () => {
    try {
      const session = await authService.refresh();
      setUser(session.user);
      setExpiresAt(session.expiresAt);
      scheduleProactiveRefresh(session.expiresAt);
      return session;
    } catch (err) {
      logout();
      throw err;
    }
  }, [logout, scheduleProactiveRefresh]);

  /**
   * Bootstrap session from localStorage on app mount
   */
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const stored = authService.getSession();

      if (!stored) {
        if (isMounted) setLoading(false);
        return;
      }

      // Check if token is expired or close to expiry (within 60 seconds)
      const needsImmediateRefresh = authService.isTokenExpired(60);

      if (needsImmediateRefresh) {
        try {
          const refreshed = await authService.refresh(stored.refreshToken);
          if (isMounted) {
            setUser(refreshed.user);
            setExpiresAt(refreshed.expiresAt);
            scheduleProactiveRefresh(refreshed.expiresAt);
          }
        } catch {
          if (isMounted) {
            authService.clearSession();
            setUser(null);
            setExpiresAt(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(stored.user);
          setExpiresAt(stored.expiresAt);
          scheduleProactiveRefresh(stored.expiresAt);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    restoreSession();

    // Register listener for unrecoverable 401s from api client
    const unregister = authService.onAuthFailure(() => {
      if (isMounted) {
        logout();
      }
    });

    return () => {
      isMounted = false;
      clearProactiveTimer();
      unregister();
    };
  }, [clearProactiveTimer, logout, scheduleProactiveRefresh]);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    expiresAt,
    loading,
    authError,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

