## story | The interview question that isn't about memorisation

"What happens when you type a URL and press Enter?" is a classic interview question, not because anyone needs the trivia, but because the answer is a map of everything that can go wrong. Engineers who can walk the map can debug almost any web problem.

## model | The journey, step by step

1. **Parse the URL** and check caches (maybe the page is already cached).
2. **DNS**: find the IP for the host (browser, OS and resolver caches first).
3. **TCP**: open a connection to the IP and port (443 for HTTPS).
4. **TLS handshake** (HTTPS): the server presents a **certificate** proving it is `acme.example.com`; both sides agree on encryption keys. (Realm 5 goes deep.)
5. **HTTP request**: `GET / HTTP/1.1` plus **headers** (`Host`, `Accept`, `Cookie`...). (Realm 4 goes deep.)
6. **Server work**: routing, authentication, business logic, database queries, maybe calls to other services.
7. **HTTP response**: a status (`200 OK`), headers (`Content-Type`, `Cache-Control`, `Set-Cookie`...) and a body.
8. **Rendering**: the browser parses HTML, fetches CSS, JS and images (more requests), runs JavaScript (which may call APIs), lays out and paints the page.

Caches (browser, **CDN** edge servers, DNS) can answer at several points, which is why a deploy sometimes "doesn't show up" until caches expire.

## inside | Your best friend: the browser's DevTools

Press F12. The **Network** tab shows every request, its status, timing, headers and response. The **Console** shows JavaScript errors. Most frontend bugs are diagnosed here in minutes.

## analogy | Sending a letter

Look up the address (DNS), drive to the building (TCP), the receptionist checks your ID and you check theirs (TLS), you hand over a request form (HTTP request), a clerk processes it (server work) and hands back an envelope (response), and you assemble the documents inside (rendering).
