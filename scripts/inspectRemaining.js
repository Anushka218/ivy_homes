import fs from "fs";

const rentals = JSON.parse(
  fs.readFileSync("./data/rentals.json", "utf8")
);

const projects = JSON.parse(
  fs.readFileSync("./data/projects.json", "utf8")
);

console.log("\n========== RENTALS ==========");
console.log("Total:", rentals.length);
console.log("Fields:", Object.keys(rentals[0]));

console.log("\nFirst rental:");
console.dir(rentals[0], { depth: null });


console.log("\n========== PROJECTS ==========");
console.log("Total:", projects.length);
console.log("Fields:", Object.keys(projects[0]));

console.log("\nFirst project:");
console.dir(projects[0], { depth: null });