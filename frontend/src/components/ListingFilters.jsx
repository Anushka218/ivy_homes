import React from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

const furnishingOptions = [
  'furnished',
  'semi-furnished',
  'unfurnished',
];

const bedroomOptions = [
  '1',
  '2',
  '3',
  '4+',
];

export function ListingFilters({
  filters,
  updateFilter,
  clearFilters,
  localities,
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />

          <h2 className="font-semibold text-slate-900">
            Filters
          </h2>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-medium text-slate-500 hover:text-emerald-700 inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

        <label className="lg:col-span-2">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Search
          </span>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              value={filters.search}
              onChange={(e) =>
                updateFilter(
                  'search',
                  e.target.value
                )
              }
              placeholder="Project or locality"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Locality
          </span>

          <select
            value={filters.locality}
            onChange={(e) =>
              updateFilter(
                'locality',
                e.target.value
              )
            }
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="">
              All localities
            </option>

            {localities.map((locality) => (
              <option
                key={locality}
                value={locality}
              >
                {locality.replace(
                  /\b\w/g,
                  (c) => c.toUpperCase()
                )}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Bedrooms
          </span>

          <select
            value={filters.bedrooms}
            onChange={(e) =>
              updateFilter(
                'bedrooms',
                e.target.value
              )
            }
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="">
              Any BHK
            </option>

            {bedroomOptions.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value} BHK
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Furnishing
          </span>

          <select
            value={filters.furnishing}
            onChange={(e) =>
              updateFilter(
                'furnishing',
                e.target.value
              )
            }
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="">
              Any
            </option>

            {furnishingOptions.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value.replace(
                    /\b\w/g,
                    (c) => c.toUpperCase()
                  )}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Min price (₹)
          </span>

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) =>
              updateFilter(
                'minPrice',
                e.target.value
              )
            }
            placeholder="0"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Max price (₹)
          </span>

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) =>
              updateFilter(
                'maxPrice',
                e.target.value
              )
            }
            placeholder="No max"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm"
          />
        </label>
      </div>
    </section>
  );
}