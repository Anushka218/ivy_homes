import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("data/listings.json", "utf8")
);

const positive = listings
  .filter((l) => l.price > 0)
  .sort((a, b) => a.price - b.price);

console.log("=================================");
console.log("LOWEST POSITIVE PRICES");
console.log("=================================");

for (const l of positive.slice(0, 20)) {
  console.log({
    listing_id: l.listing_id,
    price: l.price,
    carpet_area: l.carpet_area,
    price_per_sqft: Number(
      (l.price / l.carpet_area).toFixed(2)
    ),
    bedroom: l.bedroom,
    apartment_name: l.apartment_name,
    locality: l.locality
  });
}

console.log("\n=================================");
console.log("PRICE THRESHOLD CHECK");
console.log("=================================");

for (const threshold of [100000, 500000, 1000000, 5000000]) {
  console.log(
    `price < ₹${threshold.toLocaleString("en-IN")}:`,
    listings.filter(
      (l) => l.price > 0 && l.price < threshold
    ).length
  );
}