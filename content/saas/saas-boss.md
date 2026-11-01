## story | The security questionnaire

A large client sends a 200-question security questionnaire before signing. Question 47: "Describe how you prevent other customers from accessing our data, and provide evidence." Rumana: "Let's not answer with adjectives. Run the tests yourself and write down exactly what you sent and what came back."

## model | Defence in depth, verified

- **Edge**: the tenant comes from a validated host; client-supplied tenant headers are ignored unless from trusted proxies.
- **Application**: sessions and tokens are bound to their tenant; permissions per route.
- **Database**: RLS filters every query and fails closed.
- **Evidence**: requests and responses, plus the CI tests that check the same properties on every change.

## lab | Test isolation from the outside

Use Acme's token against Acme and Globex, try to choose a tenant with a header, and write the evidence.
