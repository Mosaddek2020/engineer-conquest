// Realm 9 · SaaS-Foundation Walkthrough: a guided tour of an ILLUSTRATIVE miniature of the codebase
// (see foundation-mini.js): layout and rules, the life of a request, a module's anatomy, tests and CI, contributing.

import { writeMini } from './foundation-mini.js';

const ROOT = '/home/dev/saas-foundation';

export default {
  id: 'foundation',
  n: 9,
  title: 'SaaS-Foundation Walkthrough',
  tagline: 'Find your way around the codebase you will work on: its rules, a request\'s journey, a module, the tests',
  badge: 'Foundation Insider',
  intro: 'Time to meet the codebase. This realm tours a **miniature** of SaaS-Foundation, written for this course: the same layout, rules and patterns as the real (private) repository, in simplified code. You will learn where things live, the **journey of one request** from host name to database row, the **anatomy of a module**, how **tests and CI** guard it, and how to **contribute** your first change. Afterwards, the real repository will feel familiar.',
  lessons: [
    {
      id: 'repo-tour',
      title: 'A tour of the repository',
      summary: 'The folders, the README and CLAUDE.md rules, the Makefile targets you will run every day, and where the docs and task cards live.',
      minutes: 20,
      lab: {
        cwd: '~/saas-foundation',
        panels: ['files', 'git'],
        setup(H) { writeMini(H); },
        suggestions: ['ls', 'cat README.md', 'cat CLAUDE.md'],
        tasks: [
          { title: 'Look around the top level: `ls`, then `ls modules packages apps`', solution: 'ls && ls modules packages apps', check: t => t.ran(/^ls\b.*modules/) },
          { title: 'Read the README, then the rules every engineer (and AI agent) follows: `cat CLAUDE.md`', solution: 'cat README.md && cat CLAUDE.md', check: t => t.ran(/\bcat\b.*CLAUDE\.md/) },
          { title: 'List the Makefile targets with their descriptions: `grep -E "^[a-z-]+:" Makefile`', solution: 'grep -E "^[a-z-]+:" Makefile', check: t => t.ran(/\bgrep\b.*Makefile/) },
          { title: 'A product is a list of modules. Read `apps/api/main.py`', solution: 'cat apps/api/main.py', check: t => t.ran(/\bcat\b.*apps\/api\/main\.py/) },
          { title: 'Find your first task card: `ls docs/intern/tasks` and read card 00', solution: 'ls docs/intern/tasks && cat docs/intern/tasks/00-warmup-members.md', check: t => t.ran(/\bcat\b.*00-warmup/) },
        ],
      },
      quiz: [
        { type: 'multi', q: 'Match the top-level folders (as in the real repo):', choices: ['modules/: one backend module each (auth, notifications...)', 'python/foundation-core/: the module system, ports, tenancy and RLS helpers', 'packages/: design system, tokens, the generated SDK', 'apps/: the reference API (apps/api) and the Next.js web app (apps/web)', 'node_modules/: where modules are written'], answer: [0, 1, 2, 3], explain: 'node_modules is installed JavaScript dependencies.' },
        { type: 'mc', q: 'Which command runs everything CI runs, and must pass before every PR?', choices: ['make api', 'make check', 'make worker', 'git push'], answer: 1, explain: '"Finish every task with make check" is the first line of CLAUDE.md.' },
        { type: 'mc', q: 'Where do you read the rules both engineers and AI coding agents must follow?', choices: ['The wiki', 'CLAUDE.md (and the per-area CLAUDE.md files)', 'Slack', 'The Makefile'], answer: 1, explain: 'AI agents like Claude Code read them automatically.' },
        { type: 'mc', q: 'How does a product add the notifications feature?', choices: ['Copy the notifications code', 'Add `notifications` to the module list passed to create_app in its main.py', 'Edit foundation_core', 'Set an environment variable'], answer: 1, explain: 'Plug and play: one line.' },
        { type: 'type', q: 'Type the make target that regenerates the OpenAPI file and the TypeScript SDK.', accept: ['make sdk'], model: 'make sdk', explain: 'Commit the result; CI fails if it is stale.' },
      ],
    },
    {
      id: 'request-lifecycle',
      title: 'The journey of one request',
      summary: 'From the Host header to a row in PostgreSQL: middleware order, tenant resolution, dependencies, the tenant-bound session and row-level security.',
      minutes: 25,
      lab: {
        cwd: '~/saas-foundation',
        panels: ['files'],
        setup(H) { writeMini(H); },
        suggestions: ['grep -n "class TenantMiddleware" -A 14 python/foundation-core/src/foundation_core/app.py'],
        tasks: [
          { title: 'Find the middleware that resolves the tenant: `grep -n "class TenantMiddleware" -A 14 python/foundation-core/src/foundation_core/app.py`', solution: 'grep -n "class TenantMiddleware" -A 14 python/foundation-core/src/foundation_core/app.py', check: t => t.ran(/\bgrep\b.*TenantMiddleware.*app\.py/) },
          { title: 'In which order do the middlewares run? Find the comment in `create_app`: `grep -n "outermost" -A 3 python/foundation-core/src/foundation_core/app.py`', solution: 'grep -n "outermost" -A 3 python/foundation-core/src/foundation_core/app.py', check: t => t.ran(/\bgrep\b.*outermost/) },
          { title: 'See how every request\'s DB session gets bound to the tenant: `grep -n "set_config" -B 3 -A 2 python/foundation-core/src/foundation_core/db.py`', solution: 'grep -n "set_config" -B 3 -A 2 python/foundation-core/src/foundation_core/db.py', check: t => t.ran(/\bgrep\b.*set_config.*db\.py/) },
          { title: 'Read the RLS SQL every tenant table gets: `grep -n "def rls_statements" -A 9 python/foundation-core/src/foundation_core/db.py`', solution: 'grep -n "def rls_statements" -A 9 python/foundation-core/src/foundation_core/db.py', check: t => t.ran(/\bgrep\b.*rls_statements/) },
          { title: 'Now a route that uses all of it: read `modules/notifications/src/foundation_notifications/router.py` and spot the permission check and the tenant-bound session', solution: 'cat modules/notifications/src/foundation_notifications/router.py', check: t => t.ran(/\bcat\b.*notifications.*router\.py/) },
        ],
      },
      quiz: [
        { type: 'order', q: 'Order what happens to GET /v1/notifications/deliveries on acme.<base_domain>.', items: ['RequestContext middleware: request id, body limit, security headers', 'CORS middleware: is the browser origin allowed for this tenant?', 'TenantMiddleware: validate the Host, resolve "acme", put it in the request context', 'Route dependencies: require("notifications.read") authenticates and checks the permission', 'get_session opens a transaction and sets app.tenant_id = acme', 'The query runs; RLS returns only Acme\'s rows', 'The response model shapes the JSON; the transaction commits'], explain: 'Each layer can stop the request before the next one runs.' },
        { type: 'mc', q: 'What does `set_config(\'app.tenant_id\', :t, true)` with `true` mean?', choices: ['Permanent for the connection', 'Local to the current transaction: the next transaction (maybe another tenant\'s) starts clean', 'Global for the database', 'It is ignored'], answer: 1, explain: 'Pooled connections can\'t leak a tenant between requests.' },
        { type: 'mc', q: 'An unknown Host reaches the API. What happens?', choices: ['The first tenant is used', '404 unknown_tenant, before any route runs', '500', 'The route runs with no tenant'], answer: 1, explain: 'And a malformed Host gets 400.' },
        { type: 'mc', q: 'A route forgot a WHERE tenant filter. What stops a leak?', choices: ['Nothing', 'Row-level security: the policy filters by app.tenant_id, and fails closed if it is unset', 'The frontend', 'CORS'], answer: 1, explain: 'And the repository adds a tenant filter too: two layers.' },
        { type: 'tf', q: 'Operator routes (/v1/operator/...) run without a tenant in context, so tenant-scoped code fails there on purpose.', answer: true, explain: 'Operators act on a tenant through an explicit, audited tenant session.' },
      ],
    },
    {
      id: 'module-anatomy',
      title: 'Anatomy of a module',
      summary: 'Manifest, models, migration with RLS, schemas, repository, service, router, ports it installs, and how another module calls it without importing it.',
      minutes: 20,
      lab: {
        cwd: '~/saas-foundation/modules/notifications/src/foundation_notifications',
        panels: ['files'],
        setup(H) { writeMini(H); },
        suggestions: ['ls -R', 'cat __init__.py'],
        tasks: [
          { title: 'List the module\'s files: `ls -R`', solution: 'ls -R', check: t => t.ran(/^ls\b.*-R/) },
          { title: 'Read the manifest (`__init__.py`): which permissions does it declare, and which roles get them?', solution: 'cat __init__.py', check: t => t.ran(/\bcat\b.*__init__\.py/) },
          { title: 'Read the model, then the migration. Which line makes the table tenant-isolated?', solution: 'cat models.py migrations/versions/0001_initial.py', check: t => t.ran(/\bcat\b.*0001_initial\.py|grep\b.*enable_rls/) },
          { title: 'Who calls notifications without importing it? From the repo root, search for the port: `grep -rn "def notify" ~/saas-foundation/python`', solution: 'grep -rn "def notify" ~/saas-foundation/python', check: t => t.ran(/\bgrep\b.*-\w*r.*notify/) },
          { title: 'Check the golden rule yourself: no module imports another. `grep -rn "from foundation_auth" ~/saas-foundation/modules` should find nothing outside auth', solution: 'grep -rn "from foundation_auth" ~/saas-foundation/modules', check: t => t.ran(/\bgrep\b.*from foundation_auth/) },
        ],
      },
      quiz: [
        { type: 'order', q: 'Order the layers inside a module, from storage to HTTP.', items: ['models.py: tables (SQLAlchemy)', 'repository.py: queries, tenant-aware', 'service.py: business rules, raises DomainError', 'router.py: thin HTTP routes using schemas.py'], explain: 'Plus __init__.py exporting the manifest.' },
        { type: 'multi', q: 'A new tenant table needs:', choices: ['`TenantScoped` on the model', 'A migration in the module\'s own branch', '`enable_rls("<table>")` in that migration', 'An entry in another module\'s code'], answer: [0, 1, 2], explain: 'The RLS and drift tests check all of it.' },
        { type: 'mc', q: 'The auth module needs to send a password-reset email. It:', choices: ['Imports foundation_notifications', 'Calls the core port notify(app, session, "auth.password_reset", ...)', 'Sends SMTP itself', 'Writes to the notifications table directly'], answer: 1, explain: 'The notifications module installs the implementation at startup.' },
        { type: 'mc', q: 'Where are a module\'s permissions granted to tenant roles?', choices: ['In the database by hand', 'In its manifest: tenant_grants / role_grants', 'In the frontend', 'In CLAUDE.md'], answer: 1, explain: 'Adding a module never requires editing another.' },
        { type: 'tf', q: 'A module may store another module\'s ids (e.g. user_id) as plain UUIDs without a foreign key.', answer: true, explain: 'That keeps modules independent.' },
      ],
    },
    {
      id: 'tests-ci',
      title: 'Tests, CI and the checks that protect main',
      summary: 'Tests on a real PostgreSQL, the isolation and drift tests, mutation checks, make check, the CI jobs (check, secrets, audit) and the PR template.',
      minutes: 20,
      lab: {
        cwd: '~/saas-foundation',
        panels: ['files'],
        setup(H) { writeMini(H); },
        suggestions: ['cat apps/api/tests/test_isolation.py', 'cat .github/workflows/ci.yml'],
        tasks: [
          { title: 'Read an isolation test: `cat apps/api/tests/test_isolation.py`. Why is the missing WHERE deliberate?', solution: 'cat apps/api/tests/test_isolation.py', check: t => t.ran(/\bcat\b.*test_isolation\.py/) },
          { title: 'Read the CI workflow: which three jobs run on every pull request?', solution: 'cat .github/workflows/ci.yml', check: t => t.ran(/\bcat\b.*ci\.yml/) },
          { title: 'Read the PR template: what is a "mutation check"?', solution: 'cat .github/pull_request_template.md', check: t => t.ran(/\bcat\b.*pull_request_template/) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why do SaaS-Foundation\'s tests use a real PostgreSQL instead of SQLite or mocks?', choices: ['Habit', 'Because the security (RLS policies, roles, constraints) lives in PostgreSQL; a fake database couldn\'t test it', 'SQLite is slower', 'Mocks are illegal'], answer: 1, explain: 'The test suite starts its own embedded Postgres.' },
        { type: 'mc', q: 'A mutation check is:', choices: ['Changing database rows', 'Deliberately breaking a protection (e.g. removing the token-expiry check), confirming a test fails, then restoring it', 'A genetics test', 'Running tests twice'], answer: 1, explain: 'It proves the tests actually guard the rule.' },
        { type: 'multi', q: 'CI jobs on every pull request:', choices: ['check: tests, import contracts, typechecks, SDK freshness', 'secrets: gitleaks over the whole history', 'audit: known-vulnerable dependencies, blocking on high severity', 'deploy to production'], answer: [0, 1, 2], explain: 'Deploys are separate from PR checks.' },
        { type: 'mc', q: 'CI fails with "SDK is stale". You:', choices: ['Disable the check', 'Run make sdk and commit the regenerated files', 'Edit the generated files by hand', 'Ignore it'], answer: 1, explain: 'Never hand-write API types.' },
        { type: 'tf', q: 'A green CI is a substitute for reading the diff in review.', answer: false, explain: 'CI checks what tests cover; reviewers check what they don\'t.' },
      ],
    },
    {
      id: 'contributing',
      title: 'Contributing: from task card to merged PR',
      summary: 'The intern workflow: task cards and spec tests, branches and draft PRs, the done checklist, security reviews, and never merging your own work.',
      minutes: 15,
      quiz: [
        { type: 'order', q: 'Order the intern workflow for a task card.', items: ['Read the task card and the files it lists', 'Branch from main: m2-<card>-<name>', 'Un-skip the card\'s spec tests and make them pass, adding more as you learn', 'Open a draft PR early; fill in the template\'s done checklist', 'make check; mutation checks for security rules', 'A reviewer approves; the maintainer merges'], explain: 'Small steps, visible early, reviewed always.' },
        { type: 'mc', q: 'The task card says "ask before adding a dependency". Why?', choices: ['Bureaucracy', 'Every dependency is code you ship and must keep secure and updated; the team decides deliberately', 'Dependencies are illegal', 'To slow you down'], answer: 1, explain: 'The audit job blocks known-vulnerable ones.' },
        { type: 'multi', q: 'Ask the maintainer before:', choices: ['Changing anything in foundation_core', 'Editing an existing (merged) migration', 'Weakening or deleting a test', 'Touching auth or MFA code', 'Renaming a local variable in your own function'], answer: [0, 1, 2, 3], explain: 'Some changes affect every module and every tenant.' },
        { type: 'mc', q: 'Cards marked "Security review" (files, API keys, webhooks, impersonation...) need:', choices: ['Nothing extra', 'A maintainer\'s review before merge, plus mutation checks recorded in the PR', 'Only a green CI', 'A second intern\'s approval'], answer: 1, explain: 'These are where mistakes become breaches.' },
        { type: 'tf', q: 'Interns should merge their own PRs once CI is green.', answer: false, explain: 'Open drafts, get review, let the maintainer merge.' },
      ],
    },
    {
      id: 'foundation-boss',
      title: 'Boss: Plan your first task',
      summary: 'Before writing code, investigate task card 00 in the codebase: find every place to change and write the plan a mentor would approve.',
      minutes: 25,
      boss: true,
      lab: {
        cwd: '~/saas-foundation',
        panels: ['files', 'git'],
        setup(H) { writeMini(H); },
        suggestions: ['cat docs/intern/tasks/00-warmup-members.md', 'grep -rn "list_members" .'],
        tasks: [
          { title: 'Re-read the task card', solution: 'cat docs/intern/tasks/00-warmup-members.md', check: t => t.ran(/\bcat\b.*00-warmup/) },
          { title: 'Find the route to change: `grep -rn "def list_members" modules`', solution: 'grep -rn "def list_members" modules', check: t => t.ran(/\bgrep\b.*list_members/) },
          { title: 'Find the response schema `MemberOut`', solution: 'grep -rn "class MemberOut" modules', check: t => t.ran(/\bgrep\b.*MemberOut/) },
          { title: 'Find the port you must extend (`UserDirectory`) and the module that implements it', solution: 'grep -rn "UserDirectory\\|_Directory" python modules', check: t => t.ran(/\bgrep\b.*(UserDirectory|_Directory)/) },
          { title: 'Create the branch `m2-00-member-names`', solution: 'git switch -c m2-00-member-names', check: t => t.exec('laptop', `cd ${ROOT} && git branch --show-current`, { user: 'dev' }).out.trim() === 'm2-00-member-names' },
          { title: 'Write `~/plan.md`: the files you will change (route, schema, port, auth implementation), the one-query rule, and the tests you will add', solution: 'printf "%s\\n" "Plan for task 00" "1. python/foundation-core/.../ports.py: add get_many(session, ids) to UserDirectory" "2. modules/auth/.../__init__.py: implement get_many with ONE query (WHERE id IN ...), no N+1" "3. modules/organizations/.../schemas.py: add name and email to MemberOut" "4. modules/organizations/.../router.py: list_members fills name/email via user_directory(app).get_many" "Tests: names returned; other tenant members never appear; query count does not grow with members. Then make sdk and make check, draft PR." > ~/plan.md', check: t => { const s = (t.file('laptop', '/home/dev/plan.md') || '').toLowerCase(); return /router/.test(s) && /memberout|schemas/.test(s) && /(userdirectory|ports)/.test(s) && /auth/.test(s) && /(one query|n\+1|in \()/.test(s) && /test/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why may organizations not simply import auth\'s UserRepository?', choices: ['It would be slower', 'Rule 1: modules never import each other (CI fails); it would couple organizations to auth\'s internals', 'Python can\'t do it', 'It would be fine'], answer: 1, explain: 'Extend the port instead.' },
        { type: 'mc', q: 'Why get_many with one query instead of calling get() per member?', choices: ['Style', 'get() in a loop is N+1 queries: 5,000 members = 5,000 queries', 'get() is deprecated', 'No reason'], answer: 1, explain: 'Correctness and scale, from the first PR.' },
        { type: 'mc', q: 'Writing a plan before coding is worth it because:', choices: ['It isn\'t', 'A 5-minute review of a plan catches wrong directions before hours of code', 'Managers like documents', 'It replaces tests'], answer: 1, explain: 'Spec first, as the AI realm will show again.' },
        { type: 'mc', q: 'Your plan touches foundation_core (the UserDirectory port). What does the intern guide say?', choices: ['Go ahead', 'Ask the maintainer before changing foundation_core: every module depends on it', 'Avoid it by importing auth', 'Copy the port'], answer: 1, explain: 'Small, agreed core changes; never cross-module imports.' },
        { type: 'mc', q: 'Which test proves the member list is safe in a multi-tenant system?', choices: ['A test that names are returned', 'A test with two tenants showing members of the other tenant never appear', 'A load test', 'A UI test'], answer: 1, explain: 'Every data feature gets a cross-tenant test.' },
      ],
    },
  ],
};
