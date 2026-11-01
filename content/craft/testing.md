## story | The test that saved a Friday

Tanvir changed how discounts round. The change looked harmless and the app ran fine. CI failed: a test called `test_50_items_get_20_percent` now returned 19.99. The bug never reached a customer. Without that test, the first report would have come from an angry accountant at month end.

## model | Why and how we test

Tests let you **change code without fear**. They are also executable documentation: the best example of how code is meant to be used.

**The test pyramid:**

- **Unit tests** (many): one function or class, milliseconds each.
- **Integration tests** (some): several parts together, e.g. an API route with a real database. SaaS-Foundation runs most of its tests this way, on a real Postgres, because the security (row-level security) lives in the database.
- **End-to-end tests** (few): the whole system through the UI or API.

**Arrange, Act, Assert**: set up the situation, do one thing, check the result. One behaviour per test, with a name that says it: `test_expired_reset_link_is_rejected`.

**Edge cases** are where bugs live: boundaries (9 vs 10 items), zero, empty, negative, very large, missing, unicode, concurrent access.

**Test-first (TDD)**: write a failing test that describes the behaviour, write the simplest code that passes, then clean up. Red, green, refactor.

## inside | Mutation checks: testing the tests

A test that never fails proves nothing. In SaaS-Foundation, every security rule gets a **mutation check**: break the protection on purpose (delete the line that checks the token's expiry), run the tests, and make sure at least one fails. If none fail, the test suite has a hole. You will see this in every PR description of the project.

## analogy | Smoke detectors

Tests are smoke detectors: cheap to install, silent when everything is fine, loud the moment something burns. A detector with no battery (a test that cannot fail) is worse than none: it makes you feel safe.

## traps | Testing traps

- Testing only the happy path.
- Tests that depend on each other's order, the time of day, or the network: they become **flaky**, and people learn to ignore red.
- Asserting too little (`assert response` passes for any non-empty response).
- Mocking so much that the test only tests the mocks.

## lab | Tests at the boundaries

A tiny shop gives 10% off for 10+ items and 20% for 50+. The tests pass, but they never check the boundaries where off-by-one bugs live. Make them stronger.
