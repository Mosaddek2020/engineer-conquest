## story | The function that didn't exist

An intern asked an assistant how to set a database statement timeout in the ORM. The answer was confident and neatly formatted: call `session.set_timeout(5)`. The intern wrote it, the editor didn't complain, and the code crashed at runtime: there is no such method. The assistant hadn't lied; it had produced the most plausible-sounding text. Knowing *why* that happens is the first step to using these tools well.

## model | What an LLM actually does

- **Tokens**: text is split into pieces (roughly ¾ of a word each). The model reads tokens and predicts the **next token**, again and again.
- It learned patterns from enormous amounts of text and code. It has **no database of facts** and **no built-in "I don't know"**.
- **Context window**: the text it can consider at once: your prompt, attached files, the conversation, tool results. Anything not in the context, it doesn't know about your project (your versions, your conventions, your other modules).
- **Temperature and sampling**: outputs are drawn from probabilities, so the same question can give different answers.
- **Knowledge cutoff**: training data stops at a date; newer libraries and API changes are unknown unless you provide docs.
- **Tools and agents**: modern assistants can call tools (read files, run commands, search docs). This grounds them in reality, and gives them the power to do damage.

**Hallucinations** are the natural failure mode: plausible APIs, flags, package names, citations or facts that don't exist, stated with full confidence.

## analogy | A brilliant new colleague with no memory of your company

Imagine a colleague who has read every programming book and every public repository, types at lightning speed and never gets tired, but joined this morning, has never seen your codebase, sometimes fills gaps with confident guesses, and forgets everything when the conversation ends. You'd give them drafts and research. You'd give them context. You'd check their work. You wouldn't give them the production database password.

## team | Prompting basics that actually help

- **Context over cleverness**: paste the error, the relevant code, the versions, the constraints.
- **Say what good looks like**: inputs, outputs, edge cases, the style of the codebase.
- **Ask for the reasoning or a plan** before code for anything non-trivial.
- **Ask it to say when it's unsure**, and to list assumptions.
- **Iterate in small steps**; start a fresh conversation when the context gets polluted with wrong turns.
