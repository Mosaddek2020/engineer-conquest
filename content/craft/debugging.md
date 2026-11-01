## story | "It just broke"

Orders started failing at 09:15 on a Sunday. Nothing had been deployed, people said. Ten minutes later the cause was found, not by guessing, but by reading: the log said `could not convert string to float: '15%'`, the setting it came from was `TAX_RATE`, and `git log -S "15%"` showed a config commit from Thursday titled "Make tax rate easier to read". Easier to read for humans, impossible to read for the code.

## model | The scientific method for bugs

1. **Reproduce** it reliably. If you can't trigger it, you can't know you fixed it.
2. **Read the evidence**: the exact error, the logs, the stack trace, *what changed recently* (code, config, data, dependencies).
3. **Form one hypothesis** ("TAX_RATE is not a number").
4. **Test it**: one change or one check at a time.
5. **Fix the cause**, not the symptom, and **add a test** (or a check) so it can't silently come back.

**Reading a Python traceback**: start at the **bottom** (exception type and message), then walk **up** until you reach a line of *your* code: that is usually where to look.

**Finding the change that caused it:**

- `git log -S "text"`: commits that added or removed a string.
- `git log -p path` / `git blame file`: the history of a file, line by line.
- `git bisect`: binary search through history with a test (next lesson's boss).

## analogy | A detective, not a fortune teller

A detective doesn't announce the culprit after looking at the room for two seconds. They collect evidence, form a theory, look for the one clue that would prove it wrong, and only then make an arrest. Guess-and-check debugging is fortune telling with extra steps.

## team | Debugging on a team

- Say what you've ruled out when you ask for help: it halves the time.
- Write down the timeline while you investigate; it becomes the incident note.
- **Blameless**: the question is "what allowed this?" (no validation on the config value, no test) rather than "who did this?".

## traps | Debugging traps

- Changing many things at once.
- Fixing the symptom (catching the exception and returning 0% tax) instead of the cause.
- Ignoring the first error in a log and chasing the last one (later errors are often consequences).
- "It works now" without knowing why.

## lab | A 500 on every new order

The orders service returns 500 for new orders. Work from the evidence to the cause, find the change that introduced it, and fix it.
