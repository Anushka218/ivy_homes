# Ivy Homes — Property Discovery & API Investigation

A production-oriented property discovery application built for the Ivy Homes Software Engineering Internship assignment.

The project has two equally important parts:

1. A working authenticated property-discovery frontend for Chennai / Anna Nagar.
2. A systematic investigation of the Ivy Homes API to determine where the supplied AI-generated API documentation differs from the behavior of the running API.

The central engineering principle followed throughout the project was:

> **Treat the running API as the source of truth, not the supplied documentation.**

The application was therefore implemented against observed API behavior, while the investigation records reproducible discrepancies between the documented and actual contracts.

---

# 1. Assignment Context

The supplied API documentation was explicitly described as AI-generated from old changelogs/internal notes and potentially incorrect.

The assignment required building a frontend while simultaneously determining which parts of the API documentation could actually be trusted.

The assigned location was:

- **City:** Chennai
- **Locality:** Anna Nagar

The required frontend functionality included:

- Real authentication
- Session persistence across refresh
- Long-lived session handling through token refresh
- Paginated/infinite property listings
- Locality, bedroom/BHK, price and furnishing filtering
- Listing detail pages with URL-based navigation
- Saved listings that persist for the authenticated user
- Rental browsing
- Project browsing
- Correct display of prices and areas
- An analytics/insights section

The investigation additionally required answering ten data questions and documenting API/documentation discrepancies.

---

# 2. Engineering Approach

The implementation was deliberately not built by blindly following `API_REFERENCE.md`.

Instead, the workflow was:

```text
API_REFERENCE.md
       |
       v
Identify documented claims
       |
       v
Convert claims into testable hypotheses
       |
       v
Send controlled API requests
       |
       v
Compare documented vs actual responses
       |
       v
Retrieve complete datasets
       |
       v
Run data-quality / consistency checks
       |
       v
Implement application against observed behavior
       |
       v
Record reproducible findings
```

This was particularly important for:

- Authentication
- Pagination
- Filtering
- Dataset completeness
- Listing status
- Saved listings
- Rental fields
- Project price units
- Duplicate property identification
- Data-quality anomalies

---

# 3. Application Features

## 3.1 Authentication

The application implements real authentication against the Ivy Homes API.

The authentication flow handles:

- Login
- Access-token storage
- Refresh-token storage
- Authentication state restoration
- Automatic token refresh
- Retrying requests after a `401`
- Logout

The API's actual token lifetime was found to be **900 seconds**, rather than the 24-hour lifetime described by the documentation.

The application therefore implements the actual refresh-token flow instead of assuming that the initial access token remains valid for 24 hours.

### Authentication Flow

```text
User
 |
 | Login
 v
/api/auth/login
 |
 v
access_token + refresh_token
 |
 +----------------------------+
 |                            |
 v                            v
API requests             Token expiry
                              |
                              v
                       /api/auth/refresh
                              |
                              v
                       New access token
                              |
                              v
                       Retry API request
```

---

# 4. Listings

The main listings page provides:

- Property cards
- Locality filtering
- BHK filtering
- Price filtering
- Furnishing filtering
- Live-status filtering
- Pagination
- Listing detail navigation

The application does not assume that all documented filters work correctly on the server.

During API investigation, some parameters were accepted by the API but did not actually filter the response as documented.

The frontend therefore uses a hybrid approach:

```text
API-supported filtering
        +
client-side filtering where API behavior is unreliable
        |
        v
correct user-visible filtering
```

This was chosen because the assignment explicitly prioritizes **correct behavior over blindly delegating every filter to the API**.

---

# 5. Listing Details

Each listing can be opened using a dedicated route:

```text
/listings/:listingId
```

The listing detail page is URL-addressable, which means a specific property can be refreshed or directly navigated to.

The detail view uses the actual listing record returned by the API.

Seller-provided content is treated as **untrusted data**.

This is important because some listing descriptions contained prompt-injection-style text attempting to influence the behavior of an AI system.

The frontend therefore treats seller descriptions strictly as display data and does not execute or follow instructions contained inside them.

---

# 6. Saved Listings

Users can:

- Save a listing
- Remove a listing
- View saved listings
- Reload the application while remaining authenticated
- Revisit their saved collection

The saved-listing source of truth is the server-side API rather than browser-only storage.

During investigation, the documented favourites endpoint was tested and did not provide the working endpoint.

The actual working route observed was:

```text
/v1/saved
```

The application accounts for this difference through its API layer.

---

# 7. Rentals

The rentals page retrieves rental records from the API and displays:

- Property information
- Monthly rent
- Area
- Locality
- Bedroom information
- Furnishing information

The implementation uses the actual field names returned by the API.

In particular, the observed rental response uses:

```text
price
```

for the rental amount rather than the documented:

```text
monthly_rent
```

The frontend normalizes the response before rendering it.

---

# 8. Projects

The projects page retrieves and displays project information including:

- Project name
- Developer
- Area
- Price range
- Location
- Project status
- Project metadata

The raw project price values were found to use lakh/crore-style scales rather than consistently representing integer INR amounts as described by the documentation.

A centralized project-normalization utility is therefore used by the frontend.

The normalization rule was derived from the observed dataset and associated listing values. It should be considered an **empirical dataset interpretation**, not an official API contract.

---

# 9. Insights

The application includes an Insights page containing the major results of the API/data investigation.

It exposes metrics such as:

- Total retrieved listing records
- Active listings
- Inactive listings
- Retrieved rental records
- Retrieved project records
- Anna Nagar rental total
- Average 2BHK price per square foot
- Recent listing count
- Estimated unique properties
- Data-quality anomalies
- Duplicate-property analysis

The purpose of this page is to make the investigation results visible within the application rather than keeping them only in standalone scripts.

---

# 10. Technology Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS
- JavaScript

## Backend / API Layer

- Vercel Serverless Functions
- Node.js
- Ivy Homes REST API

## Data Investigation

- Node.js
- JavaScript
- JSON
- Git / GitHub

---

# 11. Project Structure

```text
ivy_assig/
│
├── api/
│   └── [...path].js
│
├── data/
│   ├── listings.json
│   └── rentals.json
│
├── scripts/
│   ├── data retrieval scripts
│   ├── analysis scripts
│   ├── duplicate-property analysis
│   ├── project-count verification
│   └── assignment calculation scripts
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   └── src/
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── Layout.jsx
│       │   │
│       │   ├── common/
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── ErrorAlert.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   ├── Pagination.jsx
│       │   │   └── Badge.jsx
│       │   │
│       │   └── listings/
│       │       ├── ListingCard.jsx
│       │       ├── ListingFilters.jsx
│       │       ├── RentalCard.jsx
│       │       └── ProjectCard.jsx
│       │
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── SavedContext.jsx
│       │
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useSaved.js
│       │   └── useDebounce.js
│       │
│       ├── services/
│       │   ├── api.js
│       │   ├── authService.js
│       │   ├── listingsService.js
│       │   ├── savedService.js
│       │   ├── rentalsService.js
│       │   └── projectsService.js
│       │
│       ├── utils/
│       │   ├── priceFormatter.js
│       │   ├── projectNormalizer.js
│       │   ├── areaFormatter.js
│       │   └── sanitize.js
│       │
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── ListingsPage.jsx
│       │   ├── ListingDetailPage.jsx
│       │   ├── RentalsPage.jsx
│       │   ├── ProjectsPage.jsx
│       │   ├── SavedPage.jsx
│       │   ├── InsightsPage.jsx
│       │   └── NotFoundPage.jsx
│       │
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── submission.json
├── vercel.json
└── README.md
```

---

# 12. Frontend Architecture

The frontend is organized around a service/context/component/page separation.

```text
Pages
  |
  +---- Components
  |
  +---- Hooks
  |
  +---- Context
  |
  +---- Services
           |
           v
       API layer
           |
           v
      Ivy Homes API
```

## `services/`

The service layer isolates API communication from UI components.

### `api.js`

Provides the shared request layer.

Responsibilities include:

- Attaching authentication headers
- Making API requests
- Handling `401` responses
- Refreshing expired access tokens
- Retrying failed requests

### `authService.js`

Handles:

- Login
- Refresh

### `listingsService.js`

Handles:

- Listing retrieval
- Pagination
- Listing lookup
- Mapping application filters to observed API parameters
- Client-side filtering where necessary

### `savedService.js`

Handles the saved-listing API.

### `rentalsService.js`

Handles rental retrieval and normalization.

### `projectsService.js`

Handles project retrieval and price normalization.

---

# 13. React Contexts

## `AuthContext`

Centralizes authentication state so that authentication does not have to be independently implemented by every page.

It handles:

- Current user
- Access token
- Refresh token
- Login state
- Logout
- Session restoration
- Token refresh

---

## `SavedContext`

Provides application-wide access to saved listing state.

This prevents individual listing cards/pages from having to independently maintain the user's saved collection.

---

# 14. Utility Layer

## `priceFormatter.js`

Centralizes INR formatting so that price presentation remains consistent.

---

## `areaFormatter.js`

Handles the different area field names observed across the API.

---

## `projectNormalizer.js`

Contains the empirical normalization logic required for project prices.

Keeping this logic in one place avoids scattering assumptions about project price units throughout the UI.

---

## `sanitize.js`

Handles untrusted API-provided text before rendering it.

This is particularly important because property descriptions are seller-controlled content.

---

# 15. API Investigation

The API investigation was treated as a separate engineering problem from the frontend.

The supplied documentation was converted into testable claims.

For example:

```text
Documentation claim:
"Pagination uses page and limit."

Test:
Request page=1 and page=2.
Compare with offset-based requests.

Observation:
Response contains offset and has_more.
Changing page does not implement the documented behavior.

Conclusion:
Documented pagination contract is unreliable.
```

This process was repeated for authentication, filters, response fields, dataset counts, and other documented behavior.

---

# 16. Authentication Investigation

## Documented Behavior

The documentation described:

- API key as a query parameter
- Login returning `token`
- 24-hour token expiry
- No refresh endpoint

## Observed Behavior

The running API rejected the query-parameter form and explicitly required the API key in:

```text
X-API-Key
```

The login response instead returned:

```text
access_token
refresh_token
token_type
expires_in
refresh_url
user
```

The observed access-token expiry was:

```text
900 seconds
```

The API also exposes:

```text
POST /auth/refresh
```

Therefore the authentication documentation was materially different from the running API.

---

# 17. Pagination Investigation

The documentation described:

```text
page
limit
```

with a response shaped approximately as:

```text
{
    total,
    page,
    page_size,
    results
}
```

The observed listings response instead used:

```text
{
    limit,
    offset,
    count,
    total,
    has_more,
    results
}
```

The same offset-based behavior was observed for rentals and projects.

The listing endpoint also capped:

```text
limit=200
```

to:

```text
limit=50
```

This was important because simply requesting the documented maximum would not retrieve the expected number of records.

---

# 18. Complete Dataset Retrieval

The assignment defines a "Retrievable" record as one that can be obtained by calling the endpoint without filters and paging fully to the end.

Therefore, the investigation did not trust the API's `total` value as the only source of truth.

The collections were retrieved until the API indicated that no more records were available.

Observed results:

| Endpoint | API reported | Records retrieved |
|---|---:|---:|
| Listings | 3,789 | 4,100 |
| Rentals | 1,432 | 1,550 |
| Projects | 425 | 460 |

This discrepancy is one of the strongest examples of why the documentation and API metadata had to be independently validated.

---

# 19. Listing Status Investigation

The documentation described `/v1/listings` as returning active sale listings.

However, the actual listing records contain:

```text
is_live
```

and inactive records were present.

The complete listing dataset contained:

```text
Total records: 4100
Live records: 3233
Inactive records: 867
```

For the assignment's definition of active listings, `is_live === true` was therefore used.

---

# 20. Filter Investigation

The frontend requirements depend on reliable filtering.

The documented filters were tested individually rather than assuming that accepted query parameters imply correct semantics.

Observed behavior:

| Filter | Observed behavior |
|---|---|
| `locality` | Works server-side |
| `bhk` | Works server-side |
| `bedroom` / `bedrooms` | Not the effective bedroom filter |
| `min_price` | Accepted but did not filter as expected |
| `max_price` | Accepted but did not filter as expected |
| `furnishing` | Did not filter as expected |

Because correctness was more important than reducing the number of requests, the application retrieves the required dataset and applies local filtering where server-side behavior was unreliable.

---

# 21. Listing Identity / Duplicate Investigation

The assignment asks for the number of unique physical properties, not simply the number of listing records.

A direct:

```text
unique listing_id count
```

would therefore not be sufficient.

The investigation compared listing records using combinations of:

- Apartment name
- Locality
- Bedroom count
- Floor
- Carpet area
- Super-built-up area
- Coordinates
- Project ID
- Website/source

Exact matching was intentionally not treated as the only duplicate criterion because the same physical property can appear in multiple listings with slightly different metadata.

A similarity-based clustering approach was therefore used.

The analysis identified:

- 384 candidate duplicate pairs
- 357 duplicate-like clusters
- 735 listings belonging to candidate clusters

After validation and confidence classification, the resulting estimate was:

```text
Estimated unique physical properties: 3,722
```

This is explicitly an **estimate**, because the API does not expose a canonical physical-property ID that can prove the answer directly.

---

# 22. Example Duplicate Clusters

One strong example was:

```text
MAG-4002146
ZER-4004034
MAG-4003580
MAG-4003900
```

These records shared highly similar:

- Property/project name
- Locality
- Bedroom count
- Floor
- Carpet area
- Coordinates

but had different listing IDs and, in some cases, different project/source metadata.

Another strong cluster included:

```text
ZER-4003256
DWE-4003328
DWE-4000061
```

Again, the records were highly similar in property characteristics and geographic location.

These examples demonstrate why listing count and physical-property count cannot simply be treated as the same number.

---

# 23. Data-Quality Investigation

The complete listing dataset was inspected for anomalous prices.

Exactly nine records had negative prices.

The corrupt listing IDs are:

```text
100-4000457
DWE-4001424
DWE-4002374
MAG-4000145
SQU-4002483
ZER-4000021
ZER-4001287
ZER-4001669
ZER-4001686
```

These records were excluded from calculations where the assignment explicitly requires corrupt listings to be excluded.

---

# 24. Fake / Suspicious Listing Investigation

Nine listings were identified as fake/suspicious based on their extremely small positive prices relative to the rest of the sale dataset.

The IDs are:

```text
100-4001484
100-4001961
DWE-4000745
MAG-4000075
MAG-4000870
MAG-4001467
MAG-4002092
SQU-4001342
ZER-4002683
```

Their price-per-square-foot values were approximately:

```text
9.48
8.59
7.57
75.52
10.92
11.57
10.43
9.83
8.01
```

The conclusion is based on the dataset's internal distribution and anomalies.

These should not be interpreted as proof of real-world fraud; they are classified as fake/suspicious for the assignment's data-analysis requirement.

---

# 25. Rental Investigation

The rental endpoint reported:

```text
1,432
```

records.

Complete pagination produced:

```text
1,550
```

retrievable records.

The actual rental response uses:

```text
price
```

as the rental amount field.

For Anna Nagar, the retrieved dataset contains:

```text
150
```

records.

The total monthly rent used for the assignment is:

```text
₹53,30,500
```

---

# 26. Project Investigation

The projects endpoint reported:

```text
425
```

records.

Complete retrieval produced:

```text
460
```

project records.

Project records contain fields including:

- `project_id`
- `apartment_name`
- `developer_name`
- `price_min`
- `price_max`
- `min_area_sqft`
- `max_area_sqft`
- `total_units`
- `total_towers`
- `total_floors`
- `project_status`
- `launch_date`
- `possession_date`
- `latitude`
- `longitude`

The price representation was investigated because raw values did not consistently behave like integer INR values.

---

# 27. Costliest Project

After normalizing project prices, the highest observed project was:

```text
Project ID: P40224
Project: Shriram Serenity
Price Max: ₹3,78,00,000
```

The raw maximum price value corresponds to the observed crore-scale interpretation.

Associated listing records were also inspected as a sanity check against the normalized project price.

---

# 28. Project Listing-Count Consistency

The project `total_listings` value was compared against listing records associated with each project.

The analysis identified:

```text
336
```

projects with incorrect listing counts under the primary comparison used for the assignment.

This is treated as a data-consistency finding rather than assuming that the project's reported count is authoritative.

The more extensive verification process produced a slightly different count under a stricter comparison criterion, so the submitted answer uses the primary analysis value of **336** rather than overstating the verification as more definitive than it is.

---

# 29. Seven-Day Listing Calculation

The assignment specifies the reference timestamp:

```text
2026-09-10T00:00:00+05:30
```

The required seven-day interval was interpreted as:

```text
[2026-09-03T00:00:00+05:30,
 2026-09-10T00:00:00+05:30)
```

The number of listings posted in this interval was:

```text
122
```

---

# 30. Assignment Answers

The current calculated answers are:

| Question | Answer |
|---|---|
| `total_listing_records` | **4,100** |
| `unique_properties` | **3,722** |
| `active_listings` | **3,233** |
| `corrupt_listing_ids` | **9 IDs** |
| `total_monthly_rent` | **5,330,500 INR** |
| `avg_price_per_sqft_2bhk` | **16,174.70 INR/sqft** |
| `costliest_project` | **P40224 — 37,800,000 INR** |
| `listings_last_7_days` | **122** |
| `fake_listing_ids` | **9 IDs** |
| `projects_with_wrong_listing_count` | **336** |

---

# 31. Corrupt Listing IDs

```text
100-4000457
DWE-4001424
DWE-4002374
MAG-4000145
SQU-4002483
ZER-4000021
ZER-4001287
ZER-4001669
ZER-4001686
```

---

# 32. Fake Listing IDs

```text
100-4001484
100-4001961
DWE-4000745
MAG-4000075
MAG-4000870
MAG-4001467
MAG-4002092
SQU-4001342
ZER-4002683
```

---

# 33. Average 2BHK Price / Sq. Ft.

The calculation was performed using:

- Live listings
- BHK = 2
- Corrupt listings excluded
- Fake listings excluded

The number of eligible live 2BHK records before exclusions was:

```text
1,091
```

The resulting average was:

```text
₹16,174.70 / sq.ft.
```

The calculation is based on the actual retrieved listing records rather than trusting a precomputed API statistic.

---

# 34. API Documentation Findings

The following discrepancies were reproduced during investigation.

## Finding 1 — API Key Location

**Category:** `auth`

**Documented:**

```text
?api_key=...
```

**Actual:**

```text
X-API-Key: ...
```

**Impact:**

Clients following the documentation fail authentication.

---

## Finding 2 — Login Response Contract

**Category:** `auth`

The documentation describes:

```text
token
expires_in = 86400
```

The API actually returns:

```text
access_token
refresh_token
expires_in = 900
refresh_url
```

**Impact:**

A client implemented strictly against the documentation would parse the wrong field and assume an incorrect token lifetime.

---

## Finding 3 — Refresh Endpoint

**Category:** `undocumented_endpoint`

Actual endpoint:

```text
POST /auth/refresh
```

This endpoint is not described in the supplied documentation.

**Impact:**

A production client needs refresh behavior even though the documentation does not expose it.

---

## Finding 4 — Listings Pagination

**Category:** `pagination`

The documentation describes page-based pagination.

Actual behavior uses:

```text
offset
limit
has_more
```

The maximum effective listing limit observed was 50.

**Impact:**

A page-based implementation can retrieve incorrect or incomplete data.

---

## Finding 5 — Rentals Pagination

**Category:** `pagination`

The rental endpoint also uses:

```text
offset
limit
```

rather than the documented page-based model.

---

## Finding 6 — Projects Pagination

**Category:** `pagination`

The projects endpoint uses:

```text
offset
limit
```

rather than the documented page-based model.

---

## Finding 7 — Listings Completeness

**Category:** `completeness`

The listings endpoint reported:

```text
3,789
```

but full retrieval produced:

```text
4,100
```

records.

---

## Finding 8 — Rentals Completeness

**Category:** `completeness`

The rentals endpoint reported:

```text
1,432
```

but full retrieval produced:

```text
1,550
```

records.

---

## Finding 9 — Projects Completeness

**Category:** `completeness`

The projects endpoint reported:

```text
425
```

but full retrieval produced:

```text
460
```

records.

---

## Finding 10 — Listings Are Not Active-Only

**Category:** `completeness`

The documentation describes the listings endpoint as active-only.

Actual records include:

```text
is_live = false
```

The complete dataset contains:

```text
3233 live
867 inactive
```

---

## Finding 11 — Duplicate Physical Properties

**Category:** `duplicates`

Multiple listing IDs can represent the same apparent physical property.

This was established through property-identity analysis using:

- Name
- Locality
- Bedroom
- Floor
- Area
- Coordinates
- Project information

---

## Finding 12 — Project Price Units

**Category:** `units`

Project prices do not consistently appear as integer INR values as described in the documentation.

The returned dataset contains values whose scale corresponds to lakh/crore-style representations.

---

## Finding 13 — Rental Price Field

**Category:** `units`

The documented rental field is:

```text
monthly_rent
```

The observed field is:

```text
price
```

---

## Finding 14 — Negative Listing Prices

**Category:** `data_quality`

Nine listing records contain negative prices.

These are treated as corrupt records for the assignment.

---

## Finding 15 — Suspicious/Fake Listings

**Category:** `fraud`

Nine records contain extremely anomalous positive prices relative to the rest of the sale dataset.

These were classified as fake/suspicious records for the assignment.

---

# 35. What Was Checked and Found Correct

The investigation was not limited to finding discrepancies.

Claims were also tested and accepted where the running API behaved consistently with expectations.

The following areas were successfully verified during implementation/investigation:

### Authentication

- Valid credentials can authenticate successfully.
- Bearer authentication works for protected endpoints.
- Refresh-token authentication works.

### Listing Retrieval

- Listings can be retrieved through the documented collection endpoint.
- Listing records contain the observed property metadata.
- Individual listing records can be used to construct listing-detail views.

### Locality Filtering

The API's locality parameter was observed to affect the returned dataset.

### BHK Filtering

The `bhk` parameter was observed to affect the returned dataset.

### Rental Retrieval

Rental records can be fully retrieved using the observed offset-based pagination.

### Project Retrieval

Project records can be fully retrieved using the observed offset-based pagination.

### Health Endpoint

The health endpoint is accessible without normal user authentication and exposes server/reference-date information useful for interpreting time-based assignment questions.

### Saved Listing Functionality

The running API provides working saved-listing functionality through the observed `/v1/saved` route.

---

# 36. Security Considerations

The project treats API content as untrusted.

This is particularly important because sellers can control listing descriptions.

A listing description may contain text such as an instruction to an AI assistant.

The application does **not** treat that content as an instruction.

Instead:

```text
API response
     |
     v
untrusted data
     |
     v
sanitize / safely render
     |
     v
UI
```

---

# 37. API Key Handling

The API key is intentionally kept out of the browser bundle.

The application uses a server-side API layer so the browser communicates with:

```text
/api/...
```

while the server-side function communicates with the Ivy Homes API using the secret API key.

The deployment environment contains the secret rather than the React source.

The API key should never be committed to GitHub.

The local `.env` file is therefore excluded through `.gitignore`.

---

# 38. Vercel Deployment

The project contains a Vercel configuration that builds the frontend from:

```text
frontend/
```

and uses the serverless API functions under:

```text
api/
```

The production architecture is:

```text
Browser
   |
   v
Vercel
   |
   +---- React application
   |
   +---- /api serverless functions
              |
              | X-API-Key
              v
        Ivy Homes API
```

The production API key is configured through Vercel environment variables rather than being hardcoded in frontend code.

---

# 39. Local Development

## Prerequisites

Install:

- Node.js
- npm

You also need the Ivy Homes API credential supplied for the assignment.

---

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Configure Environment

The server-side API layer expects:

```env
IVY_API_KEY=<your-api-key>
```

Do not commit this value.

---

## Run Frontend

```bash
cd frontend
npm run dev
```

The Vite development server will provide the local application URL.

---

## Build

```bash
cd frontend
npm run build
```

---

# 40. Testing Checklist

Before submission, the application should be tested through the following flow.

## Authentication

- [ ] Open login page
- [ ] Login with valid credentials
- [ ] Confirm authenticated navigation
- [ ] Refresh browser
- [ ] Confirm session remains active
- [ ] Confirm token refresh works
- [ ] Logout
- [ ] Confirm protected routes require authentication

## Listings

- [ ] Listings load
- [ ] Pagination works
- [ ] Locality filter works
- [ ] BHK filter works
- [ ] Price filter works
- [ ] Furnishing filter works
- [ ] Live/inactive filter works
- [ ] Listing card opens detail page

## Listing Details

- [ ] `/listings/:id` loads
- [ ] Browser refresh on detail URL works
- [ ] Listing information is displayed correctly

## Saved Listings

- [ ] Save a listing
- [ ] Remove a listing
- [ ] Open Saved page
- [ ] Refresh browser
- [ ] Confirm saved state persists
- [ ] Logout/login again
- [ ] Confirm saved state remains associated with the user

## Rentals

- [ ] Rentals page loads
- [ ] Prices display correctly
- [ ] Areas display correctly
- [ ] Pagination works

## Projects

- [ ] Projects page loads
- [ ] Project prices display correctly
- [ ] Areas display correctly
- [ ] Pagination works

## Insights

- [ ] Insights page loads
- [ ] Listing counts are displayed
- [ ] Rental statistics are displayed
- [ ] Project statistics are displayed
- [ ] 2BHK price/sqft statistic is displayed
- [ ] Recent listing count is displayed
- [ ] Data-quality information is visible

## Deployment

- [ ] Production login works
- [ ] Production listings work
- [ ] Production detail-page refresh works
- [ ] Production saved listings work
- [ ] Production rentals work
- [ ] Production projects work
- [ ] Production insights work

---

# 41. Limitations

## Unique Property Count

The value:

```text
3,722
```

is an estimate.

The API does not provide a canonical physical-property identifier sufficient to directly calculate this number.

The result therefore depends on entity-resolution heuristics.

---

## Project Price Interpretation

The project price normalization is based on the observed dataset.

It should not be represented as an official API contract without confirmation from Ivy Homes.

---

## Server-Side Filter Reliability

Some documented filters are accepted by the API without producing the documented filtering behavior.

The frontend compensates with local filtering.

For a larger production dataset, this would ideally be replaced with a reliable backend filtering/query layer.

---

## Project Listing Count

The submitted `336` value comes from the primary project-count analysis.

A stricter follow-up comparison produced a slightly different value, which is why this README does not present the number as an unquestionable API truth.

---

# 42. Why the Frontend Uses Full Dataset Hydration

For this assignment, retrieving the full dataset was intentional.

The assignment specifically asks for:

- Complete record counts
- Data-quality analysis
- Duplicate-property analysis
- Fraud/fake detection
- Project/listing consistency checks

In addition, some server-side filters were found to be unreliable.

Therefore:

```text
Full retrieval
     |
     +---- analytics
     |
     +---- duplicate analysis
     |
     +---- data-quality checks
     |
     +---- client-side filtering
```

was appropriate for the assignment-sized dataset.

This would not necessarily be the architecture chosen for a production dataset containing millions of listings.

---

# 43. What I Would Change for a Production System

If this were being developed beyond the assignment, I would move several responsibilities out of the browser.

## Server-Side Data Layer

Instead of retrieving thousands of records to the client, I would introduce:

```text
Ivy API
   |
   v
Ingestion / normalization service
   |
   v
Indexed database
   |
   v
Application API
   |
   v
Frontend
```

This would allow:

- Efficient filtering
- Server-side pagination
- Indexed locality queries
- Price-range queries
- Faster initial page loads
- Reduced bandwidth

---

## Stronger Data Validation

I would formalize validation rules for:

- Negative prices
- Impossible areas
- Suspicious price/sqft
- Invalid coordinates
- Missing required fields
- Project/listing inconsistencies

These rules could run during ingestion instead of only during analysis.

---

## Automated Contract Tests

I would add automated tests that periodically verify important API assumptions:

```text
Authentication contract
Pagination contract
Response field contract
Filter behavior
Saved-listing behavior
```

This would detect future API changes early.

---

## Better Duplicate Detection

The current duplicate-property analysis is heuristic.

A production implementation could use a dedicated property-identity model based on:

- Normalized address
- Geospatial clustering
- Building/project identifiers
- Unit characteristics
- Apartment numbers
- Historical listing relationships

The output could include a confidence score instead of a single binary duplicate decision.

---

# 44. What I Would Do With Two More Days

If given two additional development days, I would prioritize the following.

### Day 1 — Reliability

1. Add automated API contract tests.
2. Add frontend tests for authentication and filtering.
3. Add tests for token refresh and retry behavior.
4. Improve error states.
5. Add stronger validation around malformed API records.
6. Verify every production route after deployment.

### Day 2 — Production Architecture

1. Move full-dataset processing away from the browser.
2. Introduce server-side normalized query endpoints.
3. Add caching for listings/projects/rentals.
4. Add structured logging.
5. Add monitoring for upstream API contract changes.
6. Improve duplicate-property resolution.
7. Improve accessibility and mobile responsiveness.

The goal would be to move the application from an assignment-optimized architecture toward a production-ready data platform.

---

# 45. AI / LLM Usage Disclosure

LLMs were used as development assistance during this project.

They were used for tasks such as:

- Exploring implementation approaches
- Debugging
- Refactoring
- Understanding API behavior
- Generating investigation scripts
- Reviewing code structure
- Improving documentation
- Reasoning about edge cases

However, API findings were not accepted merely because an LLM suggested them.

Important findings were validated against actual API requests and retrieved records.

The core investigation methodology was:

```text
LLM suggestion
     |
     v
Hypothesis
     |
     v
Actual API request / dataset
     |
     v
Evidence
     |
     v
Final conclusion
```

This distinction was especially important because the assignment itself is about identifying cases where generated documentation is incorrect.

---

# 46. Repository Hygiene

The repository should not contain:

```text
.env
```

or any other file containing the API credential.

Generated dependencies such as:

```text
node_modules/
```

and build output should also remain excluded from source control where appropriate.

The repository should contain the source code, investigation scripts, required data artifacts, `submission.json`, and this README.

---

# 47. Submission Structure

The assignment submission is represented by:

```text
submission.json
```

at the repository root.

It contains:

```text
candidate
answers
findings
```

and the required API-key field.

Before final submission, the following candidate fields must contain the actual submission values:

```text
candidate.name
candidate.email
candidate.repo_url
candidate.demo_url
```

The API credential must remain private and should only be present where required by the assignment submission mechanism.

---

# 48. Final Engineering Summary

This project was intentionally approached as both a frontend implementation task and an API-reliability investigation.

The most important engineering lesson from the assignment was:

> **An API contract is a hypothesis until it is validated against the running system.**

Several documented assumptions were found to be incorrect, including:

- API-key placement
- Authentication response structure
- Token lifetime
- Refresh-token behavior
- Pagination model
- Pagination limits
- Collection totals
- Listing status semantics
- Filter behavior
- Rental field names
- Project price units
- Saved-listing endpoint

The frontend was then implemented around the observed behavior rather than the incorrect assumptions.

At the same time, the investigation went beyond endpoint behavior and examined the underlying data for:

- Duplicate physical properties
- Invalid prices
- Suspicious/fake listings
- Project/listing inconsistencies
- Dataset completeness
- Time-window statistics

The resulting application prioritizes:

```text
Correctness
    >
Documentation assumptions
```

and:

```text
Observed API behavior
    +
Reproducible evidence
    +
Explicit uncertainty
```

over unsupported certainty.

That approach was used throughout the project so that both the application and the submitted API findings remain explainable and defensible.
