## story | The weekend app that couldn't be fixed

A founder "vibe coded" a booking app over a weekend: describe a feature, paste the AI's code, run it, paste the error back, repeat, never reading the code. By Sunday it worked, and it was genuinely impressive. Three months and many customers later, a payment bug appeared. Nobody, including the founder, understood how the code worked. Every AI "fix" broke something else. They paid a team to rewrite it.

## model | What vibe coding is, and isn't

**Vibe coding** (a term popularised in 2025): building software by prompting an AI and accepting its output based on whether it *seems* to work, without reading or understanding the code.

| Fine for | Dangerous for |
|---|---|
| throwaway prototypes and demos | anything with users' data, money or security |
| exploring "is this possible?" | code a team must maintain |
| personal scripts on your own data | multi-tenant platforms like SaaS-Foundation |
| learning what an API can do | code you'll be paged about at 3 a.m. |

**The 70% problem**: AI gets you most of the way very fast. The last 30% (edge cases, error handling, security, integration with the rest of the system, performance, maintainability) needs understanding. Vibe-coded projects tend to stall or break exactly there.

## model | AI-assisted engineering

The same tools, used with engineering habits:

1. **You own every line**: if you can't explain it in review, it doesn't merge.
2. **Spec and context first** (next lesson).
3. **Small steps**, each verified.
4. **Tests, static analysis, review**: AI code goes through exactly the same gates as human code, plus extra suspicion in security-sensitive areas.
5. **Learn from it**: ask *why*, not just *what*. Use AI to understand faster, not to skip understanding.

## analogy | A calculator in an engineering exam

A calculator makes an engineer faster. It doesn't make someone who doesn't understand the physics into an engineer: they can't tell when the answer is off by a factor of a thousand. AI is the most powerful calculator ever built.

## traps | Traps

- "It runs, ship it."
- Pasting errors back in a loop without reading them.
- Accepting new dependencies the AI suggests without checking them.
- Letting the AI rewrite large areas "to clean up" alongside your actual change.

## lab | Vibe it, then engineer it

Ask the assistant for a small database function, then review it like an engineer, with a tool to back you up.
