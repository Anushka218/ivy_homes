import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

// Assignment reference timestamp
const referenceDate = new Date(
  "2026-09-10T00:00:00+05:30"
);

// Exactly 7 days before reference timestamp
const startDate = new Date(
  "2026-09-03T00:00:00+05:30"
);

const recentListings = listings.filter(listing => {
  const postedAt = new Date(listing.posted_at);

  return (
    postedAt >= startDate &&
    postedAt < referenceDate
  );
});

console.log("=================================");
console.log("Q8 LAST 7 DAYS ANALYSIS");
console.log("=================================\n");

console.log(
  "Reference date:",
  referenceDate.toISOString()
);

console.log(
  "Window start:",
  startDate.toISOString()
);

console.log(
  "Window end:",
  referenceDate.toISOString()
);

console.log(
  "\nTotal retrievable listings:",
  listings.length
);

console.log(
  "Listings posted in last 7 days:",
  recentListings.length
);

console.log("\n=================================");
console.log("Q8 FINAL ANSWER");
console.log("=================================\n");

console.log(
  "listings_last_7_days:",
  recentListings.length
);

// Save IDs for verification/evidence
fs.writeFileSync(
  "./data/listings-last-7-days.json",
  JSON.stringify(
    recentListings.map(listing => ({
      listing_id: listing.listing_id,
      posted_at: listing.posted_at,
      locality: listing.locality
    })),
    null,
    2
  )
);

console.log(
  "\nSaved: data/listings-last-7-days.json"
);