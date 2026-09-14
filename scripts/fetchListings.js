import "dotenv/config";
import fs from "fs";
const BASE_URL = process.env.IVY_BASE_URL;
const API_KEY = process.env.IVY_API_KEY;

let accessToken = null;

// -----------------------------
// Login
// -----------------------------
async function login() {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
            email: process.env.IVY_EMAIL,
            password: process.env.IVY_PASSWORD,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `Login failed (${response.status}): ${JSON.stringify(data)}`
        );
    }

    accessToken = data.access_token;

    console.log("Logged in successfully");
    console.log("Token expires in:", data.expires_in, "seconds");
}

// -----------------------------
// Get one page of listings
// -----------------------------
async function getListings(limit, offset) {
    const response = await fetch(
        `${BASE_URL}/v1/listings?limit=${limit}&offset=${offset}`,
        {
            headers: {
                "X-API-Key": API_KEY,
                "Authorization": `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `Listings request failed (${response.status}): ${JSON.stringify(data)}`
        );
    }

    return data;
}

// -----------------------------
// Fetch all listings
// -----------------------------
async function fetchAllListings() {
    await login();

    const allListings = [];

    let offset = 0;
    const requestedLimit = 50;

    let lastResponse = null;

    while (true) {
        console.log(`Fetching offset ${offset}...`);

        const data = await getListings(requestedLimit, offset);

        lastResponse = data;

        allListings.push(...data.results);

        console.log(
            `Received ${data.results.length} records | ` +
            `Total collected: ${allListings.length} | ` +
            `API total: ${data.total} | ` +
            `Has more: ${data.has_more}`
        );

        // Check whether we have crossed the API-reported total
        if (offset >= data.total) {
            console.log(
                "\n⚠️ We are now beyond the API-reported total."
            );

            console.log(
                "Records returned beyond reported total:",
                data.results.map((listing) => listing.listing_id)
            );
        }

        // Stop only when API says there are no more records
        if (!data.has_more) {
            break;
        }

        // Move according to the number actually returned
        offset += data.results.length;
    }

    console.log("\n==============================");
    console.log("FETCH COMPLETE");
    console.log("==============================");

    console.log("API reported total:", lastResponse.total);
    console.log("Records collected:", allListings.length);
    console.log("Last response count:", lastResponse.count);
    console.log("Last response has_more:", lastResponse.has_more);
    console.log("Last offset:", offset);

    fs.writeFileSync(
    "./data/listings.json",
    JSON.stringify(allListings, null, 2)
);

console.log("Saved listings to data/listings.json");

return allListings;
}

// -----------------------------
// Run
// -----------------------------
fetchAllListings()
    .then(() => {
        console.log("\nDone.");
    })
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
    });