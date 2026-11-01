## story | The intern who lost a day of work

Farhan spent a whole day improving the signup form. In the evening he tried a command from a forum to "clean up" his folder and deleted every change. There was no undo: he had never committed. The next morning Rumana showed him the habit that would have saved him: **commit small, commit often, push your branch**. A commit is a save point you can always return to.

## model | The terminal in five minutes

The **terminal** (shell) runs commands in a **current folder** (`pwd` shows it).

| Command | Does |
|---|---|
| `pwd` / `ls -la` / `cd folder` / `cd ..` | where am I / what is here (with hidden files) / go in / go up |
| `cat file` / `less file` / `head` / `tail` | show a file / page through it / first lines / last lines |
| `grep -rn "text" .` | search every file below here, with line numbers |
| `mkdir -p a/b` / `cp` / `mv` / `rm` | make folders / copy / move or rename / delete (no recycle bin!) |
| `echo "hi" > f` / `>> f` | write (overwrite) / append |
| `cmd1 \| cmd2` | pipe: the output of one command becomes the input of the next |

Tab completes names; the Up arrow recalls previous commands; Ctrl+C stops a running command.

## model | Git: the save points of a team

**Git** records snapshots (**commits**) of a project. Each commit has an id, an author, a message and a parent: together they form the history.

Three places your changes can be:

```
working folder  --git add-->  staging area  --git commit-->  history  --git push-->  GitHub
```

The everyday loop: `git status` → `git diff` → `git add <files>` → `git commit -m "message"` → `git push`.

**Branches** are movable labels on commits. You do your work on a branch (`git switch -c my-change`), and `main` stays clean until your pull request is merged.

## analogy | A lab notebook

Scientists write every experiment in a numbered, dated notebook and never tear pages out. A git history is the team's lab notebook: what changed, who changed it, and (in the message) **why**. `git status` is reading your current page before you write on it.

## traps | Git traps

- Committing everything with `git add .` without looking: you commit debug prints, `.env` files with secrets, or huge files. Look with `git status` and `git diff` first.
- Messages like "fix" or "wip". Write what and why: "Fix tax rounding for BDT amounts".
- Working on `main` directly. Always branch.
- `rm` and `git reset --hard` are not undoable for uncommitted work. Commit first.

## lab | The everyday loop

Practise the loop you will run dozens of times a day: look, change, look again, stage, commit, review the history.
