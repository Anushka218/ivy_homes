import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("data/listings.json", "utf8")
);

const suspicious = listings
  .filter((l) => l.price > 0 && l.price < 100000)
  .sort((a, b) => a.price - b.price);

console.log("=================================");
console.log("VERY LOW PRICE LISTINGS");
console.log("=================================");
console.log("Count:", suspicious.length);

for (const l of suspicious) {
  console.log({
    listing_id: l.listing_id,
    price: l.price,
    carpet_area: l.carpet_area,
    bedroom: l.bedroom,
    apartment_name: l.apartment_name,
    locality: l.locality,
    is_live: l.is_live,
    is_verified: l.is_verified,
    posted_by: l.posted_by,
    posted_by_contact: l.posted_by_contact,
  });
}