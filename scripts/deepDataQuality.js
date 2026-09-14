import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

console.log("TOTAL:", listings.length);


// ======================================================
// 1. is_verified distribution
// ======================================================

console.log("\n========== VERIFIED STATUS ==========");

const verified = {
  true: 0,
  false: 0,
  null: 0
};

for (const l of listings) {
  if (l.is_verified === true) verified.true++;
  else if (l.is_verified === false) verified.false++;
  else verified.null++;
}

console.table(verified);


// ======================================================
// 2. Unusual numeric values
// ======================================================

console.log("\n========== NUMERIC ANOMALIES ==========");

const numericProblems = listings.filter((l) => {

  return (
    Number(l.bedroom) < 0 ||
    Number(l.bedroom) > 10 ||
    Number(l.bathroom) < 0 ||
    Number(l.bathroom) > 10 ||
    Number(l.floor) < 0 ||
    Number(l.total_floors) < 0 ||
    Number(l.floor) > Number(l.total_floors) ||
    Number(l.carpet_area) <= 0 ||
    Number(l.super_built_up_area) <= 0 ||
    Number(l.price) <= 0
  );

});

console.log("Count:", numericProblems.length);

for (const l of numericProblems) {
  console.log({
    listing_id: l.listing_id,
    bedroom: l.bedroom,
    bathroom: l.bathroom,
    floor: l.floor,
    total_floors: l.total_floors,
    carpet_area: l.carpet_area,
    super_built_up_area: l.super_built_up_area,
    price: l.price,
    is_live: l.is_live,
    is_verified: l.is_verified
  });
}


// ======================================================
// 3. Carpet area > super built-up area
// ======================================================

console.log("\n========== AREA ANOMALIES ==========");

const areaProblems = listings.filter(
  (l) =>
    Number(l.carpet_area) >
    Number(l.super_built_up_area)
);

console.log("Count:", areaProblems.length);

for (const l of areaProblems) {
  console.log({
    listing_id: l.listing_id,
    carpet_area: l.carpet_area,
    super_built_up_area: l.super_built_up_area
  });
}


// ======================================================
// 4. Future posted dates
// ======================================================

console.log("\n========== FUTURE DATES ==========");

const reference = new Date(
  "2026-09-10T00:00:00+05:30"
);

const futureListings = listings.filter(
  (l) =>
    l.posted_at &&
    new Date(l.posted_at) >= reference
);

console.log("Count:", futureListings.length);

for (const l of futureListings) {
  console.log({
    listing_id: l.listing_id,
    posted_at: l.posted_at
  });
}


// ======================================================
// 5. Location anomalies
// Chennai approximate bounding box
// ======================================================

console.log("\n========== LOCATION ANOMALIES ==========");

const locationProblems = listings.filter((l) => {

  const lat = Number(l.latitude);
  const lon = Number(l.longitude);

  return (
    lat < 12.7 ||
    lat > 13.3 ||
    lon < 79.9 ||
    lon > 80.4
  );

});

console.log("Count:", locationProblems.length);

for (const l of locationProblems) {
  console.log({
    listing_id: l.listing_id,
    latitude: l.latitude,
    longitude: l.longitude,
    locality: l.locality
  });
}


// ======================================================
// 6. Price / sqft extreme outliers
// ======================================================

console.log("\n========== PRICE / SQFT EXTREMES ==========");

const priceSqft = listings
  .filter(
    (l) =>
      Number(l.price) > 0 &&
      Number(l.carpet_area) > 0
  )
  .map((l) => ({
    listing_id: l.listing_id,
    price: Number(l.price),
    area: Number(l.carpet_area),
    ppsf:
      Number(l.price) /
      Number(l.carpet_area)
  }))
  .sort((a, b) => a.ppsf - b.ppsf);

console.log("\nCHEAPEST 20:");

console.table(priceSqft.slice(0, 20));

console.log("\nCOSTLIEST 20:");

console.table(priceSqft.slice(-20).reverse());


// ======================================================
// 7. Seller/contact + identical property details
// ======================================================

console.log("\n========== SAME CONTACT + SAME PROPERTY ==========");

const contactGroups = new Map();

for (const l of listings) {

  if (!l.posted_by_contact) continue;

  if (!contactGroups.has(l.posted_by_contact)) {
    contactGroups.set(l.posted_by_contact, []);
  }

  contactGroups
    .get(l.posted_by_contact)
    .push(l);
}

const suspiciousContactGroups = [];

for (const [contact, records] of contactGroups) {

  if (records.length < 3) continue;

  const propertyKeys = new Set(
    records.map((l) =>
      [
        l.apartment_name,
        l.locality,
        l.bedroom,
        l.floor,
        l.carpet_area
      ].join("|")
    )
  );

  if (propertyKeys.size === 1) {
    suspiciousContactGroups.push({
      contact,
      count: records.length,
      listing_ids: records.map(
        (l) => l.listing_id
      )
    });
  }
}

console.log(
  "Groups with same contact + same property signature:",
  suspiciousContactGroups.length
);

for (const group of suspiciousContactGroups) {
  console.log(group);
}


// ======================================================
// 8. Duplicate URL
// ======================================================

console.log("\n========== DUPLICATE LISTING URLS ==========");

const urlMap = new Map();

for (const l of listings) {

  if (!l.listing_url) continue;

  if (!urlMap.has(l.listing_url)) {
    urlMap.set(l.listing_url, []);
  }

  urlMap.get(l.listing_url).push(l.listing_id);
}

const duplicateUrls = [
  ...urlMap.entries()
].filter(([_, ids]) => ids.length > 1);

console.log("Count:", duplicateUrls.length);

for (const [url, ids] of duplicateUrls) {
  console.log({
    url,
    listing_ids: ids
  });
}


// ======================================================
// 9. Duplicate listing details across different IDs
// ======================================================

console.log(
  "\n========== IDENTICAL PROPERTY DETAILS =========="
);

const propertyMap = new Map();

for (const l of listings) {

  const key = [
    l.apartment_name,
    l.locality,
    l.bedroom,
    l.floor,
    l.carpet_area,
    l.super_built_up_area,
    l.latitude,
    l.longitude
  ].join("|");

  if (!propertyMap.has(key)) {
    propertyMap.set(key, []);
  }

  propertyMap.get(key).push(l);
}

const exactPropertyDuplicates = [
  ...propertyMap.values()
].filter((records) => records.length > 1);

console.log(
  "Exact duplicate property groups:",
  exactPropertyDuplicates.length
);

for (const records of exactPropertyDuplicates) {

  console.log(
    records.map((l) => ({
      listing_id: l.listing_id,
      website: l.website,
      apartment_name: l.apartment_name,
      locality: l.locality,
      bedroom: l.bedroom,
      floor: l.floor,
      carpet_area: l.carpet_area,
      latitude: l.latitude,
      longitude: l.longitude,
      price: l.price,
      is_live: l.is_live,
      is_verified: l.is_verified
    }))
  );
}