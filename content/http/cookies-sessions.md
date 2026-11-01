## story | The logout button that didn't log anyone out

A team's logout button deleted the cookie in the browser and showed "You are signed out". But the server never forgot the session. An attacker who had copied the cookie earlier (from a shared computer) kept full access for two weeks. Logging out has to happen on the server.

## model | Remembering users over a stateless protocol

HTTP is **stateless**: each request stands alone. To stay signed in, every request must carry proof.

**Cookies**: the server sends `Set-Cookie: name=value; attributes`, and the browser automatically returns `Cookie: name=value` to that site on later requests.

| Attribute | Protects against |
|---|---|
| `HttpOnly` | JavaScript (and so XSS) reading the cookie |
| `Secure` | sending it over plain HTTP |
| `SameSite=Lax/Strict` | sending it on cross-site requests (CSRF) |
| `Max-Age` / `Expires` | living forever |
| `__Host-` prefix | being set for other subdomains (forces Secure, Path=/, no Domain) |

**Server sessions vs tokens**: a session id (cookie or opaque token) is looked up on the server, so it can be **revoked** instantly (logout, password change, "sign out everywhere"). Self-contained tokens (like JWTs) are valid until expiry unless you add revocation. SaaS-Foundation uses **opaque tokens stored hashed** on the server, with idle and absolute timeouts and full revocation.

## inside | SaaS-Foundation's browser model (ADR 0001)

The API speaks bearer tokens. Browsers never hold them: a Next.js server (a backend-for-frontend) keeps the token in an httpOnly, Secure, SameSite, `__Host-` cookie and calls the API on the user's behalf. JavaScript on the page can't read the token, so even an XSS bug can't steal a reusable credential.

## analogy | A wristband at a festival

You show your ticket once at the gate and get a wristband (the session cookie). Staff check the wristband, not your ticket, every time you enter an area. If you leave for good, a responsible festival cuts the wristband off *and* marks its number invalid at every gate (server-side logout).

## lab | Sign in with curl

Do by hand what a browser does automatically: sign in, carry the cookie, and check that logout really ends the session.
