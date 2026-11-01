## story | Launch on Monday

A tenant's new storefront launches on Monday with a marketing campaign. Rumana asks you for a quick pre-launch security audit: "Not a penetration test. Check the basics a customer, a browser and an auditor would check, and give me a prioritised list."

## model | A basic external audit

1. **TLS**: valid, trusted, correct name, and *how long until it expires* (is renewal automatic?).
2. **Redirects**: does `http://` go to `https://` (301)?
3. **Headers**: HSTS, CSP, frame protection, nosniff, referrer policy; no version leaks.
4. **Cookies**: `HttpOnly`, `Secure`, `SameSite` on session cookies.
5. **Report**: findings with severity, impact and fix, most urgent first.

## lab | Audit store.example.com

Gather the evidence with curl and openssl, then write the findings.
