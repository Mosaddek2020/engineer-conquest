// Realm 7 · Backend: what a backend does, Python, FastAPI, SQL and databases, ORMs and migrations, background jobs.

const fastapiError = (loc, msg, type) => ({ status: 422, body: JSON.stringify({ detail: [{ type, loc, msg }] }, null, 2) + '\n', headers: { 'content-type': 'application/json' } });

const OPENAPI = {
  openapi: '3.1.0', info: { title: 'Bakery Orders API', version: '0.3.0' },
  paths: {
    '/v1/orders': { post: { operationId: 'orders_create', summary: 'Create an order', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderIn' } } } } }, get: { operationId: 'orders_list', summary: 'List orders' } },
    '/v1/orders/{order_id}': { get: { operationId: 'orders_get', summary: 'One order' } },
  },
  components: { schemas: { OrderIn: { type: 'object', required: ['customer_email', 'items'], properties: { customer_email: { type: 'string', format: 'email' }, items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/Item' } }, note: { type: 'string', maxLength: 200 } } }, Item: { type: 'object', required: ['sku', 'qty'], properties: { sku: { type: 'string' }, qty: { type: 'integer', minimum: 1, maximum: 100 } } } } },
};

const ORDERS_LOG = [
  '{"ts":"10:02:11","level":"info","msg":"request","method":"POST","path":"/v1/customers","status":201,"request_id":"a11"}',
  '{"ts":"10:02:13","level":"info","msg":"request","method":"POST","path":"/v1/customers","status":201,"request_id":"a12"}',
  '{"ts":"10:04:40","level":"error","msg":"unhandled exception","method":"POST","path":"/v1/customers","status":500,"request_id":"b7e"}',
  'Traceback (most recent call last):',
  '  File "customers/service.py", line 22, in create_customer',
  '    session.add(Customer(email=data.email.lower(), name=data.name))',
  '  File "sqlalchemy/engine/base.py", line 1967, in _exec_single_context',
  'sqlalchemy.exc.IntegrityError: (asyncpg.exceptions.UniqueViolationError) duplicate key value violates unique constraint "customers_tenant_id_email_key"',
  'DETAIL:  Key (tenant_id, email)=(4f1c..., rina@example.com) already exists.',
  '{"ts":"10:05:02","level":"info","msg":"request","method":"GET","path":"/v1/customers","status":200,"duration_ms":4120,"request_id":"c01"}',
  '{"ts":"10:05:31","level":"info","msg":"request","method":"GET","path":"/v1/customers","status":200,"duration_ms":3980,"request_id":"c02"}',
].join('\n') + '\n';
const EXPLAIN = `EXPLAIN ANALYZE SELECT * FROM customers WHERE tenant_id = '4f1c...' AND phone = '+8801711000000';

 Seq Scan on customers  (cost=0.00..48211.00 rows=1 width=212) (actual time=3911.204..3911.207 rows=1 loops=1)
   Filter: ((tenant_id = '4f1c...'::uuid) AND (phone = '+8801711000000'::text))
   Rows Removed by Filter: 1849903
 Planning Time: 0.112 ms
 Execution Time: 3911.240 ms

-- existing indexes on customers:
--   customers_pkey (id)
--   customers_tenant_id_email_key UNIQUE (tenant_id, email)
`;

export default {
  id: 'backend',
  n: 7,
  title: 'Backend',
  tagline: 'Python and FastAPI, SQL and PostgreSQL, ORMs and migrations, and work that happens in the background',
  badge: 'Backend Builder',
  intro: 'The backend is where the rules live: who may do what, what is valid, what gets stored, and what happens next. Learn the layers of a backend, the **Python** you need for SaaS-Foundation, **FastAPI** (routes, Pydantic validation, dependencies, OpenAPI), **SQL and PostgreSQL** (keys, joins, indexes, transactions), **ORMs and migrations** (SQLAlchemy, Alembic), and **background jobs** that must never be lost.',
  lessons: [
    {
      id: 'backend-basics',
      title: 'What a backend does',
      summary: 'Routing, authentication, validation, business rules, persistence and side effects; thin routes, services and repositories; idempotency.',
      minutes: 15,
      quiz: [
        { type: 'order', q: 'Order what a typical backend does with a "create order" request.', items: ['Route: match POST /v1/orders to a handler', 'Authenticate: who is calling?', 'Validate the input (types, required fields, limits)', 'Authorise: may this user do this, for this tenant?', 'Apply business rules and save in one transaction', 'Queue side effects (emails, webhooks) in the same transaction', 'Return a response (201 + the order)'], explain: 'SaaS-Foundation\'s layers follow this shape exactly.' },
        { type: 'mc', q: 'In SaaS-Foundation\'s module layout, where do business rules go?', choices: ['router.py', 'service.py (routes stay thin; repositories hold queries)', 'models.py', 'The frontend'], answer: 1, explain: 'models → repository → service → router, plus schemas.' },
        { type: 'mc', q: 'A client times out and retries "create payment". How do you avoid charging twice?', choices: ['Hope it doesn\'t happen', 'Idempotency: the client sends a unique key; the server stores it and returns the original result for repeats', 'Disable retries', 'Use GET'], answer: 1, explain: 'Same idea as the outbox\'s dedupe keys.' },
        { type: 'tf', q: 'Validation in the frontend means the backend doesn\'t need to validate.', answer: false, explain: 'Anyone can call the API directly. The backend is the last line of defence.' },
        { type: 'mc', q: 'Why raise domain errors (Invalid, NotFound, Conflict...) from services instead of building HTTP responses there?', choices: ['Style only', 'Services stay independent of HTTP (reusable from the worker or CLI); one handler turns errors into consistent JSON with a stable code', 'It is faster', 'FastAPI requires it'], answer: 1, explain: 'A SaaS-Foundation rule: never HTTPException in services.' },
      ],
    },
    {
      id: 'python',
      title: 'Python for this codebase',
      summary: 'Type hints, dataclasses and Pydantic, exceptions, context managers, async/await, and the uv toolchain.',
      minutes: 20,
      quiz: [
        { type: 'predict', q: 'What does this print?', code: 'def add(item, items=[]):\n    items.append(item)\n    return items\n\nadd(1)\nprint(add(2))', choices: ['[2]', '[1, 2]', '[]', 'An error'], answer: 1, explain: 'The default list is created once and shared between calls: use `items=None`.' },
        { type: 'mc', q: 'What do type hints (`def total(amounts: list[int]) -> int:`) do at runtime?', choices: ['They enforce types', 'Nothing by themselves: tools (mypy, editors) and libraries like Pydantic/FastAPI read them', 'They make code faster', 'They encrypt data'], answer: 1, explain: 'FastAPI uses them to validate requests and generate OpenAPI.' },
        { type: 'mc', q: 'What does `async with db.tenant_session(tid) as session:` guarantee?', choices: ['Nothing special', 'Setup and cleanup always run (the transaction commits or rolls back and the connection is released), even on errors', 'It runs in parallel', 'It skips RLS'], answer: 1, explain: 'Context managers are Python\'s try/finally made reusable.' },
        { type: 'predict', q: 'How long does this take (roughly)?', code: 'async def slow(n):\n    await asyncio.sleep(1)\n    return n\n\nawait asyncio.gather(slow(1), slow(2), slow(3))', choices: ['About 1 second', 'About 3 seconds', '0 seconds', 'It fails'], answer: 0, explain: 'The three waits overlap. But CPU-heavy work (like Argon2 hashing) blocks the loop, which is why SaaS-Foundation runs it in a thread.' },
        { type: 'mc', q: 'SaaS-Foundation manages Python dependencies and virtual environments with:', choices: ['pip install globally', 'uv (workspace, lockfile uv.lock, `make setup`)', 'conda', 'Nothing'], answer: 1, explain: 'One lockfile, reproducible installs.' },
        { type: 'mc', q: 'Which exception style is best?', choices: ['except Exception: pass', 'Catch the specific exception you can handle, add context, and let others propagate', 'Never catch exceptions', 'Return None on every error'], answer: 1, explain: 'Swallowed exceptions are the hardest bugs to find.' },
      ],
    },
    {
      id: 'fastapi',
      title: 'FastAPI: routes, validation and dependencies',
      summary: 'Path operations, Pydantic models and 422 validation errors, Depends() for sessions and permissions, response models, and OpenAPI for free.',
      minutes: 25,
      lab: {
        cwd: '~',
        panels: ['network'],
        setup(H) {
          const st = H.uni.fa = { created: 0 };
          H.site('orders.acme.example.com', {
            '/openapi.json': { body: JSON.stringify(OPENAPI, null, 2) + '\n' },
            '/v1/orders': req => {
              if (req.method === 'GET') return { body: '[]\n' };
              if (req.method !== 'POST') return { status: 405, body: '{"detail":"Method Not Allowed"}\n' };
              let d; try { d = JSON.parse(req.body || ''); } catch { return fastapiError(['body'], 'JSON decode error', 'json_invalid'); }
              if (!d.customer_email) return fastapiError(['body', 'customer_email'], 'Field required', 'missing');
              if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.customer_email)) return fastapiError(['body', 'customer_email'], 'value is not a valid email address', 'value_error');
              if (!Array.isArray(d.items) || !d.items.length) return fastapiError(['body', 'items'], 'List should have at least 1 item after validation, not 0', 'too_short');
              for (const [k, i] of d.items.entries()) {
                if (!Number.isInteger(i.qty)) return fastapiError(['body', 'items', k, 'qty'], 'Input should be a valid integer', 'int_type');
                if (i.qty < 1) return fastapiError(['body', 'items', k, 'qty'], 'Input should be greater than or equal to 1', 'greater_than_equal');
                if (i.qty > 100) return fastapiError(['body', 'items', k, 'qty'], 'Input should be less than or equal to 100', 'less_than_equal');
              }
              st.created++;
              return { status: 201, body: JSON.stringify({ id: 500 + st.created, customer_email: d.customer_email.toLowerCase(), items: d.items, status: 'open' }, null, 2) + '\n', headers: { 'content-type': 'application/json', location: `/v1/orders/${500 + st.created}` } };
            },
          });
        },
        suggestions: ['curl -s https://orders.acme.example.com/openapi.json | jq ".components.schemas.OrderIn"'],
        tasks: [
          { title: 'FastAPI generates `/openapi.json` from the Python types. Read the request schema: `curl -s https://orders.acme.example.com/openapi.json | jq ".components.schemas.OrderIn"`', solution: 'curl -s https://orders.acme.example.com/openapi.json | jq ".components.schemas.OrderIn"', check: t => t.ran(/openapi\.json.*\|\s*jq\b.*OrderIn/) },
          { title: 'POST an order with no email (`-d \'{"items":[{"sku":"bun","qty":2}]}\'`, JSON content type) and read the 422: `loc` says exactly which field', solution: `curl -i -X POST -H "Content-Type: application/json" -d '{"items":[{"sku":"bun","qty":2}]}' https://orders.acme.example.com/v1/orders`, check: t => t.events('http').some(e => /\/v1\/orders/.test(e.url) && e.method === 'POST' && e.status === 422) },
          { title: 'Send a quantity of 500 for one item. Which rule fires, and what is the `loc` path?', solution: `curl -s -X POST -H "Content-Type: application/json" -d '{"customer_email":"rina@example.com","items":[{"sku":"bun","qty":500}]}' https://orders.acme.example.com/v1/orders | jq`, check: t => t.events('http').filter(e => /\/v1\/orders/.test(e.url) && e.method === 'POST' && e.status === 422).length >= 2 },
          { title: 'Now create a valid order and get a 201', solution: `curl -i -X POST -H "Content-Type: application/json" -d '{"customer_email":"Rina@Example.com","items":[{"sku":"bun","qty":2}]}' https://orders.acme.example.com/v1/orders`, check: t => (t.uni.fa?.created || 0) >= 1 },
        ],
      },
      quiz: [
        { type: 'mc', q: 'In FastAPI, a Pydantic model as a route parameter (`data: OrderIn`) means:', choices: ['Nothing', 'The JSON body is parsed and validated against the model; invalid input gets an automatic 422 with details', 'The data is saved', 'The client must be logged in'], answer: 1, explain: 'Validation and docs from one type.' },
        { type: 'mc', q: 'What is `Depends()` used for in SaaS-Foundation routes?', choices: ['Styling', 'Injecting things a route needs: a tenant-scoped DB session (`get_session`), the current user, a permission check (`require("x.y")`)', 'Importing modules', 'Running tests'], answer: 1, explain: 'Dependencies are reusable, testable building blocks.' },
        { type: 'predict', q: 'What happens when a user without the permission calls this route?', code: '@router.post("/{org_id}/invites")\nasync def create_invite(\n    data: InviteIn,\n    principal: Principal = Depends(require("organizations.invite")),\n    session: AsyncSession = Depends(get_session),\n): ...', choices: ['The invite is created', '403 Forbidden before the function body runs', '500', '422'], answer: 1, explain: 'The dependency raises Forbidden; the handler never runs.' },
        { type: 'mc', q: '`response_model=OrderOut` on a route:', choices: ['Is decoration', 'Filters and validates what is returned, so internal fields (like password_hash) never leak, and documents the response', 'Speeds up the route', 'Is required for GET'], answer: 1, explain: 'Separate input and output schemas.' },
        { type: 'tf', q: 'Because FastAPI validates input, you never need to check business rules (like "only owners can invite admins") yourself.', answer: false, explain: 'Types catch shape problems; rules about who and what live in services.' },
      ],
    },
    {
      id: 'databases-sql',
      title: 'Databases and SQL',
      summary: 'Tables, primary and foreign keys, SELECT/INSERT/UPDATE/DELETE, joins, indexes and EXPLAIN, transactions and ACID, and unique constraints.',
      minutes: 25,
      quiz: [
        { type: 'predict', q: 'How many rows does this return?', code: 'orders:   (id, customer_id)  = (1, 10), (2, 10), (3, 11)\ncustomers: (id, name)        = (10, Rina), (11, Karim), (12, Lia)\n\nSELECT c.name, o.id\nFROM customers c\nJOIN orders o ON o.customer_id = c.id;', choices: ['2', '3', '4', '6'], answer: 1, explain: 'An inner join keeps only matching pairs: Rina twice, Karim once. Lia has no orders.' },
        { type: 'predict', q: 'And with a LEFT JOIN?', code: 'SELECT c.name, o.id\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id;', choices: ['3', '4 (Lia appears with NULL)', '6', '2'], answer: 1, explain: 'LEFT JOIN keeps every customer.' },
        { type: 'mc', q: 'A primary key vs a foreign key:', choices: ['Same', 'A primary key uniquely identifies a row; a foreign key references another table\'s key (and can enforce that the row exists)', 'Foreign keys are for other countries', 'Primary keys are optional'], answer: 1, explain: 'SaaS-Foundation avoids foreign keys *between modules* (plain UUIDs) to keep modules independent.' },
        { type: 'mc', q: 'A query takes 4 seconds and EXPLAIN shows "Seq Scan ... Rows Removed by Filter: 1,849,903". The usual fix:', choices: ['A bigger server', 'An index on the filtered columns, e.g. (tenant_id, phone)', 'Restart PostgreSQL', 'Cache the page'], answer: 1, explain: 'Indexes turn full scans into lookups. Check query cost before calling backend work done.' },
        { type: 'mc', q: 'What does a transaction guarantee?', choices: ['Speed', 'All statements inside it succeed together or none do (atomicity), with consistent, isolated, durable results (ACID)', 'Encryption', 'Backups'], answer: 1, explain: 'That is why SaaS-Foundation writes audit entries and outbox jobs in the same transaction as the change.' },
        { type: 'mc', q: 'Two requests create the same customer email at the same moment. What reliably prevents duplicates?', choices: ['Checking with SELECT first', 'A UNIQUE constraint in the database (and handling the violation as a 409)', 'A comment in the code', 'Frontend validation'], answer: 1, explain: 'Check-then-insert races; the database constraint does not.' },
        { type: 'predict', q: 'What is wrong?', code: 'UPDATE accounts SET balance = balance - 500;', choices: ['Nothing', 'No WHERE clause: every account loses 500', 'Syntax error', 'It needs ORDER BY'], answer: 1, explain: 'Always write the WHERE first. In SaaS-Foundation, RLS would at least confine it to one tenant.' },
      ],
    },
    {
      id: 'orm-migrations',
      title: 'ORMs and migrations',
      summary: 'SQLAlchemy models and sessions, async queries, Alembic migrations per module, model/migration drift tests, and safe schema changes.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'What does an ORM like SQLAlchemy do?', choices: ['Replaces the database', 'Maps tables to Python classes and builds parameterised SQL for you (no string-built queries)', 'Makes SQL unnecessary to understand', 'Encrypts data'], answer: 1, explain: 'You still need SQL to understand what it does (and what it costs).' },
        { type: 'mc', q: 'A migration is:', choices: ['Moving servers', 'A versioned script that changes the database schema (create table, add column...) the same way in every environment', 'A backup', 'A data export'], answer: 1, explain: 'SaaS-Foundation: Alembic, one branch per module.' },
        { type: 'mc', q: 'You add a NOT NULL column to a table that already has rows. What must the migration include?', choices: ['Nothing', 'A server_default (or a backfill) so existing rows get a value', 'A DROP TABLE', 'An index'], answer: 1, explain: 'SaaS-Foundation\'s upgrade test fails without it.' },
        { type: 'multi', q: 'Migration rules on a shared project:', choices: ['Never edit a migration that is already merged: add a new one', 'Every model change ships with its migration', 'New tenant tables call enable_rls(...)', 'Write migrations by hand only if CI is down'], answer: [0, 1, 2], explain: 'A drift test fails if models and migrations disagree.' },
        { type: 'predict', q: 'A route loads 50 organizations and, for each, runs `session.get(Owner, org.owner_id)`. How many queries?', code: 'orgs = await repo.list(limit=50)\nfor org in orgs:\n    owner = await session.get(User, org.owner_id)', choices: ['1', '2', '51', '50'], answer: 2, explain: 'The N+1 problem: load related rows in one query (WHERE id IN (...), or a join).' },
        { type: 'tf', q: 'In SaaS-Foundation, a repository extends BaseRepository, which filters by the current tenant in addition to row-level security.', answer: true, explain: 'Two layers: code mistakes fail visibly, and the database still refuses.' },
      ],
    },
    {
      id: 'background-jobs',
      title: 'Background jobs and the outbox',
      summary: 'Work that must not slow down or fail the request, the transactional outbox, workers, retries with backoff, at-least-once delivery and idempotent handlers.',
      minutes: 15,
      quiz: [
        { type: 'mc', q: 'Why not send the welcome email directly inside the signup request?', choices: ['Emails are illegal', 'The provider may be slow or down: the request would hang or fail; and if the transaction rolls back you\'d have emailed about an account that doesn\'t exist', 'Python can\'t send email', 'It is too fast'], answer: 1, explain: 'Queue it; let a worker send it.' },
        { type: 'mc', q: 'The transactional outbox pattern means:', choices: ['Emails are stored in Outlook', 'The job is written to a table in the SAME transaction as the business change, so it exists if and only if the change committed; a worker delivers it', 'A separate message broker is required', 'Jobs run in the browser'], answer: 1, explain: 'SaaS-Foundation\'s `jobs` table is the outbox; `notify()` uses it.' },
        { type: 'mc', q: '"At-least-once delivery" means handlers must be:', choices: ['Fast', 'Idempotent: running twice has the same effect as once', 'Written in Go', 'Synchronous'], answer: 1, explain: 'A worker can crash after doing the work but before marking it done.' },
        { type: 'order', q: 'Order what happens when a delivery keeps failing.', items: ['Worker claims the job and the handler raises', 'The failure is recorded; the job is rescheduled with backoff (5 s, 10 s, 20 s...)', 'Retries continue up to the maximum attempts', 'The job is dead-lettered for a human to inspect'], explain: 'Retries for temporary failures; dead letters for permanent ones.' },
        { type: 'mc', q: 'Two workers grab the same delivery at the same moment. SaaS-Foundation prevents a double send with:', choices: ['Luck', 'A row lock (SELECT ... FOR UPDATE) on the delivery, and never re-sending a delivery that is already final', 'A sleep', 'One worker only'], answer: 1, explain: 'A concurrency test proves it, and removing the lock makes the test fail.' },
      ],
    },
    {
      id: 'backend-boss',
      title: 'Boss: The 500 and the slow page',
      summary: 'Production shows 500s on customer signup and a customer list that takes 4 seconds. Find both causes from the evidence and write the fixes a reviewer would approve.',
      minutes: 25,
      boss: true,
      lab: {
        cwd: '~/incident',
        panels: ['files'],
        setup(H) {
          H.write('laptop', '~/incident/orders-api.log', ORDERS_LOG, { owner: 'dev' });
          H.write('laptop', '~/incident/explain.txt', EXPLAIN, { owner: 'dev' });
          H.write('laptop', '~/incident/service.py', `async def create_customer(session, data):\n    # check first, then insert\n    if await repo.by_email(data.email):\n        raise Conflict("A customer with this email already exists", code="email_taken")\n    session.add(Customer(email=data.email.lower(), name=data.name))\n`, { owner: 'dev' });
        },
        suggestions: ['grep -n \'"status":500\' orders-api.log', 'cat explain.txt'],
        tasks: [
          { title: 'Find the 500 in the log and the exception right after it', solution: "grep -n -A6 '\"status\":500' orders-api.log", check: t => t.ran(/\bgrep\b.*(500|error|Traceback).*orders-api\.log/i) },
          { title: 'Read `service.py`: it checks for a duplicate first. How can a duplicate still reach the database? (think: two requests at once, or "Rina@" vs "rina@")', solution: 'cat service.py', check: t => t.ran(/\b(cat|less|head)\b.*service\.py/) },
          { title: 'Find the slow requests in the log (`duration_ms` in the thousands)', solution: "grep -n duration_ms orders-api.log", check: t => t.ran(/\bgrep\b.*duration_ms.*orders-api\.log/) },
          { title: 'Read the query plan in `explain.txt`. What kind of scan, how many rows thrown away, and which index is missing?', solution: 'cat explain.txt', check: t => t.ran(/\b(cat|less|head)\b.*explain\.txt/) },
          { title: 'Write `~/fixes.md`: (1) the 500: the cause and the fix (catch the unique violation and return 409, and compare emails case-insensitively) and (2) the slow list: the index to add', solution: 'printf "%s\\n" "1. 500 on POST /v1/customers: IntegrityError, a UniqueViolation on (tenant_id, email). The check-then-insert races, and by_email compares Rina@ and rina@ differently. Fix: lower-case the email before the check, keep the UNIQUE constraint, catch the IntegrityError and return 409 email_taken; add a test with two concurrent creates." "2. GET /v1/customers takes 4 s: Seq Scan removing 1.8M rows for tenant_id + phone. Fix: a migration adding CREATE INDEX ix_customers_tenant_phone ON customers (tenant_id, phone); check EXPLAIN shows an Index Scan." > ~/fixes.md', check: t => { const s = (t.file('laptop', '/home/dev/fixes.md') || '').toLowerCase(); return /409/.test(s) && /(integrity|unique)/.test(s) && /index/.test(s) && /phone/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why is "check, then insert" not enough to prevent duplicates?', choices: ['It is enough', 'Two requests can both pass the check before either inserts (a race); only the database constraint is atomic', 'SELECT is slow', 'Python is single-threaded'], answer: 1, explain: 'Keep the check for a nice message; rely on the constraint for correctness.' },
        { type: 'mc', q: 'Which status should a duplicate email produce?', choices: ['500', '409 Conflict with a stable code like email_taken', '200', '404'], answer: 1, explain: 'It is the client\'s data, not a server crash.' },
        { type: 'multi', q: 'Before shipping the index, also:', choices: ['Add it in a new migration in the module\'s branch', 'Confirm with EXPLAIN that the plan uses it', 'Consider building it CONCURRENTLY on a big production table', 'Drop the primary key'], answer: [0, 1, 2], explain: 'Correctness and scale, verified.' },
        { type: 'mc', q: 'Rina@Example.com and rina@example.com: why must emails be compared case-insensitively before the uniqueness check?', choices: ['Style', 'Otherwise the check misses an existing account, the insert hits the unique constraint, and users get a 500 (or worse, duplicates if the constraint is case-sensitive too)', 'Postgres requires it', 'Emails are always lowercase'], answer: 1, explain: 'Normalise input once, early.' },
        { type: 'mc', q: 'How do you prove the duplicate-email fix works under concurrency?', choices: ['Try it once by hand', 'A test that sends two creates at the same time and expects one 201 and one 409', 'Read the code', 'Deploy and watch'], answer: 1, explain: 'Races need tests that race.' },
      ],
    },
  ],
};
