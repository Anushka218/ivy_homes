import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

console.log("=================================");
console.log("Q3 ACTIVE LISTINGS ANALYSIS");
console.log("=================================\n");

const activeListings = listings.filter(
  listing => listing.is_live === true
);

const inactiveListings = listings.filter(
  listing => listing.is_live === false
);

const missingIsLive = listings.filter(
  listing =>
    listing.is_live !== true &&
    listing.is_live !== false
);

console.log("Total retrievable listing records:", listings.length);
console.log("Active (is_live = true):", activeListings.length);
console.log("Inactive (is_live = false):", inactiveListings.length);
console.log("Missing/invalid is_live:", missingIsLive.length);

console.log("\n=================================");
console.log("Q3 FINAL ANSWER");
console.log("=================================\n");

console.log(
  "active_listings:",
  activeListings.length
);

// Save IDs for evidence
fs.writeFileSync(
  "./data/active-listing-ids.json",
  JSON.stringify(
    activeListings.map(l => l.listing_id),
    null,
    2
  )
);

console.log(
  "\nSaved: data/active-listing-ids.json"
);