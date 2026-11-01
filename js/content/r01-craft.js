// Realm 1 · The Engineer's Craft: terminal + git essentials, clean code, testing, debugging, bisect.

const git = (t, cmd, dir = '/home/dev/shop') => t.exec('laptop', `cd ${dir} && ${cmd}`, { user: 'dev' }).out.trim();
// index of the last history line matching re (-1 if none)
const lastIdx = (t, re) => { let k = -1; t.history.forEach((l, i) => { if (re.test(l.line ?? l)) k = i; }); return k; };
const EDIT_TESTS = /(sed|nano|vim|vi|tee|echo|cat|printf)\b.*test_discount\.sh/;
const RUN_TESTS = /^(\.\/test_discount\.sh|bash\s+test_discount\.sh)\b/;
const commit = (H, dir, msg, who = 'Rumana Akter') => H.run(`cd ${dir} && git add -A && git -c user.name="${who}" -c user.email=dev@example.com commit -qm "${msg}"`, { on: 'laptop', user: 'dev' });

const DISCOUNT = `#!/bin/bash
# discount.sh QUANTITY -> percent off. 10+ items: 10%, 50+ items: 20%.
qty=$1
if [ "$qty" -ge 50 ]; then echo 20
elif [ "$qty" -ge 10 ]; then echo 10
else echo 0
fi
`;
const TESTS = `#!/bin/bash
# Tiny test runner: each check prints PASS or FAIL; exit code = number of failures.
fails=0
check() { local got; got=$(./discount.sh "$1"); if [ "$got" = "$2" ]; then echo "PASS discount($1) = $2"; else echo "FAIL discount($1): expected $2, got $got"; fails=$((fails+1)); fi; }

check 5 0
check 10 10
check 60 20

exit $fails
`;

const APP_LOG = [
  '2026-01-01 09:00:01 INFO  app starting (version 2.3.0)',
  '2026-01-01 09:00:01 INFO  loading config from config/app.env',
  '2026-01-01 09:00:02 INFO  connected to database',
  '2026-01-01 09:00:02 INFO  listening on :8000',
  '2026-01-01 09:14:40 INFO  GET /v1/orders 200 41ms',
  '2026-01-01 09:15:02 ERROR POST /v1/orders 500 3ms',
  'Traceback (most recent call last):',
  '  File "app/routes.py", line 31, in create_order',
  '    total = pricing.total(items, tax_rate=settings.TAX_RATE)',
  '  File "app/pricing.py", line 12, in total',
  '    return round(subtotal * (1 + float(tax_rate)), 2)',
  "ValueError: could not convert string to float: '15%'",
  '2026-01-01 09:15:09 ERROR POST /v1/orders 500 2ms',
  "ValueError: could not convert string to float: '15%'",
  '2026-01-01 09:16:30 INFO  GET /health 200 1ms',
].join('\n') + '\n';
const HEALTHCHECK = `#!/bin/bash
# healthcheck.sh: fails if the tax rate in config/app.env is not a plain decimal like 0.15
rate=$(grep '^TAX_RATE=' config/app.env | cut -d= -f2)
if echo "$rate" | grep -Eq '^[0-9]+(\\.[0-9]+)?$'; then echo "ok: TAX_RATE=$rate"; else echo "broken: TAX_RATE=$rate is not a decimal"; exit 1; fi
`;

const PRICE = r => `#!/bin/bash
# price.sh AMOUNT -> amount after the 10% member discount
echo $(( $1 * ${r} / 100 ))
`;
const CHECK = `#!/bin/bash
# check.sh: exit 0 if the member discount is right (100 -> 90), 1 otherwise
[ "$(./price.sh 100)" = "90" ]
`;

export default {
  id: 'craft',
  n: 1,
  title: 'The Engineer\'s Craft',
  tagline: 'Terminal and git, clean code, tests, and debugging like a scientist',
  badge: 'Craftsperson',
  intro: 'The everyday tools and habits of the job: the **terminal** and **git** for working on a shared codebase, **clean code** that the next person can read, **tests** that let you change things without fear, and a calm, **scientific way to debug**.',
  lessons: [
    {
      id: 'terminal-git',
      title: 'Terminal and git essentials',
      summary: 'Moving around, reading files, and the everyday git loop: status, diff, add, commit, log.',
      minutes: 20,
      lab: {
        cwd: '~',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/shop/README.md', '# Shop\n\nA tiny shop used in this course.\n', { owner: 'dev' });
          H.write('laptop', '~/shop/src/greet.sh', '#!/bin/bash\necho "Hello"\n', { owner: 'dev', mode: 0o755 });
          H.run('cd ~/shop && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/shop', 'Initial shop');
        },
        suggestions: ['cd shop', 'git status', 'ls -la'],
        tasks: [
          { title: 'Go into the project: `cd shop`, then list everything including hidden files with `ls -la`', hint: 'The `.git` folder you see is where git keeps the history.', solution: 'cd shop && ls -la', check: t => t.inDir('~/shop') && t.ran(/\bls\b.*-\w*a/) },
          { title: 'Ask git what is going on: `git status`', solution: 'git status', check: t => t.ran(/^git\s+status\b/) },
          { title: 'Add a line to the README: `echo "Run src/greet.sh to say hello." >> README.md`', hint: '`>>` appends; `>` would overwrite the whole file.', solution: 'echo "Run src/greet.sh to say hello." >> README.md', check: t => /greet\.sh/.test(t.file('laptop', '/home/dev/shop/README.md') || '') && /# Shop/.test(t.file('laptop', '/home/dev/shop/README.md') || '') },
          { title: 'See exactly what changed with `git diff`', solution: 'git diff', check: t => t.ran(/^git\s+diff\b/) },
          { title: 'Stage the change (`git add README.md`) and commit it with a clear message', hint: '`git commit -m "Explain how to run the greeting"`', solution: 'git add README.md && git commit -m "Explain how to run the greeting"', check: t => /nothing to commit/.test(git(t, 'git status')) && git(t, 'git log --oneline').split('\n').length >= 2 },
          { title: 'Show the history in one line per commit: `git log --oneline`', solution: 'git log --oneline', check: t => t.ran(/^git\s+log\b.*--oneline/) },
        ],
      },
      quiz: [
        { type: 'order', q: 'Put the everyday git loop in order.', items: ['Edit files', 'git status / git diff to see what changed', 'git add the files you mean to commit', 'git commit -m "clear message"', 'git push to share the branch'], explain: 'Look before you stage, stage on purpose, then commit.' },
        { type: 'mc', q: 'What does `git add` do?', choices: ['Uploads to GitHub', 'Puts changes in the staging area for the next commit', 'Creates a branch', 'Deletes untracked files'], answer: 1, explain: 'Staging lets you choose exactly what goes into a commit.' },
        { type: 'predict', q: 'What does the file contain afterwards?', code: '$ echo "one" > notes.txt\n$ echo "two" > notes.txt\n$ echo "three" >> notes.txt\n$ cat notes.txt', choices: ['one, two, three', 'two, three', 'three', 'one, three'], answer: 1, explain: '`>` overwrites; `>>` appends.' },
        { type: 'mc', q: 'Where does git store the project history?', choices: ['On GitHub only', 'In the hidden `.git` folder of the repository', 'In your home folder', 'In the README'], answer: 1, explain: 'Every clone has the full history in `.git`.' },
        { type: 'multi', q: 'Which commands only *look* and never change anything?', choices: ['git status', 'git diff', 'git log', 'git commit', 'git reset --hard'], answer: [0, 1, 2], explain: 'Use the looking commands freely and often.' },
        { type: 'type', q: 'Type the command that shows unstaged changes line by line.', accept: ['git diff'], model: 'git diff', explain: '`git diff --staged` shows what is staged.' },
        { type: 'mc', q: 'What does `cd ..` do?', choices: ['Goes to your home folder', 'Goes up one folder', 'Lists files', 'Deletes the folder'], answer: 1, explain: '`..` is the parent directory.' },
      ],
    },
    {
      id: 'clean-code',
      title: 'Clean code',
      summary: 'Names that explain, small functions, comments that say why, consistent formatting, and the boy-scout rule.',
      minutes: 15,
      quiz: [
        { type: 'mc', q: 'Which name is best for a variable holding the number of seconds before a reset link expires?', choices: ['t', 'data', 'resetLinkTtlSeconds', 'x2'], answer: 2, explain: 'Say what it is and its unit.' },
        { type: 'mc', q: 'What should a comment usually explain?', choices: ['What each line does', 'Why the code does something non-obvious', 'Who wrote it', 'Nothing: comments are always bad'], answer: 1, explain: 'Good names explain *what*; comments explain *why* (a constraint, a trap, a decision).' },
        { type: 'predict', q: 'A reviewer sees this function. What is the main problem?', code: 'def process(d):\n    # loop\n    for x in d:\n        if x[2] > 3 and x[5] == 1:\n            send(x[1])', choices: ['It is too fast', 'Names and magic numbers hide the meaning: what are d, x[2], 3 and x[5]?', 'Python cannot loop over lists', 'It needs more comments like "# loop"'], answer: 1, explain: 'Rename (`orders`, `order.retries > MAX_RETRIES`) and the comment becomes unnecessary.' },
        { type: 'multi', q: 'Signs a function should be split:', choices: ['It does several unrelated things', 'Its name needs "and" ("validateAndSaveAndEmail")', 'It is hard to test one behaviour without the others', 'It has a docstring'], answer: [0, 1, 2], explain: 'One function, one job.' },
        { type: 'mc', q: 'The "boy-scout rule" says:', choices: ['Rewrite every file you open', 'Leave the code a little cleaner than you found it, in small safe steps', 'Never touch old code', 'Always add comments'], answer: 1, explain: 'Small improvements as you go, without derailing your ticket.' },
        { type: 'tf', q: 'Consistent formatting should be enforced by a tool (formatter/linter) rather than argued about in reviews.', answer: true, explain: 'Let the tool decide; spend review time on logic.' },
        { type: 'mc', q: 'Which is clearer?', choices: ['if not user.is_not_inactive:', 'if user.is_active:'], answer: 1, explain: 'Avoid double negatives.' },
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      summary: 'Why we test, the test pyramid, arrange-act-assert, edge cases, test-first, and what a failing test tells you.',
      minutes: 20,
      lab: {
        cwd: '~/shop',
        panels: ['files'],
        setup(H) {
          H.write('laptop', '~/shop/discount.sh', DISCOUNT, { owner: 'dev', mode: 0o755 });
          H.write('laptop', '~/shop/test_discount.sh', TESTS, { owner: 'dev', mode: 0o755 });
        },
        suggestions: ['cat discount.sh', './test_discount.sh'],
        tasks: [
          { title: 'Read the code under test: `cat discount.sh`. What should 50 items give?', solution: 'cat discount.sh', check: t => t.ran(/\bcat\b.*discount\.sh/) },
          { title: 'Run the tests: `./test_discount.sh`', solution: './test_discount.sh', check: t => lastIdx(t, RUN_TESTS) >= 0 },
          { title: 'The tests never check the *boundaries*. Add checks for exactly 10 and exactly 50 items (`check 50 20` and `check 9 0` style lines) to `test_discount.sh`, before `exit $fails`', hint: 'Use `nano test_discount.sh`, or `sed -i \'s/^check 60 20$/check 60 20\\ncheck 50 20\\ncheck 49 10\\ncheck 9 0/\' test_discount.sh`.', solution: "sed -i 's/^check 60 20$/check 60 20\\ncheck 50 20\\ncheck 49 10\\ncheck 9 0/' test_discount.sh", check: t => { const s = t.file('laptop', '/home/dev/shop/test_discount.sh') || ''; return /^check 50 20$/m.test(s) && /^check (9|49) /m.test(s) && s.indexOf('check 50 20') < s.indexOf('exit $fails'); } },
          { title: 'Run the tests again. All of them should pass: the code was right; now the tests prove it at the edges', solution: './test_discount.sh', check: t => /check 50 20/.test(t.file('laptop', '/home/dev/shop/test_discount.sh') || '') && lastIdx(t, RUN_TESTS) > lastIdx(t, EDIT_TESTS) && lastIdx(t, EDIT_TESTS) >= 0 && t.exec('laptop', 'cd /home/dev/shop && ./test_discount.sh', { user: 'dev' }).code === 0 },
        ],
      },
      quiz: [
        { type: 'order', q: 'Order the test pyramid from the most tests to the fewest.', items: ['Unit tests: one function or class, fast', 'Integration tests: several parts together (e.g. with a real database)', 'End-to-end tests: the whole system through its UI or API'], explain: 'Many fast, focused tests; fewer slow, broad ones.' },
        { type: 'mc', q: 'Arrange-Act-Assert means:', choices: ['Write code, then tests, then docs', 'Set up the situation, do the one thing under test, check the result', 'Three reviewers per test', 'Assert first, then act'], answer: 1, explain: 'A readable shape for every test.' },
        { type: 'multi', q: 'Good edge cases for "10+ items get 10%":', choices: ['9 items', '10 items', '11 items', '0 items', 'Negative quantities'], answer: [0, 1, 3, 4], explain: 'Boundaries (9/10), zero, and invalid input are where bugs hide; 11 adds little.' },
        { type: 'mc', q: 'In test-driven development (TDD) you:', choices: ['Write tests after shipping', 'Write a failing test first, make it pass with the simplest code, then clean up', 'Only test UI', 'Skip tests for small changes'], answer: 1, explain: 'Red, green, refactor.' },
        { type: 'tf', q: 'A test that never fails, whatever you change in the code, gives you safety.', answer: false, explain: 'It proves nothing. That is why SaaS-Foundation does "mutation checks": break the code on purpose and make sure a test fails.' },
        { type: 'mc', q: 'A test passes on your machine but fails in CI. Most useful first step?', choices: ['Re-run CI until it passes', 'Read the CI log: find the exact failing assertion and how the environments differ', 'Delete the test', 'Merge anyway'], answer: 1, explain: 'Flaky tests usually reveal hidden assumptions (time zones, order, data, env vars).' },
      ],
    },
    {
      id: 'debugging',
      title: 'Debugging like a scientist',
      summary: 'Reproduce, read the error from the bottom, form a hypothesis, test it, find the change that caused it, fix the cause.',
      minutes: 20,
      lab: {
        cwd: '~/orders',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/orders/config/app.env', 'APP_PORT=8000\nTAX_RATE=0.15\nCURRENCY=BDT\n', { owner: 'dev' });
          H.write('laptop', '~/orders/healthcheck.sh', HEALTHCHECK, { owner: 'dev', mode: 0o755 });
          H.run('cd ~/orders && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/orders', 'Orders service config');
          H.write('laptop', '~/orders/config/app.env', 'APP_PORT=8000\nTAX_RATE=15%\nCURRENCY=BDT\n', { owner: 'dev' });
          commit(H, '~/orders', 'Make tax rate easier to read', 'Tanvir Hasan');
          H.write('laptop', '~/orders/logs/app.log', APP_LOG, { owner: 'dev' });
        },
        suggestions: ['tail -n 20 logs/app.log', 'grep -n ERROR logs/app.log'],
        tasks: [
          { title: 'Look at the end of the log: `tail -n 20 logs/app.log`', solution: 'tail -n 20 logs/app.log', check: t => t.ran(/\btail\b.*app\.log/) },
          { title: 'List only the error lines with their line numbers: `grep -n ERROR logs/app.log`', solution: 'grep -n ERROR logs/app.log', check: t => t.ran(/\bgrep\b.*ERROR.*app\.log/) },
          { title: 'Read the traceback from the BOTTOM: what exception, and which setting does the failing line use? Show that setting in `config/app.env`', hint: 'The last line says what went wrong; the lines above say where.', solution: 'grep TAX_RATE config/app.env', check: t => t.ran(/\b(grep|cat)\b.*(TAX_RATE|app\.env)/) },
          { title: 'Find the commit that introduced the bad value: `git log -S "15%" --oneline`, then `git show <id>`', hint: '`-S` finds commits where a string was added or removed.', solution: 'git log -S "15%" --oneline && git show HEAD', check: t => t.ran(/\bgit\s+log\b.*-S/) && t.ran(/\bgit\s+show\b/) },
          { title: 'Fix the cause (TAX_RATE must be a decimal like 0.15) and prove it with `./healthcheck.sh`', solution: "sed -i 's/^TAX_RATE=.*/TAX_RATE=0.15/' config/app.env && ./healthcheck.sh", check: t => /^TAX_RATE=0\.15$/m.test(t.file('laptop', '/home/dev/orders/config/app.env') || '') && t.ran(/healthcheck\.sh/) && t.exec('laptop', 'cd /home/dev/orders && ./healthcheck.sh', { user: 'dev' }).code === 0 },
        ],
      },
      quiz: [
        { type: 'order', q: 'Order a scientific debugging session.', items: ['Reproduce the problem reliably', 'Read the evidence: error message, logs, recent changes', 'Form one hypothesis about the cause', 'Test the hypothesis (change one thing, or add a check)', 'Fix the cause, and add a test so it cannot come back'], explain: 'One hypothesis at a time; evidence over guessing.' },
        { type: 'mc', q: 'Where do you start reading a Python traceback?', choices: ['The first line', 'The last line: the exception type and message, then walk up to your own code', 'The middle', 'Only the file names'], answer: 1, explain: '"Most recent call last": the bottom is where it broke.' },
        { type: 'mc', q: 'What does `git log -S "text"` find?', choices: ['Commits whose message contains text', 'Commits that added or removed text in the code', 'Signed commits', 'Commits by a user called S'], answer: 1, explain: 'The "pickaxe": great for "when did this value appear?".' },
        { type: 'tf', q: 'Changing several things at once and seeing if the bug goes away is an efficient debugging method.', answer: false, explain: 'You will not know which change mattered, and you may add new bugs.' },
        { type: 'multi', q: 'Good questions when something "suddenly" breaks:', choices: ['What changed recently (code, config, data, dependencies)?', 'Can I reproduce it?', 'Does it happen everywhere or only for some users/tenants?', 'Who should I blame?'], answer: [0, 1, 2], explain: 'Blameless: find the cause, not the culprit.' },
        { type: 'mc', q: 'You fixed the bug. What makes the fix complete?', choices: ['Closing the ticket', 'A test that would have caught it, so it cannot silently return', 'A comment saying "fixed"', 'Restarting the server'], answer: 1, explain: 'Every bug is a missing test.' },
      ],
    },
    {
      id: 'craft-boss',
      title: 'Boss: Which commit broke it?',
      summary: 'A member discount silently changed somewhere in recent history. Use a test and git bisect to find the exact commit, then fix it properly.',
      minutes: 20,
      boss: true,
      lab: {
        cwd: '~/shop',
        panels: ['files', 'git'],
        setup(H) {
          H.write('laptop', '~/shop/price.sh', PRICE(90), { owner: 'dev', mode: 0o755 });
          H.write('laptop', '~/shop/check.sh', CHECK, { owner: 'dev', mode: 0o755 });
          H.write('laptop', '~/shop/CHANGELOG.md', '# Changelog\n', { owner: 'dev' });
          H.run('cd ~/shop && git init -q', { on: 'laptop', user: 'dev' });
          commit(H, '~/shop', 'Member pricing');
          const msgs = ['Add changelog entry', 'Tidy price script', 'Update changelog', 'Refactor arithmetic', 'Add release notes', 'Bump version'];
          msgs.forEach((m, i) => {
            if (m === 'Refactor arithmetic') H.write('laptop', '~/shop/price.sh', PRICE(80), { owner: 'dev', mode: 0o755 });
            else H.write('laptop', '~/shop/CHANGELOG.md', `# Changelog\n\n- entry ${i + 1}\n`, { owner: 'dev' });
            commit(H, '~/shop', m, i % 2 ? 'Tanvir Hasan' : 'Rumana Akter');
          });
        },
        suggestions: ['./check.sh; echo $?', 'git log --oneline'],
        tasks: [
          { title: 'Reproduce: run `./check.sh; echo $?` (0 = correct, 1 = broken)', solution: './check.sh; echo $?', check: t => t.ran(/\.\/check\.sh/) },
          { title: 'Look at the history: `git log --oneline`. Seven commits; the first one ("Member pricing") was correct', solution: 'git log --oneline', check: t => t.ran(/^git\s+log\b/) },
          { title: 'Let git find the culprit: `git bisect start HEAD <first-commit-id>` then `git bisect run ./check.sh`', hint: 'The first commit\'s id is the last line of `git log --oneline` (or `git log --reverse --format=%h | head -1`). bisect checks the middle commit, then halves the range: 7 commits take about 3 checks.', solution: 'git bisect start HEAD $(git log --reverse --format=%h | head -1) && git bisect run ./check.sh', check: t => t.ran(/git\s+bisect\s+run\b/) },
          { title: 'Inspect the bad commit with `git show <id>`, then end the bisect with `git bisect reset`', solution: 'git show $(git log -S "80" --format=%h) && git bisect reset', check: t => t.ran(/git\s+show\b/) && t.ran(/git\s+bisect\s+reset\b/) && git(t, 'git branch --show-current') === 'main' },
          { title: 'Fix it on `main` with a new commit (don\'t rewrite history) whose message mentions the bad commit\'s subject, and prove it with `./check.sh`', hint: 'Restore the 90 in price.sh, then e.g. `git commit -am "Restore 10% member discount broken in \'Refactor arithmetic\'"`. (`git revert <id>` also works.)', solution: "git revert --no-edit $(git log -S '80' --format=%h) && ./check.sh", check: t => t.exec('laptop', 'cd /home/dev/shop && ./check.sh', { user: 'dev' }).code === 0 && /nothing to commit/.test(git(t, 'git status')) && git(t, 'git log --oneline').split('\n').length >= 8 && /Refactor arithmetic/i.test(git(t, 'git log -1 --format=%s')) },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Why is `git bisect` fast?', choices: ['It reads commit messages', 'It is a binary search: each check halves the remaining commits', 'It runs tests in parallel', 'It guesses'], answer: 1, explain: '1,000 commits need about 10 checks.' },
        { type: 'mc', q: 'What makes `git bisect run` possible?', choices: ['A script whose exit code says good (0) or bad (non-zero)', 'A commit message convention', 'GitHub Actions', 'Root access'], answer: 0, explain: 'Any test that can say pass/fail automates the search.' },
        { type: 'mc', q: 'The bad commit is already on the shared `main`. How do you undo it?', choices: ['`git reset --hard` and force-push', 'A new commit that fixes it (or `git revert`), so everyone\'s history stays valid', 'Delete the repository', 'Edit the commit in place'], answer: 1, explain: 'Never rewrite shared history.' },
        { type: 'tf', q: 'The commit "Refactor arithmetic" changed behaviour, so it was not really a pure refactor.', answer: true, explain: 'A refactor changes structure, never behaviour: that is what tests are for.' },
        { type: 'multi', q: 'After fixing, what should you also do?', choices: ['Add a test that runs in CI so this can never return', 'Mention the cause in the commit/PR', 'Blame the author in chat', 'Ask why review/CI did not catch it'], answer: [0, 1, 3], explain: 'Improve the system, blamelessly.' },
      ],
    },
  ],
};
