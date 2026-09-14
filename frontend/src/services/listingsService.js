import { apiClient } from './api.js';

const PAGE_SIZE = 50;

let cachedListings = [];
let listingsMap = new Map();
let isFullyHydrated = false;
let hydrationPromise = null;

const listeners = new Set();

function addResults(results) {
  let added = 0;

  for (const item of results) {
    const id = item?.listing_id;

    if (!id || listingsMap.has(id)) {
      continue;
    }

    listingsMap.set(id, item);
    cachedListings.push(item);
    added += 1;
  }

  return added;
}

export const listingsService = {
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
        console.error('Listings listener failed:', error);
      }
    });
  },

  getCachedListings() {
    return cachedListings;
  },

  isHydrated() {
    return isFullyHydrated;
  },

  async getInitialListings() {
    if (cachedListings.length > 0) {
      if (!isFullyHydrated && !hydrationPromise) {
        this.hydrateCompleteDataset().catch((error) => {
          console.error(
            'Background listing hydration failed:',
            error
          );
        });
      }

      return cachedListings;
    }

    const data = await apiClient(
      `/v1/listings?limit=${PAGE_SIZE}&offset=0`
    );

    addResults(
      Array.isArray(data?.results)
        ? data.results
        : []
    );

    if (data?.has_more && !hydrationPromise) {
      this.hydrateCompleteDataset().catch((error) => {
        console.error(
          'Background listing hydration failed:',
          error
        );
      });
    } else if (data?.has_more === false) {
      isFullyHydrated = true;
    }

    this.notifyListeners({
      loaded: cachedListings.length,
      isComplete: isFullyHydrated,
    });

    return cachedListings;
  },

  async hydrateCompleteDataset() {
    if (isFullyHydrated) {
      return cachedListings;
    }

    if (hydrationPromise) {
      return hydrationPromise;
    }

    hydrationPromise = (async () => {
      try {
        let offset = cachedListings.length;

        while (true) {
          const data = await apiClient(
            `/v1/listings?limit=${PAGE_SIZE}&offset=${offset}`
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
            loaded: cachedListings.length,
            isComplete: false,
          });

          /*
           * IMPORTANT:
           * Do not stop based on `total`.
           *
           * We already established that the API reports 3789
           * while the retrievable dataset contains 4100 records.
           */
          if (data?.has_more === false) {
            break;
          }
        }

        isFullyHydrated = true;

        this.notifyListeners({
          loaded: cachedListings.length,
          isComplete: true,
        });

        return cachedListings;
      } finally {
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
  },

  async getListingById(listingId) {
    if (!listingId) {
      return null;
    }

    const cached = listingsMap.get(listingId);

    if (cached) {
      return cached;
    }

    /*
     * Don't assume /v1/listings/{id} exists.
     * The complete listing dataset is already our source of truth.
     */
    await this.hydrateCompleteDataset();

    return listingsMap.get(listingId) || null;
  },

  getAvailableLocalities() {
    return Array.from(
      new Set(
        cachedListings
          .map((item) =>
            String(item?.locality || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      )
    ).sort();
  },

  applyFilters(listings, filters = {}) {
    if (!Array.isArray(listings)) {
      return [];
    }

    const minPrice =
      filters.minPrice === ''
        ? null
        : Number(filters.minPrice);

    const maxPrice =
      filters.maxPrice === ''
        ? null
        : Number(filters.maxPrice);

    return listings.filter((item) => {
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
      const price = Number(item?.price);

      if (
        filters.locality &&
        filters.locality !== 'all'
      ) {
        if (
          locality !==
          String(filters.locality)
            .trim()
            .toLowerCase()
        ) {
          return false;
        }
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
        minPrice !== null &&
        Number.isFinite(minPrice)
      ) {
        if (
          !Number.isFinite(price) ||
          price < minPrice
        ) {
          return false;
        }
      }

      if (
        maxPrice !== null &&
        Number.isFinite(maxPrice)
      ) {
        if (
          !Number.isFinite(price) ||
          price > maxPrice
        ) {
          return false;
        }
      }

      if (
        filters.furnishing &&
        filters.furnishing !== 'all'
      ) {
        if (
          furnishing !==
          String(filters.furnishing)
            .trim()
            .toLowerCase()
        ) {
          return false;
        }
      }

      if (
        filters.status === 'active' &&
        item?.is_live !== true
      ) {
        return false;
      }

      if (
        filters.status === 'inactive' &&
        item?.is_live === true
      ) {
        return false;
      }

      if (filters.search?.trim()) {
        const query =
          filters.search
            .trim()
            .toLowerCase();

        const haystack = [
          item?.apartment_name,
          item?.title,
          item?.locality,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  },
};