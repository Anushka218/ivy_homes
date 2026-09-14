import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/api';
import {
  Home,
  LogOut,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  User,
  Zap,
} from 'lucide-react';

export function DashboardPlaceholder() {
  const { user, logout, expiresAt, refreshSession } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLog, setActionLog] = useState([]);
  const [testStatus, setTestStatus] = useState(null);

  // Live countdown timer for access token expiry
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const addLog = (msg, type = 'info') => {
    setActionLog((prev) => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), msg, type },
      ...prev.slice(0, 9),
    ]);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setTestStatus('Refreshing...');
    try {
      const newSession = await refreshSession();
      addLog(`Token refreshed successfully. New expiry in ${Math.round((newSession.expiresAt - Date.now()) / 1000)}s`, 'success');
      setTestStatus('Refresh succeeded!');
    } catch (err) {
      addLog(`Manual refresh failed: ${err.message}`, 'error');
      setTestStatus(`Error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Test 401 Reactive Refresh & Request Replay:
   * Sends a request to /api/v1/listings with an intentionally invalid Authorization header.
   * Proves that apiClient intercepts 401, calls refresh, and replays request!
   */
  const handleTest401Interception = async () => {
    setIsRefreshing(true);
    setTestStatus('Testing 401 reactive refresh...');
    addLog('Injecting bad authorization header to trigger 401 interceptor...', 'warn');

    try {
      // apiClient will catch 401 from this bad header, call /api/auth/refresh, update token, and retry with valid token!
      const result = await apiClient('/v1/listings?limit=1', {
        headers: {
          Authorization: 'Bearer invalid_expired_test_token_123',
        },
      });

      addLog(`401 intercepted & refreshed! Replayed request succeeded (retrieved ${result.results?.length} listing).`, 'success');
      setTestStatus('401 Reactive Refresh & Replay Verified!');
    } catch (err) {
      addLog(`Test failed: ${err.message}`, 'error');
      setTestStatus(`Test failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Ivy<span className="text-emerald-600">Homes</span>
            </span>
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Phase 1: Foundation & Auth
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium">{user?.email || 'Logged In'}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Authentication & Foundation Active
              </h1>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Logged in as <span className="font-medium text-slate-700">{user?.email}</span>. Session survived browser initialization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Token Expiry in:</span>
              <span className="font-mono font-bold">{formatTime(secondsRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Security & Architecture Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Zero API Key Leak</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">IVY_API_KEY</code> is injected server-side by the proxy. No client-side exposure in bundle.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Proactive Refresh</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Background timer refreshes token automatically at 13m (2m buffer before 15m expiration) for 30+ min continuous use.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Reactive 401 Handler</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Centralized <code className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded">apiClient</code> intercepts 401s, refreshes once via mutex, and replays requests.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Verification Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Interactive Architecture Verification
            </h2>
            <p className="text-xs text-slate-500">
              Test token refresh mechanics and verify Phase 1 requirements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Test Proactive Refresh Now
            </button>

            <button
              onClick={handleTest401Interception}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              Test 401 Reactive Refresh & Replay
            </button>
          </div>

          {testStatus && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
              Status: {testStatus}
            </div>
          )}

          {/* Activity Log */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Session Event Log:</h4>
            {actionLog.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No actions recorded yet.</p>
            ) : (
              <ul className="space-y-1.5 font-mono text-xs">
                {actionLog.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 ${
                      item.type === 'success'
                        ? 'text-emerald-700'
                        : item.type === 'error'
                        ? 'text-rose-700'
                        : item.type === 'warn'
                        ? 'text-amber-700'
                        : 'text-slate-600'
                    }`}
                  >
                    <span className="text-slate-400">[{item.time}]</span>
                    <span>{item.msg}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

