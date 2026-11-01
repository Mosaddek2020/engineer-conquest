// Realm 6 · Frontend: HTML and CSS, JavaScript, TypeScript and React, Next.js, design systems and accessibility.

const SIGNUP_HTML = `<!doctype html>
<html>
<head><title>Sign up</title></head>
<body>
  <div class="header"><img src="/logo.png"></div>
  <div class="title" style="font-size:32px">Create your account</div>
  <form action="/signup" method="post">
    <input type="email" name="email" placeholder="Email">
    <label for="pw">Password</label>
    <input type="password" id="pw" name="password">
    <p style="color:#c8c8c8;background:#ffffff">Passwords need at least 12 characters.</p>
    <div class="btn" onclick="submitForm()">Sign up</div>
  </form>
  <img src="/bakery.jpg" alt="Fresh sourdough loaves on a wooden shelf">
</body>
</html>
`;

export default {
  id: 'frontend',
  n: 6,
  title: 'Frontend',
  tagline: 'HTML, CSS and JavaScript, React with TypeScript, Next.js, design systems and accessibility',
  badge: 'Frontend Builder',
  intro: 'The frontend is everything users see and touch. Learn the three languages of the browser (**HTML** for structure, **CSS** for presentation, **JavaScript** for behaviour), how **React** with **TypeScript** builds interfaces from components, how **Next.js** (which SaaS-Foundation\'s web app uses) renders on the server and the client, and why **design systems** and **accessibility** are part of the job, not extras.',
  lessons: [
    {
      id: 'html-css',
      title: 'HTML and CSS',
      summary: 'Semantic HTML, forms and labels, the box model, flexbox and grid, responsive design, and the cascade.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'Why prefer `<button>` over `<div onclick="...">` for a button?', choices: ['It looks nicer', 'It is focusable with the keyboard, works with Enter/Space and is announced as a button by screen readers, for free', 'Divs cannot have click handlers', 'Buttons are faster'], answer: 1, explain: 'Semantic HTML gives you accessibility and behaviour for free.' },
        { type: 'multi', q: 'Which are semantic HTML elements?', choices: ['<header>, <nav>, <main>, <footer>', '<button>', '<label>', '<div class="button">', '<h1> to <h6>'], answer: [0, 1, 2, 4], explain: 'Elements that say what something *is*.' },
        { type: 'mc', q: 'What does `<label for="email">` do for `<input id="email">`?', choices: ['Nothing', 'Names the input for screen readers and makes clicking the label focus the input', 'Validates the email', 'Styles the input'], answer: 1, explain: 'A placeholder is not a label: it disappears when you type.' },
        { type: 'mc', q: 'In the CSS box model, from inside out:', choices: ['content, padding, border, margin', 'margin, border, padding, content', 'content, margin, padding, border', 'border, content, margin'], answer: 0, explain: '`box-sizing: border-box` makes width include padding and border.' },
        { type: 'mc', q: 'Flexbox vs grid:', choices: ['Flexbox lays things out in one direction (a row or a column); grid lays out rows AND columns at once', 'They are the same', 'Grid is only for tables', 'Flexbox is deprecated'], answer: 0, explain: 'Toolbars: flex. Page layouts and card grids: grid.' },
        { type: 'mc', q: 'Responsive design means:', choices: ['The site responds fast', 'Layouts adapt to screen size (media queries, fluid units), so the same page works on phones and desktops', 'Using JavaScript for everything', 'A separate mobile site'], answer: 1, explain: 'Most of Bangladesh\'s web traffic is mobile: design for phones first.' },
        { type: 'predict', q: 'Which colour is the text?', code: '<style>\n  p { color: blue; }\n  .note { color: green; }\n  #tip { color: red; }\n</style>\n<p class="note" id="tip">Hello</p>', choices: ['blue', 'green', 'red', 'black'], answer: 2, explain: 'Specificity: id > class > element.' },
      ],
    },
    {
      id: 'javascript',
      title: 'JavaScript in the browser',
      summary: 'Values and types, functions and closures, the DOM and events, promises and async/await, fetch, and modules.',
      minutes: 20,
      quiz: [
        { type: 'predict', q: 'What is logged?', code: 'console.log(1 + "2");\nconsole.log(1 + 2);', choices: ['3 and 3', '"12" and 3', '12 and "3"', 'An error'], answer: 1, explain: '+ with a string concatenates. TypeScript catches many of these surprises.' },
        { type: 'mc', q: '`===` vs `==`:', choices: ['Same', '`===` compares without type conversion; `==` converts types first (0 == "" is true!)', '`==` is stricter', '`===` is for strings only'], answer: 1, explain: 'Always use `===`.' },
        { type: 'predict', q: 'In what order are the lines logged?', code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");', choices: ['A B C D', 'A D C B', 'A D B C', 'A C D B'], answer: 1, explain: 'Synchronous code first, then promise callbacks (microtasks), then timers.' },
        { type: 'mc', q: 'What does `await fetch(url)` give you?', choices: ['The JSON data directly', 'A Response; you then `await response.json()` and should check `response.ok` (fetch does not throw on 404 or 500)', 'A string', 'Nothing'], answer: 1, explain: 'A classic bug: treating a 500 error body as data.' },
        { type: 'mc', q: 'The DOM is:', choices: ['A database', 'The browser\'s tree of objects representing the page, which JavaScript can read and change', 'A CSS framework', 'A server'], answer: 1, explain: 'React manages DOM updates for you.' },
        { type: 'mc', q: 'Why is `element.innerHTML = userInput` dangerous?', choices: ['It is slow', 'If the input contains HTML/JS it is executed: cross-site scripting', 'It deletes the element', 'It is deprecated'], answer: 1, explain: 'Use `textContent`, or let React escape for you.' },
        { type: 'multi', q: 'Which are true about `async`/`await`?', choices: ['`await` pauses the async function until the promise settles, without blocking the browser', 'Errors from awaited promises can be caught with try/catch', '`await` makes code run on another thread', 'Independent awaits can run together with Promise.all'], answer: [0, 1, 3], explain: 'JavaScript is single-threaded; async code interleaves.' },
      ],
    },
    {
      id: 'react-typescript',
      title: 'React with TypeScript',
      summary: 'Components, props and state, hooks (useState, useEffect), lists and keys, typing props, and why TypeScript catches bugs before users do.',
      minutes: 25,
      quiz: [
        { type: 'mc', q: 'In React, a component is:', choices: ['A CSS file', 'A function that takes props and returns UI (JSX); React re-renders it when its props or state change', 'A database table', 'A server'], answer: 1, explain: 'UI = f(state).' },
        { type: 'predict', q: 'Clicking the button once shows:', code: 'function Counter() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>{n}</button>;\n}', choices: ['0', '1', 'undefined', 'An error'], answer: 1, explain: 'setN schedules a re-render with the new state.' },
        { type: 'mc', q: 'Props vs state:', choices: ['Same', 'Props are passed in by the parent (read-only); state is owned and changed by the component itself', 'State comes from the server only', 'Props are global'], answer: 1, explain: 'Data flows down via props; events flow up via callbacks.' },
        { type: 'mc', q: 'Why does React want a `key` on list items?', choices: ['For styling', 'To match items between renders, so it updates the right one (use a stable id, not the array index)', 'For SEO', 'It is optional decoration'], answer: 1, explain: 'Index keys cause wrong items to keep state after re-ordering.' },
        { type: 'mc', q: 'What is TypeScript?', choices: ['A new browser', 'JavaScript with static types, checked before the code runs', 'A CSS framework', 'A database'], answer: 1, explain: 'SaaS-Foundation\'s CI typechecks every package.' },
        { type: 'predict', q: 'What does TypeScript say?', code: 'type Note = { id: number; title: string };\nfunction show(n: Note) { return n.titel.toUpperCase(); }', choices: ['Nothing, it runs fine', 'Error: property "titel" does not exist on type Note (typo caught before running)', 'It returns undefined', 'A runtime crash only'], answer: 1, explain: 'In plain JS this would crash in a user\'s browser.' },
        { type: 'mc', q: 'SaaS-Foundation\'s frontend calls the API through:', choices: ['Hand-written fetch calls everywhere', 'A TypeScript SDK generated from the API\'s OpenAPI file, so request and response types always match the backend', 'Direct database access', 'GraphQL'], answer: 1, explain: 'CI fails if the generated SDK is out of date.' },
      ],
    },
    {
      id: 'nextjs',
      title: 'Next.js and rendering',
      summary: 'Server vs client rendering, the app router, server and client components, route handlers as a backend-for-frontend, middleware, and environment variables.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'Server-side rendering (SSR) means:', choices: ['The browser builds the page from scratch', 'HTML is generated on the server per request, so the first view is fast and indexable; JS then "hydrates" it', 'The database renders HTML', 'No JavaScript at all'], answer: 1, explain: 'Next.js mixes SSR, static generation and client rendering.' },
        { type: 'mc', q: 'A React Server Component:', choices: ['Runs in the browser', 'Runs only on the server: it can read secrets and call the API directly, and ships no JS for itself to the browser', 'Is a database', 'Cannot render HTML'], answer: 1, explain: 'Interactive parts use "use client" components.' },
        { type: 'mc', q: 'Why do components from SaaS-Foundation\'s design system need `"use client"`?', choices: ['They are slow', 'They use browser interactivity (React Aria hooks, event handlers), which only works in client components', 'Licensing', 'They call the database'], answer: 1, explain: 'A real gotcha noted in the project\'s HANDOFF.' },
        { type: 'mc', q: 'In ADR 0001, Next.js route handlers act as a backend-for-frontend (BFF). Why?', choices: ['For speed only', 'They hold the API token in an httpOnly cookie and call the API server-side, so browser JavaScript never sees the token', 'To avoid writing a backend', 'For SEO'], answer: 1, explain: 'XSS can\'t exfiltrate what the page can\'t read.' },
        { type: 'tf', q: 'An environment variable prefixed `NEXT_PUBLIC_` is safe for secrets.', answer: false, explain: 'NEXT_PUBLIC_ values are bundled into browser JavaScript: public by definition.' },
        { type: 'mc', q: 'SaaS-Foundation\'s Next.js middleware does what on every request?', choices: ['Nothing', 'Sets a per-request CSP nonce and security headers, and passes the public host to the API as X-Tenant-Host', 'Logs passwords', 'Renders the page'], answer: 1, explain: 'The API trusts that header only from configured proxies.' },
      ],
    },
    {
      id: 'design-a11y',
      title: 'Design systems and accessibility',
      summary: 'Design tokens and semantic tokens, reusable components, brands and themes, and accessibility basics: labels, keyboard, contrast, alt text, headings.',
      minutes: 20,
      quiz: [
        { type: 'mc', q: 'What is a design token?', choices: ['A login token', 'A named design decision (a colour, spacing, radius, font) used instead of raw values, so brands and themes change in one place', 'An NFT', 'A CSS file'], answer: 1, explain: 'Components use `bg-primary`, never `#7a1f3d` (a SaaS-Foundation rule).' },
        { type: 'mc', q: 'Primitive vs semantic tokens:', choices: ['Same', 'Primitive: raw palette (blue-600). Semantic: meaning (primary, danger, surface) mapped to primitives per brand and mode', 'Semantic tokens are for backend', 'Primitives are deprecated'], answer: 1, explain: 'Brands swap the mapping; components never change.' },
        { type: 'multi', q: 'Accessibility basics every page needs:', choices: ['Every input has a label', 'Everything works with the keyboard alone, with a visible focus ring', 'Text contrast at least 4.5:1 (WCAG AA)', 'Meaningful images have alt text; decorative ones alt=""', 'Placeholder text instead of labels'], answer: [0, 1, 2, 3], explain: 'Placeholders vanish and are often low contrast.' },
        { type: 'mc', q: 'Who benefits from accessibility work?', choices: ['Only blind users', 'Everyone: keyboard users, people with low vision, older users, people on bright-sunlit phones, temporary injuries, and search engines', 'Nobody', 'Only the legal team'], answer: 1, explain: 'It is also a legal requirement in many markets.' },
        { type: 'mc', q: 'SaaS-Foundation checks brand colours how?', choices: ['It doesn\'t', 'A build-time contrast check per brand, and server-side validation of tenant brand overrides', 'Manually by designers', 'With AI'], answer: 1, explain: 'A tenant can\'t pick a brand colour that makes text unreadable.' },
        { type: 'tf', q: 'Using a library of accessible primitives (like React Aria) gets you keyboard and screen-reader behaviour you would otherwise have to build by hand.', answer: true, explain: 'That is why the design system builds on it.' },
      ],
    },
    {
      id: 'frontend-boss',
      title: 'Boss: Accessibility review of the signup page',
      summary: 'Read a signup page\'s HTML and find the accessibility and semantics problems a design-system component would have prevented.',
      minutes: 20,
      boss: true,
      lab: {
        cwd: '~',
        panels: ['network', 'files'],
        setup(H) {
          H.site('acme.example.com', { '/signup': { body: SIGNUP_HTML } });
          H.write('laptop', '~/a11y.md', '# Signup page review\n\n', { owner: 'dev' });
        },
        suggestions: ['curl -s https://acme.example.com/signup'],
        tasks: [
          { title: 'Fetch the page HTML: `curl -s https://acme.example.com/signup`', solution: 'curl -s https://acme.example.com/signup', check: t => t.events('http').some(e => /\/signup$/.test(e.url) && e.status === 200) },
          { title: 'Save it to `~/signup.html` so you can search it', solution: 'curl -s https://acme.example.com/signup > ~/signup.html', check: t => /<form/.test(t.file('laptop', '/home/dev/signup.html') || '') },
          { title: 'Find images without alt text: `grep -n "<img" ~/signup.html`', solution: 'grep -n "<img" ~/signup.html', check: t => t.ran(/\bgrep\b.*<img/) },
          { title: 'Find inputs and how (or whether) each is labelled: `grep -n -E "<input|<label" ~/signup.html`', solution: 'grep -n -E "<input|<label" ~/signup.html', check: t => t.ran(/\bgrep\b.*(input|label)/) },
          { title: 'Write `~/a11y.md`: at least 4 findings with a fix each. Look for: the logo image without alt, the email input with only a placeholder, the low-contrast hint text, the div used as a button, the div used as a heading', solution: 'printf "%s\\n" "1. logo <img> has no alt text: add alt=\\"Acme Bakery\\"" "2. email input has only a placeholder, no <label>: add a label (or use the FormField component)" "3. hint text #c8c8c8 on white has very low contrast (about 1.7:1): use a semantic muted token that meets 4.5:1" "4. Sign up is a <div onclick>: not focusable or keyboard-usable: use <button type=submit>" "5. the title is a styled div: use <h1>" >> ~/a11y.md', check: t => { const s = (t.file('laptop', '/home/dev/a11y.md') || '').toLowerCase(); const hits = [/alt/, /(label|placeholder)/, /contrast/, /(button|keyboard|focus)/, /(h1|heading)/].filter(re => re.test(s)).length; return hits >= 4; } },
        ],
      },
      quiz: [
        { type: 'mc', q: 'Which single change fixes the most for keyboard users on this page?', choices: ['Bigger font', 'Making "Sign up" a real <button type="submit">', 'Adding a logo', 'Changing the background'], answer: 1, explain: 'A div can\'t be reached with Tab or activated with Enter.' },
        { type: 'mc', q: 'Why would SaaS-Foundation\'s FormField component have prevented the email problem?', choices: ['It validates emails', 'It always renders a real <label> tied to the input', 'It adds colour', 'It is faster'], answer: 1, explain: 'Good components make the accessible way the default way.' },
        { type: 'tf', q: 'Decorative images should have alt="" so screen readers skip them.', answer: true, explain: 'Missing alt is different from empty alt: screen readers may read the file name.' },
        { type: 'mc', q: 'The hint text is #c8c8c8 on white (about 1.7:1). The WCAG AA minimum for normal text is:', choices: ['1:1', '3:1', '4.5:1', '10:1'], answer: 2, explain: 'Use a semantic muted token that passes.' },
        { type: 'mc', q: 'Where should the fixes go?', choices: ['Patch this page by hand', 'Rebuild the page with design-system components (FormField, Button) so the accessible version is the default everywhere', 'Add a note to the README', 'Nowhere'], answer: 1, explain: 'Fix it once, in the component.' },
      ],
    },
  ],
};
