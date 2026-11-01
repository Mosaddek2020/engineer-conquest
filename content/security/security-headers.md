## story | One missing header

A bank's customer portal was embedded invisibly inside an attacker's "win a prize" page. Users thought they were clicking "claim prize"; they were clicking "confirm transfer" in the portal underneath (**clickjacking**). One response header (`X-Frame-Options: DENY`, or the CSP `frame-ancestors` directive) would have stopped the browser from loading the portal in a frame at all.

## model | Headers that make browsers defend your users

| Header | Effect |
|---|---|
| `Strict-Transport-Security: max-age=63072000; includeSubDomains` (HSTS) | browser uses HTTPS only for this site, even for typed `http://` links |
| `Content-Security-Policy` (CSP) | which scripts, styles, frames... may load; a strict CSP with nonces stops most injected scripts (XSS) from running |
| `X-Frame-Options: DENY` / CSP `frame-ancestors 'none'` | no embedding in frames (clickjacking) |
| `X-Content-Type-Options: nosniff` | browser trusts your `Content-Type`, doesn't guess |
| `Referrer-Policy: strict-origin-when-cross-origin` | full URLs (with ids, tokens) don't leak to other sites |
| Cookie flags `HttpOnly; Secure; SameSite` | see the HTTP realm |

Plus: **redirect HTTP to HTTPS** (301), and **don't advertise versions** (`Server`, `X-Powered-By`).

## inside | SaaS-Foundation's headers

Every API response gets `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'` (it's JSON: nothing should ever execute), HSTS, `nosniff`, `no-store` caching, and a request id. The Next.js web app generates a fresh **nonce** per request and only scripts carrying it may run (`'strict-dynamic'` lets them load their chunks); this was verified in a real build: every Next script carried the nonce.

## analogy | Instructions on the delivery box

Security headers are instructions printed on the box for the courier and the recipient: "keep upright", "do not leave with neighbours", "only open with ID". The courier (browser) follows them faithfully, but only if they're printed on every box.

## lab | Compare two sites

One site is configured carefully, one is not. Read both and write down what the weak one should change.
