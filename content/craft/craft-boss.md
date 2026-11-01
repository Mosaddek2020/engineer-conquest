## story | Seven commits, one silent bug

Customers report that members are getting 20% off instead of 10%. There are seven commits since pricing was last known to be right, most of them "harmless" changelog edits and a refactor. Rumana: "Don't read every diff. Let git do the search."

## model | git bisect

`git bisect` is a **binary search** through history: you tell it one good and one bad commit, it checks out the one in the middle, you (or a script) say good or bad, and it halves the range again. 1,000 commits need about 10 checks.

```
git bisect start <bad> <good>
git bisect run ./check.sh      # exit code 0 = good, anything else = bad
git bisect reset               # back to where you were
```

Then **fix forward**: a new commit (or `git revert <id>`) on top of shared history. Never rewrite commits other people already have.

## lab | Find the commit, fix it forward

You have a script that knows the right answer (`check.sh`) and a history that broke it somewhere. Combine them.
