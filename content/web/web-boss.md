## story | Three tickets before coffee

Support has escalated three sites as "down". Rumana: "Before anyone restarts anything, tell me *which layer* is broken for each one. The fix is completely different for each."

## model | Debug by layer

1. **Name**: does it resolve? (`dig`, curl exit code 6)
2. **Connection**: does a TCP connection open? (`nc -zv host port`; "refused" vs timeout)
3. **HTTP**: what status and body come back? (`curl -i`)
4. **Application**: errors in the body and logs (request ids connect the two).

## lab | Diagnose and report

Investigate all three, then write a report the right teams can act on immediately.
