## story | The endpoint that returned the whole database

An early version of an internal API had `GET /orders` with no pagination. It was fine in testing with 30 orders. In production, a big tenant had 2 million orders: one call took 40 seconds, used 3 GB of memory and took the server down. "Every list gets a limit" became a team rule that afternoon.

## model | REST in practice

**Resources are nouns, methods are verbs:**

```
GET    /v1/orders              list (paginated, filterable)
POST   /v1/orders              create
GET    /v1/orders/42           read one
PATCH  /v1/orders/42           change some fields
DELETE /v1/orders/42           delete
POST   /v1/orders/42/cancel    an action that isn't plain CRUD
```

**JSON shapes** stay consistent: the same field names and types everywhere, ISO 8601 dates (`2026-11-01T09:30:00Z`), money as integers in minor units (poisha, cents), never floats.

**Pagination**: every list has a `limit` (with a maximum) and a way to the next page (`page`/`next`, or a cursor). **Filtering** via query parameters (`?status=open`).

**Errors** have a stable machine `code`, a human `message`, and a `request_id`: `{"code": "email_taken", "message": "...", "request_id": "..."}`. Clients branch on `code`, never on the message text (which may be translated).

**Versioning**: additive changes (new optional fields) need no new version; breaking changes go to `/v2`.

**OpenAPI** describes the whole API in a machine-readable file: documentation, validation and generated clients come from it. FastAPI produces it automatically from your Python types.

## analogy | A well-run library

Books (resources) have stable call numbers (URLs). You don't ask the librarian to bring every book in the building (pagination); you search by subject (filtering). When something goes wrong you get a slip with a reason code a computer can read and a sentence a human can (error body).

## traps | API design traps

- Leaking internal ids or database errors in responses.
- Different shapes for the same thing on different endpoints.
- Floats for money (`0.1 + 0.2 != 0.3`).
- Breaking changes without a new version.

## lab | Explore a REST API

Use the API's own description, page through results, filter, and extract exactly the data you need with jq.
