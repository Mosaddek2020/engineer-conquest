## story | "It just says 4-something"

A support ticket: "the app shows an error when saving". Tanvir asked one question: "which status code?" It was 422. That single number told him the request reached the backend, the user was signed in (not 401), allowed (not 403), and the data failed validation. He found the bug (a date sent as "31/12" instead of "2026-12-31") in five minutes. Status codes are compressed diagnoses.

## model | Methods: what you want to do

| Method | Means | Safe? | Idempotent? |
|---|---|---|---|
| `GET` | read | yes | yes |
| `POST` | create / perform an action | no | no |
| `PUT` | replace entirely | no | yes |
| `PATCH` | change some fields | no | usually no |
| `DELETE` | remove | no | yes |

**Safe** = never changes anything (so crawlers and prefetchers can call it). **Idempotent** = doing it twice has the same effect as once, which makes retries safe. That's why payments and "send email" need extra protection (idempotency keys, deduplication) against double-clicks and retries.

## model | Status codes: what happened

- **2xx success**: `200 OK`, `201 Created` (+ `Location` header), `204 No Content`.
- **3xx redirect**: `301` moved permanently, `302/307` temporarily, `304 Not Modified` (use your cache).
- **4xx client error** (fix the request): `400` malformed, `401` not authenticated, `403` authenticated but not allowed, `404` not found, `405` wrong method (+ `Allow` header), `409` conflict (e.g. email taken), `415` wrong content type, `422` invalid data, `429` too many requests (+ `Retry-After`).
- **5xx server error** (not the client's fault): `500` the app crashed, `502/504` a proxy couldn't reach or wait for the app, `503` temporarily unavailable.

## analogy | A post office counter

GET is asking "do you have a parcel for me?" (asking twice changes nothing). POST is handing in a new parcel (handing it in twice sends two). 401 is "show me your ID"; 403 is "I see your ID, but this parcel isn't yours"; 404 is "no such parcel"; 422 is "you filled in the form wrong"; 500 is the clerk fainting.

## traps | Traps

- **200 with `{"error": true}`**: every client, cache and monitoring tool now thinks it worked.
- Using GET for actions ("GET /orders/42/cancel"): a link preview bot cancels the order.
- Returning 500 for bad input: it's the client's mistake (4xx), and 5xx pages wake people up at night.
- Revealing too much in 404 vs 403 (e.g. "this account exists but..."). Sometimes 404 is the safer answer.

## lab | Talk to the Notes API

A small Notes API is running. Use every method, trigger the important status codes on purpose, and read what each one tells you.
