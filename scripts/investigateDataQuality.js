import fs from "fs";

const listings = JSON.parse(
  fs.readFileSync("./data/listings.json", "utf8")
);

console.log("TOTAL LISTINGS:", listings.length);


// ==========================================
// 1. Look for suspicious descriptions
// ==========================================

const keywords = [
  "enquir",
  "inquir",
  "contact",
  "call",
  "lead",
  "test",
  "dummy",
  "sample",
  "fake",
  "demo",
  "not available",
  "unavailable",
  "generate",
  "verification"
];

console.log("\n========== KEYWORD MATCHES ==========");

for (const keyword of keywords) {

  const matches = listings.filter((l) => {

    const text = [
      l.title,
      l.description,
      l.apartment_name,
      l.listing_url,
      l.website,
      l.posted_by,
      l.posted_by_name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(keyword);
  });

  console.log(`${keyword}: ${matches.length}`);

  if (matches.length > 0 && matches.length <= 20) {
    console.log(
      matches.map((l) => ({
        listing_id: l.listing_id,
        title: l.title,
        description: l.description,
        website: l.website,
        posted_by: l.posted_by
      }))
    );
  }
}


// ==========================================
// 2. Inspect unusual seller patterns
// ==========================================

console.log("\n========== POSTED_BY COUNTS ==========");

const postedBy = {};

for (const l of listings) {
  const value = l.posted_by ?? "NULL";
  postedBy[value] = (postedBy[value] || 0) + 1;
}

console.table(postedBy);


// ==========================================
// 3. Inspect websites
// ==========================================

console.log("\n========== WEBSITE COUNTS ==========");

const websites = {};

for (const l of listings) {
  const value = l.website ?? "NULL";
  websites[value] = (websites[value] || 0) + 1;
}

console.table(websites);


// ==========================================
// 4. Inspect listing-ID prefixes
// ==========================================

console.log("\n========== LISTING ID PREFIXES ==========");

const prefixes = {};

for (const l of listings) {

  const prefix =
    String(l.listing_id).split("-")[0];

  prefixes[prefix] =
    (prefixes[prefix] || 0) + 1;
}

console.table(prefixes);


// ==========================================
// 5. Inspect suspicious seller contacts
// ==========================================

console.log("\n========== CONTACT PATTERNS ==========");

const contacts = new Map();

for (const l of listings) {

  const contact = l.posted_by_contact;

  if (!contact) continue;

  if (!contacts.has(contact)) {
    contacts.set(contact, []);
  }

  contacts.get(contact).push(l);
}

const repeatedContacts = [...contacts.entries()]
  .filter(([_, records]) => records.length >= 5)
  .sort((a, b) => b[1].length - a[1].length);

console.log(
  "Contacts appearing in >=5 listings:",
  repeatedContacts.length
);

for (const [contact, records] of repeatedContacts.slice(0, 20)) {

  console.log({
    contact,
    count: records.length,
    listing_ids: records
      .slice(0, 20)
      .map((l) => l.listing_id)
  });
}


// ==========================================
// 6. Exact duplicate descriptions
// ==========================================

console.log("\n========== DUPLICATE DESCRIPTIONS ==========");

const descriptions = new Map();

for (const l of listings) {

  if (!l.description) continue;

  const description =
    String(l.description).trim().toLowerCase();

  if (!descriptions.has(description)) {
    descriptions.set(description, []);
  }

  descriptions.get(description).push(l);
}

const duplicateDescriptions =
  [...descriptions.entries()]
    .filter(([_, records]) => records.length >= 2)
    .sort((a, b) => b[1].length - a[1].length);

console.log(
  "Repeated descriptions:",
  duplicateDescriptions.length
);

for (const [description, records] of
     duplicateDescriptions.slice(0, 30)) {

  console.log({
    count: records.length,
    description,
    listing_ids: records.map(
      (l) => l.listing_id
    )
  });
}