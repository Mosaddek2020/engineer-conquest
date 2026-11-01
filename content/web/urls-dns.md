## story | The typo that "broke" the internet

A support ticket said the docs site was down. It wasn't: the ticket linked to `docs.examples.com` (with an extra "s"), a name that doesn't exist. Five minutes with `dig` saved an hour of restarting servers that were fine.

## model | Anatomy of a URL

```
https://acme.example.com:8443/v1/orders?status=open#top
└─┬─┘   └──────┬───────┘ └┬─┘└───┬───┘ └────┬────┘ └┬┘
scheme       host       port  path      query   fragment
```

- **scheme**: `http` or `https` (also the default port: 80 or 443).
- **host**: a name (looked up in DNS) or an IP address.
- **path**: which resource on that server.
- **query**: extra parameters (`key=value&key2=value2`). Never put secrets here: query strings end up in logs and browser history.
- **fragment**: a place inside the page. It is *not* sent to the server.

## model | DNS: names to addresses

Computers connect to **IP addresses** (`203.0.113.10`); people remember **names**. **DNS** (the Domain Name System) translates. Your machine checks `/etc/hosts` and its caches, then asks a DNS resolver, which asks the servers responsible for `example.com`.

- An **A record** maps a name to an IPv4 address (AAAA for IPv6); a **CNAME** points one name at another.
- Records are **cached** for their TTL, which is why DNS changes take time to spread.
- `dig +short name` asks DNS directly.

## inside | Why the host name matters in multi-tenant apps

In SaaS-Foundation, `acme.example.com` and `globex.example.com` can point to the same servers. The backend reads the **host** of each request to decide which **tenant** it is for, and a security fix in 2026 made sure that host must be a clean `hostname[:port]`: a crafted Host header once made password-reset emails link to an attacker's site. Host names are input like any other.

## analogy | A phone book and extensions

DNS is the phone book: it turns "Acme Bakery" into a number. The IP address is the building's number; the port (next lesson) is the extension; the path is which document to fetch once someone picks up.

## lab | Names and addresses

Look up names, reach the same server by name and by address, and see what failure looks like when a name doesn't exist.
