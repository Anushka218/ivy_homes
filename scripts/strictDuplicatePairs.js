import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf-8")
);

function normalize(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function areaDiff(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    return Infinity;
  }

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

// ------------------------------------
// Group by broad identity
// ------------------------------------

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

// ------------------------------------
// Generate STRICT pairs
// ------------------------------------

const pairs = [];

for (const group of groups.values()) {
  if (group.length < 2) continue;

  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i];
      const b = group[j];

      const area = areaDiff(
        a.carpet_area,
        b.carpet_area
      );

      const coord = coordinateDistance(a, b);

      if (area <= 5 && coord <= 0.0005) {
        pairs.push({
          listingA: a.listing_id,
          listingB: b.listing_id,

          apartment_name: a.apartment_name,
          locality: a.locality,
          bedroom: a.bedroom,
          floor: a.floor,

          carpet_area_A: a.carpet_area,
          carpet_area_B: b.carpet_area,
          carpet_difference: area,

          latitude_A: a.latitude,
          longitude_A: a.longitude,

          latitude_B: b.latitude,
          longitude_B: b.longitude,

          coordinate_difference: coord,

          price_A: a.price,
          price_B: b.price,

          website_A: a.website,
          website_B: b.website,

          project_id_A: a.project_id,
          project_id_B: b.project_id,

          is_live_A: a.is_live,
          is_live_B: b.is_live,

          is_verified_A: a.is_verified,
          is_verified_B: b.is_verified,

          posted_at_A: a.posted_at,
          posted_at_B: b.posted_at
        });
      }
    }
  }
}

pairs.sort(
  (a, b) =>
    a.locality.localeCompare(b.locality) ||
    a.apartment_name.localeCompare(b.apartment_name)
);

console.log("=================================");
console.log("STRICT DUPLICATE PAIRS");
console.log("=================================");

console.log(`Total listings: ${listings.length}`);
console.log(`Strict duplicate pairs: ${pairs.length}`);

console.table(
  pairs.map((p) => ({
    A: p.listingA,
    B: p.listingB,
    property: p.apartment_name,
    locality: p.locality,
    bedrooms: p.bedroom,
    floor: p.floor,
    areaDiff: p.carpet_difference,
    coordDiff: Number(
      p.coordinate_difference.toFixed(6)
    ),
    priceA: p.price_A,
    priceB: p.price_B,
    websiteA: p.website_A,
    websiteB: p.website_B
  }))
);

fs.writeFileSync(
  "./data/strict-duplicate-pairs.json",
  JSON.stringify(pairs, null, 2)
);

console.log(
  "\nSaved to data/strict-duplicate-pairs.json"
);