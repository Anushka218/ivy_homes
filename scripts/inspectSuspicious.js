import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

const ids = [
  "DWE-4000745",
  "ZER-4002683",
  "100-4001961",
  "100-4001484",
  "SQU-4001342",
  "MAG-4002092",
  "MAG-4000870",
  "MAG-4001467",
  "MAG-4000075"
];

for (const id of ids) {
  const listing = listings.find(
    (l) => l.listing_id === id
  );

  console.log("\n================================");
  console.log(id);
  console.log("================================");

  if (!listing) {
    console.log("NOT FOUND");
    continue;
  }

  console.log({
    listing_id: listing.listing_id,
    apartment_name: listing.apartment_name,
    locality: listing.locality,
    property_type: listing.property_type,
    bedroom: listing.bedroom,
    bathroom: listing.bathroom,
    floor: listing.floor,
    total_floors: listing.total_floors,
    furnishing: listing.furnishing,
    carpet_area: listing.carpet_area,
    super_built_up_area: listing.super_built_up_area,
    price: listing.price,
    price_per_sqft:
      Number(listing.price) /
      Number(listing.carpet_area),
    project_id: listing.project_id,
    latitude: listing.latitude,
    longitude: listing.longitude,
    is_live: listing.is_live,
    is_verified: listing.is_verified,
    posted_at: listing.posted_at,
    posted_by: listing.posted_by,
    posted_by_name: listing.posted_by_name,
    posted_by_contact: listing.posted_by_contact,
    website: listing.website,
    description: listing.description
  });
}