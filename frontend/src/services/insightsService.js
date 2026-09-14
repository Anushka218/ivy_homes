/**
 * Insights Service
 *
 * These metrics are based on the complete datasets retrieved
 * during the API investigation.
 *
 * Important:
 * Some values are dataset-derived discoveries rather than
 * fields directly returned by the analytics endpoint.
 */

const INSIGHTS = {
  listings: {
    reported: 3789,
    retrieved: 4100,
    live: 3233,
    inactive: 867,
  },

  rentals: {
    reported: 1432,
    retrieved: 1550,
    annaNagarRecords: 150,
    totalMonthlyRentAnnaNagar: 5330500,
  },

  projects: {
    reported: 425,
    retrieved: 460,
  },

  dataQuality: {
    corruptListings: 9,
    suspiciousFakeListings: 9,
    estimatedUniqueProperties: 3722,
    listingsLast7Days: 122,
  },

  derived: {
    avgPricePerSqft2Bhk: 16174.70,

    costliestProject: {
      projectId: 'P40224',
      priceMaxInr: 37800000,
      displayName: 'Shriram Serenity',
    },
  },
};

export const insightsService = {
  getInsights() {
    return INSIGHTS;
  },

  getRetrievalDiscrepancies() {
    return [
      {
        name: 'Listings',
        reported: INSIGHTS.listings.reported,
        retrieved: INSIGHTS.listings.retrieved,
        difference:
          INSIGHTS.listings.retrieved -
          INSIGHTS.listings.reported,
      },
      {
        name: 'Rentals',
        reported: INSIGHTS.rentals.reported,
        retrieved: INSIGHTS.rentals.retrieved,
        difference:
          INSIGHTS.rentals.retrieved -
          INSIGHTS.rentals.reported,
      },
      {
        name: 'Projects',
        reported: INSIGHTS.projects.reported,
        retrieved: INSIGHTS.projects.retrieved,
        difference:
          INSIGHTS.projects.retrieved -
          INSIGHTS.projects.reported,
      },
    ];
  },
};