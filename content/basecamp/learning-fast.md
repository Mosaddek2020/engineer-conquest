## story | Three hours vs ten minutes

Two interns hit the same error on their first day: the test database would not start. Intern A spent three hours trying random fixes found online, reinstalled Python twice, and went home frustrated. Intern B tried for twenty minutes, then wrote in the team chat:

> I'm running `make test` on a fresh clone. It fails with `ConnectionRefusedError` on port 5432. I've run `make setup`; Postgres isn't installed locally. I expected the tests to start their own database (the docs say "no setup needed"). Am I missing a step, or is it something on my machine?

Rumana answered in two minutes: an old `.env` file was pointing the tests at a real database. Fixed in ten minutes total.

## model | How to learn a codebase (and anything else) fast

**Read in this order**: README → contributing guide → architecture notes → the tests for the area you are touching → the code itself. Tests are executable examples of how the code is meant to be used.

**Time-box.** Pick a limit (20-30 minutes). When you reach it, stop and ask, with context.

**Ask a question that can be answered quickly:**

1. **Goal**: what are you trying to achieve? (Avoid the *XY problem*: asking about your attempted fix instead of your real goal.)
2. **What you did**: commands, with the **exact error text** (copy and paste text, not just a screenshot).
3. **Expected vs actual**.
4. **Your best guess** at the cause, even if it is wrong.

**Rubber-duck debugging**: explain the problem out loud, step by step, to anyone or anything. Very often you find the mistake halfway through the explanation.

**Keep notes**: commands that worked, things you learned, questions to ask later. Your future self is your most frequent reader.

## analogy | Learning a new city

You do not memorise every street before your first day. You learn the main roads (the architecture), find your own neighbourhood (the module you work on), ask locals for directions (teammates), and keep a map with your own notes. Within weeks you are giving directions to newer people.

## team | What mentors actually want

- Questions **early**, with context. Silent struggling is the thing that worries them.
- **Visible progress**: draft PRs, short updates, notes.
- **Curiosity about why**, not just how: "why do we use row-level security here?" teaches you more than "where do I put this line?".
- **Following up**: when you solve something, write it down (or improve the docs) so the next intern doesn't hit it.

## traps | Learning traps

- **Tutorial hell**: watching and reading without ever building. Learn by changing real code, in small steps.
- **Copy-paste without understanding** (from the internet *or* from AI). If you can't explain a line, you can't own it in review.
- **Fixing symptoms**: the test passes now, but you don't know why it failed. Find the cause.
