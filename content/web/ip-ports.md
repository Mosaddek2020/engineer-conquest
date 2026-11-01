## story | "The database is down!" (it wasn't)

A new engineer couldn't connect to the database and announced an outage. The database was fine: it only listened on `localhost`, so it was reachable from its own server and nowhere else (exactly as intended). The error said "Connection refused": the machine answered, but nothing was listening for *him* on that address and port.

## model | Addresses, ports and TCP

- An **IP address** identifies a machine on a network: `10.0.0.11`, or `127.0.0.1` (**localhost**: the machine itself).
- A **port** (0-65535) identifies a program on that machine. Well-known ports: **22** SSH, **53** DNS, **80** HTTP, **443** HTTPS, **5432** PostgreSQL.
- A program **listens** (binds) on an address and port; a client **connects** to it.
- **TCP** gives reliable, ordered delivery (HTTP/1.1 and HTTP/2 run on it). **UDP** just sends packets (DNS, video calls, and HTTP/3's QUIC).

**Reading connection errors:**

| Error | Means |
|---|---|
| Could not resolve host | DNS: no address for that name |
| Connection refused | the host answered, but nothing listens on that port (for you) |
| Timed out | no answer: firewall, wrong address, host down |
| An HTTP status (404, 500...) | networking worked; the application answered |

## analogy | An office building

The IP address is the building's street address. Ports are the office numbers inside. "Refused" is a receptionist saying "nobody works in office 5432"; a timeout is a building with the doors locked and nobody answering at all.

## traps | Traps

- Binding a dev server to `127.0.0.1` and wondering why a teammate can't reach it (or, worse, binding a database to `0.0.0.0` on the public internet).
- Two programs on the same port: "address already in use".
- Mixing up the port in the URL (`:8080`) with the server's actual listening port.

## lab | Who is listening?

Look at your own addresses, probe ports on the shop server, and see how the port in a URL changes where you land.
