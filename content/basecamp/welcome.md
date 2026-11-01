## story | Day one

Nadia joined the platform team on a Sunday morning. She had built a to-do app in university and won a hackathon. By lunch she had learned that the codebase had 40,000 lines she had never seen, that her first task was to fix one word in an email, and that the fix would need a branch, a test run, a pull request, a reviewer and a deploy.

"So most of the job is *not* writing code?" she asked her mentor, Rumana.

"Most of the job is understanding code, changing it safely, and making sure other people can keep changing it after you," Rumana said. "Writing the code is the fun bit at the end."

## model | Programming vs software engineering

**Programming** is telling a computer what to do. **Software engineering** is programming *over time, with other people, for users who depend on the result*.

| Programming asks | Engineering also asks |
|---|---|
| Does it work? | Will it still work after 50 other changes? |
| Is it fast enough? | Can a teammate understand and change it next year? |
| Does it run on my machine? | Does it run the same in production, for 10,000 users? |
| | What happens when it fails? Who notices? How do we recover? |
| | Is it secure? Is user data safe? |

That is why engineers care so much about **readability, tests, reviews, small changes, documentation and automation**: they are the tools that let many people change a system for years without breaking it.

What you will actually do as an intern:

- **Read** a lot of code and docs (far more than you write).
- **Ask** good questions, early.
- Make **small, reviewed changes** with tests.
- **Leave a trail**: commit messages, PR descriptions, notes that the next person can follow.

## analogy | Building in an occupied house

Writing a program from scratch is like building a shed in an empty field. Professional software engineering is renovating a house *while the family lives in it*: the water must keep running, nobody can be hurt, every change must be planned and inspected, and the next builder must be able to understand what you did from the drawings you left behind.

## team | How this course works

This course is a **conquest**: realms of lessons on a map, from Base Camp to the Hero Trials.

- Each lesson has three stages: **Learn** (read every lens, like this one), **Practice** (a hands-on lab in a simulated terminal, when the lesson has one), **Prove** (a quiz; 80% to pass).
- Lessons unlock in order: mastery first, so every new idea sits on solid ground.
- You earn **XP** and climb **ranks**. Perfect quizzes earn bonus XP. Each realm ends with a **Boss** lesson.
- Everything runs in your browser. The terminal and servers are simulated, so you cannot break anything real. Experiment.

## traps | Traps for new engineers

- **Staying stuck in silence.** After 20-30 minutes without progress, write down what you tried and ask.
- **Rewriting instead of reading.** The existing code usually has reasons. Find them (tests, git history, docs) before changing it.
- **Big-bang changes.** One huge pull request is hard to review and risky to ship. Small steps win.
- **"It works on my machine."** Your machine is not production. Tests and CI are the shared truth.

## lab | Your first commands

The terminal is a text interface to the computer: you type a command, press Enter, and read the answer. You will use it every day: to run the project, run tests, use git, and talk to servers.

Try these, and read the output each time. Nothing here can break anything.
