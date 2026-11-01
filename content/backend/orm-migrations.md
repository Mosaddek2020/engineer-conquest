## story | "It works on my database"

A developer added a column to a model, tested locally (where the table was recreated from scratch), and merged. Production's table, which had two years of data, still had the old shape: the deploy crashed. Since then the team has two rules: every model change ships with a **migration**, and a test fails if models and migrations disagree.

## model | SQLAlchemy and Alembic

**SQLAlchemy** (the ORM) maps tables to Python classes and builds parameterised SQL:

```python
class Note(Base, TenantScoped, Timestamped):
    __tablename__ = "notes"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200))

stmt = select(Note).where(Note.title.ilike("%flour%")).limit(50)
rows = (await session.execute(stmt)).scalars().all()
```

**Alembic** migrations change the schema step by step, the same way everywhere:

```python
revision = "notes_0002"; down_revision = "notes_0001"
def upgrade():
    op.add_column("notes", sa.Column("done", sa.Boolean(), server_default=sa.false(), nullable=False))
```

## inside | SaaS-Foundation's migration rules

- Each module has its **own Alembic branch** (`branch_labels = ("notes",)`), so a product gets exactly its modules' tables.
- Every tenant table's first migration calls **`enable_rls("<table>")`**: a test fails otherwise.
- A **drift test** compares models with migrations; an **upgrade test** builds a database at each module's *first* revision, seeds data, upgrades to the latest and checks the data survived. New NOT NULL columns without a `server_default` fail it.
- **Never edit a merged migration**: write a new one.

## analogy | Renovation plans

Models are the architect's drawing of how the house should look. Migrations are the numbered work orders that get every real house (your laptop, CI, staging, production) from its current state to the drawing, without demolishing it.

## traps | Traps

- The **N+1 query**: a loop that runs one query per row. Load related rows in one query.
- Editing old migrations.
- NOT NULL columns without defaults on existing tables.
- Assuming the ORM makes queries cheap: read the SQL it generates when performance matters.
