import fs from "fs";

const projects = JSON.parse(
  fs.readFileSync("data/projects.json", "utf8")
);

console.log("=================================");
console.log("PROJECT DATA INSPECTION");
console.log("=================================");

console.log("Total projects:", projects.length);

if (projects.length > 0) {
  console.log("\nFirst project:");
  console.dir(projects[0], { depth: null });

  console.log("\nFields:");
  console.log(Object.keys(projects[0]).sort());
}

console.log("\n=================================");
console.log("TOP 20 BY price_max");
console.log("=================================");

const sorted = [...projects]
  .sort((a, b) => Number(b.price_max) - Number(a.price_max))
  .slice(0, 20);

for (const p of sorted) {
  console.log({
    project_id: p.project_id,
    apartment_name: p.apartment_name,
    locality: p.locality,
    price_min: p.price_min,
    price_max: p.price_max,
    total_listings: p.total_listings,
  });
}