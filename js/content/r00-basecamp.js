// Realm 0 · Base Camp: what software engineering is, how teams ship, how to learn and ask, a first ticket.

const MISSION = `Welcome to the platform team!

You have joined the team that builds SaaS-Foundation: the plug-and-play base our
client products are built on. Many client companies ("tenants") share one
deployment, and the platform keeps each tenant's data private.

Your mentor is Rumana. Your first week:
  1. Learn the habits engineers here rely on (this course).
  2. Get the project running on your machine.
  3. Ship a small, real change with a pull request.

Nobody expects you to know everything. Everybody expects you to ask.
`;

// ask the repo itself (in a throwaway shell) rather than guessing at files under .git
const git = (t, cmd) => t.exec('laptop', `cd /home/dev/foundation && ${cmd}`, { user: 'dev' }).out.trim();
const onBranch = (t, name) => git(t, 'git branch --show-current') === name;

const TICKET = `TICKET FND-142  ·  priority: normal  ·  reporter: support team

Title: Welcome email says "Wellcome"

A tenant admin reports that the email new users receive starts with
"Wellcome to Acme Bakery". The typo is in our template text, not the tenant's.

Acceptance criteria:
- the English welcome text says "Welcome"
- no other wording changes
- the app's health check still answers 200
`;

const ROUTER_PY = `"""Routes for the welcome module."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}
`;

const TEMPLATES_PY = `"""Emails this module sends."""
from foundation_core import MessageTemplate

TEMPLATES = (
    MessageTemplate(
        key="welcome.new_user", locale="en",
        subject="Wellcome to {{ tenant.name }}",
        text="Hi {{ name }}, your account is ready.",
    ),
)
`;

export default {
  id: 'basecamp',
  n: 0,
  title: 'Base Camp',
  tagline: 'What engineers really do, how teams ship, and how to learn fast',
  badge: 'Base Camp Graduate',
  intro: 'Start here. Learn what **software engineering** is (it is much more than typing code), how a team turns an idea into running software, and the habits that make a new engineer useful quickly: **reading before writing, asking good questions, and leaving a trail**. You will also type your first commands in the terminal.',
  lessons: [
    {
      id: 'welcome',
      title: 'Welcome to software engineering',
      summary: 'Programming vs engineering, what an intern actually does, and how this course works.',
      minutes: 15,
      lab: {
        cwd: '~',
        panels: ['files', 'network'],
        setup(H) {
          H.write('laptop', '~/mission.txt', MISSION, { owner: 'dev' });
          H.write('laptop', '~/notes/todo.txt', '- read mission.txt\n- say hello to the team\n', { owner: 'dev' });
          H.site('status.foundation.example.com', { '/': { body: 'SaaS-Foundation status: all systems operational\n' } });
        },
        suggestions: ['pwd', 'ls', 'cat mission.txt'],
        tasks: [
          { title: 'Find out where you are: type `pwd` and press Enter', hint: '`pwd` = print working directory: the folder your terminal is "in".', solution: 'pwd', check: t => t.ran(/^pwd\b/) },
          { title: 'List what is here with `ls`', solution: 'ls', check: t => t.ran(/^ls\b/) },
          { title: 'Read your welcome note: `cat mission.txt`', hint: 'Tab completes names: type `cat mi` and press Tab.', solution: 'cat mission.txt', check: t => t.ran(/\bcat\s+(~\/)?mission\.txt/) },
          { title: 'Look inside the `notes` folder: `ls notes`, then read `notes/todo.txt`', solution: 'ls notes && cat notes/todo.txt', check: t => t.ran(/\bls\b.*notes/) && t.ran(/\bcat\b.*notes\/todo\.txt/) },
          { title: 'Ask the platform\'s status page if everything is up: `curl https://status.foundation.example.com`', hint: '`curl` makes a web request from the terminal and prints the answer.', solution: 'curl https://status.foundation.example.com', check: t => t.events('http').some(e => /status\.foundation/.test(e.url) && e.status === 200) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'What best separates software *engineering* from programming?', choices: ['Engineers type faster', 'Engineering adds teamwork, trade-offs, maintenance and responsibility over time to the act of writing code', 'Engineers only work on hardware', 'Programming uses a different language'], answer: 1, explain: 'Code is the medium; engineering is building things others can rely on and change safely for years.' },
        { type: 'multi', q: 'Which are part of a software engineer\'s normal week?', choices: ['Reading existing code', 'Writing and running tests', 'Reviewing teammates\' pull requests', 'Writing documentation', 'Only writing brand-new code'], answer: [0, 1, 2, 3], explain: 'Most time goes to reading, understanding and changing existing code.' },
        { type: 'tf', q: 'As an intern, asking questions makes you look less capable, so you should avoid it.', answer: false, explain: 'Good questions save hours. Silent struggling is what worries mentors.' },
        { type: 'mc', q: 'Roughly how much of a typical engineer\'s time goes to reading and understanding code compared with writing new code?', choices: ['Almost none', 'About equal', 'Reading is many times more than writing', 'Writing is many times more than reading'], answer: 2, explain: 'Code is read far more often than it is written, which is why readability matters so much.' },
        { type: 'type', q: 'Type the command that prints the folder you are in.', accept: ['pwd'], model: 'pwd', explain: 'Print working directory.' },
        { type: 'mc', q: 'What does `curl https://example.com` do?', choices: ['Downloads curl', 'Makes an HTTP request to example.com and prints the response body', 'Opens a browser', 'Pings the server'], answer: 1, explain: 'curl is a command-line HTTP client: you will use it a lot in this course.' },
      ],
    },
    {
      id: 'how-teams-ship',
      title: 'How a team ships software',
      summary: 'From idea to production: tickets, branches, pull requests, review, CI, deploy, and the agile rhythm around it.',
      minutes: 15,
      lab: {
        cwd: '~/foundation',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/foundation/README.md', '# SaaS-Foundation\n\nPlug-and-play modules for multi-tenant SaaS.\n', { owner: 'dev' });
          H.run('cd ~/foundation && git init -q && git add . && git -c user.name="Rumana Akter" -c user.email=rumana@example.com commit -qm "Initial commit"', { on: 'laptop', user: 'dev' });
          H.write('laptop', '~/foundation/docs/CONTRIBUTING.md', '# Contributing\n\n1. Pick a ticket.\n2. Branch from main: git switch -c <ticket>-<short-name>\n3. Small commits.\n4. Open a draft pull request early.\n5. CI must be green and one reviewer must approve.\n', { owner: 'dev' });
          H.run('cd ~/foundation && git add . && git -c user.name="Tanvir Hasan" -c user.email=tanvir@example.com commit -qm "Add contributing guide"', { on: 'laptop', user: 'dev' });
        },
        suggestions: ['git log --oneline', 'cat docs/CONTRIBUTING.md'],
        tasks: [
          { title: 'See the project\'s history: `git log --oneline`. Who made each change?', hint: '`git log` (without --oneline) also shows authors and dates.', solution: 'git log', check: t => t.ran(/^git\s+log\b/) },
          { title: 'Read how this team wants changes made: `cat docs/CONTRIBUTING.md`', solution: 'cat docs/CONTRIBUTING.md', check: t => t.ran(/\bcat\b.*CONTRIBUTING/) },
          { title: 'Start work on ticket FND-142 the team\'s way: create and switch to a branch named `fnd-142-welcome-typo`', hint: '`git switch -c <name>` creates a branch and switches to it.', solution: 'git switch -c fnd-142-welcome-typo', check: t => onBranch(t, 'fnd-142-welcome-typo') },
          { title: 'Confirm which branch you are on with `git status`', solution: 'git status', check: t => t.ran(/^git\s+status\b/) },
        ],
      },
      quiz: [
        { type: 'order', q: 'Put a typical change on a modern team in order.', items: ['A ticket describes the problem and acceptance criteria', 'You create a branch from main', 'You commit small, focused changes with tests', 'You open a pull request', 'CI runs the tests and checks', 'A teammate reviews and approves', 'The change is merged and deployed'], explain: 'Tickets, branches, PRs, CI and review form the loop almost every team uses.' },
        { type: 'mc', q: 'Why open a *draft* pull request early?', choices: ['To finish faster by skipping review', 'To get early feedback and show progress before the work is done', 'Because drafts skip CI', 'To avoid writing tests'], answer: 1, explain: 'Early visibility catches wrong directions before you invest days in them.' },
        { type: 'multi', q: 'What does CI (continuous integration) typically do on a pull request?', choices: ['Run the automated tests', 'Run linters and type checks', 'Build the project', 'Approve the PR for you', 'Check for leaked secrets'], answer: [0, 1, 2, 4], explain: 'CI checks; humans approve.' },
        { type: 'mc', q: 'In agile teams, what is a "definition of done"?', choices: ['The date the project ends', 'A shared checklist a change must meet before it counts as finished (tests, review, docs...)', 'The manager\'s approval', 'The last commit'], answer: 1, explain: 'It stops "done" from meaning "works on my machine".' },
        { type: 'mc', q: 'Scrum vs Kanban: which statement is right?', choices: ['Scrum works in fixed-length sprints; Kanban is a continuous flow with limits on work in progress', 'They are the same', 'Kanban has sprints; Scrum does not', 'Neither uses tickets'], answer: 0, explain: 'Both aim at small batches and fast feedback.' },
        { type: 'tf', q: 'Small pull requests are reviewed faster and more carefully than large ones.', answer: true, explain: 'Reviewers skim 1,000-line diffs; they read 100-line ones.' },
        { type: 'type', q: 'Type the git command that creates a branch called `fix-login` and switches to it.', accept: ['git switch -c fix-login', 'git checkout -b fix-login'], model: 'git switch -c fix-login', explain: '`git checkout -b` is the older spelling.' },
      ],
    },
    {
      id: 'learning-fast',
      title: 'Learning fast and asking well',
      summary: 'Reading docs and code, time-boxing, rubber-duck debugging, writing a question that gets answered, and keeping notes.',
      minutes: 12,
      quiz: [
        { type: 'mc', q: 'You have been stuck for 20 minutes. What is the best next step?', choices: ['Keep trying silently for the rest of the day', 'Write down what you tried and ask a focused question', 'Rewrite the whole module', 'Copy a random answer from the internet'], answer: 1, explain: 'Time-box, then ask with context. The writing often solves it (rubber duck).' },
        { type: 'multi', q: 'A good question to a teammate includes:', choices: ['What you are trying to achieve', 'What you tried and what happened (exact error)', 'What you expected instead', 'A screenshot of your whole screen only', 'Your best guess at the cause'], answer: [0, 1, 2, 4], explain: 'Goal, attempts, actual vs expected, a guess. Paste text, not only screenshots.' },
        { type: 'mc', q: 'What is "rubber-duck debugging"?', choices: ['A testing framework', 'Explaining the problem step by step (even to a toy duck) until you notice the mistake', 'Debugging in the bath', 'Deleting code until the bug goes away'], answer: 1, explain: 'Explaining forces you to check each assumption.' },
        { type: 'mc', q: 'The XY problem means:', choices: ['Asking about your attempted solution (Y) instead of your real goal (X)', 'A bug in X and Y coordinates', 'Two tickets at once', 'A merge conflict'], answer: 0, explain: 'Always say what you are ultimately trying to do.' },
        { type: 'tf', q: 'Reading the existing tests is a good way to learn how a piece of code is meant to be used.', answer: true, explain: 'Tests are executable examples.' },
        { type: 'multi', q: 'Good places to look before asking:', choices: ['The project README and docs folder', 'Tests for the code you are changing', 'git log / git blame for why it changed', 'The error message itself, read carefully', 'Nowhere: ask immediately every time'], answer: [0, 1, 2, 3], explain: 'Spend a few minutes looking first; then ask.' },
      ],
    },
    {
      id: 'basecamp-boss',
      title: 'Boss: Your first ticket',
      summary: 'Read a ticket, find the right file by searching, check the service, make the fix on a branch and write a clear status update.',
      minutes: 20,
      boss: true,
      lab: {
        cwd: '~/foundation',
        panels: ['files', 'git', 'network'],
        setup(H) {
          H.write('laptop', '~/tickets/FND-142.txt', TICKET, { owner: 'dev' });
          H.write('laptop', '~/foundation/modules/welcome/router.py', ROUTER_PY, { owner: 'dev' });
          H.write('laptop', '~/foundation/modules/welcome/templates.py', TEMPLATES_PY, { owner: 'dev' });
          H.write('laptop', '~/foundation/modules/audit/router.py', '"""Audit routes."""\n', { owner: 'dev' });
          H.run('cd ~/foundation && git init -q && git add . && git -c user.name="Rumana Akter" -c user.email=rumana@example.com commit -qm "Welcome module"', { on: 'laptop', user: 'dev' });
          H.site('acme.foundation.example.com', { '/v1/welcome/health': { body: '{"status":"ok"}' } });
        },
        suggestions: ['cat ~/tickets/FND-142.txt', 'grep -rn "Wellcome" .'],
        tasks: [
          { title: 'Read the ticket in `~/tickets/`', solution: 'cat ~/tickets/FND-142.txt', check: t => t.ran(/\bcat\b.*FND-142/) },
          { title: 'Find which file contains the typo by searching the code: `grep -rn "Wellcome" .`', hint: '`-r` searches folders recursively, `-n` prints line numbers.', solution: 'grep -rn "Wellcome" .', check: t => t.ran(/\bgrep\b.*-\w*r\w*.*Wellcome|\bgrep\b.*Wellcome.*-\w*r/) },
          { title: 'Create the branch `fnd-142-welcome-typo` before changing anything', solution: 'git switch -c fnd-142-welcome-typo', check: t => onBranch(t, 'fnd-142-welcome-typo') },
          { title: 'Fix the typo in that file (only the typo). Tip: `sed -i \'s/Wellcome/Welcome/\' <file>` or `nano <file>`', solution: "sed -i 's/Wellcome/Welcome/' modules/welcome/templates.py", check: t => /subject="Welcome to \{\{ tenant\.name \}\}"/.test(t.file('laptop', '/home/dev/foundation/modules/welcome/templates.py') || '') && !/Wellcome/.test(t.file('laptop', '/home/dev/foundation/modules/welcome/templates.py') || '') },
          { title: 'Check the acceptance criterion about health: `curl -i https://acme.foundation.example.com/v1/welcome/health` must be 200', solution: 'curl -i https://acme.foundation.example.com/v1/welcome/health', check: t => t.events('http').some(e => /welcome\/health/.test(e.url) && e.status === 200) },
          { title: 'Commit with a clear message that names the ticket, e.g. `git commit -am "Fix typo in welcome email subject (FND-142)"`', solution: 'git commit -am "Fix typo in welcome email subject (FND-142)"', check: t => onBranch(t, 'fnd-142-welcome-typo') && /FND-142/i.test(git(t, 'git log -1 --format=%s')) && /nothing to commit/.test(git(t, 'git status')) },
          { title: 'Write a 2-3 line status update for Rumana in `~/update.txt`: what you changed, where, and how you checked it (mention the file and the 200)', hint: 'For example: `echo "Fixed Wellcome -> Welcome in modules/welcome/templates.py on branch fnd-142-welcome-typo. Health check returns 200." > ~/update.txt`', solution: 'echo "Fixed the typo (Wellcome -> Welcome) in modules/welcome/templates.py on branch fnd-142-welcome-typo; committed. Checked /v1/welcome/health: 200." > ~/update.txt', check: t => { const s = t.file('laptop', '/home/dev/update.txt') || ''; return /templates\.py/.test(s) && /200/.test(s); } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why search with `grep -rn` instead of opening files one by one?', choices: ['It is the only way to edit files', 'It finds every occurrence across the codebase in seconds, with file and line', 'It fixes the typo for you', 'It is required by git'], answer: 1, explain: 'Searching is the fastest way to find your way in an unfamiliar codebase.' },
        { type: 'mc', q: 'The ticket says "no other wording changes". You notice another awkward sentence nearby. What do you do?', choices: ['Fix it too in the same commit', 'Leave it, and mention it in your update or a new ticket', 'Rewrite the whole email', 'Ignore the ticket'], answer: 1, explain: 'Stay in scope; surface extra findings separately so reviews stay focused.' },
        { type: 'multi', q: 'A good commit message:', choices: ['Says what changed and why', 'References the ticket', 'Is "fix" or "stuff"', 'Uses the imperative mood ("Fix typo...")'], answer: [0, 1, 3], explain: 'Future readers of `git log` will thank you.' },
        { type: 'tf', q: 'You should create the branch before making changes.', answer: true, explain: 'main stays clean, and your change is reviewable on its own.' },
        { type: 'mc', q: 'What makes a status update useful?', choices: ['"Done!"', 'What changed, where, how you verified it, and anything still open', 'A long story of every attempt', 'Only the commit hash'], answer: 1, explain: 'Short, concrete, verifiable.' },
      ],
    },
  ],
};
