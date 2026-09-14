import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("data/listings.json", "utf-8")
);

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const broadGroups = new Map();

for (const listing of listings) {
  const key = [
    normalize(listing.apartment_name),
    normalize(listing.locality),
    listing.bedroom,
    listing.floor,
  ].join("|");

  if (!broadGroups.has(key)) {
    broadGroups.set(key, []);
  }

  broadGroups.get(key).push(listing);
}

// Compare every pair inside each broad group.
// We DON'T apply a threshold here.
// We simply calculate the differences.

const pairs = [];

for (const group of broadGroups.values()) {
  if (group.length < 2) continue;

  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i];
      const b = group[j];

      const carpetDiff = Math.abs(
        Number(a.carpet_area) - Number(b.carpet_area)
      );

      const latDiff = Math.abs(
        Number(a.latitude) - Number(b.latitude)
      );

      const lonDiff = Math.abs(
        Number(a.longitude) - Number(b.longitude)
      );

      pairs.push({
        a: a.listing_id,
        b: b.listing_id,

        apartment_name: a.apartment_name,
        locality: a.locality,

        carpetDiff,
        latDiff,
        lonDiff,

        areaA: a.carpet_area,
        areaB: b.carpet_area,

        priceA: a.price,
        priceB: b.price,

        websiteA: a.website,
        websiteB: b.website,
      });
    }
  }
}

// Sort by geographic + area similarity
pairs.sort((x, y) => {
  const scoreX =
    x.carpetDiff +
    x.latDiff * 10000 +
    x.lonDiff * 10000;

  const scoreY =
    y.carpetDiff +
    y.latDiff * 10000 +
    y.lonDiff * 10000;

  return scoreX - scoreY;
});

console.log("=================================");
console.log("DUPLICATE PAIR ANALYSIS");
console.log("=================================");

console.log("Total listings:", listings.length);
console.log("Total candidate pairs:", pairs.length);

// Distribution of area differences
const areaBuckets = {
  "0-2 sqft": 0,
  "3-5 sqft": 0,
  "6-10 sqft": 0,
  "11-20 sqft": 0,
  "21-50 sqft": 0,
  "51+ sqft": 0,
};

for (const pair of pairs) {
  const d = pair.carpetDiff;

  if (d <= 2) areaBuckets["0-2 sqft"]++;
  else if (d <= 5) areaBuckets["3-5 sqft"]++;
  else if (d <= 10) areaBuckets["6-10 sqft"]++;
  else if (d <= 20) areaBuckets["11-20 sqft"]++;
  else if (d <= 50) areaBuckets["21-50 sqft"]++;
  else areaBuckets["51+ sqft"]++;
}

console.log("\nCarpet-area difference distribution:");

for (const [bucket, count] of Object.entries(areaBuckets)) {
  console.log(`${bucket}: ${count}`);
}

// Geographic difference distribution
const coordinateBuckets = {
  "<=0.0001°": 0,
  "<=0.0005°": 0,
  "<=0.001°": 0,
  "<=0.005°": 0,
  ">0.005°": 0,
};

for (const pair of pairs) {
  const distance = Math.max(
    pair.latDiff,
    pair.lonDiff
  );

  if (distance <= 0.0001)
    coordinateBuckets["<=0.0001°"]++;
  else if (distance <= 0.0005)
    coordinateBuckets["<=0.0005°"]++;
  else if (distance <= 0.001)
    coordinateBuckets["<=0.001°"]++;
  else if (distance <= 0.005)
    coordinateBuckets["<=0.005°"]++;
  else
    coordinateBuckets[">0.005°"]++;
}

console.log("\nCoordinate difference distribution:");

for (const [bucket, count] of Object.entries(
  coordinateBuckets
)) {
  console.log(`${bucket}: ${count}`);
}

// Show closest 50 pairs
console.log("\n=================================");
console.log("CLOSEST 50 PAIRS");
console.log("=================================\n");

pairs.slice(0, 50).forEach((pair, index) => {
  console.log(`PAIR ${index + 1}`);

  console.log({
    listingA: pair.a,
    listingB: pair.b,

    apartment_name: pair.apartment_name,
    locality: pair.locality,

    areaA: pair.areaA,
    areaB: pair.areaB,
    carpetDiff: pair.carpetDiff,

    latDiff: pair.latDiff,
    lonDiff: pair.lonDiff,

    websiteA: pair.websiteA,
    websiteB: pair.websiteB,

    priceA: pair.priceA,
    priceB: pair.priceB,
  });

  console.log("--------------------------------");
});