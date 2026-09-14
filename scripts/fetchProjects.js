import "dotenv/config";
import fs from "fs";

const API_BASE = "https://solve.ivy.homes";

const API_KEY = process.env.IVY_API_KEY;
const EMAIL = process.env.IVY_EMAIL;
const PASSWORD = process.env.IVY_PASSWORD;

if (!API_KEY || !EMAIL || !PASSWORD) {
  console.error(
    "Missing IVY_API_KEY, IVY_EMAIL, or IVY_PASSWORD in .env"
  );
  process.exit(1);
}


// =====================================
// 1. LOGIN
// =====================================

async function login() {
  console.log("Logging in...");

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",

    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Login failed ${response.status}: ${text}`
    );
  }

  const data = await response.json();

  console.log("Login successful.");

  return data.access_token;
}


// =====================================
// 2. FETCH ALL PROJECTS
// =====================================

async function fetchAllProjects(accessToken) {
  const allProjects = [];

  let offset = 0;
  const limit = 50;

  while (true) {
    const url =
      `${API_BASE}/v1/projects` +
      `?limit=${limit}&offset=${offset}`;

    console.log(`Fetching offset=${offset}...`);

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "X-API-Key": API_KEY,
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        `API error ${response.status}: ${text}`
      );
    }

    const data = await response.json();

    const results = data.results || [];

    console.log(
      `  returned=${results.length}, ` +
      `total=${data.total ?? "?"}, ` +
      `has_more=${data.has_more ?? "?"}`
    );

    allProjects.push(...results);

    if (
      results.length === 0 ||
      data.has_more === false
    ) {
      break;
    }

    offset += results.length;
  }

  return allProjects;
}


// =====================================
// 3. MAIN
// =====================================

const accessToken = await login();

const projects =
  await fetchAllProjects(accessToken);


// =====================================
// 4. SAVE
// =====================================

console.log("\n=================================");
console.log("PROJECT FETCH COMPLETE");
console.log("=================================");

console.log(
  "Total projects retrieved:",
  projects.length
);

fs.mkdirSync("data", { recursive: true });

fs.writeFileSync(
  "data/projects.json",
  JSON.stringify(projects, null, 2)
);

console.log("Saved to data/projects.json");