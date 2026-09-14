import fs from "fs";
import "dotenv/config";

const BASE_URL = process.env.IVY_BASE_URL;
const API_KEY = process.env.IVY_API_KEY;
const EMAIL = process.env.IVY_EMAIL;
const PASSWORD = process.env.IVY_PASSWORD;

let accessToken = null;
let refreshToken = null;

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD
    })
  });

  if (!response.ok) {
    throw new Error(
      `Login failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();

  accessToken = data.access_token;
  refreshToken = data.refresh_token;

  return data;
}

async function refreshAccessToken() {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error(
      `Refresh failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();

  accessToken = data.access_token;
  refreshToken = data.refresh_token;

  console.log("Access token refreshed.");
}

async function fetchProjectListings(token, projectId) {
  const all = [];
  let offset = 0;

  while (true) {
    const url =
      `${BASE_URL}/v1/listings` +
      `?project_id=${encodeURIComponent(projectId)}` +
      `&limit=50&offset=${offset}`;

    let response = await fetch(url, {
      headers: {
        "X-API-Key": API_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    // Token expired → refresh and retry this exact request once.
    if (response.status === 401) {
      await refreshAccessToken();

      response = await fetch(url, {
        headers: {
          "X-API-Key": API_KEY,
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    if (!response.ok) {
      throw new Error(
        `Listing request failed for ${projectId}: ` +
        `${response.status} ${await response.text()}`
      );
    }

    const data = await response.json();
    const results = data.results || [];

    all.push(...results);

    if (!data.has_more || results.length === 0) {
      break;
    }

    offset += results.length;
  }

  return all;
}

async function main() {
  console.log("=================================");
  console.log("Q10 API FILTER VERIFICATION");
  console.log("=================================\n");

  const projects = JSON.parse(
    fs.readFileSync("./data/projects.json", "utf8")
  );

  const loginData = await login();

  console.log("Login successful.");
  console.log(
    `Access token expires in: ${loginData.expires_in} seconds\n`
  );

  const mismatches = [];

  for (const [index, project] of projects.entries()) {
    const actualListings = await fetchProjectListings(
      accessToken,
      project.project_id
    );

    const reported = Number(project.total_listings);
    const actual = actualListings.length;

    if (reported !== actual) {
      mismatches.push({
        project_id: project.project_id,
        reported_total_listings: reported,
        actual_api_listings: actual,
        sample_listing_ids: actualListings
          .slice(0, 5)
          .map(l => l.listing_id)
      });
    }

    if ((index + 1) % 25 === 0) {
      console.log(
        `Checked ${index + 1}/${projects.length} projects`
      );
    }
  }

  console.log("\n=================================");
  console.log("Q10 RESULT");
  console.log("=================================\n");

  console.log(
    "Projects checked:",
    projects.length
  );

  console.log(
    "Projects with wrong listing count:",
    mismatches.length
  );

  console.log("\nSample mismatches:");

  mismatches.slice(0, 20).forEach(x => {
    console.log(
      `${x.project_id} | ` +
      `reported=${x.reported_total_listings} | ` +
      `actual_api=${x.actual_api_listings}`
    );
  });

  fs.writeFileSync(
    "./data/q10-api-mismatches.json",
    JSON.stringify(mismatches, null, 2)
  );

  console.log(
    "\nSaved: data/q10-api-mismatches.json"
  );
}

main().catch(error => {
  console.error("\nERROR:", error.message);
  process.exit(1);
});