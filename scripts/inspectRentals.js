import fs from "fs";

const rentals = JSON.parse(
  fs.readFileSync("./data/rentals.json", "utf8")
);

console.log("=================================");
console.log("RENTAL SCHEMA INSPECTION");
console.log("=================================\n");

console.log("Total rentals:", rentals.length);

console.log("\nFields in first rental:");

console.log(
  Object.keys(rentals[0]).sort()
);

console.log("\nFirst rental:");

console.log(
  JSON.stringify(rentals[0], null, 2)
);

console.log("\n=================================");
console.log("ANNA NAGAR SAMPLE");
console.log("=================================\n");

const annaNagarRentals = rentals.filter(
  rental =>
    String(rental.locality || "")
      .trim()
      .toLowerCase() === "anna nagar"
);

console.log(
  "Anna Nagar records:",
  annaNagarRentals.length
);

console.log(
  JSON.stringify(annaNagarRentals.slice(0, 5), null, 2)
);