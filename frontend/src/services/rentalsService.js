import { apiClient } from './api.js';

const PAGE_SIZE = 50;

let cachedRentals = [];
let rentalsMap = new Map();
let isFullyHydrated = false;
let hydrationPromise = null;

const listeners = new Set();

function addResults(results) {
  let added = 0;

  for (const item of results) {
    const id = item?.listing_id;

    if (!id || rentalsMap.has(id)) {
      continue;
    }

    rentalsMap.set(id, item);
    cachedRentals.push(item);
    added += 1;
  }

  return added;
}

export const rentalsService = {
  subscribe(callback) {
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
    };
  },

  notifyListeners(status) {
    listeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error('Rental listener failed:', error);
      }
    });
  },

  getCachedRentals() {
    return cachedRentals;
  },

  isHydrated() {
    return isFullyHydrated;
  },

  async hydrateCompleteDataset() {
    if (isFullyHydrated) {
      return cachedRentals;
    }

    if (hydrationPromise) {
      return hydrationPromise;
    }

    hydrationPromise = (async () => {
      try {
        let offset = cachedRentals.length;

        while (true) {
          const data = await apiClient(
            `/v1/rentals?limit=${PAGE_SIZE}&offset=${offset}`
          );

          const results = Array.isArray(data?.results)
            ? data.results
            : [];

          if (results.length === 0) {
            break;
          }

          addResults(results);

          offset += results.length;

          this.notifyListeners({
            loaded: cachedRentals.length,
            isComplete: false,
          });

          /*
           * Do not trust the documented `total`.
           * The API reported 1432 but we retrieved 1550.
           */
          if (data?.has_more === false) {
            break;
          }
        }

        isFullyHydrated = true;

        this.notifyListeners({
          loaded: cachedRentals.length,
          isComplete: true,
        });

        return cachedRentals;
      } finally {
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
  },

  async getInitialRentals() {
    if (cachedRentals.length > 0) {
      if (!isFullyHydrated && !hydrationPromise) {
        this.hydrateCompleteDataset().catch((error) => {
          console.error(
            'Background rental hydration failed:',
            error
          );
        });
      }

      return cachedRentals;
    }

    const data = await apiClient(
      `/v1/rentals?limit=${PAGE_SIZE}&offset=0`
    );

    addResults(
      Array.isArray(data?.results)
        ? data.results
        : []
    );

    if (data?.has_more === false) {
      isFullyHydrated = true;
    } else {
      this.hydrateCompleteDataset().catch((error) => {
        console.error(
          'Background rental hydration failed:',
          error
        );
      });
    }

    this.notifyListeners({
      loaded: cachedRentals.length,
      isComplete: isFullyHydrated,
    });

    return cachedRentals;
  },

  getAvailableLocalities() {
    return Array.from(
      new Set(
        cachedRentals
          .map((item) =>
            String(item?.locality || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      )
    ).sort();
  },

  applyFilters(rentals, filters = {}) {
    if (!Array.isArray(rentals)) {
      return [];
    }

    const minRent =
      filters.minRent === ''
        ? null
        : Number(filters.minRent);

    const maxRent =
      filters.maxRent === ''
        ? null
        : Number(filters.maxRent);

    return rentals.filter((item) => {
      const locality = String(
        item?.locality || ''
      )
        .trim()
        .toLowerCase();

      const furnishing = String(
        item?.furnishing || ''
      )
        .trim()
        .toLowerCase();

      const bedroom = Number(item?.bedroom);

      // Actual rental API field is `price`.
      const price = Number(item?.price);

      if (
        filters.locality &&
        filters.locality !== 'all' &&
        locality !==
          String(filters.locality)
            .trim()
            .toLowerCase()
      ) {
        return false;
      }

      if (
        filters.bedrooms &&
        filters.bedrooms !== 'all'
      ) {
        if (filters.bedrooms === '4+') {
          if (
            !Number.isFinite(bedroom) ||
            bedroom < 4
          ) {
            return false;
          }
        } else if (
          bedroom !== Number(filters.bedrooms)
        ) {
          return false;
        }
      }

      if (
        minRent !== null &&
        Number.isFinite(minRent) &&
        (!Number.isFinite(price) ||
          price < minRent)
      ) {
        return false;
      }

      if (
        maxRent !== null &&
        Number.isFinite(maxRent) &&
        (!Number.isFinite(price) ||
          price > maxRent)
      ) {
        return false;
      }

      if (
        filters.furnishing &&
        filters.furnishing !== 'all' &&
        furnishing !==
          String(filters.furnishing)
            .trim()
            .toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  },
};