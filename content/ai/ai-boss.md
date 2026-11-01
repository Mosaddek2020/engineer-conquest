## story | Green tests, open door

An assistant wrote an invoice lookup in minutes. It had tests. They passed. The spec said a user must *never* read another user's invoice. No test said so, and the code didn't check. In a multi-tenant SaaS, that is the most expensive kind of bug.

## model | The whole loop

**Spec** (criteria) → **tests for every criterion** (they fail first) → **AI drafts** → **read the diff** → **tests and tools** → **mutation check** the security rule → **human review** → merge.

## lab | Ship it safely

Find what the AI's tests miss, prove it with a test, fix the code, and write down what you'll do differently.
