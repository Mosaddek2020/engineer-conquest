## story | The welcome email for an account that didn't exist

A signup handler sent the welcome email, then saved the user. One day the save failed (a duplicate email): the person got a cheerful welcome email for an account that was never created. Another day the email provider was slow, and signups took 30 seconds. Both bugs disappear with one pattern.

## model | Background work and the outbox

Work that is slow, unreliable or must not be lost runs in the **background**, in a **worker** process, not in the request:

- **Transactional outbox**: write the job to a table in the **same transaction** as the business change. If the change rolls back, the job never existed. If it commits, the job will run.
- A **worker** claims due jobs (`FOR UPDATE SKIP LOCKED` lets several workers share the queue), runs the handler, and marks them done.
- **Retries with backoff** (5 s, 10 s, 20 s... capped) for temporary failures; after the maximum attempts, **dead-letter** the job for a human.
- **At-least-once delivery**: a worker can crash after the work but before marking it done, so the job runs again. Handlers must be **idempotent** (dedupe keys, final states that are never repeated).

## inside | In SaaS-Foundation

```python
await notify(app, session, "auth.password_reset", to=user.email, data={"link": url})
```

`notify()` writes a delivery row and an outbox job in the caller's transaction. The worker (`make worker`) sends it with the delivery row locked, never re-sends a final delivery, retries 8 times, then dead-letters it, and wipes the data (which may hold the one-time link) once the delivery is final. A concurrency test proves two workers can't send it twice.

## analogy | A restaurant's order rail

The waiter doesn't cook. They pin the order ticket on the rail (outbox) at the same moment the bill is opened (same transaction). Cooks (workers) take tickets from the rail; if a cook drops a plate, the ticket goes back up (retry); a ticket that keeps failing goes to the head chef (dead letter).

## traps | Traps

- Side effects inside the request (slow, and wrong on rollback).
- Non-idempotent handlers ("charge the card" without a dedupe key).
- No limit on retries (a poison job retried forever).
