## story | One codebase, three hundred bakeries

A software company built an ordering system for one bakery. Then a second bakery wanted it, then a tenth. Each got its own copy, servers and database. By bakery fifty, every bug fix meant fifty deploys, half the copies were years out of date, and nobody knew which bakery ran which version. They rebuilt it as **one** platform serving every bakery as a **tenant**: one deploy, one version, upgrades for everyone at once. That is SaaS, and it is what SaaS-Foundation is for.

## model | The SaaS model

- **Software as a service**: the provider runs the software; customers use it over the internet, usually by subscription.
- **Tenants**: the customer companies. Each has its own users, data, settings, brand and (optionally) domain, and shares the platform with the others.
- **Plans and entitlements**: what a tenant's plan includes (`custom_domain`, `files` up to 5 GB). Code checks `require_feature(app, session, "files")`; billing writes entitlements.
- **White-labelling**: each tenant's users see the tenant's brand. In SaaS-Foundation, brands are token overrides, checked for contrast on the server.

**Three kinds of people:**

| Who | What they do | In SaaS-Foundation |
|---|---|---|
| **Operators** | platform staff: create tenants, grant plans, support | separate accounts, CLI-created, **mandatory MFA**, own audit log |
| **Tenant admins** | a tenant's owners and admins: settings, secrets, other admins | `tenant_admin` module, owner-only security settings |
| **Users** | the tenant's staff and customers | accounts **per tenant**: the same email at two tenants is two accounts |

## analogy | An apartment building

The platform is the building: one structure, shared plumbing and electricity, maintained by building staff (operators). Each tenant rents an apartment with its own lock, furniture and name on the door. Building staff can enter in an emergency, but it's logged and the tenant is told. And no tenant's key must ever open a neighbour's door.

## traps | Traps for a SaaS engineer

- Forgetting the tenant in any query, cache key, file path or log line.
- Looking users up across tenants.
- Hard-coding one tenant's needs into the platform instead of making it a setting or entitlement.
