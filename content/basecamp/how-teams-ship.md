## story | From "wouldn't it be nice" to production

Support gets an email: an Acme Bakery admin wants to see which emails bounced. A product manager writes a **ticket** with the problem and **acceptance criteria**. In planning, the team agrees it fits this sprint. Tanvir picks it up, creates a **branch**, writes the code and the **tests**, and opens a **draft pull request** on day one so Rumana can see the direction. **CI** runs 237 tests and a dozen checks on every push. Rumana **reviews**, asks for one change, approves. The PR is **merged**, the pipeline **deploys** it, and the support team tells the customer. Elapsed time: three days. Nobody worked late.

## model | The delivery loop

```
idea → ticket → branch → small commits + tests → pull request → CI checks → review → merge → deploy → monitor
                                                       ↑                                              │
                                                       └──────────────── feedback ────────────────────┘
```

- **Ticket**: describes the problem, not just the solution, and how we will know it is done (acceptance criteria).
- **Branch**: your change lives apart from `main` until it is ready, so `main` stays releasable.
- **Pull request (PR)**: a request to merge your branch, with a description, a diff, CI results and review comments. It is also the permanent record of *why* the change happened.
- **CI (continuous integration)**: robots that run the tests, linters, type checks and security scans on every push. Red CI = do not merge.
- **Review**: a teammate reads the change. Two people understand every line that ships.
- **Deploy**: automated, frequent and boring. Small changes, deployed often, are *safer* than big releases.

## analogy | A restaurant kitchen

The ticket is the order slip. The branch is your own station. The pull request is the plate you put on the pass. CI is the checklist (temperature, allergens, presentation), and the reviewer is the head chef who looks before it goes out. Nobody carries food straight from a cutting board to a customer.

## team | Agile, sprints and boards

Most teams organise this loop with an **agile** method:

- **Scrum**: fixed **sprints** (often two weeks), planning at the start, a daily stand-up ("what I did, what I'll do, what blocks me"), a demo and a **retrospective** at the end.
- **Kanban**: a continuous flow on a board (To do → In progress → Review → Done) with **work-in-progress limits** so things get *finished* instead of started.

Either way, the ideas are the same: **small batches, visible work, fast feedback, and a shared definition of done** (tests pass, reviewed, documented, deployed).

## traps | Where changes get stuck

- Tickets with a solution but no problem ("add a button") instead of "admins can't see bounced emails".
- Branches that live for weeks and then conflict with everything.
- PRs with no description: the reviewer has to reverse-engineer your intent.
- Skipping CI "just this once". The one time is always the time it mattered.

## lab | Look at a real history

Every project carries its history in git. Before changing anything, look at what happened before and how the team wants changes made. Then start your work on a branch.
