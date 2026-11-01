## story | Friday afternoon, a "quick fix"

A contractor couldn't get local charging to work, so he pasted the live payment key into the code, added a print to debug it, and opened a PR titled "Quick fix: make charging work locally". It has one approval from someone who didn't read it. It's yours to review before it merges.

## model | Responding to a leaked secret

1. **Don't merge.** Fix the code: read the key from the environment, remove every print of it.
2. **Rotate** the key at the provider now: it is already in the branch's history, on the server and in everyone's clones.
3. Tell the team clearly: what leaked, where, what you did, what's left.
4. Ask what would have caught it earlier (secret scanning in CI, a pre-commit hook), blamelessly.

## lab | Stop the merge, fix it right

Review the change, fix it on its branch, and write the note the team needs.
