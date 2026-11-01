## story | Fast first paint, and a secret that stayed secret

A product team moved their React app to Next.js. Pages appeared immediately (HTML rendered on the server) instead of after a spinner, search engines could index them, and the API token moved out of the browser entirely into a server-side cookie. Same React skills, different place where code runs.

## model | Where code runs

- **Client-side rendering (CSR)**: the browser downloads JS and builds the page. Interactive, but slower first paint.
- **Server-side rendering (SSR)**: HTML is generated on the server per request, then **hydrated** (made interactive) in the browser.
- **Static generation (SSG)**: HTML built at deploy time.

**Next.js (app router):**

- Folders in `app/` are routes (`app/settings/page.tsx` → `/settings`); `layout.tsx` wraps pages.
- Components are **server components** by default: they run on the server, can read secrets and call the API directly, and send no JS for themselves. Interactive components start with `"use client"`.
- **Route handlers** (`app/api/.../route.ts`) are small server endpoints: perfect for a **backend-for-frontend** (BFF).
- **Middleware** runs before every request (redirects, headers).
- **Env vars**: only `NEXT_PUBLIC_*` reach the browser, so never prefix secrets with it.

## inside | SaaS-Foundation's web app

`apps/web` is a Next.js app. Its middleware sets a **per-request CSP nonce** and security headers, and passes the public host to the API as `X-Tenant-Host` (honoured only from trusted proxies). The root layout asks the API which tenant this host belongs to and applies that tenant's **brand tokens**. ADR 0001 decides that sign-in goes through route handlers that keep the API token in an httpOnly `__Host-` cookie.

## analogy | A restaurant with a kitchen and a table-side grill

Server components are dishes prepared in the kitchen and served ready (fast, and the recipe never leaves the kitchen). Client components are the table-side grill: interactive, but you have to bring equipment (JavaScript) to the table.

## traps | Traps

- Secrets in `NEXT_PUBLIC_` variables or client components.
- Marking everything `"use client"` (you lose server rendering and ship more JS).
- Forgetting that server components run per request: avoid slow, uncached work there.
