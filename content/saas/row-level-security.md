## story | The missing WHERE that leaked nothing

During a code review, Rumana spotted a new query: `select(Invoice).where(Invoice.status == "open")`. No tenant filter. In many systems that's a data breach waiting for a deploy. Here, the test that exercised it returned only the current tenant's invoices: PostgreSQL's row-level security had added the tenant filter itself. The missing filter was still fixed (the repository adds one too), but the safety net had held.

## model | How RLS works

Every tenant table gets, in its migration:

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;             -- even the table owner is subject to it
CREATE POLICY tenant_isolation ON invoices
  USING      (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
```

- At the start of each transaction, the app runs `set_config('app.tenant_id', '<tenant>', true)`: valid for that transaction only.
- `USING` filters what you can **read, update and delete**; `WITH CHECK` stops you **writing** rows for another tenant.
- **Fail closed**: if no tenant was set, the setting is empty, `NULLIF` makes it NULL, and *no row matches*. Bugs show up as empty results, never as other tenants' data.
- The app connects as a **runtime role** that is **not superuser and not BYPASSRLS** (those skip policies); it refuses to start otherwise. Migrations run as a separate **owner** role.

In SaaS-Foundation code: models mix in `TenantScoped`, migrations call `enable_rls("<table>")`, and `get_session` gives every route a session bound to the request's tenant.

## inside | The tests that keep it true

- `test_every_tenant_table_enforces_rls`: every `TenantScoped` table has RLS **enabled and forced** with a `tenant_isolation` policy.
- `test_startup_guard_rejects_superuser`.
- HTTP tests creating two tenants and checking that nothing crosses.
- Housekeeping visits each tenant through its own scoped session (`for_each_tenant`), so even cleanup never needs a bypass.

## analogy | Glasses that only show your own name

Imagine every database row is written in ink that only shows up through special glasses, and the glasses are cut for one tenant at the start of each transaction. Even if your code asks for "all invoices", you can only see your tenant's. Forget to put the glasses on, and you see nothing at all.

## traps | Traps

- Connecting the app as a superuser "just locally": the startup guard stops you, and that's on purpose.
- Tables with tenant data that forget `TenantScoped`/`enable_rls` (the test catches it).
- Caches, files or search indexes outside the database that don't include the tenant in their keys: RLS can't protect those.
