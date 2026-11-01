## story | Code is read far more than it is written

A function written in 20 minutes gets read hundreds of times: by reviewers, by the next person fixing a bug at 2 a.m., by you in six months when you have forgotten everything. Rumana's rule for interns: **"If I need you to explain it, the code isn't finished."**

## model | What clean code looks like

**Names that explain.** `reset_link_ttl_seconds` beats `t`. Booleans read like questions: `is_verified`, `has_mfa`. Avoid double negatives (`is_not_disabled`).

**Small functions that do one thing.** If the name needs "and" (`validate_and_save_and_email`), split it. Small functions are easier to test.

**No magic numbers.** `if retries > MAX_RETRIES` instead of `if x[2] > 3`.

**Comments say why, not what.** The code says what it does; a comment explains a constraint, a decision, or a trap:

```python
# Reset links expire after 30 min: long enough for slow email, short enough
# that an old inbox can't be used to take over the account.
RESET_TTL = timedelta(minutes=30)
```

**Consistent formatting**, enforced by tools (formatters, linters), not by debates in review.

**Errors that help.** "Use at least 12 characters" beats "invalid input".

## analogy | Writing for a stranger

Imagine your code will be maintained by a capable stranger who has no way to ask you questions. Everything they need must be on the page: clear names, obvious structure, and a note wherever something surprising is going on. In a few months, that stranger is you.

## team | Principles you will hear in reviews

- **KISS** (keep it simple): the simplest thing that works is easiest to change.
- **DRY** (don't repeat yourself): one source of truth for each rule, but don't merge things that only *look* alike.
- **YAGNI** (you aren't gonna need it): don't build for imagined future requirements.
- **Boy-scout rule**: leave the code a little cleaner than you found it, in small safe steps that don't derail your ticket.

## traps | Clean-code traps

- **Clever one-liners** that save three lines and cost every reader five minutes.
- **Comments that lie**: the code changed, the comment didn't. Prefer names over comments where possible.
- **Premature abstraction**: a "generic framework" for something used once.
- **Refactoring and changing behaviour in the same commit**: reviewers can't tell which is which.
