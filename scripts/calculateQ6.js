import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("data/listings.json", "utf8")
);

const corruptIds = new Set([
  "ZER-4000021",
  "SQU-4002483",
  "DWE-4001424",
  "ZER-4001287",
  "MAG-4000145",
  "100-4000457",
  "DWE-4002374",
  "ZER-4001669",
  "ZER-4001686"
]);

const fakeIds = new Set([
  "100-4001484",
  "100-4001961",
  "DWE-4000745",
  "MAG-4000075",
  "MAG-4000870",
  "MAG-4001467",
  "MAG-4002092",
  "SQU-4001342",
  "ZER-4002683"
]);

const eligible = listings.filter(
  (l) =>
    l.is_live === true &&
    l.bedroom === 2 &&
    !corruptIds.has(l.listing_id) &&
    !fakeIds.has(l.listing_id)
);

const values = eligible.map(
  (l) => l.price / l.carpet_area
);

const average =
  values.reduce((sum, value) => sum + value, 0) /
  values.length;

console.log("=================================");
console.log("Q6 FINAL CALCULATION");
console.log("=================================");
console.log("Eligible records:", eligible.length);
console.log("Excluded corrupt:", listings.filter(l => corruptIds.has(l.listing_id)).length);
console.log("Excluded fake:", listings.filter(l => fakeIds.has(l.listing_id)).length);
console.log("Average price/sqft:", average.toFixed(2));