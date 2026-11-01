// Realm 5 · HTTPS & Web Security: TLS and certificates, security headers, authn/authz, the OWASP classics, an audit.
// Everything here is defensive: you test your own systems and fix them.

import { makeCertPem } from '../sim/net.js';

const DAY = 86400;
const PEM = (kind, body) => `-----${kind} ${'PRIVATE'} KEY-----`;  // assembled: no key-shaped literal in the repo
const KEY_PEM = `${PEM('BEGIN')}\nMIIE\n${PEM('END')}\n`;

// one nginx server per site, each with its own certificate story
export function tlsSite(H, name, cert, { extra = '', http = 'root /var/www/site;' } = {}) {
  H.server(name.split('.')[0]);
  const host = name.split('.')[0];
  H.install(host, 'nginx');
  H.dns(name, host);
  H.write(host, `/etc/ssl/site/fullchain.pem`, makeCertPem(cert));
  H.write(host, `/etc/ssl/site/privkey.pem`, KEY_PEM, { mode: 0o600 });
  H.write(host, '/var/www/site/index.html', `<h1>${name}</h1>\n`);
  H.write(host, '/etc/nginx/sites-available/site', `server {\n    listen 80;\n    server_name ${name};\n    ${http}\n}\nserver {\n    listen 443 ssl;\n    server_name ${name};\n    ssl_certificate /etc/ssl/site/fullchain.pem;\n    ssl_certificate_key /etc/ssl/site/privkey.pem;\n    root /var/www/site;\n    index index.html;\n${extra}}\n`);
  H.run('sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/site && sudo rm /etc/nginx/sites-enabled/default && sudo systemctl reload nginx', { on: host });
}

export default {
  id: 'security',
  n: 5,
  title: 'HTTPS & Web Security',
  tagline: 'TLS and certificates, security headers, identity and access, and the classic attacks to defend against',
  badge: 'Security Minded',
  intro: 'A multi-tenant platform holds many companies\' data, so security is part of every engineer\'s job, not a separate team\'s. Learn what **HTTPS** really guarantees and how certificates fail, the **security headers** browsers rely on, the difference between **authentication and authorisation**, and the classic vulnerabilities (**injection, XSS, CSRF, SSRF, broken access control**) from the defender\'s side: how they happen and how SaaS-Foundation prevents them.',
  lessons: [
    {
      id: 'https-tls',
      title: 'HTTP vs HTTPS: TLS and certificates',
      summary: 'What HTTPS protects (and what it doesn\'t), the TLS handshake, certificates and CAs, and the three ways a certificate check fails.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const now = H.uni.time;
          tlsSite(H, 'good.example.com', { cn: 'good.example.com', sans: ['good.example.com'], issuer: "Let's Encrypt R11", notBefore: now - 30 * DAY, notAfter: now + 60 * DAY });
          tlsSite(H, 'old.example.com', { cn: 'old.example.com', sans: ['old.example.com'], issuer: "Let's Encrypt R11", notBefore: now - 95 * DAY, notAfter: now - 3 * DAY });
          tlsSite(H, 'wrong.example.com', { cn: 'www.othershop.example', sans: ['www.othershop.example'], issuer: 'DigiCert Global G2', notBefore: now - 30 * DAY, notAfter: now + 300 * DAY });
          tlsSite(H, 'self.example.com', { cn: 'self.example.com', sans: ['self.example.com'], issuer: 'self.example.com', selfSigned: true, notBefore: now - DAY, notAfter: now + 365 * DAY });
        },
        suggestions: ['curl -I https://good.example.com'],
        tasks: [
          { title: 'A healthy HTTPS site: `curl -I https://good.example.com`', solution: 'curl -I https://good.example.com', check: t => t.events('http').some(e => /good\.example\.com/.test(e.url) && e.status === 200) },
          { title: 'Now `https://old.example.com`. Read curl\'s error: which check failed?', solution: 'curl -I https://old.example.com', check: t => t.events('http').some(e => /old\.example\.com/.test(e.url) && e.error === 'TLS') },
          { title: 'Look at that certificate\'s dates yourself: `openssl s_client -connect old.example.com:443 -servername old.example.com`', solution: 'openssl s_client -connect old.example.com:443 -servername old.example.com', check: t => t.ran(/openssl\s+s_client\b.*old\.example\.com/) },
          { title: 'Try `https://wrong.example.com` and `https://self.example.com`. Two more failure types: which?', solution: 'curl -I https://wrong.example.com; curl -I https://self.example.com', check: t => t.events('http').some(e => /wrong\.example\.com/.test(e.url) && e.error === 'TLS') && t.events('http').some(e => /self\.example\.com/.test(e.url) && e.error === 'TLS') },
          { title: 'Plain HTTP works on every one of them: `curl -I http://old.example.com`. Write in `~/tls.txt` why "just use http" or `curl -k` are not fixes', solution: 'curl -I http://old.example.com; echo "http sends everything (passwords, cookies) readable and changeable by anyone on the network; -k turns off the check that proves who you are talking to, so an attacker could impersonate the site. Fix the certificate instead." > ~/tls.txt', check: t => t.events('http').some(e => /^http:\/\/old\.example\.com/.test(e.url) && e.status === 200) && /(attack|imperson|read|intercept|anyone|eavesdrop)/i.test(t.file('laptop', '/home/dev/tls.txt') || '') },
        ],
      },
      quiz: [
        { type: 'multi', q: 'What does HTTPS (TLS) give you?', choices: ['Confidentiality: others on the network can\'t read the traffic', 'Integrity: they can\'t change it unnoticed', 'Authentication of the server: you are really talking to acme.example.com', 'Protection against bugs in the server\'s code', 'Proof the site is trustworthy or not a scam'], answer: [0, 1, 2], explain: 'HTTPS proves *who* you talk to, not that they are honest or bug-free.' },
        { type: 'multi', q: 'Why would a client reject a certificate?', choices: ['It has expired', 'It was issued for a different hostname', 'It is self-signed or from an unknown CA', 'The site uses port 443'], answer: [0, 1, 2], explain: 'Time, name and trust: the three checks.' },
        { type: 'mc', q: 'What does a certificate authority (CA) do?', choices: ['Hosts websites', 'Verifies that whoever asks for a certificate controls the domain, and signs the certificate; browsers trust a list of CAs', 'Encrypts the database', 'Sells domain names'], answer: 1, explain: 'Let\'s Encrypt does this for free, automatically.' },
        { type: 'mc', q: 'What does `curl -k` do?', choices: ['Fixes certificate errors', 'Skips certificate verification for that request, so an impersonator would go unnoticed', 'Renews certificates', 'Forces HTTP'], answer: 1, explain: 'Fine for a one-off diagnosis; never in code or scripts.' },
        { type: 'order', q: 'Order a simplified TLS handshake.', items: ['Client hello: supported versions and ciphers, and the server name (SNI)', 'Server hello + certificate', 'Client verifies the certificate: trusted issuer, valid dates, matching name', 'Both derive shared session keys', 'Encrypted HTTP traffic flows'], explain: 'After the handshake, everything (headers, cookies, bodies) is encrypted.' },
        { type: 'tf', q: 'With HTTPS, the full URL path and query string are hidden from someone watching the network.', answer: true, explain: 'They see the host name (via DNS and SNI) and timing, not the path, headers or body. Still: don\'t put secrets in URLs, because servers log them.' },
      ],
    },
    {
      id: 'security-headers',
      title: 'Security headers',
      summary: 'HSTS, Content-Security-Policy, X-Frame-Options / frame-ancestors, X-Content-Type-Options, Referrer-Policy, and redirecting HTTP to HTTPS.',
      minutes: 15,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          H.uni.httpHooks.push(({ url }) => (url.host === 'secure.example.com' && url.scheme === 'http' ? { status: 301, headers: { location: `https://secure.example.com${url.path}` }, body: '' } : null));
          H.site('secure.example.com', { '*': { body: '<h1>Secure</h1>', headers: {
            'strict-transport-security': 'max-age=63072000; includeSubDomains',
            'content-security-policy': "default-src 'self'; script-src 'self' 'nonce-r4nd0m' 'strict-dynamic'; frame-ancestors 'none'; object-src 'none'",
            'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'strict-origin-when-cross-origin',
            'set-cookie': '__Host-session=abc; Path=/; HttpOnly; Secure; SameSite=Lax',
          } } });
          H.site('legacy.example.com', { '*': { body: '<h1>Legacy</h1>', headers: { server: 'Apache/2.2.15 (CentOS) PHP/5.3.3', 'x-powered-by': 'PHP/5.3.3', 'set-cookie': 'PHPSESSID=abc; path=/' } } });
        },
        suggestions: ['curl -I https://secure.example.com', 'curl -I https://legacy.example.com'],
        tasks: [
          { title: 'Read the headers of a well-configured site: `curl -I https://secure.example.com`', solution: 'curl -I https://secure.example.com', check: t => t.events('http').some(e => /^https:\/\/secure/.test(e.url)) },
          { title: 'And a legacy one: `curl -I https://legacy.example.com`. What is missing, and what is it giving away that it shouldn\'t?', solution: 'curl -I https://legacy.example.com', check: t => t.events('http').some(e => /legacy\.example\.com/.test(e.url)) },
          { title: 'Check that plain HTTP on the secure site redirects: `curl -I http://secure.example.com/login`', solution: 'curl -I http://secure.example.com/login', check: t => t.events('http').some(e => /^http:\/\/secure/.test(e.url) && e.status === 301) },
          { title: 'Write `~/headers.txt`: list at least 3 headers legacy.example.com should add, and the 2 headers that leak its software versions', solution: 'echo "add: Strict-Transport-Security, Content-Security-Policy, X-Content-Type-Options, X-Frame-Options (or frame-ancestors), Referrer-Policy; cookie needs HttpOnly, Secure, SameSite. leaks: Server and X-Powered-By reveal Apache 2.2.15 / PHP 5.3.3" > ~/headers.txt', check: t => { const s = (t.file('laptop', '/home/dev/headers.txt') || '').toLowerCase(); const adds = ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy'].filter(h => s.includes(h) || (h === 'strict-transport-security' && s.includes('hsts')) || (h === 'content-security-policy' && /\bcsp\b/.test(s))); return adds.length >= 3 && s.includes('x-powered-by') && /\bserver\b/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'What does `Strict-Transport-Security` (HSTS) do?', choices: ['Encrypts cookies', 'Tells the browser to use only HTTPS for this site for a period, even if someone types or links http://', 'Blocks scripts', 'Hides the server version'], answer: 1, explain: 'It closes the "first request over HTTP" gap for returning visitors.' },
        { type: 'mc', q: 'A strict Content-Security-Policy mainly limits the damage of:', choices: ['SQL injection', 'Cross-site scripting (XSS): injected scripts don\'t run unless allowed', 'DNS failures', 'Slow pages'], answer: 1, explain: 'SaaS-Foundation\'s web app uses a per-request nonce CSP; its API uses `default-src \'none\'`.' },
        { type: 'mc', q: '`X-Frame-Options: DENY` / `frame-ancestors \'none\'` protect against:', choices: ['Clickjacking: your page loaded invisibly inside an attacker\'s page', 'Viruses', 'Expired certificates', 'Spam'], answer: 0, explain: 'The user thinks they click the attacker\'s button, but click yours.' },
        { type: 'mc', q: 'Why remove `X-Powered-By: PHP/5.3.3`?', choices: ['It slows the response', 'It tells attackers exactly which outdated, vulnerable software to target', 'Browsers reject it', 'It breaks caching'], answer: 1, explain: 'Don\'t advertise versions. (And upgrade!)' },
        { type: 'tf', q: 'Security headers are a replacement for fixing vulnerabilities in the code.', answer: false, explain: 'They are defence in depth: a second layer when the first one fails.' },
      ],
    },
    {
      id: 'authn-authz',
      title: 'Authentication and authorisation',
      summary: 'Who are you vs what may you do: password storage, MFA, sessions, OAuth and OpenID Connect, roles and least privilege, and tenant isolation.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'Authentication vs authorisation:', choices: ['Same thing', 'Authentication proves who you are; authorisation decides what you may do', 'Authorisation comes first', 'Authentication is only for admins'], answer: 1, explain: 'Login is authN; "can this user delete this invoice?" is authZ.' },
        { type: 'mc', q: 'How should passwords be stored?', choices: ['Plain text, so support can tell users', 'Encrypted with a key', 'Hashed with a slow, salted algorithm designed for passwords (Argon2id, bcrypt)', 'Hashed with MD5'], answer: 2, explain: 'SaaS-Foundation uses Argon2id and rehashes on login when parameters improve.' },
        { type: 'multi', q: 'Which make account takeover much harder?', choices: ['Multi-factor authentication (e.g. TOTP codes)', 'Rate limiting and lockout on login', 'Checking new passwords against breach lists', 'Showing "user not found" vs "wrong password" separately', 'Revoking sessions on password change'], answer: [0, 1, 2, 4], explain: 'Different messages let attackers enumerate accounts: answer identically.' },
        { type: 'mc', q: '"Sign in with Google" for login is usually:', choices: ['OAuth only', 'OpenID Connect (OIDC): OAuth plus an ID token that says who the user is', 'SAML only', 'A password manager'], answer: 1, explain: 'And it needs state, nonce and PKCE done right (SaaS-Foundation\'s OAuth lesson in the code tour).' },
        { type: 'mc', q: 'The principle of least privilege means:', choices: ['Give everyone admin to save time', 'Every user, service and key gets only the permissions it needs, for only as long as it needs them', 'Remove all permissions', 'Only the CEO has access'], answer: 1, explain: 'Applies to API keys, database roles, AI agents and people.' },
        { type: 'mc', q: 'In a multi-tenant app, the most important authorisation question is often:', choices: ['Is the user an admin?', 'Does this record belong to the tenant (and user) making the request?', 'Is the request fast?', 'Is the user on mobile?'], answer: 1, explain: 'SaaS-Foundation answers it in the database itself, with row-level security.' },
        { type: 'mc', q: 'What is "step-up" authentication?', choices: ['Logging in twice', 'Asking for a fresh second factor before a sensitive action (changing secrets, granting admin)', 'A faster login', 'A UI animation'], answer: 1, explain: 'A stolen session alone can\'t do the most dangerous things.' },
      ],
    },
    {
      id: 'owasp',
      title: 'The classic vulnerabilities (OWASP)',
      summary: 'Broken access control, injection, XSS, CSRF, SSRF, misconfiguration and vulnerable dependencies: how each happens and the standard defence.',
      minutes: 25,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const INV = { 7: { id: 7, owner: 'you', customer: 'Acme Bakery', total_bdt: 12500 }, 8: { id: 8, owner: 'someone-else', customer: 'Globex Ltd', total_bdt: 98000 } };
          const me = 'Bearer ' + 'tk_' + 'you_1';
          H.write('laptop', '~/token.txt', 'tk_' + 'you_1\n', { owner: 'dev', mode: 0o600 });
          H.site('billing.example.com', {
            '*': req => {
              let m = req.path.match(/^\/v1\/invoices\/(\d+)$/);
              if (m) return req.headers.authorization === me ? (INV[m[1]] ? { body: JSON.stringify(INV[m[1]]) + '\n' } : { status: 404, body: '{"code":"not_found"}\n' }) : { status: 401, body: '{"code":"unauthorized"}\n' };
              m = req.path.match(/^\/v2\/invoices\/(\d+)$/);
              if (m) { if (req.headers.authorization !== me) return { status: 401, body: '{"code":"unauthorized"}\n' }; const inv = INV[m[1]]; return inv && inv.owner === 'you' ? { body: JSON.stringify(inv) + '\n' } : { status: 404, body: '{"code":"not_found"}\n' }; }
              return { status: 404, body: '{"code":"not_found"}\n' };
            },
          });
        },
        suggestions: ['curl -s -H "Authorization: Bearer $(cat ~/token.txt)" https://billing.example.com/v1/invoices/7'],
        tasks: [
          { title: 'Your app\'s billing API. Read YOUR invoice 7 with your token from `~/token.txt`', solution: 'curl -s -H "Authorization: Bearer $(cat ~/token.txt)" https://billing.example.com/v1/invoices/7', check: t => t.events('http').some(e => /\/v1\/invoices\/7$/.test(e.url) && e.status === 200) },
          { title: 'Security-test your own API: change the id to 8. What comes back, and whose data is it?', solution: 'curl -s -H "Authorization: Bearer $(cat ~/token.txt)" https://billing.example.com/v1/invoices/8', check: t => t.events('http').some(e => /\/v1\/invoices\/8$/.test(e.url) && e.status === 200) },
          { title: 'The fixed version is deployed at `/v2`. Check that `/v2/invoices/7` still works and `/v2/invoices/8` now answers 404', solution: 'curl -i -H "Authorization: Bearer $(cat ~/token.txt)" https://billing.example.com/v2/invoices/7; curl -i -H "Authorization: Bearer $(cat ~/token.txt)" https://billing.example.com/v2/invoices/8', check: t => t.events('http').some(e => /\/v2\/invoices\/7$/.test(e.url) && e.status === 200) && t.events('http').some(e => /\/v2\/invoices\/8$/.test(e.url) && e.status === 404) },
          { title: 'Write `~/idor.txt`: the name of this bug class and why v2 answers 404 rather than 403', solution: 'echo "IDOR / broken access control: v1 checked that I was signed in but not that the invoice was mine. v2 returns 404 so it does not even confirm that invoice 8 exists." > ~/idor.txt', check: t => { const s = t.file('laptop', '/home/dev/idor.txt') || ''; return /(idor|access control|insecure direct object)/i.test(s) && /(exist|reveal|confirm|leak)/i.test(s); } },
        ],
      },
      quiz: [
        { type: 'predict', q: 'What is wrong with this code?', code: 'cursor.execute(\n  "SELECT * FROM users WHERE email = \'" + email + "\'"\n)', choices: ['Nothing', 'SQL injection: input becomes part of the SQL. Use parameters: execute("... WHERE email = %s", (email,))', 'It is too slow', 'It needs an index'], answer: 1, explain: 'An email like `x\' OR \'1\'=\'1` changes the query. ORMs and parameters keep data as data.' },
        { type: 'mc', q: 'Cross-site scripting (XSS) happens when:', choices: ['Two sites share a database', 'Untrusted input is put into a page as HTML/JS without escaping, so it runs in other users\' browsers', 'A cookie expires', 'CSS is invalid'], answer: 1, explain: 'Defences: escape by default (React does), a strict CSP, httpOnly cookies.' },
        { type: 'mc', q: 'CSRF (cross-site request forgery) tricks:', choices: ['The server into calling internal URLs', 'A signed-in user\'s browser into sending a state-changing request from another site, with the user\'s cookies', 'DNS into resolving wrong names', 'Users into typing passwords'], answer: 1, explain: 'SameSite cookies, Origin checks and non-GET state changes defend against it.' },
        { type: 'mc', q: 'SSRF (server-side request forgery): a feature fetches a user-supplied URL. The risk is:', choices: ['Slow downloads', 'An attacker makes YOUR server request internal addresses (cloud metadata, admin panels, databases)', 'Spam', 'Bad caching'], answer: 1, explain: 'SaaS-Foundation refuses non-public IPs for tenant SMTP hosts, and pins the vetted IP to stop DNS rebinding.' },
        { type: 'multi', q: 'Broken access control examples:', choices: ['Changing /invoices/7 to /invoices/8 shows someone else\'s invoice', 'A normal user can call an admin endpoint', 'A user of tenant A sees tenant B\'s data', 'A login page uses HTTPS'], answer: [0, 1, 2], explain: 'It is #1 on the OWASP Top 10 for a reason.' },
        { type: 'mc', q: 'Why does a well-designed API answer 404 (not 403) for "not yours"?', choices: ['403 is deprecated', 'So it doesn\'t confirm the resource exists', 'It is faster', 'Browsers cache 404s'], answer: 1, explain: 'Don\'t leak existence (account enumeration, invoice ids).' },
        { type: 'tf', q: 'Vulnerable dependencies are part of the OWASP Top 10, and CI should audit them.', answer: true, explain: 'SaaS-Foundation\'s CI runs pip-audit and pnpm audit and blocks on high severity.' },
      ],
    },
    {
      id: 'security-boss',
      title: 'Boss: Security audit before launch',
      summary: 'A tenant\'s storefront launches Monday. Audit its TLS, redirects, headers and cookies, and write findings the team can fix in priority order.',
      minutes: 25,
      boss: true,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const now = H.uni.time;
          tlsSite(H, 'store.example.com', { cn: 'store.example.com', sans: ['store.example.com'], issuer: "Let's Encrypt R11", notBefore: now - 85 * DAY, notAfter: now + 5 * DAY }, {
            extra: '    add_header X-Frame-Options DENY;\n    add_header Set-Cookie "sid=8f1c2b; Path=/";\n    add_header X-Powered-By "Express 4.16.0";\n',
          });
          H.write('laptop', '~/audit.md', '# Launch audit: store.example.com\n\n', { owner: 'dev' });
        },
        suggestions: ['curl -I https://store.example.com', 'curl -I http://store.example.com'],
        tasks: [
          { title: 'Check HTTPS works and read every response header: `curl -I https://store.example.com`', solution: 'curl -I https://store.example.com', check: t => t.events('http').some(e => /^https:\/\/store/.test(e.url) && e.status === 200) },
          { title: 'Check the certificate\'s expiry date with `openssl s_client` (is it renewing automatically?)', solution: 'openssl s_client -connect store.example.com:443 -servername store.example.com', check: t => t.ran(/openssl\s+s_client\b.*store\.example\.com/) },
          { title: 'Does plain HTTP redirect to HTTPS? `curl -I http://store.example.com`', solution: 'curl -I http://store.example.com', check: t => t.events('http').some(e => /^http:\/\/store/.test(e.url)) },
          { title: 'Write `~/audit.md` with findings, most important first. It must cover: the cert expiring in ~5 days, no HTTP→HTTPS redirect, missing HSTS and CSP, the session cookie without HttpOnly/Secure/SameSite, and the X-Powered-By version leak', solution: 'printf "%s\\n" "1. HIGH: certificate expires in 5 days - check automatic renewal (certbot renew) now" "2. HIGH: session cookie sid has no HttpOnly, Secure or SameSite" "3. HIGH: http:// is served without a redirect to https" "4. MEDIUM: no Strict-Transport-Security (HSTS) and no Content-Security-Policy" "5. LOW: X-Powered-By reveals Express 4.16.0 - remove it and upgrade" >> ~/audit.md', check: t => { const s = (t.file('laptop', '/home/dev/audit.md') || '').toLowerCase(); return /(expir|renew)/.test(s) && /redirect/.test(s) && /(hsts|strict-transport)/.test(s) && /(csp|content-security)/.test(s) && /httponly/.test(s) && /x-powered-by/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Which finding would you fix first?', choices: ['X-Powered-By', 'The certificate expiring in 5 days (the whole store goes down when it does)', 'Missing Referrer-Policy', 'The colour of the login button'], answer: 1, explain: 'Prioritise by impact and urgency.' },
        { type: 'multi', q: 'A useful finding states:', choices: ['What is wrong, where', 'Why it matters (impact)', 'How to fix or verify it', 'A severity', 'Who is to blame'], answer: [0, 1, 2, 3], explain: 'Actionable and blameless.' },
        { type: 'tf', q: 'Passing a header audit means the site is secure.', answer: false, explain: 'Headers are one layer. Code review, tests, dependency audits and access-control testing are others.' },
        { type: 'mc', q: 'The certificate expires in 5 days and renewal is automatic. What do you still check?', choices: ['Nothing', 'That renewal actually works (a dry run) and that someone is alerted if it fails', 'The DNS TTL', 'The server version'], answer: 1, explain: 'Automation you never verified is a hope.' },
        { type: 'mc', q: 'Why is a session cookie without the Secure flag a problem even on an HTTPS site?', choices: ['It is not', 'The browser may also send it over plain HTTP (e.g. a typed http:// link), where anyone on the network can read it', 'It slows the site', 'It breaks CORS'], answer: 1, explain: 'Secure + HSTS close that gap.' },
      ],
    },
  ],
};
