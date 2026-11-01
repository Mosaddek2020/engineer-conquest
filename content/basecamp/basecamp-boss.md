## story | The smallest real change

Rumana gives you ticket FND-142: a typo in a welcome email. "It's tiny on purpose," she says. "I don't care about the typo. I care that you find the right file, change only what the ticket asks, check you didn't break anything, and tell me clearly what you did."

## model | The anatomy of a good small change

1. **Read the ticket** completely, especially the acceptance criteria.
2. **Locate** the code by searching (`grep -rn "text" .`), not by guessing.
3. **Branch** first: `main` stays clean.
4. Make the **smallest change** that meets the criteria. Stay in scope.
5. **Verify** against each acceptance criterion.
6. **Commit** with a message that says what and why, and names the ticket.
7. **Report**: what changed, where, how you checked it, anything left open.

## lab | Ticket FND-142

Work through the ticket the way the team does. Every step is something you will do on real tickets in the SaaS-Foundation repo.
