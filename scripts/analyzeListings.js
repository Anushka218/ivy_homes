import fs from "fs";

const listings = JSON.parse(
    fs.readFileSync("./data/listings.json", "utf-8")
);

console.log("Total retrieved records:", listings.length);

// ------------------------------------
// Check duplicate listing IDs
// ------------------------------------

const idCounts = new Map();

for (const listing of listings) {
    const id = listing.listing_id;

    idCounts.set(
        id,
        (idCounts.get(id) || 0) + 1
    );
}

const duplicateIds = [];

for (const [id, count] of idCounts) {
    if (count > 1) {
        duplicateIds.push({
            listing_id: id,
            count
        });
    }
}

console.log("\nUnique listing IDs:", idCounts.size);

console.log(
    "Duplicate listing IDs:",
    duplicateIds.length
);

if (duplicateIds.length > 0) {
    console.log("\nDuplicates:");
    console.log(duplicateIds);
}