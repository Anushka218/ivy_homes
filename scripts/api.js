import "dotenv/config";

const BASE_URL = process.env.IVY_BASE_URL;
const API_KEY = process.env.IVY_API_KEY;

let accessToken = null;

async function request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `${response.status} ${response.statusText}: ${JSON.stringify(data)}`
        );
    }

    return data;
}

export async function login() {
    const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: process.env.IVY_EMAIL,
            password: process.env.IVY_PASSWORD,
        }),
    });

    accessToken = data.access_token;

    console.log("Login successful");
    console.log("Token expires in:", data.expires_in, "seconds");

    return data;
}

export async function getListings(params = "") {
    return request(`/v1/listings${params}`);
}

await login();

const data = await getListings("?limit=200&offset=0");

console.log("Response limit:", data.limit);
console.log("Total:", data.total);
console.log("Returned:", data.results.length);
console.log("Has more:", data.has_more);