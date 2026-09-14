import fs from "fs";
import "dotenv/config";

const API_BASE = process.env.IVY_BASE_URL;

const API_KEY = process.env.IVY_API_KEY;
const EMAIL = process.env.IVY_EMAIL;
const PASSWORD = process.env.IVY_PASSWORD;

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Login failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchAllRentals(token) {
  const allRentals = [];

  let offset = 0;
  const requestedLimit = 50;

  while (true) {
    const url =
      `${API_BASE}/v1/rentals` +
      `?limit=${requestedLimit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Request failed at offset ${offset}: ` +
        `${response.status} ${await response.text()}`
      );
    }

    const data = await response.json();

    const results = data.results || [];

    allRentals.push(...results);

    console.log(
      `offset=${offset} | received=${results.length} | ` +
      `API total=${data.total} | has_more=${data.has_more}`
    );

    if (!data.has_more || results.length === 0) {
      break;
    }

    offset += results.length;
  }

  return allRentals;
}

async function main() {
  console.log("=================================");
  console.log("FETCHING ALL RENTALS");
  console.log("=================================\n");

  const token = await login();

  console.log("Login successful.\n");

  const rentals = await fetchAllRentals(token);

  console.log("\n=================================");
  console.log("FETCH COMPLETE");
  console.log("=================================\n");

  console.log("Total rentals retrieved:", rentals.length);

  fs.mkdirSync("./data", { recursive: true });

  fs.writeFileSync(
    "./data/rentals.json",
    JSON.stringify(rentals, null, 2)
  );

  console.log("\nSaved: data/rentals.json");
}

main().catch(error => {
  console.error("\nERROR:", error.message);
  process.exit(1);
});