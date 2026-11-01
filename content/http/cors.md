## story | "Just set it to *"

A new developer hit a red CORS error in the browser console and found a forum answer: add `Access-Control-Allow-Origin: *`. The error went away. A security reviewer later explained what else had gone away: the browser's protection that stops any random website from reading the API's responses with the user's session.

## model | Origins and the same-origin policy

An **origin** is **scheme + host + port**: `https://acme.example.com` and `https://api.acme.example.com` are different origins, and so are `http://` and `https://` versions of the same host.

The browser's **same-origin policy**: JavaScript on a page from origin A can *send* requests to origin B, but it can't *read* the responses unless B allows it.

**CORS** (cross-origin resource sharing) is how B allows it, with response headers:

- `Access-Control-Allow-Origin: https://acme.example.com` (a specific origin, never `*` with credentials)
- `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers` (for **preflight** responses)
- `Vary: Origin` (so caches don't mix up answers for different origins)

**Preflight**: for "non-simple" requests (JSON bodies, custom headers like `Authorization`), the browser first sends `OPTIONS` with `Origin` and `Access-Control-Request-Method`. If the answer doesn't allow it, the real request is never sent.

## inside | CORS is a browser rule, not a firewall

curl, scripts and attackers' servers ignore CORS entirely. CORS protects *users* (it stops malicious websites from using their browser session to read your API); it does not protect your API from direct requests. Authentication and authorisation do that.

SaaS-Foundation allows an origin only if it is a configured platform origin, or a hostname of the **same tenant** the request is for, and never sends credentials headers. The operator API accepts platform origins only.

## analogy | The bouncer who checks where you came from

The browser is a bouncer standing between web pages and APIs. A page from one club can shout an order across the street to another club, but the bouncer only lets the answer back in if the other club has put this club on its guest list.

## lab | Play the browser

curl doesn't enforce CORS, but you can imitate exactly what a browser sends and read what the server answers.
