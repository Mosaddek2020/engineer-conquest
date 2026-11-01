## story | Following one request

Rumana's exercise for new engineers: "Pick one request and follow it through the code until it touches the database, writing down every place that could stop it." It takes an hour and teaches more about the architecture than a week of reading at random.

## model | GET /v1/notifications/deliveries on acme.<base>

1. **RequestContextMiddleware**: assigns a request id, enforces the body-size limit, adds security headers, writes the JSON access log.
2. **CorsMiddleware**: if a browser sent an `Origin`, is it this tenant's own host or a platform origin?
3. **TenantMiddleware**: validates the Host (`hostname[:port]` or 400), resolves it to a tenant (or 404), stores the tenant in the request context.
4. **Global rate limits** per IP (and optionally per tenant).
5. **Route dependencies**: `require("notifications.read")` authenticates the bearer token and checks the permission; `get_session` opens a transaction and runs `set_config('app.tenant_id', <acme>, true)`.
6. **The handler** calls the repository; PostgreSQL's **RLS policy** returns only Acme's rows (and none if no tenant was set).
7. The **response model** shapes the JSON; the transaction commits; the request id goes back in `X-Request-ID`.

Every step can stop the request before the next one runs, which is what "defence in depth" looks like in code.

## analogy | Airport security

Check-in (request context), passport control (CORS), the gate that only boards passengers for *this* flight (tenant resolution), the boarding-pass scan (authentication and permission), and finally a seat that physically only exists on your plane (RLS). Getting through one checkpoint doesn't skip the others.

## lab | Trace it in the code

Use grep to find each checkpoint in the miniature codebase.
