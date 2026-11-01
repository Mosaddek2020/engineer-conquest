## story | The integration that ran at night

A team built a nightly import from a supplier API. It worked for months, then started silently importing only the first page (the supplier had grown past 50 items), and one night it hit a rate limit, crashed halfway, and left half-imported data. Every robust integration handles **auth, pagination, rate limits and errors** from day one.

## model | A careful API client

1. Read the docs and the error messages: they tell you how to authenticate.
2. Keep credentials out of code and history (read them from a file or environment variable).
3. Page until there is no `next`.
4. On `429`/`503`, wait for `Retry-After` (and back off further if it repeats).
5. Validate what you receive; log failures without logging the key.

## lab | Pull the supplier list

Build the report the purchasing team asked for: every active supplier, from every page.
