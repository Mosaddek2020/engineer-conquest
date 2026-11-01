// Realm 3 · How the Web Works: client/server, URLs and DNS, IPs and ports, what happens when you type a URL.

const BAKERY_HTML = `<!doctype html>
<html lang="en">
<head><title>Acme Bakery</title><link rel="stylesheet" href="/static/site.css"></head>
<body>
  <h1>Acme Bakery</h1>
  <div id="menu">Loading today's menu...</div>
  <script src="/static/app.js"></script>
</body>
</html>
`;
const APP_JS = `// Runs in the browser: asks the API for data and puts it on the page.
fetch('/api/menu').then(r => r.json()).then(items => {
  document.getElementById('menu').textContent = items.map(i => i.name).join(', ');
});
`;
const MENU = JSON.stringify([{ id: 1, name: 'Sourdough', price_bdt: 250 }, { id: 2, name: 'Cardamom bun', price_bdt: 90 }], null, 2) + '\n';

export default {
  id: 'web',
  n: 3,
  title: 'How the Web Works',
  tagline: 'Browsers, servers, URLs, DNS, IPs and ports: the plumbing under every web app',
  badge: 'Web Navigator',
  intro: 'Every web app is the same conversation: a **client** (usually a browser) asks a **server** for something, and the server answers. Learn the pieces of that conversation: **URLs**, **DNS** (turning names into addresses), **IP addresses and ports**, and the full journey from typing a URL to seeing a page. When something breaks, knowing which piece failed is half of the fix.',
  lessons: [
    {
      id: 'client-server',
      title: 'Clients, servers, frontend and backend',
      summary: 'Request and response, HTML pages vs JSON APIs, what runs in the browser vs on the server, and where the database fits.',
      minutes: 15,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          H.site('acme.example.com', {
            '/': { body: BAKERY_HTML },
            '/static/app.js': { body: APP_JS, headers: { 'content-type': 'application/javascript' } },
            '/api/menu': { body: MENU },
          });
        },
        suggestions: ['curl https://acme.example.com/'],
        tasks: [
          { title: 'Fetch the bakery\'s home page like a browser would: `curl https://acme.example.com/`', solution: 'curl https://acme.example.com/', check: t => t.events('http').some(e => /acme\.example\.com\/?$/.test(e.url) && e.status === 200) },
          { title: 'The HTML has an empty menu and loads a script. Fetch that script: `curl https://acme.example.com/static/app.js`', solution: 'curl https://acme.example.com/static/app.js', check: t => t.events('http').some(e => /app\.js$/.test(e.url) && e.status === 200) },
          { title: 'The script (running in the browser) calls an API. Call it yourself: `curl https://acme.example.com/api/menu`', solution: 'curl https://acme.example.com/api/menu', check: t => t.events('http').some(e => /\/api\/menu$/.test(e.url) && e.status === 200) },
          { title: 'Pull just the names out of the JSON with `jq`: `curl -s https://acme.example.com/api/menu | jq -r \'.[].name\'`', solution: "curl -s https://acme.example.com/api/menu | jq -r '.[].name'", check: t => t.ran(/curl\b.*\/api\/menu.*\|\s*jq\b/) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'In the bakery site, where does the code in `app.js` run?', choices: ['On the web server', 'In the user\'s browser', 'In the database', 'On the DNS server'], answer: 1, explain: 'The server sends JavaScript; the browser runs it. That is frontend code.' },
        { type: 'multi', q: 'Which are typical backend jobs?', choices: ['Checking who the user is and what they may do', 'Validating input', 'Reading and writing the database', 'Drawing buttons on the screen', 'Applying business rules (prices, stock)'], answer: [0, 1, 2, 4], explain: 'Drawing the UI is the frontend\'s job.' },
        { type: 'mc', q: 'Why does the browser get an HTML page *and* later call `/api/menu`?', choices: ['A bug', 'The page is the shell; the API returns data (JSON) that JavaScript puts into the page', 'To make it slower', 'Browsers always do two requests'], answer: 1, explain: 'Many modern apps load a page, then fetch data from APIs.' },
        { type: 'tf', q: 'The browser talks directly to the database.', answer: false, explain: 'Never. The backend sits between users and data, enforcing rules and permissions.' },
        { type: 'mc', q: 'What is JSON?', choices: ['A programming language', 'A text format for structured data (objects, arrays, strings, numbers) that APIs commonly use', 'A database', 'A browser'], answer: 1, explain: '`{"name": "Sourdough", "price_bdt": 250}`' },
        { type: 'type', q: 'Type a command that fetches https://acme.example.com/api/menu and prints the response.', accept: ['curl https://acme.example.com/api/menu', 'curl -s https://acme.example.com/api/menu'], model: 'curl https://acme.example.com/api/menu', explain: 'curl is the command-line HTTP client.' },
      ],
    },
    {
      id: 'urls-dns',
      title: 'URLs and DNS',
      summary: 'The parts of a URL, how a name becomes an IP address, and what happens when it doesn\'t.',
      minutes: 15,
      lab: {
        cwd: '~',
        laptopPackages: ['dnsutils'],
        panels: ['network'],
        setup(H) {
          H.server('web1');
          H.install('web1', 'nginx');
          H.dns('shop.example.com', 'web1');
        },
        suggestions: ['dig +short shop.example.com', 'cat /etc/hosts'],
        tasks: [
          { title: 'Ask DNS for the address of `shop.example.com`: `dig +short shop.example.com`', solution: 'dig +short shop.example.com', check: t => t.ran(/\bdig\b.*shop\.example\.com/) },
          { title: 'Fetch the site by name: `curl -I http://shop.example.com` (just the headers)', solution: 'curl -I http://shop.example.com', check: t => t.events('http').some(e => /shop\.example\.com/.test(e.url) && e.status === 200) },
          { title: 'Fetch the same server by the IP address you found (`curl -I http://<ip>`): same server, no DNS needed', solution: 'curl -I http://$(dig +short shop.example.com)', check: t => t.events('http').some(e => /^http:\/\/\d+\.\d+\.\d+\.\d+/.test(e.url) && e.status === 200) },
          { title: 'Try a name that does not exist: `curl http://shoop.example.com; echo "exit code $?"`. Note curl\'s error and exit code (6 = could not resolve host)', solution: 'curl http://shoop.example.com; echo "exit code $?"', check: t => t.ran(/curl\b.*shoop\.example\.com/) },
          { title: 'See the local name table every machine checks first: `cat /etc/hosts`', solution: 'cat /etc/hosts', check: t => t.ran(/\bcat\b.*\/etc\/hosts/) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'In `https://acme.example.com:8443/v1/orders?status=open#top`, what is `/v1/orders`?', choices: ['The host', 'The path', 'The query string', 'The fragment'], answer: 1, explain: 'scheme://host:port/path?query#fragment' },
        { type: 'multi', q: 'Match correctly: which statements are true for that URL?', choices: ['`https` is the scheme', '`8443` is the port', '`status=open` is in the query string', '`#top` is sent to the server', '`acme.example.com` is the host'], answer: [0, 1, 2, 4], explain: 'The fragment (#top) stays in the browser.' },
        { type: 'mc', q: 'What does DNS do?', choices: ['Encrypts traffic', 'Translates names like shop.example.com into IP addresses', 'Stores web pages', 'Runs the backend'], answer: 1, explain: 'The internet\'s phone book.' },
        { type: 'mc', q: 'curl says "Could not resolve host". Which layer failed?', choices: ['The server\'s code', 'DNS: no address was found for the name', 'The database', 'TLS'], answer: 1, explain: 'Nothing was even sent to a server. Check the spelling, then DNS.' },
        { type: 'tf', q: 'If you know the IP address, you can reach a server without DNS.', answer: true, explain: 'DNS only finds the address. (Many sites still need the right Host header, which you will meet later.)' },
        { type: 'mc', q: 'SaaS-Foundation decides which tenant a request is for by:', choices: ['A cookie', 'The host name in the request (acme.<base_domain> or a verified custom domain)', 'The user\'s IP address', 'The browser'], answer: 1, explain: 'acme.example.com and globex.example.com can be the same servers; the host tells the app which tenant.' },
      ],
    },
    {
      id: 'ip-ports',
      title: 'IP addresses, ports and TCP',
      summary: 'Addresses and ports, well-known ports, TCP vs UDP, localhost, and telling "refused" from "unreachable".',
      minutes: 15,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          H.server('web1');
          H.install('web1', 'nginx');
          H.dns('shop.example.com', 'web1');
        },
        suggestions: ['nc -zv shop.example.com 80', 'ip addr'],
        tasks: [
          { title: 'Your own laptop has addresses too: `ip addr` (look for `127.0.0.1`, the loopback, and your network address)', solution: 'ip addr', check: t => t.ran(/^ip\s+(a|addr)\b/) },
          { title: 'Is anything listening on port 80 (HTTP) on the shop server? `nc -zv shop.example.com 80`', solution: 'nc -zv shop.example.com 80', check: t => t.ran(/\bnc\b.*shop\.example\.com\s+80\b/) },
          { title: 'What about port 5432 (PostgreSQL)? `nc -zv shop.example.com 5432`. "Refused" means: the machine answered, nothing listens there', solution: 'nc -zv shop.example.com 5432', check: t => t.ran(/\bnc\b.*shop\.example\.com\s+5432\b/) },
          { title: 'Ports are part of the address you connect to: `curl -I http://shop.example.com:80/` works; `curl -I http://shop.example.com:8080/` does not', solution: 'curl -I http://shop.example.com:80/; curl -I http://shop.example.com:8080/', check: t => t.ran(/curl\b.*shop\.example\.com:8080/) && t.events('http').some(e => /shop\.example\.com/.test(e.url) && e.status === 200) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'An IP address identifies a machine (network interface). What does a port identify?', choices: ['The user', 'A particular service/program listening on that machine', 'The country', 'The browser'], answer: 1, explain: 'One server can run a web server on 443 and a database on 5432.' },
        { type: 'multi', q: 'Which well-known ports are correct?', choices: ['HTTP: 80', 'HTTPS: 443', 'SSH: 22', 'PostgreSQL: 5432', 'DNS: 8080'], answer: [0, 1, 2, 3], explain: 'DNS uses 53. 8080 is a common alternative HTTP port.' },
        { type: 'mc', q: 'What is `127.0.0.1` (localhost)?', choices: ['Google\'s server', 'The machine itself: traffic never leaves it', 'The router', 'A broken address'], answer: 1, explain: 'A service bound only to localhost is unreachable from other machines.' },
        { type: 'mc', q: '"Connection refused" vs a timeout: which is right?', choices: ['Refused: the host answered but nothing listens on that port. Timeout: no answer at all (firewall, wrong address, host down)', 'They mean the same', 'Refused means DNS failed', 'Timeout means the password is wrong'], answer: 0, explain: 'Refused is an answer; silence is a different problem.' },
        { type: 'mc', q: 'TCP vs UDP:', choices: ['TCP is reliable and ordered (HTTP/1.1, HTTP/2 use it); UDP sends packets without delivery guarantees (DNS, video, HTTP/3\'s QUIC)', 'UDP is always faster and better', 'TCP is only for email', 'They are the same'], answer: 0, explain: 'Most web traffic you\'ll debug is TCP.' },
        { type: 'tf', q: 'Two different programs can listen on the same port of the same address at the same time.', answer: false, explain: 'The second one fails with "address already in use".' },
      ],
    },
    {
      id: 'typing-a-url',
      title: 'What happens when you type a URL',
      summary: 'DNS, TCP, TLS, HTTP request, server work, response, HTML parsing, more requests, rendering, and caching along the way.',
      minutes: 15,
      quiz: [
        { type: 'order', q: 'Put the journey in order for https://acme.example.com.', items: ['The browser looks up acme.example.com in DNS (after checking its caches)', 'It opens a TCP connection to the IP on port 443', 'TLS handshake: the server proves its identity with a certificate; keys are agreed', 'The browser sends an HTTP GET / request with headers', 'The server runs code (maybe queries a database) and sends a response', 'The browser parses the HTML and requests CSS, JS and images', 'JavaScript runs, maybe calling APIs, and the page renders'], explain: 'Each step can fail differently, which is why the order helps you debug.' },
        { type: 'mc', q: 'The page HTML loads but the menu stays empty. Where do you look first?', choices: ['DNS', 'The browser\'s developer tools: the Network tab (did /api/menu fail?) and the Console (JavaScript errors)', 'The server\'s disk', 'The TLS certificate'], answer: 1, explain: 'DevTools is the frontend engineer\'s terminal.' },
        { type: 'multi', q: 'Which caches might answer before your server is ever asked?', choices: ['The browser cache', 'A CDN (content delivery network) edge', 'DNS caches', 'The database'], answer: [0, 1, 2], explain: 'Caches are why "but I deployed it!" sometimes still shows the old version.' },
        { type: 'mc', q: 'Why are pages with dozens of separate JS/CSS/image files slower on a mobile network?', choices: ['They are not', 'Each resource is another request (and maybe another connection); latency adds up', 'Mobile phones cannot run JS', 'DNS is slower on phones'], answer: 1, explain: 'Bundling, compression and HTTP/2 multiplexing help.' },
        { type: 'tf', q: 'The URL fragment (#section) is sent to the server.', answer: false, explain: 'It stays in the browser.' },
      ],
    },
    {
      id: 'web-boss',
      title: 'Boss: Three sites, three failures',
      summary: 'Three internal sites are "down". Use curl and nc to tell a DNS problem, a dead service and an application error apart, and report each one precisely.',
      minutes: 20,
      boss: true,
      lab: {
        cwd: '~',
        laptopPackages: ['dnsutils'],
        panels: ['network'],
        setup(H) {
          H.server('web1');
          H.install('web1', 'nginx');
          H.dns('docs.example.com', 'web1');
          H.server('web2');
          H.install('web2', 'nginx');
          H.run('sudo systemctl stop nginx', { on: 'web2' });
          H.dns('status.example.com', 'web2');
          H.site('orders.example.com', { '/': { status: 500, body: '{"code":"internal_error","message":"Something went wrong","request_id":"7f3a9c"}' } });
          H.write('laptop', '~/report.txt', '# Outage report\n# For each site: what you ran, what you saw, which layer failed\n', { owner: 'dev' });
        },
        suggestions: ['curl -i https://orders.example.com', 'curl -i http://status.example.com'],
        tasks: [
          { title: 'Check `docs.examples.com` (that is what the support ticket says). What does curl say, and what is the exit code?', solution: 'curl -i http://docs.examples.com; echo $?', check: t => t.ran(/curl\b.*docs\.examples\.com/) },
          { title: 'Is that name even in DNS? Compare `dig +short docs.examples.com` and `dig +short docs.example.com`', solution: 'dig +short docs.examples.com; dig +short docs.example.com', check: t => t.ran(/\bdig\b.*docs\.examples\.com/) && t.ran(/\bdig\b.*docs\.example\.com/) },
          { title: 'Check `http://status.example.com`. Then use `nc -zv status.example.com 80` to see whether anything listens', solution: 'curl -i http://status.example.com; nc -zv status.example.com 80', check: t => t.ran(/curl\b.*status\.example\.com/) && t.ran(/\bnc\b.*status\.example\.com\s+80/) },
          { title: 'Check `https://orders.example.com` with `-i`. Which status code, and what does the body give you to quote to the backend team?', solution: 'curl -i https://orders.example.com', check: t => t.events('http').some(e => /orders\.example\.com/.test(e.url) && e.status === 500) },
          { title: 'Write `~/report.txt`: one line per site with the failing layer: docs = DNS/typo, status = nothing listening (service down), orders = HTTP 500 application error (include its request id)', solution: 'printf "%s\\n" "docs.examples.com: DNS - the name does not resolve (typo, the site is docs.example.com)" "status.example.com: connection refused on port 80 - service down" "orders.example.com: HTTP 500 from the application, request_id 7f3a9c" >> ~/report.txt', check: t => { const s = t.file('laptop', '/home/dev/report.txt') || ''; return /docs/i.test(s) && /dns|resolve|typo/i.test(s) && /status/i.test(s) && /refused|listen|down/i.test(s) && /orders/i.test(s) && /500/.test(s) && /7f3a9c/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Users report "the site is down". Which question narrows it fastest?', choices: ['Is it a full moon?', 'Which layer fails: does the name resolve, does a connection open, what HTTP status comes back?', 'Who deployed last?', 'Is the logo correct?'], answer: 1, explain: 'DNS → connection → HTTP → application. Test each.' },
        { type: 'mc', q: 'A 500 response proves:', choices: ['DNS is broken', 'DNS, the connection and the web server all worked; the application failed while handling the request', 'The user typed the URL wrong', 'The network is down'], answer: 1, explain: 'Ask the backend team, with the request id.' },
        { type: 'multi', q: 'A good outage report includes:', choices: ['The exact URL and command', 'What you saw (status code, error text)', 'The failing layer', 'Request ids or timestamps', 'Guesses presented as facts'], answer: [0, 1, 2, 3], explain: 'Evidence the next person can act on.' },
        { type: 'mc', q: 'nc says "Connection refused" on port 80. What does that tell you?', choices: ['DNS is broken', 'The host answered, but nothing listens on port 80 (the web server is down or on another port)', 'A firewall silently dropped it', 'The app returned 500'], answer: 1, explain: 'Refused is an answer; silence would be a firewall or a dead host.' },
        { type: 'mc', q: 'Why include the request id from the 500 response in your report?', choices: ['It looks professional', 'It lets the backend team find the exact log lines for that request', 'It fixes the bug', 'Browsers need it'], answer: 1, explain: 'Request ids connect a user-visible error to server logs.' },
      ],
    },
  ],
};
