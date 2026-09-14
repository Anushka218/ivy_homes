import React from 'react';
import { Link } from 'react-router-dom';
import { useSaved } from '../context/SavedContext.jsx';
import {
  formatINR,
  formatCompactINR,
  formatPricePerSqft,
} from '../utils/priceFormatter.js';

import {
  Bookmark,
  MapPin,
  BedDouble,
  Maximize2,
  CheckCircle2,
  Building,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';

export function ListingCard({ listing }) {
  const {
    isSaved,
    isSaving,
    toggleSave,
  } = useSaved();

  if (!listing?.listing_id) {
    return null;
  }

  const id = listing.listing_id;

  const saved = isSaved(id);
  const saving = isSaving(id);

  const title =
    listing.apartment_name ||
    listing.title ||
    'Residential Property';

  const locality = listing.locality
    ? listing.locality.replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      )
    : 'Chennai';

  const ppsf = formatPricePerSqft(
    listing.price,
    listing.carpet_area
  );

  const detailUrl =
    `/listings/${encodeURIComponent(id)}`;

  const handleToggleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await toggleSave(listing);
    } catch (error) {
      // SavedContext handles rollback/error state.
      console.error(
        'Save toggle failed:',
        error
      );
    }
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden group">

      {/* Main clickable listing content */}
      <Link
        to={detailUrl}
        className="block p-5"
        aria-label={`View ${title}`}
      >
        {/* Price */}
        <div className="flex items-start justify-between gap-3 mb-2">

          <div>
            <div className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCompactINR(listing.price)}
            </div>

            <div className="text-xs text-slate-500 font-mono">
              {formatINR(listing.price)}

              {ppsf && (
                <>
                  {' '}
                  <span aria-hidden="true">
                    •
                  </span>{' '}
                  {ppsf}
                </>
              )}
            </div>
          </div>

          <ArrowUpRight
            className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0"
            aria-hidden="true"
          />
        </div>

        {/* Property name */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
          {title}
        </h3>

        {/* Locality */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-4">
          <MapPin
            className="w-3.5 h-3.5 text-slate-400 shrink-0"
            aria-hidden="true"
          />

          <span className="truncate">
            {locality}
          </span>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600">

          <div className="flex items-center gap-1.5">
            <BedDouble
              className="w-3.5 h-3.5 text-slate-400"
              aria-hidden="true"
            />

            <span>
              {listing.bedroom != null
                ? `${listing.bedroom} BHK`
                : 'N/A BHK'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Maximize2
              className="w-3.5 h-3.5 text-slate-400"
              aria-hidden="true"
            />

            <span>
              {listing.carpet_area != null
                ? `${listing.carpet_area} sq.ft.`
                : 'N/A sq.ft.'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Building
              className="w-3.5 h-3.5 text-slate-400"
              aria-hidden="true"
            />

            <span className="capitalize">
              {listing.property_type ||
                'Apartment'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-slate-400"
              aria-hidden="true"
            />

            <span className="capitalize">
              {listing.furnishing ||
                'Unspecified'}
            </span>
          </div>
        </div>

        {/* Status badges */}
        <div className="mt-3.5 pt-1 flex items-center justify-between gap-2">

          <div className="flex items-center gap-1.5 flex-wrap">

            {listing.is_live === true ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-slate-400"
                  aria-hidden="true"
                />
                Inactive
              </span>
            )}

            {listing.is_verified === true && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2
                  className="w-3 h-3 text-blue-600"
                  aria-hidden="true"
                />
                Verified
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono text-slate-400 truncate">
            {id}
          </span>
        </div>
      </Link>

      {/* Save action is OUTSIDE the Link */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={handleToggleSave}
          disabled={saving}
          aria-label={
            saved
              ? `Remove ${title} from saved listings`
              : `Save ${title}`
          }
          aria-pressed={saved}
          className={`w-full py-2 rounded-lg border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all ${
            saved
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'
          } ${
            saving
              ? 'opacity-70 cursor-wait'
              : ''
          }`}
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Bookmark
              className={`w-3.5 h-3.5 ${
                saved
                  ? 'fill-emerald-600 text-emerald-600'
                  : ''
              }`}
            />
          )}

          {saving
            ? 'Updating...'
            : saved
            ? 'Saved'
            : 'Save listing'}
        </button>
      </div>
    </article>
  );
}