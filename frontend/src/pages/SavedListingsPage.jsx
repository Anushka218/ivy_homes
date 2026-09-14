import React from 'react';
import {
  Bookmark,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Navbar } from '../components/Navbar.jsx';
import { ListingCard } from '../components/ListingCard.jsx';
import { useSaved } from '../context/SavedContext.jsx';

export function SavedListingsPage() {
  const {
    savedListings,
    loading,
    error,
    refreshSaved,
  } = useSaved();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Your shortlist
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Saved listings
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Saved on your IvyHomes account and restored from the server after reload.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-700 flex justify-between gap-3">
            <span>{error}</span>

            <button
              onClick={refreshSaved}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="min-h-64 grid place-items-center">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          </div>
        ) : savedListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">

            <Bookmark className="w-8 h-8 mx-auto text-slate-300" />

            <h2 className="font-semibold text-slate-900 mt-3">
              No saved listings yet
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Save a property from the listings page to see it here.
            </p>

            <Link
              to="/listings"
              className="inline-block mt-5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedListings.map(
              (listing) => (
                <ListingCard
                  key={listing.listing_id}
                  listing={listing}
                />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}