import React from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { Navbar } from '../components/Navbar.jsx';
import { ListingCard } from '../components/ListingCard.jsx';
import { ListingFilters } from '../components/ListingFilters.jsx';
import { useListings } from '../hooks/useListings.js';

export function ListingsPage() {
  const {
    listings,
    totalMatching,
    totalLoaded,
    hasMore,
    loadMore,
    filters,
    updateFilter,
    clearFilters,
    availableLocalities,
    isLoadingInitial,
    isHydrating,
    isHydrated,
    error,
  } = useListings();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Chennai · Anna Nagar
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Find a home
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Browse real listings and filter them using the observed API data.
          </p>
        </div>

        <ListingFilters
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          localities={availableLocalities}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {totalMatching.toLocaleString('en-IN')} matching listings
            </p>

            <p className="text-xs text-slate-500 mt-0.5">
              {isHydrated
                ? `${totalLoaded.toLocaleString('en-IN')} records loaded`
                : `Loading dataset · ${totalLoaded.toLocaleString('en-IN')} records so far`}
            </p>
          </div>

          {isHydrating && (
            <span className="inline-flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Syncing remaining listings…
            </span>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Could not load listings
              </p>

              <p className="mt-0.5">
                {error}
              </p>
            </div>
          </div>
        )}

        {isLoadingInitial ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-72 rounded-2xl bg-white border border-slate-200 animate-pulse"
                />
              )
            )}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="font-semibold text-slate-900">
              No listings match these filters
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Try widening the price range or clearing one of the filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.listing_id}
                  listing={listing}
                />
              ))}
            </div>

            <div className="flex justify-center mt-8">
              {hasMore ? (
                <button
                  onClick={loadMore}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Load more
                </button>
              ) : (
                <p className="text-xs text-slate-400">
                  End of matching results
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}