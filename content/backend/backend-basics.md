## story | The discount that anyone could give themselves

An online shop calculated discounts in the browser and sent the final price to the backend, which saved it. A curious customer opened the browser's DevTools, changed the price to 1 taka, and the order went through. The backend's first job is to never trust the client: it decides prices, permissions and validity itself.

## model | The backend's jobs, in order

1. **Route** the request to the right handler.
2. **Authenticate**: who is calling (session, token, API key)?
3. **Validate** the input: types, required fields, limits.
4. **Authorise**: may *this* caller do *this* to *this* object, in *this* tenant?
5. **Apply business rules** and **persist** changes, in one **transaction**.
6. **Queue side effects** (emails, webhooks) in the same transaction (outbox).
7. **Respond** with a status and body (or a structured error).

**Layers keep this manageable** (SaaS-Foundation's module layout):

```
models.py      tables (SQLAlchemy)
repository.py  queries (tenant-aware, extends BaseRepository)
service.py     rules: raises DomainError subclasses, knows nothing about HTTP
router.py      thin: validate, call the service, return a schema
schemas.py     the API contract (Pydantic)
```

**Idempotency**: networks fail and clients retry. Operations that must not happen twice (payments, invites) accept an idempotency key or deduplicate.

## analogy | A bank teller

The teller checks your ID (authentication), checks the form is filled in (validation), checks you own the account (authorisation), applies the bank's rules (no overdraft), records the transaction in the ledger atomically, and only then sends the confirmation letter (side effect). They never let you write your own balance.

## traps | Traps

- Business logic in route handlers (impossible to reuse or test without HTTP).
- Trusting client-sent prices, roles or tenant ids.
- Side effects before the transaction commits (an email for an order that rolled back).
