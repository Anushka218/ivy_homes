import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

const inactive = listings.filter(
  listing => listing.is_live === false
);

console.log("=================================");
console.log("INACTIVE LISTINGS VERIFICATION");
console.log("=================================\n");

console.log("Total listings:", listings.length);
console.log("Inactive listings:", inactive.length);

console.log("\nSample inactive listings:");

inactive.slice(0, 20).forEach(listing => {
  console.log(
    `${listing.listing_id} | ` +
    `is_live=${listing.is_live} | ` +
    `${listing.apartment_name} | ` +
    `${listing.locality}`
  );
});

fs.writeFileSync(
  "./data/inactive-listings.json",
  JSON.stringify(
    inactive.map(listing => ({
      listing_id: listing.listing_id,
      is_live: listing.is_live,
      apartment_name: listing.apartment_name,
      locality: listing.locality
    })),
    null,
    2
  )
);

console.log("\nSaved: data/inactive-listings.json");