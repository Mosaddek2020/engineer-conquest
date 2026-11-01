// Realm 8 · SaaS & Multi-tenancy: the SaaS model, tenancy models and tenant resolution, row-level security,
// identity and roles, and the modular monolith.

const BASE = 'foundation.example.com';
const IP = '203.0.113.50';
const TENANTS = {
  acme: { id: '4f1c0a2e', name: 'Acme Bakery', brand: { '--color-primary': '#7a1f3d' }, users: ['rina@acme.example'], token: 'acme_tok_1' },
  globex: { id: '9b7d33c1', name: 'Globex Ltd', brand: { '--color-primary': '#1d4ed8' }, users: ['karim@globex.example'], token: 'globex_tok_1' },
};
const HOST_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*(:[0-9]{1,5})?$/;

// A miniature SaaS-Foundation edge: tenant from the (validated) Host, tokens bound to their tenant,
// X-Tenant-Host only from a trusted proxy (none here).
export function foundationEdge(H) {
  H.uni.dns.set(`acme.${BASE}`, IP);
  H.uni.dns.set(`globex.${BASE}`, IP);
  H.uni.dns.set(`ops.${BASE}`, IP);
  const st = H.uni.edge = { seen: [] };
  const j = (status, obj) => ({ status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj, null, 2) + '\n' });
  H.uni.httpHooks.push(({ url, headers }) => {
    if (url.host !== IP && !url.host.endsWith(`.${BASE}`)) return null;
    const hdrs = Object.fromEntries(Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const rawHost = (hdrs.host || url.host).toLowerCase();
    st.seen.push({ path: url.path, host: rawHost, xth: hdrs['x-tenant-host'] || null, auth: hdrs.authorization || null });
    if (!HOST_RE.test(rawHost)) return j(400, { code: 'invalid_host', message: 'The Host header is not a valid hostname' });
    const slug = rawHost.split(':')[0].endsWith(`.${BASE}`) ? rawHost.split(':')[0].slice(0, -(BASE.length + 1)) : null;
    const tenant = slug && TENANTS[slug];
    if (!tenant) return j(404, { code: 'unknown_tenant', message: 'No tenant is configured for this host' });
    if (url.path === '/v1/tenants/current') return j(200, { id: tenant.id, slug, name: tenant.name, brand: tenant.brand });
    if (url.path === '/v1/auth/me') {
      const tok = (hdrs.authorization || '').replace(/^Bearer\s+/i, '');
      const owner = Object.entries(TENANTS).find(([, t]) => t.token === tok);
      if (!owner || owner[0] !== slug) return j(401, { code: 'unauthorized', message: 'Sign in to continue' });
      return j(200, { email: tenant.users[0], tenant: slug });
    }
    return j(404, { code: 'not_found', message: 'No such endpoint' });
  });
}

export default {
  id: 'saas',
  n: 8,
  title: 'SaaS & Multi-tenancy',
  tagline: 'One platform, many companies: tenants, isolation in the database, identity and modular design',
  badge: 'Tenant Guardian',
  intro: 'SaaS-Foundation runs many client companies (**tenants**) on one shared deployment. That design is cheap and fast to operate, and it puts one promise above all others: **a tenant must never see another tenant\'s data**. Learn the SaaS model, how a request is matched to its tenant, how **PostgreSQL row-level security** enforces isolation even when code is wrong, the identities and roles of a SaaS platform, and the **modular monolith** design that keeps it changeable.',
  lessons: [
    {
      id: 'what-is-saas',
      title: 'What SaaS is',
      summary: 'Software as a service, tenants, plans and entitlements, white-labelling and branding, and the three kinds of people in the system.',
      minutes: 15,
      quiz: [
        { type: 'mc', q: 'Software as a service (SaaS) means:', choices: ['Software sold on a USB stick', 'Software run by the provider and used over the internet, usually by subscription; the provider operates, upgrades and secures it for every customer', 'Free software', 'Software that only runs offline'], answer: 1, explain: 'Customers rent the outcome; the provider runs the machines.' },
        { type: 'mc', q: 'In SaaS-Foundation, a tenant is:', choices: ['A server', 'One client company (e.g. Acme Bakery) with its own users, data, settings and brand, sharing the platform with other tenants', 'A database table', 'A developer'], answer: 1, explain: 'Many tenants, one deployment.' },
        { type: 'mc', q: 'What is an entitlement?', choices: ['A legal contract', 'A feature or limit on a tenant\'s plan (e.g. custom_domain on, files limit 5 GB) that code checks with require_feature()', 'A user role', 'An API key'], answer: 1, explain: 'Billing writes entitlements; every module reads them.' },
        { type: 'multi', q: 'The three kinds of people in SaaS-Foundation:', choices: ['Operators: platform staff (us), separate accounts, mandatory MFA', 'Tenant admins: a tenant\'s owners and admins, managing that tenant', 'Users: a tenant\'s customers and staff, who belong to exactly one tenant', 'Superusers who can see every tenant without logs'], answer: [0, 1, 2], explain: 'Even operators act on a tenant only through audited, tenant-scoped paths.' },
        { type: 'mc', q: 'White-labelling means:', choices: ['Removing colour', 'Each tenant\'s users see the tenant\'s brand (name, colours, domain) rather than the platform\'s', 'Using white backgrounds', 'Hiding the code'], answer: 1, explain: 'SaaS-Foundation\'s design tokens make brands a data change, not a code change.' },
        { type: 'tf', q: 'In SaaS-Foundation, the same email address at two tenants is two separate user accounts.', answer: true, explain: 'Accounts are per tenant: never look a user up across tenants.' },
      ],
    },
    {
      id: 'tenancy-models',
      title: 'Tenancy models and tenant resolution',
      summary: 'Silo, pool and bridge models; resolving the tenant from the host name; custom domains; why the Host header is security-critical; noisy neighbours.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) { foundationEdge(H); },
        suggestions: [`curl -s https://acme.${BASE}/v1/tenants/current`],
        tasks: [
          { title: `Ask the platform which tenant this host is: \`curl -s https://acme.${BASE}/v1/tenants/current\``, solution: `curl -s https://acme.${BASE}/v1/tenants/current`, check: t => (t.uni.edge?.seen || []).some(s => s.path === '/v1/tenants/current' && s.host.startsWith('acme.')) },
          { title: `Same for \`globex.${BASE}\`. Then compare both names with \`dig +short\`: same address?`, solution: `curl -s https://globex.${BASE}/v1/tenants/current; dig +short acme.${BASE} globex.${BASE}`, check: t => (t.uni.edge?.seen || []).some(s => s.host.startsWith('globex.')) && t.ran(/\bdig\b.*foundation\.example\.com/) },
          { title: `Prove the Host header decides: call the IP directly with \`-H "Host: globex.${BASE}"\``, solution: `curl -s -H "Host: globex.${BASE}" https://${IP}/v1/tenants/current`, check: t => (t.uni.edge?.seen || []).some(s => s.host.startsWith('globex.') && t.events('http').some(e => e.url.includes(IP))) },
          { title: `A host that isn't a tenant: \`curl -i https://nobody.${BASE}/v1/tenants/current\``, solution: `curl -i https://nobody.${BASE}/v1/tenants/current`, check: t => t.events('http').some(e => /nobody\./.test(e.url) && e.status === 404) },
          { title: `The 2026 security fix: a malformed Host (\`-H "Host: acme.${BASE}:@evil.example.com"\`) must get 400, so it can never reach an emailed link`, solution: `curl -i -H "Host: acme.${BASE}:@evil.example.com" https://${IP}/v1/tenants/current`, check: t => (t.uni.edge?.seen || []).some(s => /@evil/.test(s.host)) && t.events('http').some(e => e.status === 400) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'The "pool" model (SaaS-Foundation\'s choice) means:', choices: ['A separate database and servers per tenant', 'Tenants share the same application and database; every row carries a tenant_id and isolation is enforced', 'A swimming pool', 'Each tenant runs its own code version'], answer: 1, explain: 'Cheapest to run and upgrade; isolation must be bulletproof. A silo (dedicated) option can come later for clients who need it.' },
        { type: 'mc', q: 'How does SaaS-Foundation know which tenant a request is for?', choices: ['A tenant id in the request body', 'From the host name: a verified custom domain, or <slug>.<base_domain>', 'From the user\'s IP', 'It asks the user'], answer: 1, explain: 'Resolved once in TenantMiddleware, before any route runs.' },
        { type: 'mc', q: 'Why may X-Tenant-Host only be trusted from configured proxies?', choices: ['It is slow', 'Otherwise any client could choose any tenant by sending the header', 'Browsers don\'t send it', 'It is deprecated'], answer: 1, explain: 'The app even refuses to start with trust_tenant_header but no trusted_proxies.' },
        { type: 'multi', q: 'Custom domains (shop.client.com) need:', choices: ['Proof the tenant controls the domain (DNS verification)', 'Re-verification, so a dangling DNS record can\'t be taken over', 'TLS certificates for that name', 'Accepting any domain someone types in'], answer: [0, 1, 2], explain: 'Unverified domains never resolve to a tenant.' },
        { type: 'mc', q: 'A "noisy neighbour" is:', choices: ['A loud office', 'One tenant using so much capacity that others slow down', 'A security breach', 'A DNS problem'], answer: 1, explain: 'Rate limits, quotas per plan and query limits protect neighbours.' },
      ],
    },
    {
      id: 'row-level-security',
      title: 'Isolation in the database: row-level security',
      summary: 'How PostgreSQL RLS policies work, the tenant setting per transaction, FORCE and fail-closed, why the app\'s role can\'t bypass it, and the tests that prove it.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'Row-level security (RLS) makes PostgreSQL:', choices: ['Encrypt rows', 'Filter every query on a table through a policy (here: tenant_id must equal the current tenant), whatever SQL the app sends', 'Faster', 'Store rows on different disks'], answer: 1, explain: 'A forgotten WHERE can\'t leak another tenant\'s rows.' },
        { type: 'predict', q: 'With RLS on `notes` and the session\'s tenant set to Acme, what does this return?', code: 'SELECT count(*) FROM notes;   -- no WHERE clause at all\n-- the table holds 40 Acme notes and 70 Globex notes', choices: ['110', '40', '70', 'An error'], answer: 1, explain: 'The policy adds the tenant filter for you.' },
        { type: 'mc', q: 'SaaS-Foundation\'s policy uses `NULLIF(current_setting(\'app.tenant_id\', true), \'\')::uuid`. If no tenant was set:', choices: ['All rows are visible', 'The value is NULL, so no rows match: the query sees nothing (fail closed)', 'It crashes the server', 'It picks the first tenant'], answer: 1, explain: 'Forgetting to set the tenant shows empty results, never other tenants\' data.' },
        { type: 'mc', q: 'Why must the app connect as a role that is NOT superuser and NOT BYPASSRLS?', choices: ['For speed', 'Superusers and BYPASSRLS roles skip every policy, silently disabling isolation; the app refuses to start with such a role', 'Licensing', 'It doesn\'t matter'], answer: 1, explain: 'Migrations use a separate owner role.' },
        { type: 'mc', q: 'What does `FORCE ROW LEVEL SECURITY` add?', choices: ['Nothing', 'The policy applies to the table\'s owner too', 'It deletes rows', 'It speeds up queries'], answer: 1, explain: 'No role gets an accidental exemption.' },
        { type: 'multi', q: 'Which tests protect isolation in SaaS-Foundation?', choices: ['Every TenantScoped table must have RLS enabled and forced with a tenant_isolation policy', 'The startup guard rejects a superuser connection', 'Cross-tenant tests through the real HTTP routes', 'A manual check once a year'], answer: [0, 1, 2], explain: 'Automated, on a real Postgres, in every CI run.' },
        { type: 'mc', q: 'Housekeeping jobs must clean expired rows in every tenant. How, without a role that bypasses RLS?', choices: ['Use the superuser', 'Visit each tenant through its own scoped session (for_each_tenant)', 'Disable RLS at night', 'Skip it'], answer: 1, explain: 'Even maintenance obeys isolation.' },
      ],
    },
    {
      id: 'identity-roles',
      title: 'Identity, roles and permissions in a SaaS',
      summary: 'Operators, tenant admins, organization roles; permissions declared in manifests; claims and invites; MFA policy and step-up; operator transparency.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'How does a new tenant get its FIRST owner?', choices: ['Anyone can register as owner', 'An operator issues a single-use, expiring claim token; the first admin signs up, verifies their email and redeems it', 'The database creates one', 'Owners are imported from Google'], answer: 1, explain: 'Never create admins from a public endpoint.' },
        { type: 'mc', q: 'Permissions in SaaS-Foundation look like:', choices: ['"admin"', '"<module>.<verb>", e.g. organizations.invite, declared in the module\'s manifest and granted to roles there', 'Numbers', 'Free text'], answer: 1, explain: 'Routes check permissions with require("organizations.invite"), never role names.' },
        { type: 'multi', q: 'Which are true about invites?', choices: ['Bound to the invited email: only a signed-in user whose VERIFIED email matches can accept', 'Single-use and expiring', 'A forwarded link works for anyone', 'Owners can\'t be created by organization invites'], answer: [0, 1, 3], explain: 'A leaked link is useless to anyone else.' },
        { type: 'mc', q: 'When an operator changes something in a tenant, the tenant:', choices: ['Never finds out', 'Sees it in its own audit log, marked actor_type="operator"', 'Gets a refund', 'Must approve it first'], answer: 1, explain: 'Operator transparency builds trust.' },
        { type: 'mc', q: 'A tenant sets auth.mfa_required = "admins". A user is promoted to admin while signed in. What happens?', choices: ['Nothing until they log out', 'On their next request they get mfa_enrollment_required and can only reach the MFA setup', 'They are deleted', 'The policy is ignored'], answer: 1, explain: 'This was a real bug found in the security review: the policy is now checked on every request.' },
        { type: 'mc', q: 'Who may change a tenant\'s SMTP server or MFA policy?', choices: ['Any admin', 'Only the tenant\'s owners (owner_only settings), with a recent MFA check', 'Any user', 'Nobody'], answer: 1, explain: 'Another review fix: an admin could otherwise route the owner\'s reset email to their own server.' },
      ],
    },
    {
      id: 'modular-monolith',
      title: 'The modular monolith',
      summary: 'One deployable app made of independent modules: manifests, ports, events and the outbox, enforced boundaries, and why not microservices (yet).',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'A modular monolith is:', choices: ['One giant tangled codebase', 'One deployable application split into modules with strict, tool-enforced boundaries', 'Many microservices', 'A database'], answer: 1, explain: 'The simplicity of one deploy, the independence of modules.' },
        { type: 'mc', q: 'In SaaS-Foundation, how does a product choose its features?', choices: ['By editing every module', 'By listing modules in apps/api/main.py: create_app([tenants, auth, organizations, ...])', 'With environment variables only', 'At runtime by users'], answer: 1, explain: '"A product is a list of modules."' },
        { type: 'multi', q: 'A module manifest (define_module) declares:', choices: ['Its permissions and which roles get them', 'Its dependencies on other modules (by name)', 'Its migrations, templates and settings', 'Imports of other modules\' code'], answer: [0, 1, 2], explain: 'Modules never import each other: CI\'s import-linter fails if they do.' },
        { type: 'mc', q: 'Modules communicate through:', choices: ['Shared global variables', 'Ports (small interfaces in foundation_core), events (in-process or durable via the outbox), or HTTP', 'Direct imports', 'Email'], answer: 1, explain: 'Each module can be replaced without touching the others.' },
        { type: 'mc', q: 'Why not start with microservices?', choices: ['They are illegal', 'They add network calls, distributed transactions, separate deploys and observability costs; a well-bounded monolith gets most of the benefit and can be split later along the module lines', 'They are slower to write in Python', 'No reason'], answer: 1, explain: 'Clear boundaries first; distribution only when a measured need appears.' },
        { type: 'tf', q: 'foundation_core may import modules like auth or notifications.', answer: false, explain: 'Core knows nothing about any module; modules plug into core\'s ports.' },
      ],
    },
    {
      id: 'saas-boss',
      title: 'Boss: Prove tenant isolation',
      summary: 'Before a big client signs, test isolation from the outside: hosts, tokens and headers. Then write the evidence a client\'s security questionnaire asks for.',
      minutes: 20,
      boss: true,
      lab: {
        cwd: '~',
        panels: ['network', 'files'],
        setup(H) {
          foundationEdge(H);
          H.write('laptop', '~/acme-token.txt', TENANTS.acme.token + '\n', { owner: 'dev', mode: 0o600 });
          H.write('laptop', '~/isolation.md', '# Tenant isolation evidence\n\n', { owner: 'dev' });
        },
        suggestions: [`curl -s -H "Authorization: Bearer $(cat ~/acme-token.txt)" https://acme.${BASE}/v1/auth/me`],
        tasks: [
          { title: 'With Acme\'s token, call `/v1/auth/me` on Acme\'s host: 200', solution: `curl -s -H "Authorization: Bearer $(cat ~/acme-token.txt)" https://acme.${BASE}/v1/auth/me`, check: t => t.events('http').some(e => /acme\./.test(e.url) && /\/v1\/auth\/me/.test(e.url) && e.status === 200) },
          { title: 'The same token on Globex\'s host. It must fail', solution: `curl -i -H "Authorization: Bearer $(cat ~/acme-token.txt)" https://globex.${BASE}/v1/auth/me`, check: t => t.events('http').some(e => /globex\./.test(e.url) && /\/v1\/auth\/me/.test(e.url) && e.status === 401) },
          { title: 'Try to pick Globex with `X-Tenant-Host: globex.foundation.example.com` while calling Acme\'s host (you are not a trusted proxy)', solution: `curl -i -H "X-Tenant-Host: globex.${BASE}" -H "Authorization: Bearer $(cat ~/acme-token.txt)" https://acme.${BASE}/v1/auth/me`, check: t => (t.uni.edge?.seen || []).some(s => s.xth && /globex/.test(s.xth)) },
          { title: 'Write `~/isolation.md`: for each test, what you sent and what came back, plus one sentence on the database layer (RLS) that protects even if the application had a bug', solution: 'printf "%s\\n" "1. Acme token on acme host /v1/auth/me: 200 (own tenant)" "2. Acme token on globex host: 401 - tokens are bound to their tenant" "3. X-Tenant-Host: globex from an untrusted client: ignored, still Acme" "Database layer: PostgreSQL row-level security filters every query to the current tenant and fails closed, so even a missing WHERE in code cannot return another tenant rows." >> ~/isolation.md', check: t => { const s = (t.file('laptop', '/home/dev/isolation.md') || '').toLowerCase(); return /200/.test(s) && /401/.test(s) && /x-tenant-host/.test(s) && /(rls|row-level|row level)/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why test isolation from the outside when RLS exists?', choices: ['RLS doesn\'t work', 'Defence in depth: application checks (tokens bound to tenants, host validation) and the database layer should each hold on their own; tests prove both', 'Clients like curl', 'To slow things down'], answer: 1, explain: 'Every layer is tested to fail closed.' },
        { type: 'multi', q: 'Good evidence for a client\'s security questionnaire:', choices: ['Concrete tests with requests and responses', 'The automated tests that run in CI on every change', 'The architecture decision (RLS, fail closed)', '"Trust us"'], answer: [0, 1, 2], explain: 'Show, don\'t tell.' },
        { type: 'tf', q: 'If one tenant\'s token works on another tenant\'s host, that is a critical security bug.', answer: true, explain: 'It breaks the platform\'s core promise.' },
        { type: 'mc', q: 'X-Tenant-Host sent by an ordinary client was ignored. Which setting would make it honoured, and why is that only safe in one situation?', choices: ['Any setting; always safe', 'FOUNDATION_TRUST_TENANT_HEADER with the proxy listed in FOUNDATION_TRUSTED_PROXIES: only safe when the API is reachable solely through that proxy', 'CORS', 'A cookie'], answer: 1, explain: 'Otherwise anyone could choose a tenant.' },
        { type: 'mc', q: 'A questionnaire asks how you prevent cross-tenant access. The strongest answer includes:', choices: ['Adjectives', 'The layers (host validation, tenant-bound tokens, permissions, RLS failing closed) AND the automated tests that verify each on every change', 'A promise', 'The number of engineers'], answer: 1, explain: 'Evidence beats assurances.' },
      ],
    },
  ],
};
