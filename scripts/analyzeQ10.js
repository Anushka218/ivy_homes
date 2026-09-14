import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("data/listings.json", "utf8")
);

const projects = JSON.parse(
  fs.readFileSync("data/projects.json", "utf8")
);


// =====================================
// 1. COUNT LISTINGS PER PROJECT
// =====================================

const allListingCounts = new Map();
const liveListingCounts = new Map();

for (const listing of listings) {
  if (!listing.project_id) continue;

  const projectId = listing.project_id;

  // Count ALL retrievable listing records
  allListingCounts.set(
    projectId,
    (allListingCounts.get(projectId) || 0) + 1
  );

  // Count only live listings
  if (listing.is_live === true) {
    liveListingCounts.set(
      projectId,
      (liveListingCounts.get(projectId) || 0) + 1
    );
  }
}


// =====================================
// 2. COMPARE PROJECT COUNTS
// =====================================

const mismatches = [];

for (const project of projects) {
  const projectId = project.project_id;

  const reported = Number(project.total_listings);

  const actualAll =
    allListingCounts.get(projectId) || 0;

  const actualLive =
    liveListingCounts.get(projectId) || 0;

  if (reported !== actualAll) {
    mismatches.push({
      project_id: projectId,
      apartment_name: project.apartment_name,
      locality: project.locality,
      reported,
      actual_all: actualAll,
      actual_live: actualLive,
      difference: actualAll - reported,
    });
  }
}


// =====================================
// 3. SORT
// =====================================

mismatches.sort((a, b) =>
  a.project_id.localeCompare(b.project_id)
);


// =====================================
// 4. OUTPUT
// =====================================

console.log("=================================");
console.log("Q10 PROJECT LISTING COUNT ANALYSIS");
console.log("=================================");

console.log("Projects:", projects.length);
console.log("Listings:", listings.length);

console.log(
  "Projects with wrong listing count:",
  mismatches.length
);

console.log("\n=================================");
console.log("FIRST 30 MISMATCHES");
console.log("=================================");

console.dir(
  mismatches.slice(0, 30),
  { depth: null }
);


// =====================================
// 5. CHECK WHETHER LIVE COUNT MATCHES
// =====================================

let matchesAll = 0;
let matchesLive = 0;
let matchesNeither = 0;

for (const project of projects) {
  const id = project.project_id;
  const reported = Number(project.total_listings);

  const allCount =
    allListingCounts.get(id) || 0;

  const liveCount =
    liveListingCounts.get(id) || 0;

  if (reported === allCount) {
    matchesAll++;
  } else if (reported === liveCount) {
    matchesLive++;
  } else {
    matchesNeither++;
  }
}

console.log("\n=================================");
console.log("WHAT DOES total_listings REPRESENT?");
console.log("=================================");

console.log(
  "Matches ALL listing records:",
  matchesAll
);

console.log(
  "Matches LIVE listing records:",
  matchesLive
);

console.log(
  "Matches NEITHER:",
  matchesNeither
);


// =====================================
// 6. SAVE EXACT IDs
// =====================================

const wrongProjectIds =
  mismatches.map((x) => x.project_id);

fs.writeFileSync(
  "data/wrong-project-counts.json",
  JSON.stringify(mismatches, null, 2)
);

fs.writeFileSync(
  "data/wrong-project-ids.json",
  JSON.stringify(wrongProjectIds, null, 2)
);

console.log("\nSaved:");
console.log("  data/wrong-project-counts.json");
console.log("  data/wrong-project-ids.json");