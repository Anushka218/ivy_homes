import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Building2,
  Loader2,
  MapPin,
  RefreshCw,
} from 'lucide-react';

import { Navbar } from '../components/Navbar.jsx';
import { projectsService } from '../services/projectsService.js';
import {
  formatProjectPrice,
} from '../utils/projectPriceFormatter.js';

const DISPLAY_PAGE_SIZE = 24;

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  const [filters, setFilters] = useState({
    locality: 'all',
    status: 'all',
  });

  const [displayCount, setDisplayCount] =
    useState(DISPLAY_PAGE_SIZE);

  const [loading, setLoading] =
    useState(true);

  const [hydrating, setHydrating] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe =
      projectsService.subscribe((status) => {
        if (!mounted) return;

        setProjects(
          [...projectsService.getCachedProjects()]
        );

        setHydrating(!status.isComplete);
      });

    projectsService
      .getInitialProjects()
      .then((data) => {
        if (!mounted) return;

        setProjects([...data]);
        setHydrating(
          !projectsService.isHydrated()
        );
      })
      .catch((err) => {
        if (!mounted) return;

        setError(
          err.message ||
            'Failed to load projects'
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

  const filteredProjects = useMemo(
    () =>
      projectsService.applyFilters(
        projects,
        filters
      ),
    [projects, filters]
  );

  const visibleProjects =
    filteredProjects.slice(
      0,
      displayCount
    );

  const hasMore =
    visibleProjects.length <
    filteredProjects.length;

  const localities =
    projectsService.getAvailableLocalities();

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setDisplayCount(
      DISPLAY_PAGE_SIZE
    );
  }

  function clearFilters() {
    setFilters({
      locality: 'all',
      status: 'all',
    });

    setDisplayCount(
      DISPLAY_PAGE_SIZE
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Chennai · Projects
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Explore projects
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Browse residential projects and their observed price and area ranges.
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
          <div className="grid sm:grid-cols-2 gap-3">
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
                    (char) =>
                      char.toUpperCase()
                  )}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                updateFilter(
                  'status',
                  e.target.value
                )
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">
                All statuses
              </option>
              <option value="ready">
                Ready
              </option>
              <option value="ongoing">
                Ongoing
              </option>
              <option value="upcoming">
                Upcoming
              </option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-semibold text-emerald-700"
          >
            Clear filters
          </button>
        </section>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {filteredProjects.length.toLocaleString(
                'en-IN'
              )}{' '}
              matching projects
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {projects.length.toLocaleString(
                'en-IN'
              )}{' '}
              records loaded
            </p>
          </div>

          {hydrating && (
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading remaining projects…
            </span>
          )}
        </div>

        {loading ? (
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
        ) : error ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-4">
            {error}
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="font-semibold text-slate-900">
              No projects match these filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleProjects.map(
                (project) => (
                  <article
                    key={project.project_id}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
                          {project.developer_name ||
                            'Residential project'}
                        </p>

                        <h2 className="text-lg font-bold text-slate-900 mt-1">
                          {project.apartment_name ||
                            'Unnamed Project'}
                        </h2>
                      </div>

                      <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.locality ||
                        'Chennai'}
                    </div>

                    <div className="mt-5 space-y-3 pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                          Price range
                        </p>

                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {formatProjectPrice(
                            project.price_min
                          )}{' '}
                          –{' '}
                          {formatProjectPrice(
                            project.price_max
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                          Area range
                        </p>

                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {project.min_area_sqft ??
                            'N/A'}{' '}
                          –{' '}
                          {project.max_area_sqft ??
                            'N/A'}{' '}
                          sq.ft.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">
                            Listings
                          </span>
                          <p className="font-semibold text-slate-800">
                            {project.total_listings ??
                              'N/A'}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400">
                            Units
                          </span>
                          <p className="font-semibold text-slate-800">
                            {project.total_units ??
                              'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        {project.project_id}
                      </span>

                      {project.project_status && (
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] capitalize">
                          {project.project_status}
                        </span>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() =>
                    setDisplayCount(
                      (count) =>
                        count +
                        DISPLAY_PAGE_SIZE
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