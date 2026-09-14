import "dotenv/config";

const BASE_URL = process.env.IVY_BASE_URL;
const API_KEY = process.env.IVY_API_KEY;
const EMAIL = process.env.IVY_EMAIL;
const PASSWORD = process.env.IVY_PASSWORD;

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
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

async function testEndpoint(endpoint, token) {
  console.log("\n=================================");
  console.log(endpoint);
  console.log("=================================\n");

  // Test documented pagination
  const pageUrl = `${BASE_URL}${endpoint}?page=1&limit=20`;

  const pageResponse = await fetch(pageUrl, {
    headers: {
      "X-API-Key": API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("page=1 response:", pageResponse.status);

  const pageData = await pageResponse.json();

  console.log(
    JSON.stringify(
      {
        limit: pageData.limit,
        offset: pageData.offset,
        count: pageData.count,
        total: pageData.total,
        has_more: pageData.has_more,
        page: pageData.page,
        page_size: pageData.page_size,
      },
      null,
      2
    )
  );

  // Test actual pagination
  const offsetUrl = `${BASE_URL}${endpoint}?limit=20&offset=20`;

  const offsetResponse = await fetch(offsetUrl, {
    headers: {
      "X-API-Key": API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("\noffset=20 response:", offsetResponse.status);

  const offsetData = await offsetResponse.json();

  console.log(
    JSON.stringify(
      {
        limit: offsetData.limit,
        offset: offsetData.offset,
        count: offsetData.count,
        total: offsetData.total,
        has_more: offsetData.has_more,
        page: offsetData.page,
        page_size: offsetData.page_size,
      },
      null,
      2
    )
  );
}

async function main() {
  console.log("Logging in...");

  const token = await login();

  console.log("Login successful.");

  await testEndpoint("/v1/rentals", token);
  await testEndpoint("/v1/projects", token);
}

main().catch(error => {
  console.error("\nERROR:", error.message);
  process.exit(1);
});