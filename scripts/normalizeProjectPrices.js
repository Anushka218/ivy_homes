import fs from "fs";

const projects = JSON.parse(
  fs.readFileSync("./data/projects.json", "utf8")
);

function toINR(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return null;
  }

  /*
    Based on the observed data:
    - Values >= 10 appear to be lakh values.
      Example: 99.8 -> ₹99.8 lakh
    - Values < 10 appear to be crore values.
      Example: 3.09 -> ₹3.09 crore

    This is an inference from the dataset's value scale.
  */

  if (n >= 10) {
    return n * 100000;
  }

  return n * 10000000;
}

const normalized = projects
  .map(project => ({
    project_id: project.project_id,
    apartment_name: project.apartment_name,
    locality: project.locality,
    price_min_raw: project.price_min,
    price_max_raw: project.price_max,
    price_min_inr: toINR(project.price_min),
    price_max_inr: toINR(project.price_max)
  }))
  .filter(project =>
    project.price_max_inr !== null
  )
  .sort(
    (a, b) =>
      b.price_max_inr - a.price_max_inr
  );

console.log("=================================");
console.log("NORMALIZED PROJECT PRICES");
console.log("=================================\n");

console.log(
  "Projects analyzed:",
  normalized.length
);

console.log("\nTop 20 by normalized price_max:\n");

normalized.slice(0, 20).forEach((project, index) => {
  console.log(
    `${index + 1}. ` +
    `${project.project_id} | ` +
    `${project.apartment_name} | ` +
    `raw=${project.price_max_raw} | ` +
    `INR=₹${project.price_max_inr.toLocaleString("en-IN")}`
  );
});

console.log("\n=================================");
console.log("Q7 CANDIDATE");
console.log("=================================\n");

const highest = normalized[0];

console.log({
  project_id: highest.project_id,
  apartment_name: highest.apartment_name,
  price_max_raw: highest.price_max_raw,
  price_max_inr: highest.price_max_inr
});

fs.writeFileSync(
  "./data/normalized-project-prices.json",
  JSON.stringify(normalized, null, 2)
);

console.log(
  "\nSaved: data/normalized-project-prices.json"
);