## story | One component, fifty screens

SaaS-Foundation's design system has one `Button` component. It's used on every screen of every product built on the platform. When the accessibility review asked for a bigger focus ring, one change fixed fifty screens. That is the point of components: build a piece of UI once, correctly, and reuse it everywhere.

## model | React

- A **component** is a function that takes **props** and returns UI written in **JSX**:

```tsx
type Props = { title: string; done: boolean; onToggle: () => void };

export function NoteRow({ title, done, onToggle }: Props) {
  return (
    <li>
      <label>
        <input type="checkbox" checked={done} onChange={onToggle} /> {title}
      </label>
    </li>
  );
}
```

- **State** (`useState`) is data a component owns; changing it re-renders. **Props** flow down; **callbacks** flow events up.
- **Effects** (`useEffect`) synchronise with the outside world (subscriptions, timers). Data fetching usually goes through a library or a server component instead.
- **Lists** need stable `key`s (ids, not array indexes).
- React **escapes** values in JSX by default (XSS protection), unless you use `dangerouslySetInnerHTML` (the name is the warning).

## model | TypeScript

TypeScript adds **types** to JavaScript and checks them before the code runs: typos in property names, wrong argument types and missing `null` checks become compile errors instead of user-facing bugs. SaaS-Foundation's frontend uses a **generated SDK**, so API calls are typed from the backend's OpenAPI description.

## analogy | LEGO

Components are LEGO bricks: small, standard pieces with defined connectors (props). You build big things by combining them, and a better brick improves everything built with it. TypeScript is the shape of the studs: pieces that don't fit simply don't click.

## traps | Traps

- Copying state that could be derived (two sources of truth drift apart).
- Array-index keys.
- `any` everywhere (it switches TypeScript off).
- Huge components that do fetching, logic and layout at once.
