## story | The same ten mistakes

The OWASP Top 10 is a list of the most common, most damaging web vulnerabilities, updated every few years from real breach data. What's striking is how little it changes: the same families of mistakes show up decade after decade, because each new team has to learn them. You'll learn them now, from the defender's side.

## model | The classics and their standard defences

**Broken access control** (#1): users reach data or actions they shouldn't (changing an id in the URL: **IDOR**). *Defence:* check ownership on every object access; deny by default; prefer 404 for "not yours"; in multi-tenant systems, enforce isolation in the database too (RLS).

**Injection** (SQL, shell, template): untrusted input becomes code. *Defence:* parameterised queries / ORM (never build SQL with string concatenation), no `shell=True` with input, templates that can't execute code.

**Cross-site scripting (XSS)**: input rendered as HTML/JS in other users' browsers. *Defence:* escape by default (React does; `dangerouslySetInnerHTML` doesn't), strict CSP, httpOnly cookies.

**CSRF**: a malicious site makes your browser send a state-changing request with your cookies. *Defence:* SameSite cookies, Origin checks, no state changes on GET.

**SSRF**: your server fetches a user-supplied URL and is tricked into calling internal services (cloud metadata, admin panels). *Defence:* allow-lists, refuse private IPs, pin the resolved IP (stop DNS rebinding), no redirects.

**Security misconfiguration**: debug mode on, default passwords, verbose errors, missing headers, open storage buckets.

**Vulnerable and outdated components**: dependencies with known CVEs. *Defence:* Dependabot, `pip-audit`/`npm audit` in CI.

**Cryptographic failures, identification failures, logging failures**: covered across this realm and the Practices realm.

## inside | Evidence from SaaS-Foundation's own security review

The project's November 2026 review (docs/SECURITY-REVIEW-2026-11-01.md) found, among others: a **Host-header** trick that made password-reset emails link to an attacker's site (input validation), **unlimited MFA guessing** by re-entering the password (a counter reset in the wrong place), and an **email-change link that survived a password reset**. All fixed, each with a regression test that fails if the fix is removed. Read it: it's the best lesson in this realm.

## analogy | Locks, alarms and keys

Access control is the locks on each door, not just the front door. Injection is a form where writing "and open the safe" in the name field actually opens the safe. XSS is a visitor leaving a note on the noticeboard that hypnotises the next person who reads it. SSRF is convincing the receptionist to phone the vault from inside the building.

## lab | Test your own API for IDOR

Security testing your own application is part of the job. A billing API is about to ship: check that one customer can't read another's invoice.
