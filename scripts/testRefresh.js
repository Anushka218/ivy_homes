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

  return response.json();
}

async function main() {
  console.log("=================================");
  console.log("REFRESH TOKEN TEST");
  console.log("=================================\n");

  const loginData = await login();

  console.log("Login successful.");
  console.log("Access token received:", Boolean(loginData.access_token));
  console.log("Refresh token received:", Boolean(loginData.refresh_token));
  console.log("Refresh URL:", loginData.refresh_url);
  console.log("Access token expiry:", loginData.expires_in);

  console.log("\nTesting /auth/refresh...\n");

  const response = await fetch(
    `${BASE_URL}${loginData.refresh_url}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        refresh_token: loginData.refresh_token,
      }),
    }
  );

  console.log("Refresh response status:", response.status);

  const data = await response.json();

  // Don't print actual tokens.
  console.log("\nRefresh response structure:");

  console.log(
    JSON.stringify(
      {
        has_access_token: Boolean(data.access_token),
        has_refresh_token: Boolean(data.refresh_token),
        token_type: data.token_type,
        expires_in: data.expires_in,
        refresh_url: data.refresh_url,
        error: data.error,
        detail: data.detail,
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error("\nERROR:", error.message);
  process.exit(1);
});