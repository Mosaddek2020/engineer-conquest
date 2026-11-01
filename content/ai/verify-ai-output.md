## story | The project that reviewed itself

SaaS-Foundation's security milestone was built with heavy AI assistance: careful specs, tests on a real database, mutation checks. Before calling it done, the team ran an **independent review**: a separate AI reviewer that hadn't written the code, given only the code and the threat model, told to break it. It found **four high-severity issues** the author had missed, including password-reset links that could be pointed at an attacker's site by a crafted Host header. All were reproduced, fixed, and covered by regression tests that fail if the fix is removed. The lesson isn't "AI is bad"; it's that **the author grading its own work is the weakest check, for humans and AI alike**.

## model | Layers of verification

1. **Tests from the spec**, not from the code: every acceptance criterion gets a test.
2. **Read the diff**, not the summary.
3. **Static analysis**: linters, type checks, `semgrep`, secret scanning, dependency audit (all in CI).
4. **Mutation checks**: break the protection on purpose; a test must fail; restore it.
5. **Independent review**: a teammate, or a separate AI reviewer briefed with the code and the threat model, not with the author's conclusions.
6. **CI as the gate**: nothing merges red.
7. **Small diffs** make every layer work better.

## analogy | Proofreading your own essay

You read what you *meant* to write. A fresh pair of eyes reads what's actually on the page. AI-written code needs fresh eyes even more, because its mistakes look exactly as polished as its successes.

## traps | Traps

- Asking the same AI "are you sure?" (it will often agree with whatever you imply).
- Accepting "all tests pass" without checking whether tests changed.
- Large AI diffs reviewed in one sitting.

## lab | Mutation check by hand

The AI says its validation works and the tests pass. Prove the tests would notice if it didn't.
