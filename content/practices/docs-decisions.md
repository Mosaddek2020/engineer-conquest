## story | "Why on earth is it like this?"

A new engineer found that SaaS-Foundation's API returns bearer tokens instead of setting cookies, and was about to "fix" it. Then he found `docs/adr/0001-browser-session-model.md`: a one-page record explaining that browsers never hold the token (a Next.js server keeps it in an httpOnly cookie), why that protects against stolen tokens, and which alternatives were rejected. Ten minutes of reading saved a week of work and a security hole.

## model | Documentation that earns its keep

- **README**: what this is, how to run it, how to test it, where to read more. A newcomer should be running in minutes.
- **Docstrings and comments**: the contract (inputs, units, errors) and the *why* of surprising code.
- **ADRs (architecture decision records)**: one short page per important decision: context, decision, consequences, rejected options. They answer "why is it like this?" years later.
- **Changelogs and versions**: semantic versioning `MAJOR.MINOR.PATCH`: breaking change, new feature, fix.
- **Runbooks**: step-by-step instructions for operating the system (how to reset an operator's MFA, how to rotate a key).

Docs change **in the same PR** as the code they describe, or they start to lie.

## model | Estimates and "done"

- Estimate in **ranges with assumptions** ("1-3 days if the endpoint exists"), and update early when you learn more.
- Break big tasks into steps you can finish in a day.
- **Definition of done**: tests pass, reviewed, docs updated, deployed or ready to deploy, ticket updated. SaaS-Foundation's PR template turns it into a checklist.

## analogy | A ship's log

A ship's log records course changes and the reasons for them. When something goes wrong at sea, nobody asks the captain to remember; they read the log. Code tells you what the system does; good docs and ADRs tell you why.

## traps | Traps

- Docs that describe the *intended* system, not the real one.
- Huge wikis nobody updates. Keep docs next to the code, small and current.
- Estimates given to please, not to inform.
