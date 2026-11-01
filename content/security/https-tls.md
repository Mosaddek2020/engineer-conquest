## story | The coffee-shop Wi-Fi

In 2010 a browser extension called Firesheep let anyone on a café's Wi-Fi click a button and take over other customers' Facebook and Twitter sessions: those sites only used HTTPS for the login page, and session cookies travelled in plain text. Within months, the big sites moved everything to HTTPS. Today, plain HTTP for anything with a login is simply a vulnerability.

## model | HTTP vs HTTPS

**HTTP** sends everything (URLs, headers, cookies, passwords, bodies) as readable text. Anyone between you and the server (Wi-Fi owner, ISP, a compromised router) can read *and change* it.

**HTTPS** is HTTP inside **TLS**, which gives three guarantees:

1. **Confidentiality**: the traffic is encrypted.
2. **Integrity**: tampering is detected.
3. **Server authentication**: the server proves it is really `acme.example.com`.

It does **not** prove the site is honest, or that its code has no bugs.

**Certificates**: the server presents a certificate saying "this key belongs to acme.example.com", signed by a **certificate authority** (CA) the client trusts. Clients check three things:

| Check | Fails as |
|---|---|
| Trust: signed by a known CA (chain) | "self-signed certificate", "unable to get local issuer" |
| Time: within notBefore/notAfter | "certificate has expired" |
| Name: matches the host you asked for | "no alternative certificate subject name matches" |

Let's Encrypt issues free 90-day certificates automatically; expiring certificates are one of the most common causes of outages, so renewal must be automated and monitored.

## analogy | A passport at the border

The certificate is a passport. The CA is the government that issued it. The border officer (your browser) checks that the passport is from a recognised government (trust), not expired (time) and that the photo matches the person in front of them (name). `curl -k` is the officer waving everyone through without looking.

## traps | Traps

- **`curl -k` / `verify=False` in code.** It "fixes" the error by turning off the protection. Fix the certificate.
- **Mixed content**: an HTTPS page loading scripts over HTTP: the browser blocks them (or worse, an attacker swaps them).
- **Secrets in URLs**: TLS hides the path on the wire, but servers, proxies and browser history still log it.
- Forgetting renewal monitoring.

## lab | Four certificates, three ways to fail

Four sites run HTTPS. Only one is healthy. Find out exactly what is wrong with each of the others.
