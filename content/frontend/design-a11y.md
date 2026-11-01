## story | One in six

About one in six people has a significant disability, and far more have temporary or situational ones: a broken arm, a toddler on one hip, glare on a phone screen, slow mobile data. When an interface works with a keyboard, a screen reader and good contrast, it works better for everyone.

## model | Design systems

A **design system** is a shared set of **tokens** (named design decisions) and **components** (built once, accessibly) that every product uses.

- **Primitive tokens**: the raw palette and scales (`blue-600`, `space-4`).
- **Semantic tokens**: meaning (`primary`, `danger`, `surface`, `text-muted`), mapped to primitives per **brand** and **light/dark mode**.
- Components use only semantic tokens, so a new tenant brand changes colours everywhere without touching a component.

SaaS-Foundation: `packages/tokens` (two brands, **contrast-checked at build time**), `packages/design-system` (Button, Input, FormField, Card, ThemeProvider on **React Aria** for keyboard and screen-reader behaviour). Tenant brand overrides are validated on the server too.

## model | Accessibility (a11y) basics (WCAG AA)

- **Labels** on every form control (a `<label>`, not a placeholder).
- **Keyboard**: everything reachable with Tab, usable with Enter/Space, with a visible focus ring; no keyboard traps.
- **Contrast**: 4.5:1 for normal text, 3:1 for large text and UI parts.
- **Alt text** for meaningful images; `alt=""` for decorative ones.
- **Structure**: headings in order, landmarks (`<main>`, `<nav>`), real buttons and links.
- **Don't rely on colour alone** (add icons or text to errors).
- Respect **reduced motion**; support **200% zoom**.

## analogy | Ramps and kerb cuts

Kerb cuts were built for wheelchair users, and now parents with prams, travellers with suitcases and delivery workers with trolleys all use them. Accessible design is the kerb cut of software.

## traps | Traps

- "We'll add accessibility later": retrofitting is far more expensive.
- Custom widgets (dropdowns, modals) without keyboard support.
- Brand colours chosen without a contrast check.
