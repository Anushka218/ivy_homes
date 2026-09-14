import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { listingsService } from '../services/listingsService.js';

const DISPLAY_PAGE_SIZE = 24;

const DEFAULT_FILTERS = {
  locality: 'anna nagar',
  bedrooms: '',
  minPrice: '',
  maxPrice: '',
  furnishing: '',
  status: 'active',
  search: '',
};

export function useListings() {
  const [allListings, setAllListings] =
    useState([]);

  const [filters, setFilters] =
    useState(DEFAULT_FILTERS);

  const [displayLimit, setDisplayLimit] =
    useState(DISPLAY_PAGE_SIZE);

  const [isLoadingInitial, setIsLoadingInitial] =
    useState(true);

  const [isHydrating, setIsHydrating] =
    useState(false);

  const [isHydrated, setIsHydrated] =
    useState(false);

  const [totalLoaded, setTotalLoaded] =
    useState(0);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let mounted = true;

    const sync = (status) => {
      if (!mounted) {
        return;
      }

      setAllListings([
        ...listingsService.getCachedListings(),
      ]);

      setTotalLoaded(status.loaded);
      setIsHydrated(status.isComplete);
      setIsHydrating(!status.isComplete);
    };

    const unsubscribe =
      listingsService.subscribe(sync);

    (async () => {
      try {
        setIsLoadingInitial(true);
        setError(null);

        const initial =
          await listingsService.getInitialListings();

        if (!mounted) {
          return;
        }

        setAllListings([...initial]);
        setTotalLoaded(initial.length);

        setIsHydrated(
          listingsService.isHydrated()
        );

        setIsHydrating(
          !listingsService.isHydrated()
        );
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              'Failed to load listings'
          );
        }
      } finally {
        if (mounted) {
          setIsLoadingInitial(false);
        }
      }
    })();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const filteredListings = useMemo(
    () =>
      listingsService.applyFilters(
        allListings,
        filters
      ),
    [allListings, filters]
  );

  const listings = useMemo(
    () =>
      filteredListings.slice(
        0,
        displayLimit
      ),
    [filteredListings, displayLimit]
  );

  const hasMore =
    displayLimit < filteredListings.length;

  const updateFilter = useCallback(
    (key, value) => {
      setFilters((current) => ({
        ...current,
        [key]: value,
      }));

      setDisplayLimit(
        DISPLAY_PAGE_SIZE
      );
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      locality: '',
    });

    setDisplayLimit(
      DISPLAY_PAGE_SIZE
    );
  }, []);

  const loadMore = useCallback(() => {
    setDisplayLimit(
      (current) =>
        current + DISPLAY_PAGE_SIZE
    );
  }, []);

  return {
    listings,

    totalMatching:
      filteredListings.length,

    totalLoaded,

    hasMore,

    loadMore,

    filters,

    updateFilter,

    clearFilters,

    availableLocalities:
      listingsService.getAvailableLocalities(),

    isLoadingInitial,

    isHydrating,

    isHydrated,

    error,
  };
}