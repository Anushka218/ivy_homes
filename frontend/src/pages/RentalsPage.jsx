import React, { useEffect, useMemo, useState } from 'react';
import {
  BedDouble,
  Building2,
  Loader2,
  MapPin,
  RefreshCw,
} from 'lucide-react';

import { Navbar } from '../components/Navbar.jsx';
import { rentalsService } from '../services/rentalsService.js';
import { formatINR, formatCompactINR } from '../utils/priceFormatter.js';

const DISPLAY_PAGE_SIZE = 24;

export function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [filters, setFilters] = useState({
    locality: 'all',
    bedrooms: 'all',
    furnishing: 'all',
    minRent: '',
    maxRent: '',
  });

  const [displayCount, setDisplayCount] =
    useState(DISPLAY_PAGE_SIZE);

  const [loading, setLoading] = useState(true);
  const [hydrating, setHydrating] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      rentalsService.subscribe((status) => {
        if (!mounted) return;

        setRentals(
          rentalsService.getCachedRentals()
        );

        setHydrating(!status.isComplete);
      });

    rentalsService
      .getInitialRentals()
      .then((data) => {
        if (!mounted) return;

        setRentals([...data]);
        setHydrating(
          !rentalsService.isHydrated()
        );
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err.message || 'Failed to load rentals'
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const filteredRentals = useMemo(
    () =>
      rentalsService.applyFilters(
        rentals,
        filters
      ),
    [rentals, filters]
  );

  const visibleRentals = filteredRentals.slice(
    0,
    displayCount
  );

  const hasMore =
    visibleRentals.length <
    filteredRentals.length;

  const localities =
    rentalsService.getAvailableLocalities();

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setDisplayCount(DISPLAY_PAGE_SIZE);
  }

  function clearFilters() {
    setFilters({
      locality: 'all',
      bedrooms: 'all',
      furnishing: 'all',
      minRent: '',
      maxRent: '',
    });

    setDisplayCount(DISPLAY_PAGE_SIZE);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Chennai · Rentals
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Find a rental
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Browse rental properties using the observed API data.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select
              value={filters.locality}
              onChange={(e) =>
                updateFilter(
                  'locality',
                  e.target.value
                )
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">
                All localities
              </option>

              {localities.map((locality) => (
                <option
                  key={locality}
                  value={locality}
                >
                  {locality.replace(
                    /\b\w/g,
                    (char) => char.toUpperCase()
                  )}
                </option>
              ))}
            </select>

            <select
              value={filters.bedrooms}
              onChange={(e) =>
                updateFilter(
                  'bedrooms',
                  e.target.value
                )
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">
                Any BHK
              </option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4+">4+ BHK</option>
            </select>

            <select
              value={filters.furnishing}
              onChange={(e) =>
                updateFilter(
                  'furnishing',
                  e.target.value
                )
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">
                Any furnishing
              </option>
              <option value="furnished">
                Furnished
              </option>
              <option value="semi-furnished">
                Semi furnished
              </option>
              <option value="unfurnished">
                Unfurnished
              </option>
            </select>

            <input
              type="number"
              placeholder="Min rent"
              value={filters.minRent}
              onChange={(e) =>
                updateFilter(
                  'minRent',
                  e.target.value
                )
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Max rent"
              value={filters.maxRent}
              onChange={(e) =>
                updateFilter(
                  'maxRent',
                  e.target.value
                )
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Clear filters
          </button>
        </section>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {filteredRentals.length.toLocaleString(
                'en-IN'
              )}{' '}
              matching rentals
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {rentals.length.toLocaleString(
                'en-IN'
              )}{' '}
              records loaded
            </p>
          </div>

          {hydrating && (
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading remaining rentals…
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4 mb-5 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse"
                />
              )
            )}
          </div>
        ) : visibleRentals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="font-semibold text-slate-900">
              No rentals match these filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleRentals.map((rental) => {
                const title =
                  rental.apartment_name ||
                  rental.title ||
                  'Rental Property';

                const locality =
                  rental.locality ||
                  'Chennai';

                return (
                  <article
                    key={rental.listing_id}
                    className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-emerald-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCompactINR(
                            rental.price
                          )}
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            / month
                          </span>
                        </p>

                        <p className="text-xs text-slate-500 font-mono mt-1">
                          {formatINR(
                            rental.price
                          )}
                        </p>
                      </div>

                      <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>

                    <h2 className="font-semibold text-slate-900 mt-4">
                      {title}
                    </h2>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {locality}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <BedDouble className="w-4 h-4 text-slate-400" />
                        {rental.bedroom ?? 'N/A'} BHK
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong>
                          {rental.carpet_area ?? 'N/A'}
                        </strong>{' '}
                        sq.ft carpet
                      </div>

                      <div className="text-xs text-slate-600">
                        <strong>
                          {rental.super_builtup_area ??
                            'N/A'}
                        </strong>{' '}
                        sq.ft built-up
                      </div>

                      <div className="text-xs text-slate-600 capitalize">
                        {rental.furnishing ||
                          'Unspecified'}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() =>
                    setDisplayCount(
                      (count) =>
                        count + DISPLAY_PAGE_SIZE
                    )
                  }
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}