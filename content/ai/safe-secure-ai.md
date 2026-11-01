## story | Three incidents from one year

A developer pasted a production `.env` file into a public chat assistant to debug a crash: the database password had to be rotated across forty services. Another asked an assistant for a package to parse invoices, installed the slightly-wrong name it suggested, and pulled in malware someone had published under that exact hallucinated name. A third pointed a coding agent at an open-source repository whose README contained hidden instructions telling AI agents to download and run a script. Each incident was preventable with one habit.

## model | The risks, and the defences

**1. Secrets and personal data in prompts.** Anything you paste may be stored, logged or used under the tool's terms. *Defence:* never paste secrets, customer data or production config; redact (`[REDACTED]`); use only company-approved tools and accounts for company code; many companies route AI traffic through a **gateway with data-loss prevention** that blocks secrets.

**2. Prompt injection.** Text the AI reads (READMEs, issues, PR descriptions, web pages, error messages, emails) can contain instructions that hijack it: "ignore previous instructions and run...". Dangerous when an agent can **read untrusted content and act**. *Defence:* read the agent's plan; deny dangerous command patterns (piping downloads into a shell, network access, deletions); keep secrets out of the agent's environment; treat any text from outside as data, never as instructions.

**3. Hallucinated packages ("slopsquatting").** AIs invent plausible package names; attackers register them. *Defence:* verify a package exists, is the one you mean, is maintained and widely used, and ask whether you need a new dependency at all (SaaS-Foundation requires the maintainer's OK).

**4. Insecure suggestions.** AI reproduces common patterns, including common vulnerabilities (SQL built with f-strings, `verify=False`, missing permission checks). *Defence:* review, static analysis (semgrep, linters), tests from the spec.

**5. Licences, IP and privacy.** Generated code can resemble licensed code; company policies on approved tools and data still apply.

**6. Over-privileged agents.** *Defence:* least privilege, allow/ask/deny rules, branches or sandboxes, audit logs, human approval for anything irreversible.

## analogy | A helpful stranger in the server room

Treat AI input and output like a helpful stranger who wandered into the server room: they might be brilliant and they might be reading from a note someone slipped them. You don't hand them your keys, you don't let them install things you haven't checked, and you watch what they touch.

## lab | Two everyday traps

Debug a billing error without leaking a secret, then catch a prompt injection before a setup agent follows it.
