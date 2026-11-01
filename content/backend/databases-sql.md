## story | Four seconds per page

The customer list for one big tenant took four seconds to load. The code was fine; the query was fine. The database was reading all 1.8 million customers of all tenants to find one phone number, because nobody had created an index for that search. One line of migration made it take 2 milliseconds.

## model | Relational databases

- **Tables** of **rows** and typed **columns**. A **primary key** identifies each row (`id`, often a UUID). A **foreign key** references a row in another table.
- **Constraints** keep data valid even when code is wrong: `NOT NULL`, `UNIQUE (tenant_id, email)`, `CHECK`, foreign keys.
- **SQL**:

```sql
SELECT name, email FROM users WHERE tenant_id = $1 AND email = $2;
INSERT INTO notes (id, tenant_id, title) VALUES ($1, $2, $3);
UPDATE notes SET done = true WHERE id = $1;   -- always a WHERE!
DELETE FROM notes WHERE id = $1;
SELECT c.name, o.id FROM customers c JOIN orders o ON o.customer_id = c.id;  -- inner join: matches only
```

- **Indexes** make lookups fast (like a book's index) at the cost of slower writes and some space. **`EXPLAIN ANALYZE`** shows the plan: a *Seq Scan* over millions of rows means a missing index.
- **Transactions**: a group of statements that succeed or fail together (**ACID**: atomic, consistent, isolated, durable).
- **Race conditions**: "check then insert" can race; a `UNIQUE` constraint can't.

## inside | PostgreSQL in SaaS-Foundation

- Every tenant table has a `tenant_id` and **row-level security**: the database itself filters every query to the current tenant (Realm 8 explains how).
- Modules don't use foreign keys *into other modules' tables* (plain UUIDs keep modules independent).
- Tests run on a **real PostgreSQL**, because the security lives in the database.

## analogy | A library card catalogue

Tables are shelves of identical index cards. A primary key is each card's number. An index is the catalogue sorted by author: finding all books by one author takes seconds instead of reading every card in the library.

## traps | Traps

- `UPDATE`/`DELETE` without `WHERE`.
- Building SQL with string concatenation (injection).
- Lists without `LIMIT`.
- Missing indexes on columns you filter or join by.
