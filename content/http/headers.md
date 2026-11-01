## story | The deploy that didn't show up

Rumana deployed a new menu, but customers kept seeing the old one for five minutes. Nothing was broken: the response said `Cache-Control: public, max-age=300`, so browsers and the CDN were allowed to keep their copy for 300 seconds. Headers are small, and they control a lot.

## model | Headers: metadata on both sides

Every request and response carries **headers**: `Name: value` lines before the body.

**Request headers (client → server):**

- `Host`: which site (essential when one server hosts many, as with tenants).
- `Accept`: formats the client wants back (`application/json`, `text/csv`). `Accept-Language` for languages.
- `Content-Type`: the format of the body being sent.
- `Authorization: Bearer <token>`: the credential. Sensitive!
- `Cookie`: cookies the server set earlier.
- `User-Agent`: which client; `If-None-Match`: "I have this version (ETag), has it changed?"

**Response headers (server → client):**

- `Content-Type`, `Content-Length`.
- `Cache-Control`: `no-store` (never cache: personal data), `max-age=300` (cache for 5 minutes), `public`/`private`.
- `ETag`: a version id for the content; with `If-None-Match` the server can answer `304 Not Modified` with no body.
- `Set-Cookie`, `Location` (for 201 and redirects), `Retry-After` (for 429/503), `Vary` (which request headers change the response).
- Security headers (`Strict-Transport-Security`, `Content-Security-Policy`...): Realm 5.

`curl -v` shows both sides: lines starting `>` were sent, `<` were received.

## analogy | The envelope and the letter

The body is the letter. Headers are everything written on the envelope: who it's for, what language it's in, how urgent, whether to keep a copy, and a stamp proving who sent it.

## inside | Headers in SaaS-Foundation

Every API response carries `X-Request-ID` (quote it in bug reports: it finds the exact log lines), `Cache-Control: no-store` on `/v1/` responses, and strict security headers. Request ids from a trusted proxy are reused; malformed ones are replaced.

## lab | Read and steer with headers

Watch the full conversation, negotiate a format, inspect caching, and make a conditional request.
