## story | The intern who shipped in week one

Two interns started together. One worked alone for two weeks on a big change and opened a 1,500-line PR that needed a week of review and rework. The other picked task card 00, opened a draft PR on day two with a plan and a failing test, got two comments, and merged a small, solid change by Thursday. Both learned; one learned much faster.

## model | The workflow

1. **Pick the card** (in order, or as assigned). Read it and the files it lists.
2. **Branch**: `git switch -c m2-<card>-<short-name>`.
3. **Spec tests first**: move the card's file from `apps/api/tests/todo/` next to the other tests, remove the `skip`, and make them pass, adding cases you discover.
4. **Draft PR early**, with the template's done checklist.
5. **`make check`**; for security rules, **mutation checks** recorded in the PR.
6. **Review**: answer every comment. Cards marked **Security review** wait for the maintainer.
7. **The maintainer merges.** Interns never merge their own work.

**Ask before:** adding a dependency, changing `foundation_core`, editing a merged migration, weakening a test, touching auth or MFA.

## analogy | Climbing with a partner

You choose a route (task card), plan it at the bottom (draft PR with a plan), climb in short pitches with protection placed often (small commits and tests), and your partner checks every knot before you rely on it (review).

## traps | Traps

- Going silent for days.
- PRs that mix the task with unrelated clean-ups.
- "I'll add tests at the end."
