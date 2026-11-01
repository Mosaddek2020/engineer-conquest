## story | Two alerts on a Monday

Monitoring shows a handful of 500s on `POST /v1/customers` and the customer list page taking around four seconds for one large tenant. Rumana: "Different problems, probably. Find the cause of each from the evidence, and write fixes I'd approve in review: no 'just restart it'."

## model | From evidence to fix

1. **Find the failing request** in the logs (status, request id).
2. **Read the exception** at the bottom of the traceback; connect it to the code.
3. Ask **"how could the code's own check be bypassed?"** (races, case differences).
4. For slowness: **read the query plan**. *Seq Scan* plus millions of rows removed = missing index.
5. Fixes come **with tests or verification** (a concurrent-create test; EXPLAIN showing an index scan).

## lab | Diagnose and write the fixes

The incident folder has the API log, the service code and a query plan.
