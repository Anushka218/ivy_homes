import fs from "fs";

const projects = JSON.parse(
  fs.readFileSync("./data/projects.json", "utf8")
);

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

console.log("=================================");
console.log("PROJECT PRICE UNIT ANALYSIS");
console.log("=================================\n");

const candidates = projects
  .filter(
    p =>
      typeof p.price_min === "number" &&
      typeof p.price_max === "number"
  )
  .sort((a, b) => b.price_max - a.price_max);

console.log("Projects with numeric price ranges:", candidates.length);

console.log("\nTop 20 projects by raw price_max:\n");

for (const project of candidates.slice(0, 20)) {
  const projectListings = listings.filter(
    listing => listing.project_id === project.project_id
  );

  const listingPrices = projectListings
    .map(l => Number(l.price))
    .filter(Number.isFinite);

  const maxListingPrice =
    listingPrices.length > 0
      ? Math.max(...listingPrices)
      : null;

  console.log(
    `${project.project_id} | ` +
    `${project.apartment_name} | ` +
    `price_min=${project.price_min} | ` +
    `price_max=${project.price_max} | ` +
    `listing_count=${projectListings.length} | ` +
    `max_listing_price=${maxListingPrice}`
  );
}

console.log("\n=================================");
console.log("UNIT CONVERSION CHECK");
console.log("=================================\n");

const p40231 = projects.find(
  p => p.project_id === "P40231"
);

if (p40231) {
  console.log("P40231:", {
    project_id: p40231.project_id,
    apartment_name: p40231.apartment_name,
    price_min: p40231.price_min,
    price_max: p40231.price_max
  });

  console.log("\nPossible interpretations of price_max:");

  console.log(
    `Raw value: ${p40231.price_max}`
  );

  console.log(
    `× 100,000 = ₹${p40231.price_max * 100000}`
  );

  console.log(
    `× 1,000,000 = ₹${p40231.price_max * 1000000}`
  );

  console.log(
    `× 10,000,000 = ₹${p40231.price_max * 10000000}`
  );

  const matchingListings = listings.filter(
    l => l.project_id === "P40231"
  );

  console.log("\nListings with P40231:");

  matchingListings.forEach(l => {
    console.log(
      `${l.listing_id} | ₹${l.price}`
    );
  });
}