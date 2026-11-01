## story | Signed in is not the same as allowed

An app checked carefully that every request came from a signed-in user. It did not check *which* user. Any customer could open `/invoices/1`, `/invoices/2`, ... and read every other customer's invoices. The login system was excellent; the authorisation was missing.

## model | Authentication: who are you?

- **Passwords** are stored as slow, salted hashes designed for passwords (**Argon2id**, bcrypt), never encrypted or plain. Check new passwords against breach lists; require length over complexity rules.
- **Rate limiting and lockout** on login; identical answers for "no such user" and "wrong password" (no **account enumeration**).
- **MFA** (multi-factor): something you know (password) + something you have (a TOTP code from an authenticator app, a security key). Stops most account takeovers.
- **Sessions or tokens** after login (HTTP realm), revocable, with idle and absolute timeouts.
- **OAuth 2.0 / OpenID Connect**: "Sign in with Google". OIDC adds an **ID token** saying who the user is. Done right it needs `state` (bound to the browser), **PKCE**, a `nonce`, and full verification of the token's signature, issuer, audience and expiry.

## model | Authorisation: what may you do?

- **Roles and permissions**: e.g. `owner`, `admin`, `member`, each granting named permissions like `organizations.invite`. Check permissions, not role names, in code.
- **Least privilege**: users, services, API keys, database roles and AI agents get only what they need.
- **Object-level checks**: not just "may this user read invoices?" but "is *this* invoice theirs (and their tenant's)?".
- **Step-up**: sensitive actions (changing secrets, granting admin) need a recent second-factor check.

## inside | How SaaS-Foundation does it

- Argon2id passwords with rehash on login, a breached-password check, progressive lockout per account and IP.
- TOTP MFA with single-use recovery codes, **mandatory for operators**, optional or required per tenant policy.
- Permissions `<module>.<verb>` declared in each module's manifest and checked with `require("...")`.
- **Tenant isolation in the database**: PostgreSQL row-level security makes every query see only the current tenant's rows, even if the code forgets a `WHERE`.

## analogy | A hotel

Authentication is the front desk checking your passport and giving you a key card. Authorisation is the key card opening *your* room, the gym and the breakfast hall, and not other guests' rooms or the manager's office. A hotel with a perfect front desk and key cards that open every door is not secure.

## traps | Traps

- Checking authorisation in the frontend only (hiding a button is not access control).
- Role checks scattered as `if user.role == "admin"` instead of named permissions.
- Admin features without MFA.
- Forgetting the object-level check (the invoice story).
