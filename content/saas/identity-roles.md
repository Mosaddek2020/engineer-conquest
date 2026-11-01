## story | Two bugs the review found

SaaS-Foundation's own security review (November 2026) found two identity bugs that only make sense in a multi-tenant system. First, a tenant **admin** (not owner) could change the tenant's SMTP server to their own and then request a password reset for the **owner**: the reset link arrived on the admin's server. Second, switching a tenant's MFA policy to "admins" didn't affect admins who were already signed in. Both were fixed with tests that fail if the fix is removed.

## model | Roles and permissions

- **Operators** (platform staff): CLI-created only, mandatory TOTP MFA (an enrolment-only session until they enrol), stricter lockout, 8-hour sessions, their own append-only audit log. Any action on a tenant is written to **that tenant's** audit log as `actor_type="operator"`.
- **Tenant roles** (`tenant_admin` module): `owner` and `admin`. A tenant always keeps at least one owner.
- **Organization roles** inside a tenant: `owner`, `admin`, `member`.
- **Permissions** are `<module>.<verb>` strings declared in each module's manifest, granted to roles there (`tenant_grants`, `role_grants`), and checked in routes with `require("organizations.invite")`.

## model | Getting power safely

- **First owner**: an operator issues a single-use, expiring **claim**; the first admin registers, **verifies their email**, and redeems it.
- **Invites** (organizations and tenant admins): hashed, single-use, 7 days, bound to the **verified** invited email, rate-limited per inviter.
- **MFA policy** per tenant (`off`, `admins`, `everyone`), checked on every request.
- **Step-up**: settings writes, secrets and admin-role changes need an MFA check from the last 10 minutes.
- **Owner-only settings**: mail routing, credentials, MFA policy, OAuth configuration.
- **Sensitive emails** (links, security notices) can't be reworded by tenants and always use the platform's mail server.

## analogy | Keys in a hotel chain

Hotel staff (operators) have master keys, but every use is logged and the guest is told. Each hotel's manager (tenant owner) controls that hotel only, and can make deputies (admins), but deputies can't change where the manager's mail is delivered.

## traps | Traps

- Checking role names (`if role == "admin"`) instead of permissions.
- Admin features without MFA.
- Anything that lets a lower role redirect or read a higher role's credentials or links.
