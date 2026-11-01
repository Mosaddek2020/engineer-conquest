## story | The key that cost a weekend

An intern pushed a cloud API key in a config file to a public repository. Within four minutes, automated scanners had found it, and by morning someone had started 200 crypto-mining servers on the company's account. Deleting the file in the next commit didn't help: the key was in the history, and bots had already copied it.

## model | Configuration and secrets

**12-factor config**: the same code runs in every environment (your laptop, CI, staging, production). What differs between them (database URLs, API keys, feature flags) comes from the **environment**: environment variables, or a secret manager that injects them.

- Commit an **`.env.example`** with placeholders: it documents what is needed.
- Keep your real **`.env`** local and in **`.gitignore`**.
- Required settings **fail fast**: crash at startup with a message naming the missing variable.
- **Secrets** (passwords, API keys, private keys, tokens) never go in code, git, tickets, chat or logs. If one leaks: **rotate it immediately**, then clean up.

SaaS-Foundation goes further: tenant credentials (a client's SMTP password, a payment key) live in an **encrypted vault** (AES-GCM), never in settings or plain columns.

## model | Logging that helps and doesn't leak

- **Levels**: `debug` (noisy detail), `info` (normal events), `warning` (unexpected but handled), `error` (something failed).
- **Structured logs** (JSON): fields like `status`, `path`, `request_id`, `duration_ms` that machines can filter and aggregate.
- **Request ids** connect all the log lines of one request across services.
- **Never log**: passwords, tokens (also inside URLs and query strings), full card numbers, more personal data than you need. SaaS-Foundation's JSON logger redacts secret-looking keys, bearer tokens, `token=` values and email addresses automatically, and the access log records paths without query strings.

## analogy | House keys

Configuration is the house address: different for every house, written on the outside. Secrets are the keys: you don't print them on the door, you don't photocopy them for strangers, and if you lose one, you change the lock (rotate), you don't just hope nobody finds it.

## traps | Traps

- `git add .` picks up `.env`. Look at `git status` before every commit.
- "Temporary" debug logging of a full request, headers included (the `Authorization` header is a credential).
- Default values for secrets (`SECRET = os.environ.get("SECRET", "dev-secret")`): production silently runs with the default.
- Secrets pasted into AI chat windows. (More on that in the AI realm.)

## lab | Set up config safely, and catch a leaky log

Set up your local configuration the safe way, prove git will never pick it up, then audit a log for leaked secrets.
