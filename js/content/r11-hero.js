// Realm 11 · Hero Trials: capstones that combine every realm: an incident, a full code review, and the final exam.

const commit = (H, dir, msg, who = 'Rumana Akter') => H.run(`cd ${dir} && git add -A && git -c user.name="${who}" -c user.email=dev@example.com commit -qm "${msg}"`, { on: 'laptop', user: 'dev' });
const ENV_PATH = '/home/dev/deploy/api.env';
const trusted = H => /^FOUNDATION_TRUSTED_PROXIES=\[\s*"10\.0\.0\.(0\/8|0\/24|2(\/32)?)"\s*\]\s*$/m.test(H.uni.host('laptop').files.get(ENV_PATH) || '');

const ACCESS_LOG = Array.from({ length: 12 }, (_, i) => `{"ts":"16:${String(40 + i).padStart(2, '0')}:0${i % 10}","level":"info","logger":"foundation.access","method":"POST","path":"/v1/auth/login","status":${i > 4 ? 429 : 200},"client_ip":"10.0.0.2","request_id":"r${100 + i}"}`).join('\n') + '\n';

// the PR under review: several problems from different realms in one diff
const ROUTER_BASE = `@router.get("/v1/reports/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: uuid.UUID,
    principal: Principal = Depends(require("reports.read")),
    session: AsyncSession = Depends(get_session),
) -> ReportOut:
    report = await ReportRepository(session).get(report_id)
    if report is None or report.owner_id != principal.user_id:
        raise NotFound("No such report")
    return ReportOut.model_validate(report, from_attributes=True)
`;
const ROUTER_PR = `EXPORT_API_KEY = "sk_live_" + "4Qb9ExampleOnly7Tr"


@router.get("/v1/reports/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: uuid.UUID,
    principal: Principal = Depends(require("reports.read")),
    session: AsyncSession = Depends(get_session),
) -> ReportOut:
    report = await ReportRepository(session).get(report_id)
    if report is None:
        raise NotFound("No such report")
    return ReportOut.model_validate(report, from_attributes=True)


@router.get("/v1/reports/search")
async def search_reports(q: str, session: AsyncSession = Depends(get_session)):
    rows = await session.execute(text(f"SELECT * FROM reports WHERE title ILIKE '%{q}%'"))
    return [dict(r._mapping) for r in rows]
`;
const TEST_BASE = `async def test_owner_reads_report(client, owner): ...
async def test_other_user_gets_404(client, owner, other_user): ...
`;
const TEST_PR = `async def test_owner_reads_report(client, owner): ...
`;

export default {
  id: 'hero',
  n: 11,
  title: 'Hero Trials',
  tagline: 'Capstones: an incident, a full code review, and the final exam',
  badge: 'Engineer Hero',
  intro: 'The final trials combine everything: **HTTP and logs, security and tenancy, git, code review, and AI-era judgement**. Pass them and you are ready for your first SaaS-Foundation task card. Next stops: Git Conquest and DevOps Conquest for deeper dives.',
  lessons: [
    {
      id: 'hero-incident',
      title: 'Trial: The Friday incident',
      summary: 'Every user of a tenant is suddenly rate-limited. Use status codes, headers, logs and the configuration to find a cause that crosses HTTP, networking and security, fix it, and write the postmortem.',
      minutes: 30,
      boss: true,
      lab: {
        cwd: '~/deploy',
        panels: ['network', 'files'],
        setup(H) {
          H.write('laptop', '~/deploy/api.env', 'FOUNDATION_PUBLIC_SCHEME=https\nFOUNDATION_TRUST_TENANT_HEADER=false\nFOUNDATION_TRUSTED_PROXIES=[]\nFOUNDATION_RATE_LIMIT_IP_PER_MINUTE=600\n', { owner: 'dev' });
          H.write('laptop', '~/deploy/CHANGELOG.md', '# Infra changes\n\n- Fri 15:30: put the new edge proxy (10.0.0.2) in front of the API. All traffic now comes through it.\n', { owner: 'dev' });
          H.write('laptop', '~/deploy/logs/access.log', ACCESS_LOG, { owner: 'dev' });
          H.write('laptop', '~/deploy/README.md', '# Deploy notes\n\nThe API reads api.env at start. After editing it, restart with ./restart.sh\n', { owner: 'dev' });
          H.write('laptop', '~/deploy/restart.sh', '#!/bin/bash\necho "api restarted with $(grep -c . api.env) settings"\n', { owner: 'dev', mode: 0o755 });
          H.site('acme.foundation.example.com', {
            '/v1/auth/login': () => (trusted(H)
              ? { status: 200, body: '{"token":"…","expires_at":"…"}\n' }
              : { status: 429, headers: { 'retry-after': '41', 'content-type': 'application/json' }, body: '{"code":"rate_limited","message":"Too many requests. Slow down.","request_id":"r117"}\n' }),
          });
        },
        suggestions: ['curl -i -X POST https://acme.foundation.example.com/v1/auth/login'],
        tasks: [
          { title: 'Reproduce what Acme\'s users see: `curl -i -X POST https://acme.foundation.example.com/v1/auth/login`. Status, header, code?', solution: 'curl -i -X POST https://acme.foundation.example.com/v1/auth/login', check: t => t.events('http').some(e => /login/.test(e.url) && e.status === 429) },
          { title: 'Read the access log. Whose IP does every request appear to come from?', solution: 'cat logs/access.log | jq -r .client_ip | sort | uniq -c', check: t => t.ran(/access\.log/) },
          { title: 'What changed? Read `CHANGELOG.md` and `api.env`', solution: 'cat CHANGELOG.md api.env', check: t => t.ran(/\bcat\b.*CHANGELOG/) && t.ran(/\b(cat|grep)\b.*api\.env/) },
          { title: 'Fix the configuration so the app trusts the proxy and sees real client IPs: `FOUNDATION_TRUSTED_PROXIES=["10.0.0.2"]` (JSON list), then `./restart.sh`', hint: 'Behind a proxy that the app doesn\'t trust, every user shares the proxy\'s IP, so they all share one rate-limit bucket.', solution: `sed -i 's/^FOUNDATION_TRUSTED_PROXIES=.*/FOUNDATION_TRUSTED_PROXIES=["10.0.0.2"]/' api.env && ./restart.sh`, check: t => /^FOUNDATION_TRUSTED_PROXIES=\[\s*"10\.0\.0\.(0\/8|0\/24|2(\/32)?)"\s*\]\s*$/m.test(t.file('laptop', ENV_PATH) || '') && t.ran(/restart\.sh/) },
          { title: 'Verify: the login answers 200 again', solution: 'curl -i -X POST https://acme.foundation.example.com/v1/auth/login', check: t => t.events('http').some(e => /login/.test(e.url) && e.status === 200) },
          { title: 'Write `~/postmortem.md`: impact, root cause (proxy not in trusted_proxies → all users shared the proxy IP → one rate-limit bucket), fix, and a follow-up to prevent it (e.g. a deploy checklist / alert on 429 rate). Blameless', solution: 'printf "%s\\n" "# Postmortem: Acme logins rate-limited" "Impact: from 16:45 most Acme users got 429 on login." "Root cause: the new edge proxy 10.0.0.2 was not in FOUNDATION_TRUSTED_PROXIES, so the API saw every user as the proxy IP and all shared one per-IP rate-limit bucket." "Fix: FOUNDATION_TRUSTED_PROXIES=[\\"10.0.0.2\\"], restarted; login returns 200." "Follow-up: add trusted proxies to the infra-change checklist and alert when the 429 rate jumps." > ~/postmortem.md', check: t => { const s = (t.file('laptop', '/home/dev/postmortem.md') || '').toLowerCase(); return /trusted/.test(s) && /proxy/.test(s) && /(rate|429)/.test(s) && /(follow|prevent|checklist|alert)/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why did one infrastructure change rate-limit almost every user?', choices: ['The proxy was slow', 'The API did not trust the proxy, so it used the proxy\'s IP as every client\'s IP; all users shared one per-IP bucket', 'DNS failed', 'The certificate expired'], answer: 1, explain: 'The same setting also decides whether X-Forwarded-For can be believed.' },
        { type: 'mc', q: 'Why not "fix" it by trusting every proxy (`0.0.0.0/0`)?', choices: ['It would be fine', 'Then any client could fake X-Forwarded-For (and, with the tenant header enabled, choose a tenant): lockouts and limits would be trivial to bypass', 'It is slower', 'JSON does not allow it'], answer: 1, explain: 'Trust exactly your own proxies.' },
        { type: 'multi', q: 'A good postmortem:', choices: ['States impact and timeline', 'Finds the root cause and contributing factors', 'Lists follow-ups that prevent recurrence', 'Names who to blame', 'Is shared so others learn'], answer: [0, 1, 2, 4], explain: 'Blameless: fix the system.' },
        { type: 'mc', q: 'What made this incident hard to spot from the application\'s point of view?', choices: ['Nothing was deployed in the app: the cause was an infrastructure change that altered what the app could see (client IPs)', 'The logs were missing', 'The app crashed', 'DNS failed'], answer: 0, explain: 'Always ask what changed, everywhere.' },
        { type: 'mc', q: 'Which alert would have caught this within minutes?', choices: ['CPU usage', 'A sudden rise in 429 responses (or login failures) per tenant', 'Disk space', 'Certificate expiry'], answer: 1, explain: 'Alert on what users feel.' },
      ],
    },
    {
      id: 'hero-review',
      title: 'Trial: The capstone code review',
      summary: 'One pull request, five problems from five realms. Review it the way SaaS-Foundation\'s maintainers would, and decide whether it can merge.',
      minutes: 30,
      boss: true,
      lab: {
        cwd: '~/reports',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/reports/router.py', ROUTER_BASE, { owner: 'dev' });
          H.write('laptop', '~/reports/test_reports.py', TEST_BASE, { owner: 'dev' });
          H.run('cd ~/reports && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/reports', 'Reports: read your own report');
          H.run('cd ~/reports && git switch -q -c feat/report-search', { on: 'laptop', user: 'dev' });
          H.write('laptop', '~/reports/router.py', ROUTER_PR, { owner: 'dev' });
          H.write('laptop', '~/reports/test_reports.py', TEST_PR, { owner: 'dev' });
          commit(H, '~/reports', 'Add report search (generated with AI, tests pass)', 'Sam Contractor');
          H.run('cd ~/reports && git switch -q main', { on: 'laptop', user: 'dev' });
          H.write('laptop', '~/review.md', '# Review: feat/report-search\n\n', { owner: 'dev' });
        },
        suggestions: ['git diff main feat/report-search'],
        tasks: [
          { title: 'Read the whole change: `git diff main feat/report-search`', solution: 'git diff main feat/report-search', check: t => t.ran(/git\s+diff\b.*report-search/) },
          { title: 'Write `~/review.md` with every blocking problem you find, each with why it matters and a fix, and a verdict (approve or request changes). There are five', hint: 'Look for: a secret; a removed ownership check (IDOR); SQL built with an f-string; a search with no permission check and no limit; and a deleted test.', solution: 'printf "%s\\n" "1. blocking: EXPORT_API_KEY hard-codes a live key: move to the vault/env and rotate it" "2. blocking: get_report no longer checks report.owner_id: any user can read any report (IDOR / broken access control); restore the check" "3. blocking: search builds SQL with an f-string: SQL injection; use a parameter (title ILIKE :q)" "4. blocking: /search has no require(...) permission and no limit: anyone can dump all reports; add require(\\"reports.read\\") and a limit" "5. blocking: test_other_user_gets_404 was deleted: that test protected the access rule; restore it and add a search test" "Verdict: request changes." >> ~/review.md', check: t => { const s = (t.file('laptop', '/home/dev/review.md') || '').toLowerCase(); const hits = [/(key|secret|sk_live)/, /(owner|idor|access control|other user)/, /(injection|f-string|parameter)/, /(limit|permission|require)/, /(test.*(deleted|removed|missing)|(deleted|removed|missing).*test)/].filter(re => re.test(s)).length; return hits >= 5 && /request(ed)? changes|not approve|do not merge|reject/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: '"Tests pass" was in the commit message. Why doesn\'t it reassure you here?', choices: ['Tests never matter', 'The PR deleted the test that protected the rule it broke', 'The tests are in Python', 'CI was down'], answer: 1, explain: 'Always check whether tests changed.' },
        { type: 'mc', q: 'Which single issue is most urgent after merge would have happened?', choices: ['Missing limit', 'The leaked live key (and the IDOR): both expose data or money immediately; rotate the key first', 'Naming', 'Formatting'], answer: 1, explain: 'Secrets get rotated before anything else.' },
        { type: 'tf', q: 'A route without require(...) in SaaS-Foundation is reachable by any signed-in user of the tenant (or anyone, if it does not authenticate at all).', answer: true, explain: 'Every route declares who may call it.' },
        { type: 'mc', q: 'The PR says it was generated with AI. How does that change your review?', choices: ['Skip it: AI is reliable', 'Same gates as any code, with extra suspicion for security-sensitive parts and for removed tests', 'Reject automatically', 'Only check formatting'], answer: 1, explain: 'Who wrote it changes nothing about what ships.' },
        { type: 'mc', q: 'How should the search endpoint find titles safely?', choices: ['f-string SQL with escaping', 'A parameterised query (or the ORM) with the user input bound as a value, plus require("reports.read") and a limit', 'Client-side filtering of all reports', 'A stored procedure built from strings'], answer: 1, explain: 'Data stays data.' },
      ],
    },
    {
      id: 'hero-final',
      title: 'Trial: The final exam',
      summary: 'Fifteen questions across every realm. Pass it and you\'re ready for your first SaaS-Foundation task card.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'You\'ve been stuck for 30 minutes. Best move?', choices: ['Keep going silently', 'Write what you tried and ask a focused question with the exact error', 'Rewrite the module', 'Go home'], answer: 1, explain: 'Base Camp.' },
        { type: 'mc', q: 'A bug "suddenly" appeared. Fastest way to find the change that caused it, given a test that shows it?', choices: ['Read every commit', 'git bisect run ./test', 'Restart the server', 'Ask in chat'], answer: 1, explain: 'The Craft.' },
        { type: 'mc', q: 'You pushed an API key to a branch. First step?', choices: ['Delete it in a new commit', 'Rotate the key', 'Make the repo private', 'Ignore it'], answer: 1, explain: 'Good Practices.' },
        { type: 'mc', q: 'curl reports "Could not resolve host". Which layer failed?', choices: ['DNS', 'TLS', 'The app', 'The database'], answer: 0, explain: 'How the Web Works.' },
        { type: 'mc', q: 'A POST returns 422. Most likely:', choices: ['Server crashed', 'Input failed validation', 'Not signed in', 'Not allowed'], answer: 1, explain: 'HTTP Deep Dive.' },
        { type: 'mc', q: 'Which cookie attribute stops JavaScript (and so XSS) from reading a session cookie?', choices: ['Secure', 'HttpOnly', 'SameSite', 'Path'], answer: 1, explain: 'HTTP Deep Dive.' },
        { type: 'mc', q: '`curl -k` "fixes" a certificate error by:', choices: ['Renewing it', 'Turning off the check that proves who you\'re talking to', 'Switching to HTTP/2', 'Trusting the CA'], answer: 1, explain: 'HTTPS & Web Security.' },
        { type: 'mc', q: 'Changing /invoices/7 to /invoices/8 shows another customer\'s invoice. That is:', choices: ['XSS', 'IDOR / broken access control', 'CSRF', 'SSRF'], answer: 1, explain: 'HTTPS & Web Security.' },
        { type: 'mc', q: 'Why use <button> instead of <div onclick>?', choices: ['Style', 'Keyboard, focus and screen readers work for free', 'Speed', 'SEO only'], answer: 1, explain: 'Frontend.' },
        { type: 'mc', q: 'Check-then-insert lets duplicates through under concurrency. The reliable fix?', choices: ['A sleep', 'A UNIQUE constraint, with the violation turned into a 409', 'A bigger server', 'Frontend validation'], answer: 1, explain: 'Backend.' },
        { type: 'mc', q: 'How does SaaS-Foundation decide the tenant of a request?', choices: ['A header the client chooses', 'The validated host name (subdomain or verified custom domain)', 'The IP address', 'A cookie'], answer: 1, explain: 'SaaS & Multi-tenancy.' },
        { type: 'mc', q: 'A query forgot its tenant filter. What still prevents a leak?', choices: ['CORS', 'Row-level security, failing closed', 'The CDN', 'Nothing'], answer: 1, explain: 'SaaS & Multi-tenancy.' },
        { type: 'mc', q: 'Module A needs module B\'s functionality. In SaaS-Foundation, A:', choices: ['Imports B', 'Calls a port in foundation_core that B implements', 'Copies B\'s code', 'Reads B\'s tables directly'], answer: 1, explain: 'SaaS-Foundation Walkthrough.' },
        { type: 'mc', q: 'An AI coding agent proposes deleting failing tests to make CI green. You:', choices: ['Approve', 'Deny it, find out why they fail, and make sure your policy denies destructive steps', 'Disable CI', 'Merge'], answer: 1, explain: 'Software Development in the Era of AI.' },
        { type: 'mc', q: 'The strongest check on AI-written (or any) code is:', choices: ['Asking the author if it\'s right', 'Tests from the spec, mutation checks, and an independent review', 'A long commit message', 'Running it once'], answer: 1, explain: 'Software Development in the Era of AI.' },
      ],
    },
  ],
};
