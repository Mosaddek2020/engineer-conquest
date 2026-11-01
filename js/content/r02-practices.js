// Realm 2 · Good Practices: design principles, config/secrets/logs, code review, docs and decisions.

// Fake keys are assembled at runtime so the public repository never contains a secret-shaped literal.
const FAKE_SK = ['sk', 'live', '51HxQ2bExampleOnlyNotARealKey9876'].join('_');
const FAKE_PK = ['pk', 'live', '88Ab12ExampleOnlyNotARealKey000'].join('_');

const git = (t, cmd, dir) => t.exec('laptop', `cd ${dir} && ${cmd}`, { user: 'dev' }).out.trim();
const commit = (H, dir, msg, who = 'Rumana Akter') => H.run(`cd ${dir} && git add -A && git -c user.name="${who}" -c user.email=dev@example.com commit -qm "${msg}"`, { on: 'laptop', user: 'dev' });

const SETTINGS_PY = `import os

# All configuration comes from the environment (12-factor). Defaults only for harmless values.
DATABASE_URL = os.environ["DATABASE_URL"]            # required: crash at start if missing
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")  # secret: never committed
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
`;

const REPORT_BASE = `def monthly_report(orders):
    """Total revenue per currency for the given orders."""
    totals = {}
    for order in orders:
        totals[order.currency] = totals.get(order.currency, 0) + order.amount
    return totals
`;
const REPORT_PR = `import requests

API_KEY = "${FAKE_SK}"


def monthly_report(orders):
    totals = {}
    for o in orders:
        print("DEBUG order", o.id, o.customer_email, o.amount)
        totals[o.currency] = totals.get(o.currency, 0) + o.amount
    requests.post("https://analytics.example.com/v1/push", json=totals,
                  headers={"Authorization": "Bearer " + API_KEY})
    return totals
`;

const PAY_BASE = `import os


def charge(amount_minor, currency):
    """Charge a card through the payment provider. Amounts are integers in minor units (poisha)."""
    key = os.environ["PAYMENTS_API_KEY"]
    return {"amount": amount_minor, "currency": currency, "key_id": key[:6]}
`;
const PAY_PR = `import os

PAYMENTS_API_KEY = "${FAKE_PK}"


def charge(amount_minor, currency):
    """Charge a card through the payment provider. Amounts are integers in minor units (poisha)."""
    print("charging", amount_minor, currency, "with key", PAYMENTS_API_KEY)
    return {"amount": amount_minor, "currency": currency, "key_id": PAYMENTS_API_KEY[:6]}
`;

export default {
  id: 'practices',
  n: 2,
  title: 'Good Practices',
  tagline: 'Design that survives change, secrets that stay secret, reviews that help',
  badge: 'Good Practitioner',
  intro: 'The habits that separate code that works today from code a team can live with for years: **design principles** that keep parts independent, **configuration and secrets** handled safely, **logs** that help instead of leak, **code review** done well from both sides, and **documentation** that records why.',
  lessons: [
    {
      id: 'design-principles',
      title: 'Design principles',
      summary: 'Separation of concerns, cohesion and coupling, single responsibility, depending on interfaces, composition over inheritance.',
      minutes: 15,
      quiz: [
        { type: 'mc', q: 'High cohesion and low coupling means:', choices: ['Everything in one file', 'Things that change together live together; parts depend on each other as little as possible', 'Every class inherits from one base class', 'Copying code to avoid dependencies'], answer: 1, explain: 'SaaS-Foundation\'s whole design ("modules never import each other") is this principle enforced by a tool.' },
        { type: 'mc', q: 'The single responsibility principle says a module or class should have:', choices: ['One method', 'One reason to change', 'One developer', 'One test'], answer: 1, explain: 'If billing rules and email formatting live in one class, two unrelated changes collide there.' },
        { type: 'mc', q: 'Module A needs to send an email but must not import the email module. A good design is:', choices: ['Copy the email code into A', 'A calls an interface ("port") that the email module implements and installs at startup', 'Merge both modules', 'Use a global variable'], answer: 1, explain: 'Depend on an abstraction (dependency inversion). That is exactly how `notify()` works in SaaS-Foundation.' },
        { type: 'multi', q: 'Separation of concerns: which belong in different layers of a web backend?', choices: ['HTTP routing and request parsing', 'Business rules', 'Database queries', 'All of them in one function per endpoint'], answer: [0, 1, 2], explain: 'Routes stay thin; services hold rules; repositories hold queries.' },
        { type: 'mc', q: '"Prefer composition over inheritance" means:', choices: ['Never use classes', 'Build behaviour by combining small objects rather than deep inheritance trees', 'Inherit from as many classes as possible', 'Use only functions'], answer: 1, explain: 'Deep hierarchies make changes ripple unpredictably.' },
        { type: 'tf', q: 'Good design means planning every future feature up front.', answer: false, explain: 'YAGNI: design for change, not for imagined requirements.' },
      ],
    },
    {
      id: 'config-secrets-logs',
      title: 'Configuration, secrets and logs',
      summary: '12-factor config from the environment, .env files and .gitignore, never committing secrets, structured logs and what must never be logged.',
      minutes: 20,
      lab: {
        cwd: '~/api',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/api/settings.py', SETTINGS_PY, { owner: 'dev' });
          H.write('laptop', '~/api/.env.example', '# Copy to .env and fill in. Never commit .env.\nDATABASE_URL=postgresql://app@localhost:5432/app\nSMTP_PASSWORD=\nLOG_LEVEL=INFO\n', { owner: 'dev' });
          H.write('laptop', '~/api/.gitignore', '__pycache__/\n*.pyc\n', { owner: 'dev' });
          H.run('cd ~/api && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/api', 'API settings');
          H.write('laptop', '~/api/logs/api.log', [
            '{"ts":"09:00:01","level":"info","msg":"request","path":"/v1/auth/login","status":200}',
            '{"ts":"09:00:05","level":"info","msg":"login ok","user":"r***@example.com"}',
            '{"ts":"09:01:12","level":"debug","msg":"calling provider","url":"https://pay.example.com/charge?token=tok_live_4f7Q9sECRET"}',
            '{"ts":"09:01:13","level":"error","msg":"provider timeout","path":"/v1/billing/charge","status":502}',
          ].join('\n') + '\n', { owner: 'dev' });
        },
        suggestions: ['cat settings.py', 'cat .env.example', 'cat .gitignore'],
        tasks: [
          { title: 'Read how the app is configured: `cat settings.py`. Where do the values come from?', solution: 'cat settings.py', check: t => t.ran(/\bcat\b.*settings\.py/) },
          { title: 'Create your local `.env` from the example: `cp .env.example .env`', solution: 'cp .env.example .env', check: t => t.exists('laptop', '/home/dev/api/.env') },
          { title: 'Make sure `.env` can never be committed: add it to `.gitignore`', hint: '`echo ".env" >> .gitignore`', solution: 'echo ".env" >> .gitignore', check: t => /^\.env$/m.test(t.file('laptop', '/home/dev/api/.gitignore') || '') },
          { title: 'Prove it: `git status` must not list `.env` (only `.gitignore` changed)', solution: 'git status', check: t => t.ran(/^git\s+status\b/) && /^\.env$/m.test(t.file('laptop', '/home/dev/api/.gitignore') || '') && !/\.env\s*$/m.test(git(t, 'git status', '/home/dev/api').replace(/\.env\.example/g, '')) },
          { title: 'Logs can leak secrets too. Search the log for anything that looks like a token: `grep -n "token" logs/api.log`', solution: 'grep -n "token" logs/api.log', check: t => t.ran(/\bgrep\b.*(token|tok_|secret).*api\.log/i) },
          { title: 'Write the leaking log line number and why it is a problem into `~/finding.txt` (e.g. "line 3: payment token in a URL query string was logged")', solution: 'echo "line 3: a live payment token in the URL query string was logged at debug level; logs must not contain secrets" > ~/finding.txt', check: t => { const s = t.file('laptop', '/home/dev/finding.txt') || ''; return /\b3\b/.test(s) && /token|secret/i.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Where should an app\'s configuration (database URL, API keys, feature flags) come from?', choices: ['Hard-coded constants', 'The environment (env vars, injected secrets), so the same code runs in every environment', 'A file committed to git with production values', 'The user\'s browser'], answer: 1, explain: '12-factor: config varies between deploys; code does not.' },
        { type: 'multi', q: 'Never commit:', choices: ['.env files with real values', 'API keys and passwords', 'Private keys', '.env.example with placeholders', 'Customer data dumps'], answer: [0, 1, 2, 4], explain: 'An example file with placeholders documents what is needed, safely.' },
        { type: 'mc', q: 'You committed an API key and pushed it. Deleting it in the next commit is enough?', choices: ['Yes', 'No: it is in history (and copies of it). Revoke/rotate the key now, then clean up', 'Only if the repo is private', 'Yes, if nobody starred the repo'], answer: 1, explain: 'Assume any pushed secret is compromised. Rotate first.' },
        { type: 'multi', q: 'What should not be in logs?', choices: ['Passwords and tokens (also inside URLs)', 'Full card numbers', 'Request ids', 'Status codes and durations', 'Personal data beyond what you truly need'], answer: [0, 1, 4], explain: 'Log ids, codes and timings. SaaS-Foundation redacts tokens, secrets and emails automatically.' },
        { type: 'mc', q: 'Why prefer structured (JSON) logs?', choices: ['They look nicer', 'Machines can filter and aggregate fields (status, path, tenant) reliably', 'They are smaller', 'They are encrypted'], answer: 1, explain: '`status=500 AND path=/v1/orders` beats grepping free text.' },
        { type: 'mc', q: 'An app starts but a required setting is missing. Best behaviour?', choices: ['Run with a guessed default', 'Fail at startup with a clear message naming the setting', 'Fail later on the first request', 'Log nothing'], answer: 1, explain: 'Fail fast and loud, close to the cause.' },
      ],
    },
    {
      id: 'code-review',
      title: 'Code review, from both sides',
      summary: 'What reviewers look for, writing a PR people can review, kind and specific comments, and receiving feedback well.',
      minutes: 20,
      lab: {
        cwd: '~/reports',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/reports/report.py', REPORT_BASE, { owner: 'dev' });
          H.run('cd ~/reports && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/reports', 'Monthly revenue report');
          H.run('cd ~/reports && git switch -q -c feat/analytics-push', { on: 'laptop', user: 'dev' });
          H.write('laptop', '~/reports/report.py', REPORT_PR, { owner: 'dev' });
          commit(H, '~/reports', 'Push report totals to analytics', 'Sam Contractor');
          H.run('cd ~/reports && git switch -q main', { on: 'laptop', user: 'dev' });
        },
        suggestions: ['git log --oneline --all', 'git diff main feat/analytics-push'],
        tasks: [
          { title: 'A teammate asks you to review the branch `feat/analytics-push`. See its commits: `git log --oneline main..feat/analytics-push`', solution: 'git log --oneline main..feat/analytics-push', check: t => t.ran(/git\s+log\b.*feat\/analytics-push/) },
          { title: 'Read the full change: `git diff main feat/analytics-push`', solution: 'git diff main feat/analytics-push', check: t => t.ran(/git\s+diff\b.*feat\/analytics-push/) },
          { title: 'Write your review in `~/review.md`: at least three concrete findings. Reviewers here always flag secrets, personal data in logs, and missing tests', hint: 'Be specific and kind: what, where, why it matters, and a suggestion. For example: "blocking: line 3 hard-codes a live API key; load it from the environment and rotate this one".', solution: 'printf "%s\\n" "blocking: line 3 hard-codes a live API key (sk_live...). Move it to an env var and rotate the key." "blocking: the DEBUG print logs customer emails (personal data). Remove it or log the order id only." "question: the report now makes a network call; what happens on timeout? Please add a test with the HTTP call mocked." "nit: renamed loop variable o is less clear than order." > ~/review.md', check: t => { const s = (t.file('laptop', '/home/dev/review.md') || '').toLowerCase(); return /(key|secret|sk_live)/.test(s) && /(email|personal|print|debug)/.test(s) && /test/.test(s); } },
        ],
      },
      quiz: [
        { type: 'multi', q: 'What should a reviewer look for first?', choices: ['Correctness: does it do what the ticket says, including edge cases?', 'Security: secrets, permissions, input validation, data exposure', 'Tests that would fail if the change were wrong', 'Personal style preferences the linter does not enforce'], answer: [0, 1, 2], explain: 'Style belongs to tools; humans review logic, safety and tests.' },
        { type: 'mc', q: 'Which review comment is best?', choices: ['"This is wrong."', '"blocking: `charge()` runs before the stock check, so a failed check still charges the card. Could we check stock first and add a test for the failure path?"', '"I would never write it like this."', '"LGTM" without reading'], answer: 1, explain: 'Specific, explains the impact, suggests a way forward, marks severity.' },
        { type: 'mc', q: 'Labels like "nit:", "question:" and "blocking:" help because:', choices: ['They make comments longer', 'The author knows which comments must be fixed before merge and which are optional', 'GitHub requires them', 'They hide comments'], answer: 1, explain: 'Clarity about severity avoids endless back-and-forth.' },
        { type: 'multi', q: 'A good PR description includes:', choices: ['What and why (link the ticket)', 'How it was tested', 'Risky areas the reviewer should look at closely', 'Screenshots for UI changes', 'Your life story'], answer: [0, 1, 2, 3], explain: 'Help the reviewer spend attention where it matters.' },
        { type: 'mc', q: 'You receive a lot of comments on your first PR. Best reaction?', choices: ['Argue every point', 'Assume good intent, ask when unclear, fix or explain each one, and thank the reviewer', 'Close the PR', 'Ignore the nits silently'], answer: 1, explain: 'Review is about the code, not you, and it is how you learn the codebase fastest.' },
        { type: 'tf', q: 'A 2,000-line PR gets a more thorough review than four 500-line PRs.', answer: false, explain: 'Big diffs get skimmed. Split work into reviewable steps.' },
      ],
    },
    {
      id: 'docs-decisions',
      title: 'Documentation and decisions',
      summary: 'READMEs that get people running, docstrings, architecture decision records, changelogs and versions, estimates and the definition of done.',
      minutes: 15,
      quiz: [
        { type: 'multi', q: 'A good README tells a newcomer:', choices: ['What the project is', 'How to set it up and run it', 'How to run the tests', 'Where to find deeper docs', 'Every function in the code'], answer: [0, 1, 2, 3], explain: 'Get people running in minutes; link the rest.' },
        { type: 'mc', q: 'What is an ADR (architecture decision record)?', choices: ['A test report', 'A short document recording a decision, its context, the options considered and the consequences', 'A deployment script', 'A code style guide'], answer: 1, explain: 'SaaS-Foundation keeps them in docs/adr/: future engineers learn *why*, not just *what*.' },
        { type: 'mc', q: 'In semantic versioning (MAJOR.MINOR.PATCH), a breaking API change bumps:', choices: ['PATCH', 'MINOR', 'MAJOR', 'Nothing'], answer: 2, explain: 'MAJOR = breaking, MINOR = new features, PATCH = fixes.' },
        { type: 'mc', q: 'Your lead asks how long a task will take and you are unsure. Best answer?', choices: ['"Two hours" to look good', 'A range with assumptions, and a check-in point: "1-3 days, assuming the API exists; I\'ll know more after the spike tomorrow"', '"I don\'t know"', '"Whenever it\'s done"'], answer: 1, explain: 'Honest ranges plus early updates beat confident wrong numbers.' },
        { type: 'tf', q: 'Documentation should be updated in the same pull request as the code change it describes.', answer: true, explain: 'Otherwise docs drift and start to lie.' },
        { type: 'mc', q: 'Which docstring is most useful?', choices: ['"""Charge function."""', '"""Charge a card. Amounts are integers in minor units (poisha); raises PaymentDeclined on a decline."""', '"""TODO"""', '"""This function charges."""'], answer: 1, explain: 'Units, contract and failure behaviour are what callers need.' },
      ],
    },
    {
      id: 'practices-boss',
      title: 'Boss: The PR that must not merge',
      summary: 'A payment change hard-codes a live key and logs it. Review it, fix it properly on the branch, and leave the history and the team better informed.',
      minutes: 20,
      boss: true,
      lab: {
        cwd: '~/payments',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/payments/pay.py', PAY_BASE, { owner: 'dev' });
          H.write('laptop', '~/payments/.env.example', 'PAYMENTS_API_KEY=\n', { owner: 'dev' });
          H.write('laptop', '~/payments/.gitignore', '.env\n', { owner: 'dev' });
          H.run('cd ~/payments && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/payments', 'Payments: charge via provider');
          H.run('cd ~/payments && git switch -q -c feat/quick-charge', { on: 'laptop', user: 'dev' });
          H.write('laptop', '~/payments/pay.py', PAY_PR, { owner: 'dev' });
          commit(H, '~/payments', 'Quick fix: make charging work locally', 'Sam Contractor');
        },
        suggestions: ['git diff main feat/quick-charge', 'git switch feat/quick-charge'],
        tasks: [
          { title: 'Review the branch: `git diff main feat/quick-charge`', solution: 'git diff main feat/quick-charge', check: t => t.ran(/git\s+diff\b.*quick-charge/) },
          { title: 'You are on that branch. Fix `pay.py`: the key must come from the environment again (`os.environ["PAYMENTS_API_KEY"]`), no literal key may remain, and nothing may print the key', hint: 'The quickest correct fix is to bring back main\'s version of the file: `git checkout main -- pay.py`.', solution: 'git checkout main -- pay.py', check: t => { const s = t.file('laptop', '/home/dev/payments/pay.py') || ''; return /os\.environ\["PAYMENTS_API_KEY"\]/.test(s) && !/pk_live_/.test(s) && !/print\(.*(key|PAYMENTS_API_KEY)/i.test(s); } },
          { title: 'Commit the fix on `feat/quick-charge` with a message that says the key was removed and must be rotated', solution: 'git commit -am "Load payments key from the environment; remove hard-coded key (rotate pk_live_88Ab...)"', check: t => git(t, 'git branch --show-current', '/home/dev/payments') === 'feat/quick-charge' && /nothing to commit/.test(git(t, 'git status', '/home/dev/payments')) && /rotat|revok/i.test(git(t, 'git log -1 --format=%s', '/home/dev/payments')) },
          { title: 'The key is still in the branch\'s history. Write `~/incident.txt` for the team: which key leaked, that it must be rotated at the provider now, and that the fix commit does not erase history', solution: 'echo "The live payments key pk_live_88Ab... was committed on feat/quick-charge. Rotate it at the provider now: the fix commit removes it from the code but it stays in git history." > ~/incident.txt', check: t => { const s = t.file('laptop', '/home/dev/incident.txt') || ''; return /pk_live|payments key/i.test(s) && /rotat|revok/i.test(s) && /histor/i.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why is rotating the key more urgent than cleaning git history?', choices: ['History cleaning is impossible', 'Anyone who already cloned or saw the key can use it; only rotation makes the leaked key worthless', 'Rotation is free', 'GitHub forbids history rewrites'], answer: 1, explain: 'Treat pushed secrets as public. Rotate first, then clean up.' },
        { type: 'multi', q: 'Which tools catch hard-coded secrets before they reach main?', choices: ['A secret scanner in CI (e.g. gitleaks, as in SaaS-Foundation)', 'Code review', 'Pre-commit hooks', 'Turning off CI'], answer: [0, 1, 2], explain: 'Layers: local hook, CI scanner, human review.' },
        { type: 'mc', q: 'The author says "it was only for local testing". Your response:', choices: ['Approve', 'Explain kindly that local hacks end up in shared history; show how to use .env locally instead', 'Report them to HR', 'Rewrite the feature yourself'], answer: 1, explain: 'Teach the safer habit; the goal is better code and a better teammate.' },
        { type: 'tf', q: 'Printing a secret "just at debug level" is fine because debug logs are rarely read.', answer: false, explain: 'Logs are shipped, stored and searched by many systems and people.' },
        { type: 'mc', q: 'Where should the payments key live in development?', choices: ['Hard-coded with a TODO', 'In a local .env (gitignored), loaded into the environment; in production, injected from a secret manager or the vault', 'In the README', 'In a ticket'], answer: 1, explain: 'Same code everywhere, secrets outside it.' },
      ],
    },
  ],
};
