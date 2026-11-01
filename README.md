# Engineer Conquest

A hands-on, mastery-based path for **interns and new software engineers**: from "what do engineers actually do?" to shipping a reviewed change on a multi-tenant SaaS platform, with **software development in the era of AI** built in.

**Live:** https://mosaddek2020.github.io/engineer-conquest/

Third in the Conquest series, after
[Git Conquest](https://mosaddek2020.github.io/git-conquest/) and
[DevOps Conquest](https://mosaddek2020.github.io/devops-conquest/).

## The path (12 realms, 65 lessons, ~380 quiz questions)

| # | Realm | What you learn |
|---|---|---|
| 0 | Base Camp | What engineers really do, how teams ship, learning fast and asking well, your first ticket |
| 1 | The Engineer's Craft | Terminal + git, clean code, testing, debugging, git bisect |
| 2 | Good Practices | Design principles, config/secrets/logs, code review, docs and ADRs |
| 3 | How the Web Works | Client/server, URLs and DNS, IPs and ports, what happens when you type a URL |
| 4 | HTTP Deep Dive | Methods and status codes, headers, cookies and sessions, REST and JSON, CORS |
| 5 | HTTPS & Web Security | TLS and certificates, security headers, authn/authz, the OWASP classics |
| 6 | Frontend | HTML/CSS, JavaScript, React + TypeScript, Next.js, design systems and accessibility |
| 7 | Backend | Python, FastAPI, SQL and PostgreSQL, ORMs and migrations, background jobs |
| 8 | SaaS & Multi-tenancy | Tenants, tenancy models, row-level security, identity and roles, the modular monolith |
| 9 | SaaS-Foundation Walkthrough | A guided tour of an illustrative miniature of the codebase interns will work on |
| 10 | Software Development in the Era of AI | How LLMs fail, vibe coding vs engineering, spec first, Claude Code and Codex, safe and secure AI coding, verifying AI output |
| 11 | Hero Trials | An incident, a capstone code review, the final exam |

Each lesson: **Learn** (several "lenses": story, mental model, analogy, team practice, traps) → **Practice** (a lab in a simulated terminal with servers, APIs, certificates, git, an AI assistant and a coding agent) → **Prove** (a quiz, 80% to pass). XP, ranks, badges and boss lessons make it a conquest. Progress stays in your browser; export a progress code from the Profile page.

The SaaS-Foundation realm uses an **illustrative miniature** written for the course: it mirrors the real layout and patterns but contains no code from the private repository.

## Development

Static site, no backend. The engine and simulator are shared with DevOps Conquest.

```bash
node tools/build-content.mjs   # bundle content/<realm>/<lesson>.md into js/content/text.js
node tests/labs.mjs [realm]    # every lab solvable from its solutions, no premature passes
node tests/quizzes.mjs         # quiz validity + rank ladder reachable
node tests/modules.mjs         # every module imports
node tools/build.mjs           # dist/ for a static web server
```

Pushing to `main` runs every test and deploys to GitHub Pages.
