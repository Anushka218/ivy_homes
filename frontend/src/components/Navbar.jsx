import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSaved } from '../context/SavedContext.jsx';

import {
  Home,
  Bookmark,
  LogOut,
  User,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { savedCount } = useSaved();
  const location = useLocation();

  const isListingsActive =
    location.pathname === '/' ||
    location.pathname.startsWith('/listings');

  const isRentalsActive =
    location.pathname.startsWith('/rentals');

  const isProjectsActive =
    location.pathname.startsWith('/projects');

  const isInsightsActive =
    location.pathname.startsWith('/insights');

  const isSavedActive =
    location.pathname === '/saved';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand & Navigation */}
        <div className="flex items-center gap-8">

          {/* Brand */}
          <Link
            to="/listings"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition">
              <Home className="w-5 h-5" />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900">
              Ivy<span className="text-emerald-600">Homes</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">

            {/* Listings */}
            <Link
              to="/listings"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isListingsActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Listings
            </Link>

            {/* Rentals */}
            <Link
              to="/rentals"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isRentalsActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Rentals
            </Link>

            {/* Projects */}
            <Link
              to="/projects"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isProjectsActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Projects
            </Link>

            {/* Insights */}
            <Link
              to="/insights"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isInsightsActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Insights
            </Link>

            {/* Saved */}
            <Link
              to="/saved"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                isSavedActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />

              <span>Saved</span>

              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-xs font-semibold rounded-full bg-emerald-600 text-white">
                  {savedCount}
                </span>
              )}
            </Link>

          </nav>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-3">

          {/* User Email */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700">
            <User className="w-3.5 h-3.5 text-slate-500" />

            <span className="font-medium truncate max-w-[180px]">
              {user?.email || 'User'}
            </span>
          </div>

          {/* Sign Out */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition"
          >
            <LogOut className="w-3.5 h-3.5" />

            <span className="hidden sm:inline">
              Sign Out
            </span>
          </button>

        </div>
      </div>
    </header>
  );
}