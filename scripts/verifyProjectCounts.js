import fs from "fs";

const projects = JSON.parse(
  fs.readFileSync("./data/projects.json", "utf8")
);

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

const results = [];

for (const project of projects) {
  const projectListings = listings.filter(
    listing => listing.project_id === project.project_id
  );

  const actualAll = projectListings.length;

  const actualLive = projectListings.filter(
    listing => listing.is_live === true
  ).length;

  const reported = Number(project.total_listings);

  if (reported !== actualAll || reported !== actualLive) {
    results.push({
      project_id: project.project_id,
      project_name: project.apartment_name,
      reported_total_listings: reported,
      actual_all_listings: actualAll,
      actual_live_listings: actualLive
    });
  }
}

console.log("=================================");
console.log("PROJECT LISTING COUNT VERIFICATION");
console.log("=================================\n");

console.log("Projects:", projects.length);
console.log("Listings:", listings.length);
console.log(
  "Projects with incorrect total_listings:",
  results.length
);

console.log("\nSample mismatches:");

results.slice(0, 20).forEach(project => {
  console.log(
    `${project.project_id} | ` +
    `reported=${project.reported_total_listings} | ` +
    `all=${project.actual_all_listings} | ` +
    `live=${project.actual_live_listings}`
  );
});

fs.writeFileSync(
  "./data/project-count-mismatches.json",
  JSON.stringify(results, null, 2)
);

console.log(
  "\nSaved: data/project-count-mismatches.json"
);
