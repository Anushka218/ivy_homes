import fs from "fs";

const listings = JSON.parse(
    fs.readFileSync("./data/listings.json", "utf-8")
);

console.log("Total listings:", listings.length);

console.log("\nFields in first listing:");

console.log(
    Object.keys(listings[0]).sort()
);

console.log("\nFirst listing:");

console.log(
    JSON.stringify(listings[0], null, 2)
);