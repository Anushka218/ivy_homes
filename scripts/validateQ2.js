import fs from "fs";

const clusters = JSON.parse(
  fs.readFileSync("./data/q2-property-clusters.json", "utf8")
);

console.log("=================================");
console.log("Q2 DUPLICATE CLUSTER VALIDATION");
console.log("=================================\n");

console.log("Duplicate clusters:", clusters.length);

// --------------------------------------------------
// Helper functions
// --------------------------------------------------

function normalize(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function range(values) {
  const nums = values
    .map(num)
    .filter(v => v !== null);

  if (nums.length === 0) return null;

  return {
    min: Math.min(...nums),
    max: Math.max(...nums),
    difference: Math.max(...nums) - Math.min(...nums)
  };
}

// --------------------------------------------------
// Analyze every cluster
// --------------------------------------------------

const validated = [];

for (const cluster of clusters) {
  const listings = cluster.listings;

  const apartmentNames = [
    ...new Set(
      listings.map(l => normalize(l.apartment_name))
    )
  ];

  const localities = [
    ...new Set(
      listings.map(l => normalize(l.locality))
    )
  ];

  const bedrooms = [
    ...new Set(
      listings.map(l => num(l.bedroom))
    )
  ];

  const floors = [
    ...new Set(
      listings.map(l => num(l.floor))
    )
  ];

  const projectIds = [
    ...new Set(
      listings
        .map(l => l.project_id)
        .filter(Boolean)
    )
  ];

  const websites = [
    ...new Set(
      listings
        .map(l => normalize(l.website))
        .filter(Boolean)
    )
  ];

  const prices = range(
    listings.map(l => l.price)
  );

  const carpetAreas = range(
    listings.map(l => l.carpet_area)
  );

  const superBuiltUpAreas = range(
    listings.map(l => l.super_built_up_area)
  );

  const latitudes = range(
    listings.map(l => l.latitude)
  );

  const longitudes = range(
    listings.map(l => l.longitude)
  );

  // ----------------------------------------------
  // Strong consistency checks
  // ----------------------------------------------

  const sameApartment =
    apartmentNames.length === 1;

  const sameLocality =
    localities.length === 1;

  const sameBedroom =
    bedrooms.length === 1;

  const sameFloor =
    floors.length === 1;

  const areaDifference =
    carpetAreas?.difference ?? Infinity;

  const sbuDifference =
    superBuiltUpAreas?.difference ?? Infinity;

  const latitudeDifference =
    latitudes?.difference ?? Infinity;

  const longitudeDifference =
    longitudes?.difference ?? Infinity;

  // ----------------------------------------------
  // Confidence classification
  // ----------------------------------------------

  let confidence = "HIGH";

  const reasons = [];

  if (!sameApartment) {
    confidence = "LOW";
    reasons.push("different apartment names");
  }

  if (!sameLocality) {
    confidence = "LOW";
    reasons.push("different localities");
  }

  if (!sameBedroom) {
    confidence = "LOW";
    reasons.push("different bedroom counts");
  }

  if (!sameFloor) {
    confidence = "LOW";
    reasons.push("different floors");
  }

  if (areaDifference > 10) {
    confidence = "LOW";
    reasons.push(
      `carpet area difference ${areaDifference} sqft`
    );
  }

  if (sbuDifference > 25) {
    confidence = "MEDIUM";
    reasons.push(
      `SBU difference ${sbuDifference} sqft`
    );
  }

  if (latitudeDifference > 0.0005) {
    confidence = "MEDIUM";
    reasons.push(
      `latitude difference ${latitudeDifference}`
    );
  }

  if (longitudeDifference > 0.0005) {
    confidence = "MEDIUM";
    reasons.push(
      `longitude difference ${longitudeDifference}`
    );
  }

  validated.push({
    cluster_number: cluster.cluster_number,

    listing_count: listings.length,

    confidence,

    reasons,

    apartment_names: apartmentNames,

    localities,

    bedrooms,

    floors,

    project_ids: projectIds,

    websites,

    price_range: prices,

    carpet_area_range: carpetAreas,

    super_built_up_area_range:
      superBuiltUpAreas,

    latitude_range: latitudes,

    longitude_range: longitudes,

    listing_ids: listings.map(
      l => l.listing_id
    )
  });
}

// --------------------------------------------------
// SUMMARY
// --------------------------------------------------

const confidenceCounts = {
  HIGH: 0,
  MEDIUM: 0,
  LOW: 0
};

for (const item of validated) {
  confidenceCounts[item.confidence]++;
}

console.log("=================================");
console.log("CONFIDENCE SUMMARY");
console.log("=================================\n");

console.table(confidenceCounts);

// --------------------------------------------------
// Number of listings represented by each confidence
// category
// --------------------------------------------------

for (const level of ["HIGH", "MEDIUM", "LOW"]) {
  const items = validated.filter(
    x => x.confidence === level
  );

  const listingCount = items.reduce(
    (sum, x) => sum + x.listing_count,
    0
  );

  console.log(
    `${level} clusters: ${items.length}`
  );

  console.log(
    `${level} listings: ${listingCount}\n`
  );
}

// --------------------------------------------------
// Suspicious clusters
// --------------------------------------------------

const suspicious = validated.filter(
  x => x.confidence !== "HIGH"
);

console.log("=================================");
console.log("SUSPICIOUS CLUSTERS");
console.log("=================================\n");

console.log(
  "Suspicious clusters:",
  suspicious.length
);

for (const item of suspicious) {
  console.log("\n---------------------------------");

  console.log(
    `Cluster ${item.cluster_number}`
  );

  console.log(
    `Listings: ${item.listing_count}`
  );

  console.log(
    `Confidence: ${item.confidence}`
  );

  console.log(
    `Reasons: ${item.reasons.join("; ")}`
  );

  console.log(
    "Apartment names:",
    item.apartment_names
  );

  console.log(
    "Localities:",
    item.localities
  );

  console.log(
    "Bedrooms:",
    item.bedrooms
  );

  console.log(
    "Floors:",
    item.floors
  );

  console.log(
    "Carpet area:",
    item.carpet_area_range
  );

  console.log(
    "SBU area:",
    item.super_built_up_area_range
  );

  console.log(
    "Coordinates:",
    item.latitude_range,
    item.longitude_range
  );

  console.log(
    "Project IDs:",
    item.project_ids
  );

  console.log(
    "Websites:",
    item.websites
  );

  console.log(
    "Listing IDs:",
    item.listing_ids
  );
}

// --------------------------------------------------
// SAVE VALIDATION
// --------------------------------------------------

fs.writeFileSync(
  "./data/q2-validation.json",
  JSON.stringify(validated, null, 2)
);

console.log(
  "\nSaved: data/q2-validation.json"
);

// --------------------------------------------------
// FINAL ESTIMATE
// --------------------------------------------------

const duplicateListings = validated.reduce(
  (sum, cluster) =>
    sum + (cluster.listing_count - 1),
  0
);

const estimatedUnique =
  4100 - duplicateListings;

console.log("\n=================================");
console.log("Q2 CURRENT ESTIMATE");
console.log("=================================\n");

console.log(
  "Total records: 4100"
);

console.log(
  "Duplicate records removed:",
  duplicateListings
);

console.log(
  "Estimated unique properties:",
  estimatedUnique
);