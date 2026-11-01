## story | Swapping an email provider in one PR

When a product needed a new email channel, the change touched one module. Auth, invites and every other sender kept calling the same `notify()` port; none of them knew how email worked. That's the payoff of a module that is complete, self-contained and connected through ports.

## model | What's inside a module

```
modules/notifications/src/foundation_notifications/
  __init__.py      the manifest: define_module(name, depends_on, permissions, tenant_grants,
                   models, migrations, templates, settings, owner_only, setup, ...)
  models.py        tables (TenantScoped for tenant data)
  migrations/versions/0001_initial.py   its own Alembic branch; enable_rls(...) for tenant tables
  schemas.py       Pydantic: the API contract
  repository.py    queries
  service.py       rules: raises DomainError subclasses
  router.py        thin routes: Depends(require(...)), Depends(get_session)
```

**Connections to the rest of the platform:**

- It **installs** ports in `setup` (notifications installs `app.state.notifier`, the implementation of `notify()`).
- It **calls** other modules' ports (`tenant_settings`, `secret_vault`, `tenant_profile`).
- It **declares** what it needs and offers in the manifest, so a reader learns its contract without opening other files.

## analogy | A kitchen appliance

A module is an appliance: everything it needs is inside the case, it plugs into standard sockets (ports), and a label on the back (the manifest) tells you its power needs and what it does. You can replace it without rewiring the house.

## lab | Open up a module

Explore the notifications module, find the line that isolates its table, and check the no-imports rule yourself.
