import fs from "fs";

const BASE_URL = "https://solve.ivy.homes";
const API_KEY = process.env.IVY_API_KEY;
const TOKEN = process.env.IVY_TOKEN;

if (!API_KEY || !TOKEN) {
  throw new Error(
    "Set IVY_API_KEY and IVY_TOKEN environment variables first."
  );
}

const headers = {
  "X-API-Key": API_KEY,
  Authorization: `Bearer ${TOKEN}`,
};

async function fetchAll(endpoint, filename) {
  const all = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url =
      `${BASE_URL}${endpoint}` +
      `?limit=${limit}&offset=${offset}`;

    console.log(`GET ${url}`);

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `${response.status} ${await response.text()}`
      );
    }

    const data = await response.json();

    const results = data.results || [];

    all.push(...results);

    console.log(
      `Received ${results.length}; total collected: ${all.length}`
    );

    if (!data.has_more || results.length === 0) {
      break;
    }

    offset += results.length;
  }

  fs.writeFileSync(
    filename,
    JSON.stringify(all, null, 2)
  );

  console.log(
    `\nSaved ${all.length} records to ${filename}`
  );

  return all;
}

await fetchAll(
  "/v1/rentals",
  "./data/rentals.json"
);

await fetchAll(
  "/v1/projects",
  "./data/projects.json"
);