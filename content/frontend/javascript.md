## story | The menu that said "undefined"

A bakery's menu page showed "undefined undefined undefined" for an afternoon. The API had started returning `{ "items": [...] }` instead of a plain list, and the JavaScript did `data.map(...)` on the object. Nothing crashed on the server, every test there passed, and users saw nonsense. Frontend code runs on thousands of devices you don't control, so types and careful handling of API responses matter.

## model | JavaScript essentials

- **Values**: numbers, strings, booleans, `null`/`undefined`, objects `{}`, arrays `[]`. Use `===` (no type conversion), `const` by default, `let` when it changes.
- **Functions** and **closures**: a function remembers the variables around it.
- **The DOM**: the page as a tree of objects; `document.querySelector`, `addEventListener('click', ...)`. Use `textContent`, not `innerHTML`, for user data (XSS).
- **Asynchronous code**: the browser has one thread. Slow work (network, timers) uses **promises**; `async`/`await` makes them readable:

```js
async function loadMenu() {
  const res = await fetch('/api/menu');
  if (!res.ok) throw new Error(`menu failed: ${res.status}`);  // fetch does NOT throw on 404/500
  return (await res.json()).items;
}
```

- **Event loop**: synchronous code runs first, then promise callbacks, then timers.
- **Modules**: `import`/`export` split code into files.

## analogy | A single waiter

JavaScript in the browser is one waiter serving a whole restaurant. They never stand at the kitchen door waiting for one dish (that would freeze the page); they take the order, move on, and come back when the kitchen rings (a promise resolves).

## traps | Traps

- Assuming `fetch` throws on HTTP errors.
- `innerHTML` with user data.
- Forgetting `await` (you get a Promise, not the data).
- `==` surprises (`0 == ""` is `true`).
