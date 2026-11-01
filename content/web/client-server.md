## story | One click, four machines

An Acme Bakery customer taps "Menu" on her phone. Her **browser** (the client) asks a **web server** for a page. The server's **backend** code checks which bakery this is, asks the **database** for today's items, and answers. The browser draws the page and runs a little **JavaScript** that asks an **API** for prices. Four machines, a dozen messages, under a second. Every web app you will work on is a variation of this conversation.

## model | The client-server conversation

- A **client** sends a **request**; a **server** sends back a **response**. The client always speaks first.
- **Frontend**: the code that runs on the user's device (HTML for structure, CSS for looks, JavaScript for behaviour). In SaaS-Foundation: `apps/web` (Next.js and React).
- **Backend**: code on servers you control: authentication, permissions, validation, business rules, talking to the database. In SaaS-Foundation: the FastAPI modules in `modules/`.
- **Database**: where data lives (PostgreSQL in SaaS-Foundation). Only the backend talks to it.
- **API** (application programming interface): the backend's menu of requests it accepts, usually returning **JSON**.

```
browser  ──HTTP──>  web server / backend  ──SQL──>  database
   ↑  HTML, CSS, JS, JSON  │
   └───────────────────────┘
```

## analogy | A restaurant

The customer (client) never walks into the kitchen. She orders from a waiter (the API) using a menu (the API's documentation). The kitchen (backend) decides what's possible, checks the order and cooks from the pantry (database). The plate that arrives (the response) is all the customer sees.

## team | Who owns what

On many teams, frontend and backend engineers specialise but share the **API contract**: the requests, responses and error codes both sides agree on. SaaS-Foundation generates a typed **SDK** from the backend's OpenAPI description, so the frontend can't call an endpoint that doesn't exist or misread a field.

## traps | Traps

- **Trusting the client.** Anything the browser sends can be faked. Prices, permissions and validation are enforced on the backend, always.
- Putting secrets in frontend code: everything sent to the browser is public.

## lab | Be the browser

Use `curl` to make the same requests a browser makes when it opens the bakery's site.
