import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

// --------------------------------------------------
// NORMALIZATION
// --------------------------------------------------

function normalize(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Coordinate distance in degrees.
// We use a small threshold because listings of the same
// physical property may have slightly different coordinates.
function coordinateClose(a, b, threshold = 0.0005) {
  const latA = number(a.latitude);
  const lonA = number(a.longitude);
  const latB = number(b.latitude);
  const lonB = number(b.longitude);

  if (
    latA === null ||
    lonA === null ||
    latB === null ||
    lonB === null
  ) {
    return false;
  }

  return (
    Math.abs(latA - latB) <= threshold &&
    Math.abs(lonA - lonB) <= threshold
  );
}

// --------------------------------------------------
// BASIC INFORMATION
// --------------------------------------------------

console.log("=================================");
console.log("Q2 UNIQUE PROPERTY ANALYSIS");
console.log("=================================\n");

console.log("Total listing records:", listings.length);

// --------------------------------------------------
// STEP 1: LISTING ID UNIQUENESS
// --------------------------------------------------

const listingIds = new Set(
  listings.map(l => l.listing_id)
);

console.log("Unique listing IDs:", listingIds.size);
console.log(
  "Duplicate listing IDs:",
  listings.length - listingIds.size
);

// --------------------------------------------------
// STEP 2: CREATE PROPERTY CANDIDATE GROUPS
//
// We deliberately DO NOT use project_id as the identity,
// because earlier analysis showed project_id can be
// inconsistent.
//
// Strong identity signals:
// - apartment/building name
// - locality
// - bedroom count
// - floor
//
// Then we compare:
// - carpet area
// - coordinates
// - super built-up area
// --------------------------------------------------

const groups = new Map();

for (const listing of listings) {
  const key = [
    normalize(listing.apartment_name),
    normalize(listing.locality),
    number(listing.bedroom),
    number(listing.floor)
  ].join("|");

  if (!groups.has(key)) {
    groups.set(key, []);
  }

  groups.get(key).push(listing);
}

console.log("\nBroad candidate groups:", groups.size);

// --------------------------------------------------
// STEP 3: BUILD DUPLICATE CLUSTERS
//
// Two listings are considered possible representations
// of the same physical property when:
//
// 1. Same normalized building name
// 2. Same locality
// 3. Same bedroom count
// 4. Same floor
// 5. Carpet area differs by <= 10 sqft
// 6. Coordinates differ by <= 0.0005 degrees
//
// We use connected components so that:
// A ~ B and B ~ C can form one property cluster.
// --------------------------------------------------

function arePossibleDuplicates(a, b) {
  const areaA = number(a.carpet_area);
  const areaB = number(b.carpet_area);

  if (areaA === null || areaB === null) {
    return false;
  }

  const areaDifference = Math.abs(areaA - areaB);

  if (areaDifference > 10) {
    return false;
  }

  if (!coordinateClose(a, b, 0.0005)) {
    return false;
  }

  return true;
}

// Union-Find / Disjoint Set
const parent = new Map();

function find(x) {
  if (parent.get(x) !== x) {
    parent.set(x, find(parent.get(x)));
  }

  return parent.get(x);
}

function union(a, b) {
  const rootA = find(a);
  const rootB = find(b);

  if (rootA !== rootB) {
    parent.set(rootB, rootA);
  }
}

// Initialize every listing as its own property.
for (const listing of listings) {
  parent.set(listing.listing_id, listing.listing_id);
}

let candidatePairs = 0;

// Compare only listings inside the same broad candidate group.
for (const group of groups.values()) {
  if (group.length < 2) continue;

  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i];
      const b = group[j];

      if (arePossibleDuplicates(a, b)) {
        candidatePairs++;

        union(a.listing_id, b.listing_id);
      }
    }
  }
}

// --------------------------------------------------
// STEP 4: BUILD CLUSTERS
// --------------------------------------------------

const clusters = new Map();

for (const listing of listings) {
  const root = find(listing.listing_id);

  if (!clusters.has(root)) {
    clusters.set(root, []);
  }

  clusters.get(root).push(listing);
}

const duplicateClusters = [...clusters.values()]
  .filter(cluster => cluster.length > 1);

const duplicateListings = duplicateClusters.reduce(
  (sum, cluster) => sum + cluster.length,
  0
);

const estimatedUniqueProperties =
  listings.length -
  duplicateClusters.reduce(
    (sum, cluster) => sum + (cluster.length - 1),
    0
  );

// --------------------------------------------------
// STEP 5: SUMMARY
// --------------------------------------------------

console.log("\n=================================");
console.log("DUPLICATE ANALYSIS");
console.log("=================================\n");

console.log("Candidate duplicate pairs:", candidatePairs);

console.log(
  "Potential duplicate clusters:",
  duplicateClusters.length
);

console.log(
  "Listings inside duplicate clusters:",
  duplicateListings
);

console.log(
  "Estimated unique properties:",
  estimatedUniqueProperties
);

// --------------------------------------------------
// STEP 6: CLUSTER SIZE DISTRIBUTION
// --------------------------------------------------

const distribution = {};

for (const cluster of duplicateClusters) {
  const size = cluster.length;

  distribution[size] =
    (distribution[size] || 0) + 1;
}

console.log("\nCluster size distribution:");

console.table(distribution);

// --------------------------------------------------
// STEP 7: SHOW ALL DUPLICATE CLUSTERS
// --------------------------------------------------

console.log("\n=================================");
console.log("DUPLICATE CLUSTER DETAILS");
console.log("=================================\n");

const clusterOutput = duplicateClusters
  .map((cluster, index) => ({
    cluster_number: index + 1,

    listings: cluster.map(l => ({
      listing_id: l.listing_id,
      apartment_name: l.apartment_name,
      locality: l.locality,
      bedroom: l.bedroom,
      floor: l.floor,
      carpet_area: l.carpet_area,
      super_built_up_area: l.super_built_up_area,
      latitude: l.latitude,
      longitude: l.longitude,
      project_id: l.project_id,
      price: l.price,
      is_live: l.is_live,
      website: l.website,
      posted_by_name: l.posted_by_name
    }))
  }))
  .sort(
    (a, b) =>
      b.listings.length - a.listings.length
  );

// Show first 30 clusters in terminal.
console.dir(
  clusterOutput.slice(0, 30),
  {
    depth: null,
    maxArrayLength: null
  }
);

// --------------------------------------------------
// STEP 8: SAVE COMPLETE ANALYSIS
// --------------------------------------------------

fs.writeFileSync(
  "./data/q2-property-clusters.json",
  JSON.stringify(clusterOutput, null, 2)
);

console.log(
  "\nSaved: data/q2-property-clusters.json"
);

// --------------------------------------------------
// STEP 9: SHOW SOME IMPORTANT EDGE CASES
// --------------------------------------------------

console.log("\n=================================");
console.log("LARGEST DUPLICATE CLUSTERS");
console.log("=================================\n");

for (const cluster of clusterOutput.slice(0, 10)) {
  console.log(
    `Cluster ${cluster.cluster_number} (${cluster.listings.length} listings)`
  );

  console.table(
    cluster.listings.map(l => ({
      listing_id: l.listing_id,
      apartment_name: l.apartment_name,
      locality: l.locality,
      bedroom: l.bedroom,
      floor: l.floor,
      carpet_area: l.carpet_area,
      lat: l.latitude,
      lon: l.longitude,
      project_id: l.project_id,
      price: l.price
    }))
  );
}