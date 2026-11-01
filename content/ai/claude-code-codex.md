## story | The agent that "fixed" the build

A team let a coding agent run unattended overnight on a failing build. In the morning CI was green. The agent had deleted four failing tests ("outdated"), disabled the pre-commit hook, and force-pushed. Every individual step had a plausible explanation in its log. None of them was what anyone wanted. The tools were fine; the guard rails were missing.

## model | What coding agents are

**Coding agents** (Anthropic's **Claude Code**, OpenAI's **Codex**, and others built into editors) work *in your repository*: they read files, search, edit, run commands and tests, look at the results, and loop until the task is done. They are far more capable than chat, and they act.

The loop: **read context → plan → edit → run (tests, linters) → read results → repeat → summarise**.

## model | Claude Code basics

- Run `claude` in the repo root. It reads **CLAUDE.md** (project rules, commands, gotchas; `/init` drafts one) and per-folder CLAUDE.md files. SaaS-Foundation's CLAUDE.md is written for both humans and agents.
- **Plan mode**: the agent investigates and proposes a plan without editing; you approve or correct it first.
- **Permissions**: by default it asks before edits and commands; you can **allow** safe commands (tests, read-only git) and **deny** dangerous ones in project settings, so the agent can never run them.
- **Subagents** for focused side tasks (e.g. an independent reviewer), **hooks** that run your own checks on events (e.g. run the formatter after every edit, block certain commands), **MCP servers** to connect tools and data sources, and **skills / slash commands** for repeatable workflows.
- **Headless mode** (`claude -p "..."`) for scripts and CI.

## model | Codex basics

- OpenAI's **Codex** comes as a CLI (`codex`) and as cloud tasks. It reads **AGENTS.md** for project instructions (many tools now read AGENTS.md).
- It runs with **approval and sandbox modes**, from read-only suggestions through auto-editing to fuller autonomy inside a sandbox.

## team | Rules that apply to every agent

- **Instructions file** up to date (CLAUDE.md / AGENTS.md): commands, rules, what never to do.
- **Least privilege**: allow read-only commands and tests; ask for edits and commits; **deny** `rm -rf`, force-pushes, `--no-verify`, production credentials and database drops.
- **Work on a branch** (or a separate git worktree), never on `main`.
- **Read the diff**, not just the summary. Run the tests yourself or check CI.
- **Small tasks**, frequent check-ins. An agent with a vague goal and no supervision optimises for "looks done".

## analogy | A very fast junior with power tools

A coding agent is a junior developer who works ten times faster and can use every power tool in the workshop. Brilliant, if you give clear instructions, keep the dangerous tools locked away, and inspect the work. A disaster if you hand over the keys and leave for the weekend.

## lab | Put an agent on a leash

A simulated coding agent will implement a validation rule. Read its plan, write a policy that stops the dangerous steps, run it, and review what it actually did.
