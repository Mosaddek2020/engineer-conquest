## story | Same assistant, two results

Two interns asked the same assistant for the same feature from task card 00. The first typed "add names to the members list" and got a tidy endpoint that returned every user of every tenant, with no permission check and no limit. The second pasted a ten-line spec (goal, acceptance criteria, constraints, out of scope, tests) and got a plan that respected tenants, used the port instead of a cross-module import, avoided N+1 queries, and started with failing tests. The difference wasn't the AI. It was the spec.

## model | A spec in five headings

```markdown
# Spec: member list shows names and emails
## Goal               what and why, in 1-2 sentences
## Acceptance criteria  checkable statements (each becomes a test)
## Constraints        codebase rules, security, performance (tenants! one query!)
## Out of scope       what NOT to change
## Tests              how we'll know it's done
```

Then work in **small, verified steps**:

1. **Plan first**: ask for a plan, not code ("plan mode" in Claude Code does exactly this: the agent reads and proposes, but doesn't edit).
2. **Tests first**: turn each acceptance criterion into a failing test.
3. **Implement in small diffs**, run the tests after each.
4. **Review** the diff against the spec.

Project instruction files (**CLAUDE.md**, **AGENTS.md**) are a permanent spec: the rules every task must follow. SaaS-Foundation's intern task cards and their skipped spec tests are specs written in advance.

## analogy | Ordering at a tailor

"Make me a suit" gets you *a* suit. Measurements, fabric, occasion, budget and a fitting appointment get you *your* suit. The tailor's skill is the same; the brief decides the result.

## traps | Traps

- Specs that describe the solution but not the acceptance criteria.
- Forgetting the constraints (tenancy, permissions, performance): the AI can't know them otherwise.
- One giant prompt for a week of work.

## lab | Vague prompt vs spec

Compare what the assistant produces from a one-line wish and from a real spec.
