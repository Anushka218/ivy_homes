import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

const rentals = JSON.parse(
  fs.readFileSync("./data/rentals.json", "utf8")
);

const projects = JSON.parse(
  fs.readFileSync("./data/projects.json", "utf8")
);

const REFERENCE = new Date("2026-09-10T00:00:00+05:30");
const SEVEN_DAYS_AGO = new Date(
  REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000
);

console.log("========================================");
console.log("IVY HOMES ASSIGNMENT ANALYSIS");
console.log("========================================");


// --------------------------------------------------
// Q1
// --------------------------------------------------

console.log("\nQ1. TOTAL LISTING RECORDS");
console.log(listings.length);


// --------------------------------------------------
// Q3
// --------------------------------------------------

const activeListings = listings.filter(
  (l) => l.is_live === true
);

console.log("\nQ3. ACTIVE LISTINGS");
console.log(activeListings.length);


// --------------------------------------------------
// Q4 — inspect obvious corrupt records
// --------------------------------------------------

const corruptListings = listings.filter((l) => {
  return (
    l.price == null ||
    l.price <= 0 ||
    l.carpet_area == null ||
    l.carpet_area <= 0 ||
    l.latitude == null ||
    l.longitude == null ||
    l.bedroom == null ||
    l.bedroom < 0
  );
});

console.log("\nQ4. POSSIBLE CORRUPT LISTINGS");
console.log("Count:", corruptListings.length);

for (const l of corruptListings) {
  console.log({
    listing_id: l.listing_id,
    price: l.price,
    carpet_area: l.carpet_area,
    bedroom: l.bedroom,
    latitude: l.latitude,
    longitude: l.longitude,
    is_live: l.is_live,
  });
}


// --------------------------------------------------
// Q5 — total monthly rent in Anna Nagar
// --------------------------------------------------

const annaNagarRentals = rentals.filter(
  (r) =>
    String(r.locality).toLowerCase() === "anna nagar"
);

const totalMonthlyRent = annaNagarRentals.reduce(
  (sum, r) => sum + Number(r.price || 0),
  0
);

console.log("\nQ5. ANNA NAGAR RENTALS");
console.log("Rental records:", annaNagarRentals.length);
console.log("Total monthly rent:", totalMonthlyRent);


// --------------------------------------------------
// Q6 — average price / sqft for live 2BHK
// Exclude corrupt + fake later once identified
// --------------------------------------------------

const live2BHK = listings.filter(
  (l) =>
    l.is_live === true &&
    Number(l.bedroom) === 2 &&
    Number(l.carpet_area) > 0 &&
    Number(l.price) > 0
);

const pricePerSqft = live2BHK.map(
  (l) => Number(l.price) / Number(l.carpet_area)
);

const avgPricePerSqft =
  pricePerSqft.reduce((a, b) => a + b, 0) /
  pricePerSqft.length;

console.log("\nQ6. LIVE 2BHK PRICE / SQFT");
console.log("Records:", live2BHK.length);
console.log("Average:", avgPricePerSqft.toFixed(2));


// --------------------------------------------------
// Q7 — costliest project
// --------------------------------------------------

const costliestProject = projects.reduce(
  (max, p) =>
    Number(p.price_max) > Number(max.price_max)
      ? p
      : max,
  projects[0]
);

console.log("\nQ7. COSTLIEST PROJECT");

console.log({
  project_id: costliestProject.project_id,
  apartment_name: costliestProject.apartment_name,
  price_max: costliestProject.price_max,
  locality: costliestProject.locality,
});


// --------------------------------------------------
// Q8 — listings posted in previous 7 days
// [REFERENCE - 7 days, REFERENCE)
// --------------------------------------------------

const recentListings = listings.filter((l) => {
  if (!l.posted_at) return false;

  const posted = new Date(l.posted_at);

  return (
    posted >= SEVEN_DAYS_AGO &&
    posted < REFERENCE
  );
});

console.log("\nQ8. LISTINGS LAST 7 DAYS");
console.log("Count:", recentListings.length);

console.log(
  "Window:",
  SEVEN_DAYS_AGO.toISOString(),
  "to",
  REFERENCE.toISOString()
);


// --------------------------------------------------
// Q9 — inspect suspicious/fake listings
// --------------------------------------------------

const suspiciousListings = listings.filter((l) => {
  const text = [
    l.description,
    l.title,
    l.apartment_name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("fake") ||
    text.includes("test listing") ||
    text.includes("generate enquiries") ||
    text.includes("generate inquiries")
  );
});

console.log("\nQ9. SUSPICIOUS / FAKE LISTINGS");
console.log("Count:", suspiciousListings.length);

for (const l of suspiciousListings) {
  console.log({
    listing_id: l.listing_id,
    title: l.title,
    description: l.description,
    is_live: l.is_live,
  });
}


// --------------------------------------------------
// Q10 — project listing-count consistency
// --------------------------------------------------

const listingsByProject = new Map();

for (const listing of listings) {
  if (!listing.project_id) continue;

  const current =
    listingsByProject.get(listing.project_id) || 0;

  listingsByProject.set(
    listing.project_id,
    current + 1
  );
}

const wrongProjectCounts = [];

for (const project of projects) {
  const actual =
    listingsByProject.get(project.project_id) || 0;

  const reported = Number(project.total_listings);

  if (actual !== reported) {
    wrongProjectCounts.push({
      project_id: project.project_id,
      apartment_name: project.apartment_name,
      reported,
      actual,
    });
  }
}

console.log("\nQ10. PROJECTS WITH WRONG LISTING COUNT");
console.log("Count:", wrongProjectCounts.length);

console.dir(
  wrongProjectCounts,
  { depth: null }
);


// --------------------------------------------------
// EXTRA DATA QUALITY SUMMARY
// --------------------------------------------------

console.log("\n========================================");
console.log("DATA QUALITY SUMMARY");
console.log("========================================");

console.log("Listings:", listings.length);
console.log("Live listings:", activeListings.length);
console.log("Rentals:", rentals.length);
console.log("Projects:", projects.length);
console.log("Anna Nagar rentals:", annaNagarRentals.length);
console.log("Recent listings:", recentListings.length);
console.log(
  "Projects with wrong listing count:",
  wrongProjectCounts.length
);