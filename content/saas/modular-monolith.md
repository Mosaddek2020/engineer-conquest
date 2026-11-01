## story | Swapping the engine while driving

A product built on SaaS-Foundation needed to replace its email provider with SMS for some messages. Because `auth` only calls the `notify()` port and never imports the notifications module, the team could add a new channel inside notifications without touching auth, invites, or any other caller. The change was one module, one PR.

## model | A monolith made of modules

SaaS-Foundation is a **modular monolith**: one deployable app built from independent modules.

- **A product is a list of modules**: `create_app([tenants, auth, organizations, entitlements, jobs, audit, settings, operator, tenant_admin, notifications, ...])`.
- Each module has a **manifest** (`define_module(...)`): name, `depends_on`, permissions and grants, migrations (its own Alembic branch), templates, settings, owner-only keys, maintenance, events.
- **Modules never import each other.** They communicate through:
  - **Ports** in `foundation_core` (`notify`, `secret_vault`, `tenant_settings`, `user_directory`, `require_feature`, `rate_limiter`...): one module installs the implementation at startup, others call it.
  - **Events**: `events.publish(...)` (in-process, best effort) or `events.publish_durable(session, ...)` (the outbox: retried, never lost).
- **`foundation_core` knows no module.**
- CI enforces the boundaries with **import-linter** (Python) and **dependency-cruiser** (TypeScript).

**Why not microservices?** Separate services add network failures, distributed transactions, many deploys and harder debugging. Clear module boundaries give most of the independence today, and are exactly where you'd split later if a measured need appears.

## analogy | A stereo system with standard plugs

Speakers, amplifier and turntable are separate boxes that connect through standard plugs (ports). You can replace the speakers without opening the amplifier. A monolith without modules is a stereo where everything is soldered together.

## traps | Traps

- "Just this once" importing another module's internals.
- Ports that grow to expose everything (keep them small).
- Putting module-specific logic into `foundation_core`.
