import fs from "fs";

const rentals = JSON.parse(
  fs.readFileSync("./data/rentals.json", "utf8")
);

console.log("=================================");
console.log("Q5 ANNA NAGAR RENT ANALYSIS");
console.log("=================================\n");

const annaNagarRentals = rentals.filter(
  rental =>
    String(rental.locality || "")
      .trim()
      .toLowerCase() === "anna nagar"
);

console.log("Total retrievable rentals:", rentals.length);
console.log("Anna Nagar rentals:", annaNagarRentals.length);

// The actual API field for monthly rent is `price`
const totalMonthlyRent = annaNagarRentals.reduce(
  (sum, rental) => sum + Number(rental.price || 0),
  0
);

console.log("Total monthly rent:", totalMonthlyRent);

console.log("\n=================================");
console.log("Q5 FINAL ANSWER");
console.log("=================================\n");

console.log(
  "total_monthly_rent:",
  totalMonthlyRent
);

// Useful verification
console.log("\nSample prices:");

annaNagarRentals.slice(0, 10).forEach(rental => {
  console.log(
    `${rental.listing_id}: ₹${rental.price}`
  );
});

fs.writeFileSync(
  "./data/anna-nagar-rentals.json",
  JSON.stringify(annaNagarRentals, null, 2)
);

console.log("\nSaved: data/anna-nagar-rentals.json");