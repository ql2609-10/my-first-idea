# Nextstep student job finder

Real employer postings from 35 public Ashby job boards. Every listing links to its original employer-hosted page. This is a broad job catalog; its count is not a count of guaranteed graduate-eligible roles.

## Run and validate

- `node scripts/build.mjs`
- `node scripts/dev.mjs` (http://localhost:5179)
- `node scripts/test.mjs`

No dependencies or API keys are required. `src/worker.mjs` runs on Cloudflare Workers; the build embeds the existing HTML/CSS/JS and a verified fallback catalog into `dist/server/index.js`. The Site identity stays in `.openai/hosting.json`.

## Data and freshness

`GET /api/jobs` fetches the employers listed in `dist/boards.json`, with four concurrent requests, request timeouts, and a five-minute cache for successful collections. All user profile matching runs in the browser; skills and location are not transmitted to the employers. Page load refreshes the feed; Find re-ranks immediately and refreshes when the browser's five-minute cache expires.

Only publicly listed jobs whose `publishedAt` is in the last 30 days are included. Ashby's date is the last publication, which may be a re-posting, not necessarily the first publication. URLs are validated and deduplicated. The original posting is the authority on current availability and eligibility.

If an employer feed fails, its dated fallback rows are included only while still within 30 days; the UI reports unavailable sources. Successfully fetched boards replace their old rows, including removal of closed jobs. The UI never fabricates jobs or retains expired postings to reach 1,000. The current initial snapshot was checked on 2026-09-29 UTC (September 28 in New York): 1,423 distinct listings.

Experience/category labels are heuristics. Senior titles and descriptions with recognized 3+ year requirements are excluded for early-career profiles. Unconfirmed experience is labeled explicitly. “Any experience” exposes the full catalog. Pagination shows 20 jobs per page.

Public API documentation: https://developers.ashbyhq.com/docs/public-job-posting-api
