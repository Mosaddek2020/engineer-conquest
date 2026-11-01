## story | Two kinds of review

Tanvir's first PR got one comment: "Not how we do it." He spent a day guessing what was meant. His second PR, reviewed by Rumana, got five comments, each like this: *"blocking: this query runs once per member (N+1). On a tenant with 5,000 members that's 5,000 queries. Could we load them in one `WHERE id IN (...)`? Happy to pair on it."* He fixed all five in an hour and learned something from each.

## model | Reviewing well

**Look for, in order:**

1. **Correctness**: does it do what the ticket says? Edge cases? Error paths?
2. **Security and data**: secrets, permissions, validation, personal data in logs, tenant isolation.
3. **Tests**: would a test fail if this code were wrong?
4. **Design and readability**: will the next person understand and change it?
5. **Style**: only what tools don't already enforce.

**Write comments that can be acted on**: what, where, why it matters, a suggestion, and a severity label (**blocking**, **question**, **suggestion**, **nit**). Praise good things too.

## model | Being reviewed well

- **Small PRs** with a description: what and why, how you tested it, what to look at closely.
- Review your own diff first: you'll catch half the issues.
- Assume good intent. Ask when a comment is unclear. Reply to every comment (fixed / explained / ticket created).
- Comments are about the code, not about you, and they are the fastest way to learn the codebase.

## analogy | A second pair of eyes on the climbing rope

Climbers check each other's knots and harnesses before every climb, however experienced they are. Nobody is offended: the check is part of climbing safely. Code review is the partner check before code goes to production.

## traps | Review traps

- **Rubber-stamping** ("LGTM") without reading.
- **Bikeshedding**: twenty comments on naming, none on the missing permission check.
- Reviewing 2,000 lines at once: attention collapses after a few hundred.
- Approving your own code (SaaS-Foundation's interns open draft PRs and never merge their own work).

## lab | Review a teammate's branch

A contractor asks you to review a small change to the monthly report. Read it as a reviewer and write your findings.
