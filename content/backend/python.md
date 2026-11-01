## story | The list that remembered

An intern wrote `def add_tag(tag, tags=[])` and couldn't understand why every new note "inherited" tags from previous ones. Python creates default values once, when the function is defined. Five minutes with a mentor, and a lesson remembered for life. Every language has a handful of these; here are Python's that matter in SaaS-Foundation.

## model | The Python you need here

- **Type hints** everywhere: `def total(amounts: list[int]) -> int:`. Python ignores them at runtime, but editors, type checkers, **Pydantic** and **FastAPI** read them to validate data and generate docs.
- **Pydantic models** describe data shapes with validation:

```python
class InviteIn(BaseModel):
    email: EmailStr
    role: str = Field(default="member", max_length=32)
```

- **Dataclasses** for simple internal value objects (`@dataclass(frozen=True)`).
- **Exceptions**: raise specific ones (`Invalid`, `NotFound`, `Conflict` from `foundation_core`), catch only what you can handle.
- **Context managers** (`with` / `async with`) guarantee cleanup: transactions commit or roll back, connections return to the pool.
- **async/await**: the API is asynchronous. Awaiting I/O (database, HTTP) lets other requests run meanwhile. CPU-heavy work (password hashing) blocks the loop, so SaaS-Foundation runs it in a thread (`asyncio.to_thread`).
- **Tooling**: `uv` manages the virtual environment and the lockfile; `make setup`, `make test`, `make check`.

## analogy | A chef's knives

You don't need every utensil in the shop: you need a few knives, kept sharp, and to know which one is dangerous in which way. Type hints, Pydantic, context managers and async are this codebase's knives.

## traps | Traps

- Mutable default arguments.
- Blocking calls (`time.sleep`, `requests.get`, heavy CPU) inside async code.
- `except Exception: pass`.
- Forgetting `await` (you get a coroutine object, not a result).
