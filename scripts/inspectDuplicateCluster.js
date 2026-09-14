import fs from "fs";

const clusters = JSON.parse(
  fs.readFileSync("./data/q2-property-clusters.json", "utf8")
);

// Cluster 240 from our previous analysis
const clusterId = 240;

const cluster = clusters.find(
  c => c.cluster_number === clusterId
);

if (!cluster) {
  console.log("Cluster not found.");
  process.exit(1);
}

console.log("=================================");
console.log("DUPLICATE CLUSTER INSPECTION");
console.log("=================================\n");

console.log("Cluster:", clusterId);
console.log("Number of records:", cluster.listings.length);

console.log("\nRecords:\n");

cluster.listings.forEach((listing, index) => {
  console.log(`--- Record ${index + 1} ---`);

  console.log({
    listing_id: listing.listing_id,
    apartment_name: listing.apartment_name,
    locality: listing.locality,
    bedroom: listing.bedroom,
    floor: listing.floor,
    carpet_area: listing.carpet_area,
    super_built_up_area: listing.super_built_up_area,
    latitude: listing.latitude,
    longitude: listing.longitude,
    price: listing.price,
    project_id: listing.project_id,
    website: listing.website,
    posted_by: listing.posted_by
  });
});