import fs from "fs";

const projects = JSON.parse(
  fs.readFileSync("./data/projects.json", "utf8")
);

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

console.log("=================================");
console.log("Q7 COSTLIEST PROJECT ANALYSIS");
console.log("=================================\n");

// --------------------------------------------------
// 1. Find project with highest price_max
// --------------------------------------------------

const validProjects = projects.filter(
  p =>
    typeof p.price_max === "number" &&
    Number.isFinite(p.price_max)
);

validProjects.sort((a, b) => b.price_max - a.price_max);

const topProjects = validProjects.slice(0, 20);

console.log("TOP 20 PROJECTS BY price_max:\n");

console.table(
  topProjects.map(p => ({
    project_id: p.project_id,
    apartment_name: p.apartment_name,
    locality: p.locality,
    price_min: p.price_min,
    price_max: p.price_max,
    total_listings: p.total_listings
  }))
);

// --------------------------------------------------
// 2. Top project
// --------------------------------------------------

const top = topProjects[0];

console.log("\n=================================");
console.log("COSTLIEST PROJECT CANDIDATE");
console.log("=================================\n");

console.log(top);

// --------------------------------------------------
// 3. Find listings belonging to this project
// --------------------------------------------------

const projectListings = listings.filter(
  listing => listing.project_id === top.project_id
);

console.log("\n=================================");
console.log("LISTINGS FOR TOP PROJECT");
console.log("=================================\n");

console.log(
  `Project: ${top.project_id} - ${top.apartment_name}`
);

console.log(
  `Listings found: ${projectListings.length}\n`
);

console.table(
  projectListings.map(l => ({
    listing_id: l.listing_id,
    price_inr: l.price,
    bedroom: l.bedroom,
    carpet_area: l.carpet_area,
    is_live: l.is_live,
    locality: l.locality,
    apartment_name: l.apartment_name
  }))
);

// --------------------------------------------------
// 4. Compare project price_max with listing prices
// --------------------------------------------------

const listingPrices = projectListings
  .map(l => l.price)
  .filter(
    price =>
      typeof price === "number" &&
      Number.isFinite(price) &&
      price > 0
  );

const maxListingPrice =
  listingPrices.length > 0
    ? Math.max(...listingPrices)
    : null;

console.log("\n=================================");
console.log("PRICE COMPARISON");
console.log("=================================\n");

console.log("Project price_min:", top.price_min);
console.log("Project price_max:", top.price_max);
console.log("Maximum listing price:", maxListingPrice);

if (maxListingPrice !== null) {
  console.log(
    "\nProject price_max / maximum listing price:",
    top.price_max / maxListingPrice
  );

  console.log(
    "Project price_max × 1,00,000:",
    top.price_max * 100000
  );

  console.log(
    "Project price_max × 10,00,000:",
    top.price_max * 1000000
  );

  console.log(
    "Project price_max × 1,00,00,000:",
    top.price_max * 10000000
  );
}

// --------------------------------------------------
// 5. Inspect all top projects against their listings
// --------------------------------------------------

console.log("\n=================================");
console.log("TOP PROJECTS VS LISTING PRICES");
console.log("=================================\n");

for (const project of topProjects.slice(0, 10)) {
  const matchingListings = listings.filter(
    l => l.project_id === project.project_id
  );

  const prices = matchingListings
    .map(l => l.price)
    .filter(
      p =>
        typeof p === "number" &&
        Number.isFinite(p) &&
        p > 0
    );

  const maxPrice =
    prices.length > 0 ? Math.max(...prices) : null;

  console.log({
    project_id: project.project_id,
    apartment_name: project.apartment_name,
    project_price_min: project.price_min,
    project_price_max: project.price_max,
    listing_count: matchingListings.length,
    max_listing_price_inr: maxPrice
  });
}

// --------------------------------------------------
// 6. Candidate INR conversions
// --------------------------------------------------

console.log("\n=================================");
console.log("Q7 CANDIDATE INR CONVERSIONS");
console.log("=================================\n");

console.log({
  project_id: top.project_id,
  raw_price_max: top.price_max,

  if_lakhs:
    top.price_max * 100000,

  if_million:
    top.price_max * 1000000,

  if_crore:
    top.price_max * 10000000
});

console.log("\n=================================");
console.log("NEXT STEP");
console.log("=================================");
console.log(
  "Use the listing prices above to determine which unit interpretation is actually supported by the dataset."
);