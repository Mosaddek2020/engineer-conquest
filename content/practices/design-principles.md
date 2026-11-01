## story | The change that touched 40 files

A team wanted to switch their email provider. Email sending had been copied into the signup code, the invoice code, the password-reset code and twelve other places, each slightly different. The "small" change took three weeks and broke password resets for a day. A neighbouring team made the same switch in an afternoon: their email sending lived behind one interface, and only one module knew which provider was behind it.

## model | Principles that keep change cheap

**Separation of concerns**: different jobs live in different places. In a web backend: the **route** parses HTTP and returns responses; the **service** holds business rules; the **repository** talks to the database. When the rule changes, you know where to look.

**High cohesion, low coupling**: things that change together live together (cohesion); parts depend on each other as little as possible (coupling). Low coupling is what makes a change local.

**Single responsibility**: a class or module should have *one reason to change*.

**Depend on interfaces, not implementations** (dependency inversion): code asks for "something that can send a message", not "the SMTP client in module X". The implementation is plugged in at startup.

**Composition over inheritance**: combine small, focused objects instead of building deep class trees where a change to the base ripples everywhere.

## inside | This is literally how SaaS-Foundation is built

SaaS-Foundation's first hard rule is **"modules never import each other"**, and CI enforces it with a tool (`import-linter`). Modules talk through **ports**: small interfaces in `foundation_core`. The auth module needs to send a password-reset email; it calls `notify(...)`, a port that the notifications module implements. Auth has no idea how email works, and notifications can be replaced without touching auth.

## analogy | Wall sockets

Your laptop doesn't know which power station made the electricity. It depends on an interface (the socket and its voltage), and any compliant supply can be plugged in. Hard-wiring the laptop to one power station would be high coupling.

## traps | Design traps

- **The god object**: one class that does everything, that every change has to touch.
- **Premature abstraction**: interfaces with exactly one implementation "for the future" add cost without benefit. Wait for the second real use.
- **Shared mutable state** (globals) that couples everything invisibly.
- **Inheritance for code reuse** only: if B is not truly a kind of A, compose instead.
