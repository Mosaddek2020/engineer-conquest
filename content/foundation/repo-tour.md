## story | Nadia's first clone

Nadia cloned SaaS-Foundation, ran `make setup && make check`, and watched several hundred tests pass against a real PostgreSQL in a few minutes. Then she opened the folder and saw dozens of directories. Rumana's advice: "Don't read it all. Read the README, then CLAUDE.md, then the module you're touching, then its tests. In that order."

> **About this realm:** you'll explore a *miniature* of SaaS-Foundation written for this course. It has the same layout, rules and patterns as the real repository, in simplified code. The real repository is private: you'll get access through your team.

## model | The layout

```
apps/api/            the reference product: main.py lists the modules
apps/web/            the Next.js web app
python/foundation-core/   the core: module system, ports, tenancy, RLS helpers, HTTP edge
modules/<name>/      one backend module each: tenants, auth, organizations, notifications, ...
packages/            design-system, tokens, the generated TypeScript SDK
docs/                ARCHITECTURE, ROADMAP, HANDOFF, ADRs, THREAT-MODEL, intern guide + task cards
```

**Read first:** `README.md` → `CLAUDE.md` (the rules; CI enforces several) → `docs/HANDOFF.md` (current state) → `docs/intern/README.md`.

**Make targets you'll use daily:** `make setup`, `make check` (everything CI runs: finish every task with it), `make test`, `make sdk`, `make dev-db`, `make api`, `make worker`.

## analogy | A city map with districts

`foundation-core` is the city's infrastructure (roads, power, water). Each module is a district with its own buildings and a few official connections to the infrastructure (ports). `apps/api/main.py` decides which districts this particular city has. You don't need to know every street to start working in one district.

## traps | Traps

- Reading every file before starting (you'll forget most of it).
- Skipping CLAUDE.md: its rules are enforced by CI, and reviewers will point you back to it.
- Running the API against a database without following DEV-SETUP (the app refuses unsafe database roles, on purpose).

## lab | Look around

Explore the miniature repository the way you'll explore the real one on day one.
