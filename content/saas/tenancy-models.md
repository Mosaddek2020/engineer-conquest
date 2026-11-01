## story | The header that chose your tenant

Early versions of many SaaS apps decided the tenant from a header the frontend sent, like `X-Tenant: acme`. It worked perfectly, until someone opened their browser's tools, changed the header to another company's name, and was looking at that company's dashboard. Which tenant a request belongs to is a security decision, and it must come from something the client can't freely choose, or that is verified.

## model | Tenancy models

| Model | What is shared | Trade-off |
|---|---|---|
| **Silo** | nothing: servers and database per tenant | strongest isolation, most expensive to run and upgrade |
| **Bridge** | app shared, database (or schema) per tenant | in between |
| **Pool** | app and database shared; every row has `tenant_id` | cheapest, simplest upgrades; isolation must be enforced rigorously |

SaaS-Foundation uses the **pool** model, with isolation enforced in the database (next lesson). A dedicated-instance option for clients who demand it is on the roadmap.

## model | Resolving the tenant

1. Read the request's **host**: `acme.foundation.example.com`, or a **verified custom domain** like `shop.acme.com`.
2. Validate it is a clean `hostname[:port]` (anything else: **400**). This fix came from a real security review: a crafted Host header once made password-reset links point to an attacker's site.
3. Look it up: unknown host → **404 unknown_tenant**.
4. Put the tenant in the request **context**; every database session for this request is bound to it.

Behind a proxy (the Next.js server), the proxy passes the public host as `X-Tenant-Host`, which is only honoured when it comes from **trusted proxies**. The app refuses to start if you enable the header without listing them.

**Noisy neighbours**: one tenant's heavy usage mustn't slow the others: rate limits, plan quotas and per-tenant limits.

## analogy | Mail sorting by address

The building's mailroom sorts letters by the address on the envelope (the host), not by a note inside saying "please give this to apartment 12" (a client-chosen header). And a letter with a smudged, impossible address is returned, not guessed at.

## lab | One address, many tenants

A miniature SaaS-Foundation edge is running. See how the host decides the tenant, and how it refuses bad hosts.
