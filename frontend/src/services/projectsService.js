import { apiClient } from './api.js';

const PAGE_SIZE = 50;

let cachedProjects = [];
let projectsMap = new Map();
let isFullyHydrated = false;
let hydrationPromise = null;

const listeners = new Set();

function addResults(results) {
  let added = 0;

  for (const item of results) {
    const id = item?.project_id;

    if (!id || projectsMap.has(id)) {
      continue;
    }

    projectsMap.set(id, item);
    cachedProjects.push(item);
    added += 1;
  }

  return added;
}

export const projectsService = {
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
        console.error(
          'Project listener failed:',
          error
        );
      }
    });
  },

  getCachedProjects() {
    return cachedProjects;
  },

  isHydrated() {
    return isFullyHydrated;
  },

  async hydrateCompleteDataset() {
    if (isFullyHydrated) {
      return cachedProjects;
    }

    if (hydrationPromise) {
      return hydrationPromise;
    }

    hydrationPromise = (async () => {
      try {
        let offset = cachedProjects.length;

        while (true) {
          const data = await apiClient(
            `/v1/projects?limit=${PAGE_SIZE}&offset=${offset}`
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
            loaded: cachedProjects.length,
            isComplete: false,
          });

          if (data?.has_more === false) {
            break;
          }
        }

        isFullyHydrated = true;

        this.notifyListeners({
          loaded: cachedProjects.length,
          isComplete: true,
        });

        return cachedProjects;
      } finally {
        hydrationPromise = null;
      }
    })();

    return hydrationPromise;
  },

  async getInitialProjects() {
    if (cachedProjects.length > 0) {
      if (!isFullyHydrated && !hydrationPromise) {
        this.hydrateCompleteDataset().catch(
          console.error
        );
      }

      return cachedProjects;
    }

    const data = await apiClient(
      `/v1/projects?limit=${PAGE_SIZE}&offset=0`
    );

    addResults(
      Array.isArray(data?.results)
        ? data.results
        : []
    );

    if (data?.has_more === false) {
      isFullyHydrated = true;
    } else {
      this.hydrateCompleteDataset().catch(
        console.error
      );
    }

    this.notifyListeners({
      loaded: cachedProjects.length,
      isComplete: isFullyHydrated,
    });

    return cachedProjects;
  },

  getAvailableLocalities() {
    return Array.from(
      new Set(
        cachedProjects
          .map((item) =>
            String(item?.locality || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      )
    ).sort();
  },

  applyFilters(projects, filters = {}) {
    if (!Array.isArray(projects)) {
      return [];
    }

    return projects.filter((project) => {
      const locality = String(
        project?.locality || ''
      )
        .trim()
        .toLowerCase();

      const status = String(
        project?.project_status || ''
      )
        .trim()
        .toLowerCase();

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
        filters.status &&
        filters.status !== 'all' &&
        status !==
          String(filters.status)
            .trim()
            .toLowerCase()
      ) {
        return false;
      }

      return true;
    });
  },
};