import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.jsx';
import { SavedProvider } from './context/SavedContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { LoginPage } from './pages/LoginPage.jsx';
import { ListingsPage } from './pages/ListingsPage.jsx';
import { ListingDetailPage } from './pages/ListingDetailPage.jsx';
import { SavedListingsPage } from './pages/SavedListingsPage.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          Verifying session...
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/listings" replace />}
              />

              <Route
                path="/listings"
                element={<ListingsPage />}
              />

              <Route
                path="/listings/:listingId"
                element={<ListingDetailPage />}
              />

              <Route
                path="/saved"
                element={<SavedListingsPage />}
              />

              <Route
                path="*"
                element={<Navigate to="/listings" replace />}
              />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedProvider>
          <AppRoutes />
        </SavedProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}