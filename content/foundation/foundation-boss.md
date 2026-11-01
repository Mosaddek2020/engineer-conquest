## story | Plan before you type

Rumana: "Before you write a line for card 00, show me a plan: every file you'll touch, how you'll keep it to one query, and which tests prove it. If the plan is right, the code takes an hour."

## model | A good change plan

- **Files** to change, and why each.
- **Rules** it must respect (no cross-module imports, no N+1 queries, permissions).
- **Tests** that will prove it (including the cross-tenant case).
- **Done**: `make sdk`, `make check`, draft PR.

## lab | Investigate task 00

Find everything the change touches in the miniature codebase, branch, and write the plan.
