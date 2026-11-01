## story | The button nobody could press

A redesign replaced every `<button>` with a nicely styled `<div>`. It looked identical. Then support calls started: keyboard users couldn't submit forms, screen-reader users heard "Sign up" as plain text, and mobile users in bright sunlight couldn't see the pale grey hint text. All of it came from forgetting what HTML elements *mean*.

## model | HTML: structure and meaning

HTML describes **what things are**: `<header>`, `<nav>`, `<main>`, `<h1>`-`<h6>` (one `h1` per page, levels in order), `<p>`, `<ul>/<li>`, `<a>` (goes somewhere), `<button>` (does something), `<form>`, `<label>`, `<input>`.

**Semantic elements** come with free behaviour: `<button>` is focusable, works with Enter and Space, and is announced as a button. `<label for="email">` names its input for screen readers and makes the label clickable.

## model | CSS: presentation

- **Selectors and specificity**: element < class < id < inline style. Later rules win ties. Prefer classes; avoid `!important`.
- **The box model**: content → padding → border → margin. Use `box-sizing: border-box`.
- **Layout**: **flexbox** for one direction (toolbars, rows of buttons), **grid** for two (page layouts, card grids).
- **Responsive design**: fluid widths, `rem` units, media queries: design for the phone first, then widen.
- In SaaS-Foundation you'll mostly write **Tailwind** utility classes driven by **design tokens** (`bg-primary`, `text-muted`), not raw CSS colours.

## analogy | A building's structure and its paint

HTML is the structure of a building: walls, doors, stairs, signs saying which room is which. CSS is the paint, lighting and furniture. You can repaint freely, but if you draw a door on a wall instead of building one (a div styled as a button), people can't walk through it.

## traps | Traps

- Placeholders as labels (they vanish when typing and are usually low contrast).
- Skipping heading levels or using headings for size instead of structure.
- Fixed pixel widths that break on small phones.
- Clickable divs and spans.
