import React, {
  useEffect,
  useState,
} from 'react';

import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Loader2,
  MapPin,
} from 'lucide-react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import { Navbar } from '../components/Navbar.jsx';
import { useSaved } from '../context/SavedContext.jsx';
import { listingsService } from '../services/listingsService.js';

import {
  formatCompactINR,
  formatINR,
  formatPricePerSqft,
} from '../utils/priceFormatter.js';

function pretty(value) {
  if (value == null || value === '') {
    return 'Not provided';
  }

  return String(value).replace(
    /\b\w/g,
    (c) => c.toUpperCase()
  );
}

export function ListingDetailPage() {
  const { listingId } = useParams();

  const [listing, setListing] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const {
    isSaved,
    isSaving,
    toggleSave,
  } = useSaved();

  useEffect(() => {
    let mounted = true;

    async function loadListing() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await listingsService.getListingById(
            decodeURIComponent(listingId)
          );

        if (!mounted) {
          return;
        }

        if (!result) {
          throw new Error(
            'Listing not found'
          );
        }

        setListing(result);
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              'Unable to load listing'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadListing();

    return () => {
      mounted = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-[70vh] grid place-items-center">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        </div>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Listing unavailable
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            {error ||
              'The listing could not be found.'}
          </p>

          <Link
            to="/listings"
            className="inline-block mt-5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
          >
            Back to listings
          </Link>
        </main>
      </>
    );
  }

  const saved = isSaved(
    listing.listing_id
  );

  const saving = isSaving(
    listing.listing_id
  );

  const ppsf =
    formatPricePerSqft(
      listing.price,
      listing.carpet_area
    );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7">

        <Link
          to="/listings"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>

        <section className="mt-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

          <div className="p-6 sm:p-8">

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">

              <div>
                <div className="flex gap-2 mb-3">

                  {listing.is_live === true && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      Live
                    </span>
                  )}

                  {listing.is_verified === true && (
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {listing.apartment_name ||
                    listing.title ||
                    'Residential Property'}
                </h1>

                <p className="mt-2 text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {pretty(listing.locality)},
                  Chennai
                </p>
              </div>

              <button
                onClick={() =>
                  toggleSave(listing)
                }
                disabled={saving}
                className={`shrink-0 px-4 py-2.5 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 ${
                  saved
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 text-slate-700 hover:border-emerald-400'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark
                    className={
                      saved
                        ? 'w-4 h-4 fill-current'
                        : 'w-4 h-4'
                    }
                  />
                )}

                {saved
                  ? 'Saved'
                  : 'Save listing'}
              </button>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-6">

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Price
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {formatCompactINR(
                    listing.price
                  )}
                </p>

                <p className="text-sm text-slate-500">
                  {formatINR(
                    listing.price
                  )}

                  {ppsf
                    ? ` · ${ppsf}`
                    : ''}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Configuration
                </p>

                <p className="text-xl font-semibold text-slate-900 mt-1">
                  {listing.bedroom ?? '—'} BHK ·{' '}
                  {listing.bathroom ?? '—'} baths
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">

              {[
                [
                  'Carpet area',
                  listing.carpet_area
                    ? `${listing.carpet_area} sq.ft.`
                    : null,
                ],

                [
                  'Super built-up',
                  listing.super_built_up_area
                    ? `${listing.super_built_up_area} sq.ft.`
                    : null,
                ],

                [
                  'Floor',
                  listing.floor != null
                    ? `${listing.floor}${
                        listing.total_floors != null
                          ? ` / ${listing.total_floors}`
                          : ''
                      }`
                    : null,
                ],

                [
                  'Furnishing',
                  pretty(
                    listing.furnishing
                  ),
                ],
              ].map(
                ([name, value]) => (
                  <div key={name}>
                    <p className="text-xs text-slate-400">
                      {name}
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-1">
                      {value ||
                        'Not provided'}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-8">
              <h2 className="font-semibold text-slate-900">
                Description
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 whitespace-pre-line">
                {listing.description ||
                  'No description provided.'}
              </p>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-sm">

              <div>
                <span className="text-slate-400">
                  Property type:
                </span>{' '}
                <span className="font-medium text-slate-700">
                  {pretty(
                    listing.property_type
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400">
                  Facing:
                </span>{' '}
                <span className="font-medium text-slate-700">
                  {pretty(
                    listing.facing_direction
                  )}
                </span>
              </div>

              <div>
                <span className="text-slate-400">
                  Parking:
                </span>{' '}
                <span className="font-medium text-slate-700">
                  {listing.covered_parking ==
                  null
                    ? 'Not provided'
                    : listing.covered_parking
                    ? 'Covered'
                    : 'No'}
                </span>
              </div>

              <div>
                <span className="text-slate-400">
                  Listing ID:
                </span>{' '}
                <span className="font-mono text-xs text-slate-700">
                  {listing.listing_id}
                </span>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}