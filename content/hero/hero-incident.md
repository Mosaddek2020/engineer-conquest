## story | Friday, 16:45

Friday afternoon, Acme Bakery's support line lights up: nobody can log in. "Too many requests", the app says, even for people who haven't tried in days. Nothing in the application was deployed this week. Rumana is on a plane. You are on call.

## model | Bring every realm

- **HTTP**: status codes and headers tell you which part answered and why (429, `Retry-After`, request ids).
- **Logs**: structured fields (`client_ip`, `status`) show patterns at a glance.
- **What changed?** Code, config, infrastructure, data.
- **Security model**: per-IP limits and lockouts rely on knowing the *real* client IP, which behind a proxy only works if the proxy is **trusted**.
- **Fix, verify, write it up** blamelessly, with a follow-up that stops it happening again.

## lab | Handle the incident

Reproduce, investigate, fix, verify, and write the postmortem.
