## story | The test that failed on purpose

A reviewer asked a contributor: "Your PR adds a check that reset links expire. How do you know the test would catch it if someone removed the check?" The contributor deleted the check, ran the tests, saw one fail, restored the check, and wrote "mutation check: removing the expiry condition fails test_reset_links_expire" in the PR. That sentence is now a required part of every security-sensitive PR.

## model | How the codebase protects itself

- **Real-PostgreSQL tests**: the suite starts its own embedded Postgres, because RLS, roles and constraints *are* the security.
- **Structural tests**: every tenant table has RLS enabled and forced; models match migrations; upgrading from the first revisions keeps data; the app refuses a superuser connection.
- **Behaviour tests** through the real HTTP routes, including cross-tenant attempts.
- **Mutation checks** for security rules: break it, see red, restore.
- **`make check`** = tests + import contracts + typechecks + token contrast + SDK freshness.
- **CI on every PR**: `check`, `secrets` (gitleaks over the whole history), `audit` (pip-audit and pnpm audit, blocking on high).
- **Spec tests** for upcoming work live, skipped, in `apps/api/tests/todo/`: the intern's acceptance criteria as code.

## analogy | Fire drills

Smoke detectors (tests) are only trusted because someone presses the test button now and then and hears the alarm (mutation checks). CI is the building inspector who visits before every change is allowed in.

## lab | Read the guards

Read an isolation test, the CI workflow and the PR template.
