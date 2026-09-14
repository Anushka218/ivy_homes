import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf-8")
);

// -----------------------------
// Helpers
// -----------------------------

function normalize(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function sameValue(a, b) {
  return normalize(a) === normalize(b);
}

function areaDiff(a, b) {
  if (typeof a !== "number" || typeof b !== "number") return Infinity;
  return Math.abs(a - b);
}

function coordinateDistance(a, b) {
  if (
    typeof a.latitude !== "number" ||
    typeof a.longitude !== "number" ||
    typeof b.latitude !== "number" ||
    typeof b.longitude !== "number"
  ) {
    return Infinity;
  }

  return Math.sqrt(
    Math.pow(a.latitude - b.latitude, 2) +
    Math.pow(a.longitude - b.longitude, 2)
  );
}

function priceDifferencePercent(a, b) {
  if (typeof a !== "number" || typeof b !== "number") return Infinity;

  const avg = (a + b) / 2;

  if (avg === 0) return Infinity;

  return (Math.abs(a - b) / avg) * 100;
}

// -----------------------------
// Step 1: Candidate groups
//
// We only compare listings that have
// the same broad identity.
// -----------------------------

const groups = new Map();

for (const listing of listings) {
  const key = [
    normalize(listing.apartment_name),
    normalize(listing.locality),
    listing.bedroom,
    listing.floor
  ].join("|");

  if (!groups.has(key)) {
    groups.set(key, []);
  }

  groups.get(key).push(listing);
}

// -----------------------------
// Step 2: Generate candidate pairs
// -----------------------------

const candidatePairs = [];

for (const group of groups.values()) {
  if (group.length < 2) continue;

  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i];
      const b = group[j];

      const aDiff = areaDiff(a.carpet_area, b.carpet_area);
      const coordDiff = coordinateDistance(a, b);
      const priceDiff = priceDifferencePercent(a.price, b.price);

      candidatePairs.push({
        a,
        b,
        areaDiff: aDiff,
        coordDiff,
        priceDiff
      });
    }
  }
}

console.log("=================================");
console.log("DUPLICATE CONFIDENCE ANALYSIS");
console.log("=================================");
console.log(`Total listings: ${listings.length}`);
console.log(`Candidate pairs: ${candidatePairs.length}`);

// -----------------------------
// Classification
// -----------------------------

/*
STRICT

Strong evidence that two records represent
the same physical property.

Requirements:
- same apartment name
- same locality
- same bedroom
- same floor
- carpet area difference <= 5 sqft
- coordinates reasonably close <= 0.0005 degrees
*/

function isStrict(pair) {
  return (
    pair.areaDiff <= 5 &&
    pair.coordDiff <= 0.0005
  );
}

/*
MODERATE

Still highly suspicious of duplication, but
allows slightly more variation.

Requirements:
- same broad identity
- carpet area difference <= 10 sqft
- coordinates <= 0.001 degrees
*/

function isModerate(pair) {
  return (
    pair.areaDiff <= 10 &&
    pair.coordDiff <= 0.001
  );
}

/*
LOOSE

Potential duplicate.

Used only for investigation, NOT directly
for the final answer.

Allows larger area differences.
*/

function isLoose(pair) {
  return (
    pair.areaDiff <= 20 &&
    pair.coordDiff <= 0.001
  );
}

const strictPairs = candidatePairs.filter(isStrict);
const moderatePairs = candidatePairs.filter(isModerate);
const loosePairs = candidatePairs.filter(isLoose);

// -----------------------------
// Union-Find
// Used to turn duplicate PAIRS
// into duplicate PROPERTY CLUSTERS.
// -----------------------------

class UnionFind {
  constructor(ids) {
    this.parent = new Map();
    this.rank = new Map();

    for (const id of ids) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
    }
  }

  find(x) {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)));
    }

    return this.parent.get(x);
  }

  union(a, b) {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) return;

    const rankA = this.rank.get(rootA);
    const rankB = this.rank.get(rootB);

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }
  }
}

function buildClusters(pairs) {
  const uf = new UnionFind(
    listings.map((l) => l.listing_id)
  );

  for (const pair of pairs) {
    uf.union(
      pair.a.listing_id,
      pair.b.listing_id
    );
  }

  const clusters = new Map();

  for (const listing of listings) {
    const root = uf.find(listing.listing_id);

    if (!clusters.has(root)) {
      clusters.set(root, []);
    }

    clusters.get(root).push(listing);
  }

  // Only return actual duplicate clusters.
  return [...clusters.values()]
    .filter((cluster) => cluster.length > 1)
    .sort((a, b) => b.length - a.length);
}

// -----------------------------
// Build clusters
// -----------------------------

const strictClusters = buildClusters(strictPairs);
const moderateClusters = buildClusters(moderatePairs);
const looseClusters = buildClusters(loosePairs);

// -----------------------------
// Statistics
// -----------------------------

function printClusterStats(name, pairs, clusters) {
  const duplicateListings = clusters.reduce(
    (sum, cluster) => sum + cluster.length,
    0
  );

  const estimatedUnique =
    listings.length - duplicateListings + clusters.length;

  console.log("\n=================================");
  console.log(name);
  console.log("=================================");

  console.log(`Duplicate pairs: ${pairs.length}`);
  console.log(`Duplicate clusters: ${clusters.length}`);
  console.log(`Listings inside clusters: ${duplicateListings}`);
  console.log(`Estimated unique properties: ${estimatedUnique}`);

  const distribution = {};

  for (const cluster of clusters) {
    const size = cluster.length;

    distribution[size] =
      (distribution[size] || 0) + 1;
  }

  console.log("Cluster size distribution:");

  for (const [size, count] of Object.entries(distribution)) {
    console.log(`  ${size} listings: ${count} clusters`);
  }
}

printClusterStats(
  "STRICT DUPLICATES",
  strictPairs,
  strictClusters
);

printClusterStats(
  "MODERATE DUPLICATES",
  moderatePairs,
  moderateClusters
);

printClusterStats(
  "LOOSE / INVESTIGATION ONLY",
  loosePairs,
  looseClusters
);

// -----------------------------
// Show representative clusters
// -----------------------------

function printExamples(name, clusters, limit = 20) {
  console.log(`\n=================================`);
  console.log(`${name} EXAMPLES`);
  console.log(`=================================`);

  clusters.slice(0, limit).forEach((cluster, index) => {
    console.log(`\nCLUSTER ${index + 1}`);

    console.log({
      size: cluster.length,
      apartment_name: cluster[0].apartment_name,
      locality: cluster[0].locality,
      bedroom: cluster[0].bedroom,
      floor: cluster[0].floor
    });

    console.table(
      cluster.map((listing) => ({
        listing_id: listing.listing_id,
        carpet_area: listing.carpet_area,
        latitude: listing.latitude,
        longitude: listing.longitude,
        price: listing.price,
        website: listing.website,
        project_id: listing.project_id
      }))
    );
  });
}

printExamples(
  "STRICT",
  strictClusters
);

printExamples(
  "MODERATE",
  moderateClusters
);

// -----------------------------
// Save machine-readable output
// -----------------------------

const output = {
  totalListings: listings.length,

  candidatePairs: candidatePairs.length,

  strict: {
    pairs: strictPairs.length,
    clusters: strictClusters.length,
    estimatedUniqueProperties:
      listings.length -
      strictClusters.reduce((s, c) => s + c.length, 0) +
      strictClusters.length
  },

  moderate: {
    pairs: moderatePairs.length,
    clusters: moderateClusters.length,
    estimatedUniqueProperties:
      listings.length -
      moderateClusters.reduce((s, c) => s + c.length, 0) +
      moderateClusters.length
  },

  loose: {
    pairs: loosePairs.length,
    clusters: looseClusters.length,
    estimatedUniqueProperties:
      listings.length -
      looseClusters.reduce((s, c) => s + c.length, 0) +
      looseClusters.length
  },

  strictClusters: strictClusters.map((cluster) =>
    cluster.map((listing) => listing.listing_id)
  ),

  moderateClusters: moderateClusters.map((cluster) =>
    cluster.map((listing) => listing.listing_id)
  )
};

fs.writeFileSync(
  "./data/duplicate-analysis.json",
  JSON.stringify(output, null, 2)
);

console.log(
  "\nSaved detailed results to data/duplicate-analysis.json"
);