// Realm 4 · HTTP Deep Dive: methods and status codes, headers, cookies and sessions, REST and JSON, CORS.

const API = 'api.acme.example.com';
const TOKEN = 'nt_' + 'live_7c1f0e2a9b';  // assembled at runtime: no secret-shaped literal in the repo
const json = (status, obj, headers = {}) => ({ status, body: JSON.stringify(obj, null, 2) + '\n', headers: { 'content-type': 'application/json', ...headers } });
const problem = (status, code, message, headers = {}) => json(status, { code, message, request_id: 'req_' + (1000 + status) }, headers);

// A small Notes API whose handlers record what they were sent, so checks can verify the learner's requests.
export function notesApi(H) {
  const st = H.uni.notesApi = { notes: [{ id: 1, title: 'Order flour', done: false }, { id: 2, title: 'Fix oven timer', done: true }], next: 3, seen: [] };
  const authed = req => req.headers.authorization === `Bearer ${TOKEN}`;
  H.site(API, {
    '/v1/notes': req => {
      st.seen.push({ method: req.method, path: '/v1/notes', headers: req.headers, body: req.body });
      if (req.method === 'GET') return json(200, st.notes);
      if (req.method !== 'POST') return problem(405, 'method_not_allowed', 'Use GET or POST', { allow: 'GET, POST' });
      if (!authed(req)) return problem(401, 'unauthorized', 'Sign in to continue', { 'www-authenticate': 'Bearer' });
      if (!/application\/json/.test(req.headers['content-type'] || '')) return problem(415, 'unsupported_media_type', 'Send JSON with Content-Type: application/json');
      let data; try { data = JSON.parse(req.body || ''); } catch { return problem(400, 'bad_json', 'The body is not valid JSON'); }
      if (!data.title || typeof data.title !== 'string') return problem(422, 'invalid', 'title is required');
      const note = { id: st.next++, title: data.title, done: false };
      st.notes.push(note);
      return json(201, note, { location: `/v1/notes/${note.id}` });
    },
    '*': req => {
      const m = req.path.match(/^\/v1\/notes\/(\d+)$/);
      if (!m) return problem(404, 'not_found', 'No such endpoint');
      st.seen.push({ method: req.method, path: req.path, headers: req.headers, body: req.body });
      const note = st.notes.find(n => n.id === Number(m[1]));
      if (!note) return problem(404, 'not_found', `No note ${m[1]}`);
      if (req.method === 'GET') return json(200, note);
      if (!authed(req)) return problem(401, 'unauthorized', 'Sign in to continue', { 'www-authenticate': 'Bearer' });
      if (req.method === 'PATCH') { try { Object.assign(note, JSON.parse(req.body || '{}')); } catch { return problem(400, 'bad_json', 'The body is not valid JSON'); } return json(200, note); }
      if (req.method === 'DELETE') { st.notes = st.notes.filter(n => n !== note); return { status: 204, body: '' }; }
      return problem(405, 'method_not_allowed', 'Use GET, PATCH or DELETE', { allow: 'GET, PATCH, DELETE' });
    },
  });
}

const sent = (t, pred) => (t.uni.notesApi?.seen || []).some(pred);

export default {
  id: 'http',
  n: 4,
  title: 'HTTP Deep Dive',
  tagline: 'Methods, status codes, headers, cookies, REST and CORS: the language of every web app',
  badge: 'HTTP Speaker',
  intro: 'HTTP is the language browsers, apps and servers speak. Every bug report you get will mention it: "a 401", "a CORS error", "it returns 422". Learn to **read and write HTTP fluently**: methods and status codes, the **headers** that carry metadata, **cookies and sessions**, **REST API** design with JSON, and **CORS**. You will practise against a real (simulated) API with curl.',
  lessons: [
    {
      id: 'methods-status',
      title: 'Methods and status codes',
      summary: 'GET, POST, PUT, PATCH, DELETE; safe and idempotent; 2xx, 3xx, 4xx, 5xx and what each one tells you.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          notesApi(H);
          H.write('laptop', '~/token.txt', TOKEN + '\n', { owner: 'dev', mode: 0o600 });
        },
        suggestions: [`curl -i https://${API}/v1/notes`],
        tasks: [
          { title: `List the notes with the status line and headers: \`curl -i https://${API}/v1/notes\``, solution: `curl -i https://${API}/v1/notes`, check: t => sent(t, r => r.method === 'GET' && r.path === '/v1/notes') && t.ran(/curl\b.*-\w*i/) },
          { title: 'Get one note (`/v1/notes/1`), then one that does not exist (`/v1/notes/99`). Compare the status codes', solution: `curl -i https://${API}/v1/notes/1; curl -i https://${API}/v1/notes/99`, check: t => sent(t, r => r.path === '/v1/notes/1' && r.method === 'GET') && sent(t, r => r.path === '/v1/notes/99') },
          { title: 'Try to create a note with POST and no credentials. Which status, and which header tells you how to authenticate?', solution: `curl -i -X POST https://${API}/v1/notes`, check: t => sent(t, r => r.method === 'POST' && !r.headers.authorization) },
          { title: 'Now create one properly: Bearer token from `~/token.txt`, JSON content type, a title. Look for 201 and the `Location` header', hint: `curl -i -X POST -H "Authorization: Bearer $(cat ~/token.txt)" -H "Content-Type: application/json" -d '{"title":"Buy yeast"}' https://${API}/v1/notes`, solution: `curl -i -X POST -H "Authorization: Bearer $(cat ~/token.txt)" -H "Content-Type: application/json" -d '{"title":"Buy yeast"}' https://${API}/v1/notes`, check: t => (t.uni.notesApi?.notes || []).some(n => n.id >= 3) },
          { title: 'Send a POST with valid credentials but no `title` (e.g. `-d \'{}\'`). Which 4xx does a well-designed API return for "your data is invalid"?', solution: `curl -i -X POST -H "Authorization: Bearer $(cat ~/token.txt)" -H "Content-Type: application/json" -d '{}' https://${API}/v1/notes`, check: t => sent(t, r => r.method === 'POST' && r.headers.authorization && /^\s*\{\s*\}\s*$/.test(r.body || '')) },
          { title: 'Delete note 2 with `-X DELETE` (authenticated). What does 204 mean?', solution: `curl -i -X DELETE -H "Authorization: Bearer $(cat ~/token.txt)" https://${API}/v1/notes/2`, check: t => !(t.uni.notesApi?.notes || []).some(n => n.id === 2) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Which method should be used to read data without changing anything?', choices: ['POST', 'GET', 'DELETE', 'PATCH'], answer: 1, explain: 'GET is *safe*: it must not change server state.' },
        { type: 'mc', q: '"Idempotent" means:', choices: ['Fast', 'Doing it twice has the same effect as doing it once (GET, PUT, DELETE)', 'It needs a token', 'It returns JSON'], answer: 1, explain: 'POST usually is not: two POSTs create two notes. That matters for retries.' },
        { type: 'multi', q: 'Match the families: which are right?', choices: ['2xx: success', '3xx: redirection', '4xx: the client did something wrong', '5xx: the server failed', '1xx: errors'], answer: [0, 1, 2, 3], explain: '1xx is informational.' },
        { type: 'mc', q: '401 vs 403:', choices: ['Same thing', '401: we don\'t know who you are (authenticate); 403: we know, and you are not allowed', '401: forbidden; 403: not found', '403 means the server crashed'], answer: 1, explain: 'Unauthenticated vs unauthorised.' },
        { type: 'mc', q: 'An API returns 422 for a POST. The most likely cause:', choices: ['The server is down', 'The request was understood but the data failed validation (e.g. a required field is missing)', 'Wrong URL', 'Expired certificate'], answer: 1, explain: 'FastAPI (and SaaS-Foundation) use 422 for invalid input.' },
        { type: 'mc', q: 'A 201 Created response usually includes:', choices: ['A Location header pointing at the new resource', 'Nothing', 'A cookie', 'A redirect to the home page'], answer: 0, explain: 'And often the created object in the body.' },
        { type: 'multi', q: 'Which statuses mean "retry later might work"?', choices: ['429 Too Many Requests (check Retry-After)', '503 Service Unavailable', '404 Not Found', '400 Bad Request'], answer: [0, 1], explain: 'Retrying a 400 or 404 unchanged gives the same answer.' },
        { type: 'type', q: 'Type the curl option that sets the HTTP method (e.g. to DELETE).', accept: ['-X', '--request'], model: '-X', explain: '`curl -X DELETE https://…`' },
      ],
    },
    {
      id: 'headers',
      title: 'Headers: the metadata of every request',
      summary: 'Request and response headers, Content-Type and Accept, Authorization, User-Agent, Cache-Control, ETag and 304, and reading them with curl -v.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const st = H.uni.hdr = { seen: [] };
          const MENU = [{ name: 'Sourdough', price_bdt: 250 }, { name: 'Cardamom bun', price_bdt: 90 }];
          H.site('menu.acme.example.com', {
            '/v1/menu': req => {
              st.seen.push(req);
              if (req.headers['if-none-match'] === '"menu-v7"') return { status: 304, body: '', headers: { etag: '"menu-v7"', 'cache-control': 'public, max-age=300' } };
              if (/text\/csv/.test(req.headers.accept || '')) return { status: 200, body: 'name,price_bdt\n' + MENU.map(m => `${m.name},${m.price_bdt}`).join('\n') + '\n', headers: { 'content-type': 'text/csv', etag: '"menu-v7"', 'cache-control': 'public, max-age=300', vary: 'Accept' } };
              return { status: 200, body: JSON.stringify(MENU, null, 2) + '\n', headers: { 'content-type': 'application/json', etag: '"menu-v7"', 'cache-control': 'public, max-age=300', vary: 'Accept' } };
            },
          });
        },
        suggestions: ['curl -v https://menu.acme.example.com/v1/menu'],
        tasks: [
          { title: 'See both sides of the conversation with `-v`: lines starting `>` are what curl sent, `<` what came back', solution: 'curl -v https://menu.acme.example.com/v1/menu', check: t => t.ran(/curl\b.*-\w*v\b.*menu/) },
          { title: 'Ask for a different format with the `Accept` header: `-H "Accept: text/csv"`', solution: 'curl -i -H "Accept: text/csv" https://menu.acme.example.com/v1/menu', check: t => (t.uni.hdr?.seen || []).some(r => /text\/csv/.test(r.headers.accept || '')) },
          { title: 'Read the caching headers: `curl -I …/v1/menu`. How long may a cache keep it, and what is its ETag?', solution: 'curl -I https://menu.acme.example.com/v1/menu', check: t => t.ran(/curl\b.*-\w*I\b.*menu/) },
          { title: 'Ask "has it changed since version menu-v7?": send `If-None-Match: "menu-v7"` and get a 304 with an empty body', hint: `curl -i -H 'If-None-Match: "menu-v7"' https://menu.acme.example.com/v1/menu`, solution: `curl -i -H 'If-None-Match: "menu-v7"' https://menu.acme.example.com/v1/menu`, check: t => t.events('http').some(e => /menu/.test(e.url) && e.status === 304) },
        ],
      },
      quiz: [
        { type: 'mc', q: '`Content-Type` vs `Accept`:', choices: ['Same thing', 'Content-Type describes the body being sent; Accept says which formats the client wants back', 'Accept is for cookies', 'Content-Type is only for HTML'], answer: 1, explain: 'Both sides use Content-Type for their own body.' },
        { type: 'mc', q: 'What does a 304 Not Modified response mean?', choices: ['The page was deleted', 'Your cached copy (identified by ETag) is still current: reuse it, no body sent', 'An error', 'A redirect'], answer: 1, explain: 'Saves bandwidth with conditional requests.' },
        { type: 'multi', q: 'Which are *request* headers a client typically sends?', choices: ['Host', 'Authorization', 'Accept', 'Set-Cookie', 'User-Agent'], answer: [0, 1, 2, 4], explain: 'Set-Cookie comes from the server; the client sends Cookie.' },
        { type: 'mc', q: '`Cache-Control: no-store` on an API response means:', choices: ['Cache it for one hour', 'No cache (browser or proxy) may keep a copy: right for personal or sensitive data', 'Only CDNs may cache', 'The response is empty'], answer: 1, explain: 'SaaS-Foundation sets it on every /v1 API response.' },
        { type: 'mc', q: 'Why is the `Authorization` header sensitive?', choices: ['It is not', 'It carries the credential (e.g. a bearer token): anyone who has it can act as you', 'It contains the password hash', 'It slows requests'], answer: 1, explain: 'Never log it; never paste it into tickets or AI chats.' },
        { type: 'predict', q: 'What does this command print?', code: '$ curl -s -o /dev/null -w "%{http_code}" https://menu.acme.example.com/v1/menu', choices: ['The JSON menu', '200', 'Nothing', 'HTTP/1.1 200 OK and headers'], answer: 1, explain: '-o /dev/null discards the body; -w prints the status.' },
      ],
    },
    {
      id: 'cookies-sessions',
      title: 'Cookies and sessions',
      summary: 'HTTP is stateless; cookies and their attributes (HttpOnly, Secure, SameSite), server sessions vs tokens, and logging out properly.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const st = H.uni.cookies = { sessions: new Set(['s_9f2b7d']), loggedOut: false, seen: [] };
          H.site('app.acme.example.com', {
            '/login': req => {
              if (req.method !== 'POST') return { status: 405, body: 'POST only\n', headers: { allow: 'POST' } };
              let d = {}; try { d = JSON.parse(req.body || '{}'); } catch { /* bad */ }
              if (d.email !== 'baker@acme.example.com' || d.password !== 'correct horse 2026') return { status: 401, body: '{"code":"bad_credentials","message":"Email or password is incorrect"}\n', headers: { 'content-type': 'application/json' } };
              return { status: 200, body: '{"ok":true}\n', headers: { 'content-type': 'application/json', 'set-cookie': '__Host-session=s_9f2b7d; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600' } };
            },
            '/me': req => { st.seen.push(req); const c = req.headers.cookie || ''; const id = (c.match(/__Host-session=([\w]+)/) || [])[1]; return id && st.sessions.has(id) ? { status: 200, body: '{"email":"baker@acme.example.com","tenant":"acme"}\n' } : { status: 401, body: '{"code":"unauthorized","message":"Sign in to continue"}\n' }; },
            '/logout': req => { const c = req.headers.cookie || ''; const id = (c.match(/__Host-session=([\w]+)/) || [])[1]; if (id) { st.sessions.delete(id); st.loggedOut = true; } return { status: 204, body: '', headers: { 'set-cookie': '__Host-session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } }; },
          });
          H.write('laptop', '~/login.json', '{"email":"baker@acme.example.com","password":"correct horse 2026"}\n', { owner: 'dev', mode: 0o600 });
        },
        suggestions: ['curl -i https://app.acme.example.com/me'],
        tasks: [
          { title: 'Ask "who am I?" without any cookie: `curl -i https://app.acme.example.com/me`', solution: 'curl -i https://app.acme.example.com/me', check: t => t.events('http').some(e => /\/me$/.test(e.url) && e.status === 401) },
          { title: 'Sign in: POST `~/login.json` to `/login` with `-i`, and read the `Set-Cookie` header and every attribute on it', hint: '`curl -i -X POST -H "Content-Type: application/json" -d @login.json https://app.acme.example.com/login` (`-d @file` sends a file\'s contents)', solution: 'curl -i -X POST -H "Content-Type: application/json" -d @login.json https://app.acme.example.com/login', check: t => t.events('http').some(e => /\/login$/.test(e.url) && e.status === 200) },
          { title: 'A browser would now send that cookie automatically. Do it by hand: `-H "Cookie: __Host-session=<value>"` on `/me`', solution: 'curl -i -H "Cookie: __Host-session=s_9f2b7d" https://app.acme.example.com/me', check: t => t.events('http').some(e => /\/me$/.test(e.url) && e.status === 200) },
          { title: 'Log out with the cookie (`/logout`), then try `/me` with the same cookie again. Logging out must kill the session on the server, not just in the browser', solution: 'curl -i -H "Cookie: __Host-session=s_9f2b7d" https://app.acme.example.com/logout; curl -i -H "Cookie: __Host-session=s_9f2b7d" https://app.acme.example.com/me', check: t => t.uni.cookies?.loggedOut && t.after(e => e.type === 'http' && /\/logout$/.test(e.url), e => e.type === 'http' && /\/me$/.test(e.url) && e.status === 401) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'HTTP is "stateless". So how does a site remember you are signed in?', choices: ['It remembers your IP', 'The server sets a cookie (or issues a token) that the client sends with every request', 'The browser stores your password', 'It doesn\'t'], answer: 1, explain: 'Each request carries its own proof.' },
        { type: 'multi', q: 'Match the cookie attributes to what they do:', choices: ['HttpOnly: JavaScript cannot read the cookie (protects against XSS stealing it)', 'Secure: only sent over HTTPS', 'SameSite=Lax: not sent on most cross-site requests (protects against CSRF)', 'Max-Age: how long it lives', 'Path=/admin: encrypts the cookie'], answer: [0, 1, 2, 3], explain: 'Path limits where it is sent; nothing in the list encrypts it.' },
        { type: 'mc', q: 'Why must logout invalidate the session on the server?', choices: ['It doesn\'t need to', 'Otherwise anyone who copied the cookie can keep using it', 'To save memory', 'Browsers require it'], answer: 1, explain: 'Server-side revocation makes stolen cookies worthless.' },
        { type: 'mc', q: 'SaaS-Foundation\'s plan for browsers (ADR 0001) is:', choices: ['Store the API token in localStorage', 'The Next.js server keeps the bearer token in an httpOnly __Host- cookie; the browser never sees the token', 'Send the password with every request', 'No sessions'], answer: 1, explain: 'XSS can act during the page view but cannot steal a reusable token.' },
        { type: 'tf', q: 'A cookie named with the `__Host-` prefix must be Secure, have Path=/ and no Domain attribute.', answer: true, explain: 'So it can\'t leak to other subdomains (other tenants!).' },
        { type: 'mc', q: 'Server sessions vs self-contained tokens (like JWTs):', choices: ['Sessions are looked up on the server, so they can be revoked instantly; self-contained tokens are valid until they expire unless you add a revocation list', 'Tokens are always more secure', 'Sessions cannot expire', 'They are identical'], answer: 0, explain: 'SaaS-Foundation uses opaque tokens stored hashed on the server: revocable.' },
      ],
    },
    {
      id: 'rest-json',
      title: 'REST APIs and JSON',
      summary: 'Resources and URLs, using methods consistently, JSON shapes, pagination, errors with stable codes, versioning, and OpenAPI.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const ORDERS = Array.from({ length: 23 }, (_, i) => ({ id: 101 + i, status: i % 4 === 0 ? 'open' : 'delivered', total_bdt: 150 + (i * 37) % 900 }));
          H.site('api.shop.example.com', {
            '/v1/orders': req => {
              const q = Object.fromEntries(new URLSearchParams((req.query || '').replace(/^\?/, '')));
              const limit = Math.min(Number(q.limit) || 10, 50), page = Math.max(Number(q.page) || 1, 1);
              let rows = ORDERS; if (q.status) rows = rows.filter(o => o.status === q.status);
              const items = rows.slice((page - 1) * limit, page * limit);
              const hasNext = page * limit < rows.length;
              return { status: 200, body: JSON.stringify({ items, page, limit, total: rows.length, next: hasNext ? `/v1/orders?page=${page + 1}&limit=${limit}${q.status ? '&status=' + q.status : ''}` : null }, null, 2) + '\n', headers: { 'content-type': 'application/json' } };
            },
            '/openapi.json': { body: JSON.stringify({ openapi: '3.1.0', info: { title: 'Shop API', version: '1.4.0' }, paths: { '/v1/orders': { get: { summary: 'List orders', parameters: [{ name: 'status', in: 'query' }, { name: 'page', in: 'query' }, { name: 'limit', in: 'query' }] } }, '/v1/orders/{id}': { get: { summary: 'One order' } } } }, null, 2) + '\n' },
          });
        },
        suggestions: ['curl -s https://api.shop.example.com/openapi.json | jq ".paths | keys"'],
        tasks: [
          { title: 'Good APIs describe themselves. List the paths in the OpenAPI document: `curl -s https://api.shop.example.com/openapi.json | jq ".paths | keys"`', solution: 'curl -s https://api.shop.example.com/openapi.json | jq ".paths | keys"', check: t => t.ran(/openapi\.json.*\|\s*jq\b/) },
          { title: 'Get the first page of orders and look at the shape: items, page, total, next', solution: 'curl -s https://api.shop.example.com/v1/orders | jq', check: t => t.events('http').some(e => /\/v1\/orders/.test(e.url) && e.status === 200) },
          { title: 'Only open orders, 5 per page: use query parameters `status=open&limit=5` (quote the URL!)', solution: 'curl -s "https://api.shop.example.com/v1/orders?status=open&limit=5" | jq', check: t => t.events('http').some(e => /status=open/.test(e.url) && /limit=5/.test(e.url)) },
          { title: 'Follow `next` to page 2 of all orders, and print just the order ids with jq', solution: 'curl -s "https://api.shop.example.com/v1/orders?page=2&limit=10" | jq ".items[].id"', check: t => t.events('http').some(e => /page=2/.test(e.url)) && t.ran(/jq\b.*\.items\[\]\.id/) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Which URL design is most RESTful for "cancel order 42"?', choices: ['GET /cancelOrder?id=42', 'POST /v1/orders/42/cancel or PATCH /v1/orders/42 {"status": "cancelled"}', 'GET /v1/orders/42/delete', 'POST /api'], answer: 1, explain: 'Nouns in URLs, verbs in methods; never change state with GET.' },
        { type: 'mc', q: 'Why paginate list endpoints?', choices: ['To annoy clients', 'So one request can\'t return (or load from the database) millions of rows', 'JSON has a size limit of 10 items', 'For SEO'], answer: 1, explain: 'Correctness *and* scale: every list needs a limit.' },
        { type: 'mc', q: 'A good API error body looks like:', choices: ['"Error!"', '{"code": "email_taken", "message": "An account with this email already exists", "request_id": "..."}', 'An HTML stack trace', 'Status 200 with {"error": true}'], answer: 1, explain: 'Stable codes for programs, a message for humans, an id for support. SaaS-Foundation does exactly this.' },
        { type: 'mc', q: 'Why put a version in the path (/v1/...)?', choices: ['It looks professional', 'So breaking changes can ship as /v2 while existing clients keep working', 'It is required by HTTP', 'For caching'], answer: 1, explain: 'Additive changes don\'t need a new version; breaking ones do.' },
        { type: 'mc', q: 'What is OpenAPI?', choices: ['An open-source API', 'A machine-readable description of an API (paths, parameters, schemas) used for docs and generated clients', 'A database', 'An auth protocol'], answer: 1, explain: 'SaaS-Foundation generates its TypeScript SDK from it and fails CI if they drift.' },
        { type: 'predict', q: 'What does this print?', code: '$ echo \'{"items":[{"id":7},{"id":9}],"total":2}\' | jq ".items[].id"', choices: ['7 9 (one per line)', '[7, 9]', '2', 'An error'], answer: 0, explain: '`.items[]` iterates; `.id` picks the field.' },
      ],
    },
    {
      id: 'cors',
      title: 'CORS and the same-origin policy',
      summary: 'What an origin is, why browsers block cross-origin reads, preflight requests, and why CORS is not a server-side security wall.',
      minutes: 15,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const allowed = new Set(['https://acme.example.com']);
          H.uni.cors = { preflights: [] };
          H.site('api.acme.example.com', {
            '/v1/menu': req => {
              const origin = req.headers.origin;
              const ok = origin && allowed.has(origin);
              if (req.method === 'OPTIONS') {
                H.uni.cors.preflights.push({ origin, ok });
                return ok ? { status: 204, body: '', headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type, authorization', 'access-control-max-age': '600', vary: 'Origin' } } : { status: 403, body: '{"code":"origin_not_allowed"}\n', headers: { vary: 'Origin' } };
              }
              return { status: 200, body: '[{"name":"Sourdough"}]\n', headers: { 'content-type': 'application/json', vary: 'Origin', ...(ok ? { 'access-control-allow-origin': origin } : {}) } };
            },
          });
        },
        suggestions: ['curl -i -H "Origin: https://acme.example.com" https://api.acme.example.com/v1/menu'],
        tasks: [
          { title: 'Call the API as the bakery\'s own site would: `-H "Origin: https://acme.example.com"`. Find `Access-Control-Allow-Origin` in the response', solution: 'curl -i -H "Origin: https://acme.example.com" https://api.acme.example.com/v1/menu', check: t => t.ran(/curl\b.*Origin:\s*https:\/\/acme\.example\.com/) },
          { title: 'Now as a different site (`https://evil.example.com`). The server still answers 200: what is missing, and who enforces it?', solution: 'curl -i -H "Origin: https://evil.example.com" https://api.acme.example.com/v1/menu', check: t => t.ran(/curl\b.*Origin:\s*https:\/\/evil\.example\.com/) },
          { title: 'A browser sends a *preflight* before a POST with JSON. Imitate it: `-X OPTIONS` with `Origin` and `Access-Control-Request-Method: POST`, for the allowed origin', solution: 'curl -i -X OPTIONS -H "Origin: https://acme.example.com" -H "Access-Control-Request-Method: POST" https://api.acme.example.com/v1/menu', check: t => (t.uni.cors?.preflights || []).some(p => p.ok) },
          { title: 'And the same preflight from `https://evil.example.com`', solution: 'curl -i -X OPTIONS -H "Origin: https://evil.example.com" -H "Access-Control-Request-Method: POST" https://api.acme.example.com/v1/menu', check: t => (t.uni.cors?.preflights || []).some(p => !p.ok && /evil/.test(p.origin || '')) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Which pairs are the SAME origin?', choices: ['https://acme.example.com and https://acme.example.com/menu', 'https://acme.example.com and http://acme.example.com', 'https://acme.example.com and https://api.acme.example.com', 'https://acme.example.com and https://acme.example.com:8443'], answer: 0, explain: 'Origin = scheme + host + port. The path does not matter.' },
        { type: 'mc', q: 'Who enforces CORS?', choices: ['The server, by refusing requests', 'The browser: it refuses to let a page read a cross-origin response unless the server allows that origin', 'DNS', 'The firewall'], answer: 1, explain: 'curl ignores CORS entirely, so CORS is not a protection for your API against scripts or attackers.' },
        { type: 'tf', q: 'Setting `Access-Control-Allow-Origin: *` with credentials is a safe way to fix a CORS error.', answer: false, explain: 'Browsers reject `*` with credentials anyway, and allowing every origin defeats the purpose. Allow exactly the origins you trust.' },
        { type: 'mc', q: 'What is a preflight request?', choices: ['A test deploy', 'An automatic OPTIONS request the browser sends to ask permission before certain cross-origin requests (e.g. JSON POSTs)', 'A DNS lookup', 'A cookie check'], answer: 1, explain: 'If the preflight is refused, the real request is never sent.' },
        { type: 'mc', q: 'SaaS-Foundation\'s CORS rule allows an Origin when:', choices: ['Always', 'It is one of the configured platform origins, or a hostname of the SAME tenant the request is for', 'It is any https site', 'Never'], answer: 1, explain: 'Tenant B\'s site can\'t read tenant A\'s API from a browser.' },
      ],
    },
    {
      id: 'http-boss',
      title: 'Boss: Integrate with a partner API',
      summary: 'Authenticate, page through all results, respect rate limits, and turn the data into a report, the way a careful integration does.',
      minutes: 25,
      boss: true,
      lab: {
        cwd: '~',
        panels: ['network', 'files'],
        setup(H) {
          const KEY = 'pk_' + 'test_4ba1f7';
          H.write('laptop', '~/.partner_key', KEY + '\n', { owner: 'dev', mode: 0o600 });
          const st = H.uni.partner = { calls: 0, limited: false };
          const SUPPLIERS = Array.from({ length: 12 }, (_, i) => ({ id: `sup_${i + 1}`, name: ['Dhaka Mills', 'Chattogram Spices', 'Sylhet Tea', 'Rajshahi Mangoes', 'Khulna Fish', 'Barishal Rice'][i % 6] + (i >= 6 ? ' II' : ''), active: i % 5 !== 3 }));
          H.site('partner.example.com', {
            '/v1/suppliers': req => {
              st.calls++;
              if (req.headers['x-api-key'] !== KEY) return { status: 401, body: '{"code":"unauthorized","message":"Send your key in X-Api-Key"}\n', headers: { 'content-type': 'application/json' } };
              if (st.calls === 3 && !st.limited) { st.limited = true; return { status: 429, body: '{"code":"rate_limited","message":"Slow down"}\n', headers: { 'content-type': 'application/json', 'retry-after': '2' } }; }
              const q = Object.fromEntries(new URLSearchParams((req.query || '').replace(/^\?/, '')));
              const page = Math.max(Number(q.page) || 1, 1), per = 5;
              const items = SUPPLIERS.slice((page - 1) * per, page * per);
              return { status: 200, body: JSON.stringify({ items, page, next: page * per < SUPPLIERS.length ? page + 1 : null }) + '\n', headers: { 'content-type': 'application/json' } };
            },
          });
        },
        suggestions: ['curl -i https://partner.example.com/v1/suppliers'],
        tasks: [
          { title: 'Call `https://partner.example.com/v1/suppliers` without a key and read the error: it tells you how to authenticate', solution: 'curl -i https://partner.example.com/v1/suppliers', check: t => t.events('http').some(e => /partner/.test(e.url) && e.status === 401) },
          { title: 'Authenticate with the key from `~/.partner_key` (without typing the key into your command)', solution: 'curl -s -H "X-Api-Key: $(cat ~/.partner_key)" https://partner.example.com/v1/suppliers', check: t => t.events('http').some(e => /partner/.test(e.url) && e.status === 200) },
          { title: 'Fetch pages 2 and 3. One of your calls will be rate-limited: read the `Retry-After` header, wait that long (`sleep 2`), and retry the same page', solution: 'curl -i -H "X-Api-Key: $(cat ~/.partner_key)" "https://partner.example.com/v1/suppliers?page=2"; sleep 2; curl -s -H "X-Api-Key: $(cat ~/.partner_key)" "https://partner.example.com/v1/suppliers?page=2"; curl -s -H "X-Api-Key: $(cat ~/.partner_key)" "https://partner.example.com/v1/suppliers?page=3"', check: t => t.events('http').some(e => /partner/.test(e.url) && e.status === 429) && t.after(e => e.type === 'http' && /partner/.test(e.url) && e.status === 429, e => e.type === 'http' && /page=3/.test(e.url) && e.status === 200) && t.ran(/\bsleep\b/) },
          { title: 'Write the names of all ACTIVE suppliers (all 3 pages) into `~/suppliers.txt`, one per line', hint: `for p in 1 2 3; do curl -s -H "X-Api-Key: $(cat ~/.partner_key)" "https://partner.example.com/v1/suppliers?page=$p" | jq -r '.items[] | select(.active) | .name'; done > ~/suppliers.txt`, solution: `for p in 1 2 3; do curl -s -H "X-Api-Key: $(cat ~/.partner_key)" "https://partner.example.com/v1/suppliers?page=$p" | jq -r '.items[] | select(.active) | .name'; done > ~/suppliers.txt`, check: t => { const lines = (t.file('laptop', '/home/dev/suppliers.txt') || '').trim().split('\n').filter(Boolean); return lines.length === 10 && lines.includes('Rajshahi Mangoes II') && !lines.includes('Rajshahi Mangoes') && !lines.includes('Sylhet Tea II'); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why read the key from a file (`$(cat ~/.partner_key)`) instead of typing it?', choices: ['It is faster', 'Typed secrets end up in shell history and screenshots', 'curl requires it', 'Files are encrypted'], answer: 1, explain: 'Keep secrets out of history, logs and chats.' },
        { type: 'mc', q: 'An API answers 429 with `Retry-After: 2`. A good client:', choices: ['Retries immediately in a tight loop', 'Waits at least 2 seconds, then retries (with backoff if it happens again)', 'Gives up forever', 'Switches to another API key'], answer: 1, explain: 'Hammering a rate-limited API gets you blocked.' },
        { type: 'multi', q: 'A robust integration also:', choices: ['Handles every page, not just the first', 'Sets timeouts', 'Logs errors without logging the key', 'Assumes the partner never changes the response format', 'Validates the data it receives'], answer: [0, 1, 2, 4], explain: 'External APIs change and fail; plan for it.' },
        { type: 'mc', q: 'The partner API returned 401 with a message saying which header to use. What is the right next step?', choices: ['Retry the same request', 'Send the key in the header it names (X-Api-Key), read from a file or env var', 'Use a different API', 'Disable TLS'], answer: 1, explain: 'Error messages are documentation.' },
        { type: 'mc', q: 'Your loop fetched pages 1-3 but the API now has 5 pages. How do you make it robust?', choices: ['Hard-code 5', 'Follow `next` until it is null', 'Fetch 100 pages', 'Ask the partner'], answer: 1, explain: 'Let the API tell you when you\'re done.' },
      ],
    },
  ],
};
