// An ILLUSTRATIVE miniature of the SaaS-Foundation repository, written for this course. It mirrors the real
// layout and patterns (modules, ports, row-level security, middleware, tests) in simplified code. It is not a
// copy of the real, private codebase: interns explore the real repository on their own machines.

export const MINI = {
  'README.md': `# SaaS-Foundation (course miniature)

Plug-and-play modules for multi-tenant SaaS products: FastAPI modules, a token-driven design system, and a
generated SDK. A product is a list of modules.

    make setup && make check

Start with CLAUDE.md (the rules) and docs/HANDOFF.md (the state of things).
`,
  'CLAUDE.md': `# Rules for engineers and AI agents

Finish every task with \`make check\`.

## Hard rules (CI enforces the first three)
1. Modules never import each other. Talk through ports (foundation_core), events, or HTTP.
2. foundation_core imports no module.
3. Packages never import from apps/.
4. Every table with tenant data uses TenantScoped, and its migration calls enable_rls("<table>").
5. Permissions are "<module>.<verb>", declared in the module manifest.
6. Raise DomainError subclasses from services, never HTTPException.
7. Side effects that must not be lost (emails, webhooks) go through the outbox: notify(...) or publish_durable(...).
8. Secrets go in the vault, never in settings, logs or code.

## Commands
- Everything CI runs: make check
- Tests: make test (starts its own PostgreSQL)
- Import boundaries: make contracts
`,
  'Makefile': `setup:      ## install everything
\tuv sync && pnpm install
test:       ## backend tests on a real PostgreSQL
\tcd apps/api && pytest -q -n auto
contracts:  ## modules never import each other
\tlint-imports
sdk:        ## regenerate OpenAPI + the TypeScript SDK (commit the result)
\tpnpm sdk
check: test contracts   ## everything CI runs
\tpnpm typecheck && pnpm sdk:check
dev-db:     ## local PostgreSQL in Docker, migrated
\tdocker compose up -d --wait db && $(MAKE) migrate
api:        ## dev server
\tuvicorn main:app --reload
worker:     ## background jobs (emails, webhooks)
\tpython manage.py worker
`,
  'docs/HANDOFF.md': `# Handoff

State: Milestones 0 and 1 are done (notifications, auth with MFA and OIDC, hardening).
Milestone 2 is scaffolded for an intern: docs/intern/README.md and docs/intern/tasks/.
`,
  'docs/intern/tasks/00-warmup-members.md': `# 00 · Warm-up: member list with names

GET /v1/organizations/{org_id}/members returns only user_id and role. Make it also return name and email.

Rule to learn: organizations must NOT import auth. Use the user_directory port.

Steps:
1. Add get_many(session, ids) to the UserDirectory port; implement it in auth with ONE query.
2. Add name and email to MemberOut; fill them in list_members.
3. Tests; make sdk; make check; open a draft PR.
`,
  'apps/api/main.py': `"""A product = a list of modules."""
from foundation_core import create_app
from foundation_tenants import module as tenants
from foundation_auth import module as auth
from foundation_organizations import module as organizations
from foundation_notifications import module as notifications

app = create_app([tenants, auth, organizations, notifications])
`,
  'python/foundation-core/src/foundation_core/app.py': `"""create_app assembles a product from modules."""


class TenantMiddleware:
    """Resolve the tenant from the host BEFORE any route runs."""

    async def dispatch(self, request, call_next):
        host = request_host(request)            # validated hostname[:port], or "" when malformed
        if not host:
            return problem(400, "invalid_host", "The Host header is not a valid hostname")
        ctx = await request.app.state.tenant_resolver(host.split(":")[0])
        if ctx is None:
            return problem(404, "unknown_tenant", "No tenant is configured for this host")
        token = set_tenant(ctx)                 # every DB session in this request is bound to ctx
        try:
            return await call_next(request)
        finally:
            reset_tenant(token)


def create_app(modules, settings=None):
    app = FastAPI()
    for module in resolve_order(modules):     # dependency order from each manifest
        if module.setup:
            module.setup(app)                   # modules install their ports here
        if module.router:
            app.include_router(module.router, prefix=f"/v1/{module.name}")
    # outermost first: RequestContext -> CORS -> Tenant -> rate limits -> routes
    app.add_middleware(TenantMiddleware)
    app.add_middleware(CorsMiddleware)
    app.add_middleware(RequestContextMiddleware)
    return app
`,
  'python/foundation-core/src/foundation_core/db.py': `"""Tenant isolation enforced by PostgreSQL, not by discipline."""


def rls_statements(table):
    """SQL for every tenant table's migration. Fails closed: no tenant set -> no rows."""
    expr = "tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid"
    return [
        f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY',
        f'ALTER TABLE "{table}" FORCE ROW LEVEL SECURITY',
        f'CREATE POLICY tenant_isolation ON "{table}" USING ({expr}) WITH CHECK ({expr})',
    ]


class Database:
    @asynccontextmanager
    async def tenant_session(self, tenant_id):
        async with self._sessions() as session, session.begin():
            # is_local=true: the setting lives only for this transaction
            await session.execute(text("SELECT set_config('app.tenant_id', :t, true)"), {"t": str(tenant_id)})
            yield session

    async def assert_rls_enforced(self):
        """At startup: refuse a database role that could bypass row-level security."""
        if (await self.current_role()).superuser_or_bypassrls:
            raise RuntimeError("Connect the app with a plain role; use an owner role for migrations.")


async def get_session(request):
    """Route dependency: a session already bound to the request's tenant."""
    async with request.app.state.db.tenant_session(current_tenant_id()) as session:
        yield session
`,
  'python/foundation-core/src/foundation_core/ports.py': `"""Ports: contracts that one module installs and any module may call, so nobody imports anybody."""


async def notify(app, session, template, *, to, data=None):
    """Queue a message in the CALLER'S transaction; the worker sends it. Installed by notifications."""
    notifier = app.state.notifier
    if notifier is None:
        raise DomainError("This product needs the notifications module", code="no_notifier")
    return await notifier(session, template, to=to, data=data or {})


class UserDirectory(Protocol):
    """Read-only lookups of the current tenant's users, for modules that must not import auth."""

    async def get(self, session, user_id): ...
    async def by_email(self, session, email): ...


def user_directory(app):
    return app.state.user_directory            # installed by the auth module
`,
  'modules/CLAUDE.md': `# Modules

Layout: models.py (tables) -> repository.py (queries) -> service.py (rules) -> router.py (HTTP),
plus schemas.py (the API contract) and __init__.py exporting  module = define_module(...).

- Another module's data is reached by port or event, never by import or foreign key.
- Routes stay thin: validate, call the service, return a schema.
- A new route needs a test; a new tenant table needs enable_rls in its migration.
`,
  'modules/notifications/src/foundation_notifications/__init__.py': `"""Notifications: other modules send with the core port notify(...)."""
from foundation_core import define_module

module = define_module(
    name="notifications",
    version="0.1.0",
    router=router,
    depends_on=("jobs", "settings", "tenants"),
    permissions=("notifications.read", "notifications.manage"),
    tenant_grants={"owner": ("notifications.read", "notifications.manage"),
                   "admin": ("notifications.read", "notifications.manage")},
    models="foundation_notifications.models",
    migrations=Path(__file__).parent / "migrations" / "versions",
    setup=_setup,                 # installs app.state.notifier: the implementation of the notify() port
)
`,
  'modules/notifications/src/foundation_notifications/models.py': `class Delivery(Base, TenantScoped, Timestamped):
    """One message to one recipient. data is wiped once the delivery is final (it may hold one-time links)."""

    __tablename__ = "notification_deliveries"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    template: Mapped[str] = mapped_column(String(200))
    to_address: Mapped[str] = mapped_column(String(320))
    status: Mapped[str] = mapped_column(String(16), default="queued")
    attempts: Mapped[int] = mapped_column(Integer, default=0)
`,
  'modules/notifications/src/foundation_notifications/migrations/versions/0001_initial.py': `revision = "notifications_0001"
down_revision = None
branch_labels = ("notifications",)        # each module owns its own Alembic branch


def upgrade():
    op.create_table(
        "notification_deliveries",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("tenant_id", sa.Uuid(), nullable=False, index=True),
        sa.Column("template", sa.String(200), nullable=False),
        sa.Column("to_address", sa.String(320), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    enable_rls("notification_deliveries")    # a test fails if a tenant table forgets this
`,
  'modules/notifications/src/foundation_notifications/router.py': `router = APIRouter()
read = require("notifications.read")


@router.get("/deliveries", response_model=list[DeliveryOut], summary="Delivery log, newest first")
async def deliveries(
    limit: int = Query(50, ge=1, le=200),     # every list has a limit
    _: Principal = Depends(read),             # 401/403 before the body runs
    session: AsyncSession = Depends(get_session),   # bound to this tenant: RLS applies
) -> list[DeliveryOut]:
    rows = await DeliveryRepository(session).recent(limit=limit)
    return [DeliveryOut.model_validate(r, from_attributes=True) for r in rows]
`,
  'modules/organizations/src/foundation_organizations/router.py': `router = APIRouter()


@router.get("/{org_id}/members", response_model=list[MemberOut])
async def list_members(
    org_id: uuid.UUID,
    _: Principal = Depends(require("organizations.read")),
    session: AsyncSession = Depends(get_session),
) -> list[MemberOut]:
    members = await MembershipRepository(session).in_org(org_id)
    return [MemberOut(user_id=m.user_id, role=m.role) for m in members]   # task 00: add name and email
`,
  'modules/organizations/src/foundation_organizations/schemas.py': `class MemberOut(BaseModel):
    user_id: uuid.UUID
    role: str
`,
  'modules/auth/src/foundation_auth/__init__.py': `class _Directory:
    """Implements the core UserDirectory port, so other modules can look users up without importing auth."""

    async def get(self, session, user_id):
        return self._ref(await UserRepository(session).get(user_id))

    async def by_email(self, session, email):
        return self._ref(await UserRepository(session).by_email(email))


def _setup(app):
    app.state.user_directory = _Directory()
`,
  'apps/api/tests/test_isolation.py': `async def test_tenant_a_cannot_see_tenant_b_notes(app, db):
    a, b = uuid.uuid4(), uuid.uuid4()
    async with db.tenant_session(a) as s:
        s.add(Note(tenant_id=a, title="A's secret"))
    async with db.tenant_session(b) as s:
        rows = (await s.execute(select(Note))).scalars().all()   # no WHERE on purpose
    assert rows == []                                              # RLS filtered tenant A's row away
`,
  '.github/workflows/ci.yml': `name: ci
on: [push, pull_request]
jobs:
  check:     # tests on a real PostgreSQL, import contracts, typechecks, SDK freshness
    runs-on: ubuntu-latest
    steps: [checkout, setup-uv, setup-pnpm, "make setup", "make check"]
  secrets:   # gitleaks over the full git history
    runs-on: ubuntu-latest
  audit:     # pip-audit + pnpm audit; blocks on high severity
    runs-on: ubuntu-latest
`,
  '.github/pull_request_template.md': `## What and why

## Done checklist
- [ ] Tests exist, including real-Postgres tests where data or permissions are involved
- [ ] Tenant data? Migration in the module's own branch, enable_rls(...), RLS test passes
- [ ] make check exits 0; regenerated SDK/OpenAPI committed
- [ ] Security-sensitive? Mutation check: broke the protection on purpose, a test failed, restored it
`,
};

// Folders that exist in the miniature (some only to make `ls` realistic).
export const MINI_DIRS = ['modules/tenants', 'modules/jobs', 'modules/settings', 'modules/audit', 'modules/tenant_admin', 'modules/files', 'modules/webhooks', 'packages/design-system', 'packages/tokens', 'packages/sdk', 'apps/web/app', 'docs/adr'];

export function writeMini(H, root = '~/saas-foundation') {
  for (const [path, text] of Object.entries(MINI)) H.write('laptop', `${root}/${path}`, text, { owner: 'dev' });
  for (const d of MINI_DIRS) H.write('laptop', `${root}/${d}/.keep`, '', { owner: 'dev' });
  H.run(`cd ${root} && git init -q && git add -A && git -c user.name="Rumana Akter" -c user.email=rumana@example.com commit -qm "SaaS-Foundation (course miniature)"`, { on: 'laptop', user: 'dev' });
}
