import { apiClient } from './api.js';

export const savedService = {
  async getSavedListings() {
    const data =
      await apiClient('/v1/saved');

    if (Array.isArray(data)) {
      return data;
    }

    if (
      Array.isArray(data?.results)
    ) {
      return data.results;
    }

    return [];
  },

  async addSavedListing(
    listingId
  ) {
    return apiClient(
      '/v1/saved',
      {
        method: 'POST',
        body: JSON.stringify({
          listing_id: listingId,
        }),
      }
    );
  },

  async removeSavedListing(
    listingId
  ) {
    return apiClient(
      `/v1/saved/${encodeURIComponent(
        listingId
      )}`,
      {
        method: 'DELETE',
      }
    );
  },
};