# Best practices

The rules this codebase is built on, and _why_ — a rule without its reasoning gets discarded the
first time it is inconvenient.

Most of these were paid for. The sections marked **⚠ Gotcha** are bugs that actually occurred
while building this, several of which the type system and the linter both accepted happily.

---

## 0. The five rules

1. **Two of anything is a bug.** A second HTTP client, a second async-state hook, a second way to
   run an exit animation — each one is a place where behaviour will diverge. Find the existing
   abstraction or change it.
2. **Motion values come from `config/animation.ts`.** Never a literal duration or easing in a
   component.
3. **Colours are semantic.** `bg-surface-raised`, never `bg-zinc-900`.
4. **Accessibility lives in the primitive, not the call site.** If a consumer _can_ wire ARIA
   wrong, the primitive is wrong.
5. **A component describes what; a hook owns the lifecycle.** Components should not contain
   cleanup logic.

---

## 1. Structure & naming

| Thing        | Convention                               | Example                               |
| ------------ | ---------------------------------------- | ------------------------------------- |
| Components   | `PascalCase.tsx`, one component per file | `ShowcaseCard.tsx`                    |
| CVA variants | `Component.variants.ts`                  | `Button.variants.ts`                  |
| Contexts     | `Component.context.ts`                   | `Field.context.ts`                    |
| Hooks        | `useThing.ts`, named export              | `useProjects.ts`                      |
| Stores       | `name.store.ts`                          | `toast.store.ts`                      |
| Feature APIs | `name.api.ts` inside `api/`              | `showcase.api.ts`                     |
| Pages        | `NamePage.tsx`, **default** export       | `ShowcasePage.tsx` (for `React.lazy`) |
| Barrels      | `index.ts` — a feature's public API      | `features/showcase/index.ts`          |

**Rules**

- Import via `@/…` absolutely. `./sibling` is fine; `../../..` is banned by ESLint.
- Cross-feature imports go through `features/x/index.ts` only. Reaching into
  `features/x/components/Internal.tsx` from another feature is the first step to a monolith.
- `config/`, `lib/`, `utils/`, `hooks/`, `services/` never import from `features/`. If a "shared"
  thing needs a feature, it is not shared.
- Pages compose sections. If a page has data fetching or animation code in it, that belongs in a
  hook or a section component.

**Barrels:** one per layer/feature, exporting the public surface. Do **not** create a barrel per
folder — deep barrel chains cause circular imports and defeat tree-shaking. Inside a feature,
import by full path (`@/features/showcase/components/ShowcaseCard`); from outside, import from the
feature root.

---

## 2. Components

### Variants as data, not branches

```tsx
// ✅  cva: adding a variant cannot introduce a branch bug, and the prop type is derived
export const buttonVariants = cva(base, { variants: { variant: { primary: '…' } } });
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {}

// ❌  the fifth conditional is where the regression lives
const cls = isPrimary ? '…' : isDanger ? '…' : isGhost && !disabled ? '…' : '…';
```

Keep variants in `Component.variants.ts`: Fast Refresh only applies to modules that export
components, so a co-located non-component export makes every edit a full reload.

### `cn()` so the consumer always wins

`cn = twMerge(clsx(...))`. Put it last, over the variant classes, so `<Button className="px-8" />`
actually gets `px-8` instead of losing to the variant's `px-5`.

### `asChild` over `as`

Radix `Slot` composes onto the child element, which keeps `<Button asChild><Link/></Button>`
correctly a single `<a>` — no wrapper, no polymorphic-props type gymnastics.

> **⚠ Gotcha — `Slot` needs `Slottable`.**
> `Slot` clones exactly **one** child. `<Button asChild rightIcon={…}>` passes three children and
> throws _"Slot failed to slot onto its children"_ at runtime. TypeScript cannot see this and
> ESLint cannot see this; the page renders as an error boundary. Mark which child becomes the root:
>
> ```text
> <Component ...>
>   {leftIcon}
>   {asChild ? <Slottable>{children}</Slottable> : children}
>   {rightIcon}
> </Component>
> ```
>
> The lesson is bigger than the fix: **run the app before calling it done.** A clean
> typecheck/lint/build says nothing about whether React can render it.

### Controlled dialogs must restore focus themselves

> **⚠ Gotcha — a controlled Radix Dialog loses focus on close.**
> Radix restores focus by calling `context.triggerRef.current?.focus()`, and only
> a `<Dialog.Trigger>` populates `triggerRef`. `<Modal>` and `<MobileNav>` here
> are controlled (`open` + `onOpenChange`) and opened by an arbitrary button, so
> `triggerRef` is `null`. Radix's handler still calls `event.preventDefault()`,
> which _also_ suppresses `FocusScope`'s own fallback — so focus lands on
> `<body>` and a keyboard user is dumped to the top of the document.
>
> Measured, not guessed: a real click + `Escape` left
> `document.activeElement === document.body`. Removing the fix reproduces it;
> adding it back returns focus to the trigger. `npm run smoke` asserts this.
>
> The fix is [`useReturnFocus`](../src/hooks/useReturnFocus.ts) — a capture-phase
> `focusin` listener that remembers the last element focused outside any dialog,
> wired to `onCloseAutoFocus`. Shared by both surfaces, so it exists once.
>
> Note that `element.click()` does **not** move focus, so a test that opens a
> dialog that way cannot detect this at all. Drive real input events.

### `memo` only where it pays

Two legitimate uses in this codebase, both with a named reason:

- `RoleCard` / carousel slides — Swiper fires `onProgress` on every frame of a drag.
- `ToastItem` — a new toast must not re-render existing ones and restart their countdowns.

Everywhere else, `memo` costs a comparison and buys nothing. Prefer fixing the _cause_ of the
re-render: narrow the selector, hoist the constant, stabilise the callback.

---

## 3. Animation

### Choose the right tool

| Use                                                            | Tool                         | Why                                             |
| -------------------------------------------------------------- | ---------------------------- | ----------------------------------------------- |
| Hover, press, focus, colour change                             | CSS transition               | One property, sub-200ms, free on the compositor |
| Multi-element sequence, scroll-bound, exit animation, counters | GSAP                         | Timelines, ScrollTrigger, cleanup               |
| Layout-dependent measurement                                   | GSAP + `invalidateOnRefresh` | Re-measures instead of caching a stale number   |

Reaching for GSAP to fade a button is how a 116 kB dependency ends up on the critical path of a
hover state.

### Always go through `useGsapContext`

```tsx
const root = useGsapContext<HTMLDivElement>(
  ({ scope, reduced }) => {
    playPreset({
      targets: scope.querySelectorAll('[data-item]'),
      preset: 'fade-up',
      reduced,
      scrollTrigger: { trigger: scope, start: SCROLL.start, once: true },
    });
  },
  [deps],
);
return <div ref={root}>…</div>;
```

It gives you, for free: plugin registration, a **layout effect** (the `from` state is applied
before paint — with `useEffect` the user sees one frame of un-animated layout), selector scoping
(two instances of the same component cannot animate each other's children), full `revert()` on
unmount or dep change, and the `reduced` flag.

`setup` may return a cleanup function; GSAP runs it as part of `revert()`. That is how
`AnimatedText` restores its original markup.

**The two exceptions**, both documented in place, both for the same reason — the tween must start
from the element's _current_ position, and `revert()` would reset it first:

- `ThemeToggle`'s sliding indicator.
- `RouteTransition`'s page fades.

Those use a bare `useLayoutEffect` + explicit `tween.kill()`.

### Reduced motion is not optional

Every animation path handles it. The pattern differs by kind of animation:

```tsx
// Reveals: jump to the end state.               (playPreset does this for you)
if (reduced) {
  gsap.set(targets, { ...preset.to, clearProps: 'transform,filter,clipPath' });
  return;
}

// Enter/exit choreography: fast-forward the same timeline, so onComplete still fires
// and the state machine is identical.          (useAnimatedPresence does this for you)
const animation = runEnter(element);
if (reduced) animation?.progress(1);

// Information (not decoration) must survive: the scroll-progress bar keeps updating,
// just without a scrubbed tween.
```

The failure mode to fear is an element stuck at `opacity: 0` because the reduced-motion branch
skipped the tween that would have revealed it. When adding an animation, test with reduced motion
on — that is the path where content disappears.

### Progressive enhancement: never pre-hide with CSS

GSAP applies the `from` state itself, at runtime. So if the bundle fails, the content is simply
visible. An `opacity: 0` in a stylesheet waiting for JS to remove it is a blank page one CDN
failure away.

### ScrollTrigger

- Distances are **functions**, plus `invalidateOnRefresh: true` — `end: () => \`+=${distance()}\``.
  A captured number leaves dead scroll space after a resize or a font load.
- Call `ScrollTrigger.refresh()` after route content mounts. `RouteTransition` does it on enter
  complete; without it, every scroll animation on the new page measures the previous page's height.
- For >20 elements use `batchReveal()` (`ScrollTrigger.batch`) — shared triggers instead of one per
  element.
- Pinning is desktop-only here. It fights momentum scrolling and the mobile URL bar; small screens
  get native `scroll-snap`, which looks better and is less code.

> **⚠ Gotcha — GSAP owns the whole `transform` property.**
> Centring a modal with `top-1/2 -translate-y-1/2` and then tweening `scale` wipes out the
> translate, and the panel jumps to the corner. Either animate a wrapper, or centre without
> transforms — this codebase uses `fixed inset-0 m-auto h-fit`.

> **⚠ Gotcha — inline transforms beat CSS hover.**
> After a reveal, GSAP leaves `transform: translate(0,0)` inline, which silently kills
> `hover:-translate-y-1`. `playPreset` ends every reveal with
> `clearProps: 'transform,filter,clipPath'` to hand control back to CSS.

> **⚠ Gotcha — `killTweensOf` is per-element, not per-timeline.**
> `enter`/`exit` return timelines that may animate several nodes (a panel _and_
> its overlay). `gsap.killTweensOf(panel)` kills only the panel's tween; the
> overlay's keeps running and can outlive the replacement timeline, winning the
> final write. Keep a handle on the animation and `.kill()` that instead —
> see `useAnimatedPresence`.

### Text reveal

`<AnimatedText>` splits into `char` / `word` / `line`, each unit inside an `overflow: hidden` mask.

- Accessibility: a clean visually-hidden copy of the text for screen readers, and the shredded copy
  marked `aria-hidden`. Splitting a sentence into 40 spans otherwise gets announced as 40
  fragments. The cost is the text appearing twice in `textContent`; that is the accepted trade.
- Masks bleed `padding-bottom: 0.14em` with a matching negative margin, or descenders (g, y, p) get
  clipped.
- Graphemes are segmented with `Intl.Segmenter` — `split('')` tears emoji and combining marks apart.
- `line` mode measures the natural wrap, so it must re-split when the text or layout changes; the
  context cleanup reverts the DOM each time.
- Above-the-fold headlines use `immediate`, not a ScrollTrigger. An element already in view that
  waits for a scroll event stays invisible.

---

## 4. State

**Decision order — stop at the first that works:**

1. Derive it. `resolved` theme is `mode` + a media query, never stored.
2. `useState` in the component.
3. A shared hook (`useDisclosure`, `useAsync`).
4. A Zustand store — only for state that genuinely spans distant parts of the tree.

### Stores

Create every store through [`createStore`](../src/store/createStore.ts) so devtools and `persist`
are wired identically everywhere. Name your actions:

```ts
set({ isOpen: true }, false, 'ui/openMobileNav'); // ← label shows up in the devtools timeline
```

Export **atomic selectors** next to the store and subscribe narrowly:

```ts
export const selectMobileNavOpen = (s: UiState) => s.isMobileNavOpen;

useUiStore(selectMobileNavOpen); // ✅ re-renders on one boolean
useUiStore((s) => ({ a: s.a, b: s.b })); // ❌ new object every call → re-render every write
```

Persist the minimum, via `partialize`, and bump `version` when the shape changes. Never persist
derived or transient state — a user who changes their OS theme must not be stuck on a stale value.

> **⚠ Gotcha — the persisted envelope is a contract.**
> `index.html`'s pre-paint theme script parses what Zustand `persist` writes:
> `{ "state": { "mode": … }, "version": … }`. Change the store's key, `partialize` shape, or
> storage and that script silently falls back — reintroducing the theme flash. The two are linked
> by `STORAGE_KEYS.theme` and a comment in both files.

### Imperative APIs beat hook-only APIs

```ts
toast.success('Saved'); // works in components, interceptors, store actions, event listeners
```

`toast` reads the store via `getState()`, so there is exactly one notification API — no hook
variant that drifts from the imperative one. `useToast()` just returns the same stable object.

### Latest values in effects: `useEffectEvent`, not a ref

```tsx
// ✅  stable identity, always-fresh closure, and the linter understands it
const runSetup = useEffectEvent((api) => setup(api));

// ❌  "Cannot update ref during render" — and it hides real dependency bugs
const setupRef = useRef(setup);
setupRef.current = setup;
```

If you must use a ref, assign it **in an effect declared before** the effect that reads it —
never during render.

> Note: `react-hooks` v6 only recognises literal `useEffect` / `useLayoutEffect` /
> `useInsertionEffect` as effects. A conditional `useIsomorphicLayoutEffect` alias breaks that
> analysis, which is why this browser-only SPA calls `useLayoutEffect` directly. If SSR is added,
> reintroduce the wrapper _and_ register it in the ESLint config.

---

## 5. Data

```
component → feature hook (useProjects) → feature api (showcase.api.ts) → services/api.ts → HttpClient
```

- Nothing calls `fetch` outside `HttpClient`. That is the only place timeouts, retries, tracing
  headers and error normalisation can be guaranteed.
- Cross-cutting concerns are interceptors (`api.interceptors.onRequest.push(...)`), not call-site
  edits.
- Endpoints are data (`ENDPOINTS.projects.detail(slug)`), so a backend rename is one line.
- Retries apply to idempotent methods by default, with exponential backoff **plus jitter** so a
  recovering server does not get a synchronised stampede.
- Distinguish error kinds: `HttpError` (with `isClientError` / `isServerError` / `isUnauthorized`),
  `NetworkError`, `TimeoutError`. UI branches on the class, never on a message string.
- A caller's abort is propagated as-is so `useAsync` can swallow it; a timeout becomes a
  `TimeoutError` the user should see. Conflating them shows an error toast every time a component
  unmounts mid-request.
- `useAsync` guards stale responses with a request id, aborts on unmount and on re-run. It is also
  the single seam to swap for TanStack Query — feature hooks keep working unchanged.
- Mocks live in the feature's `*.api.ts` behind `env.features.mockApi`, so components never know.
  Keep a deterministic failure path (here: an `@fail.test` email) so the error branch is reachable
  by hand.

---

## 6. Theming

- Semantic utilities only. If you need a colour that does not exist, add a token — do not inline a
  palette value. One raw `bg-zinc-900` is a permanent dark-mode bug.
- Add a token in three places: `:root`, `.dark`, and the `@theme inline` mapping. Miss the mapping
  and the utility silently produces nothing.
- `@theme inline` is deliberate: utilities emit `var(--token)`, so `.dark` re-themes the page with
  no duplicate CSS and no re-render.
- Tailwind v4 has no `tailwind.config.js` — the CSS _is_ the config. Also: the important modifier
  is now a **suffix** (`pb-10!`), and gradients are `bg-linear-to-r`, not `bg-gradient-to-r`.
- `color-scheme` is set on `<html>` alongside the class, so scrollbars, form controls and the caret
  follow the theme too.

---

## 7. Accessibility checklist

Before merging any UI:

- [ ] Reachable and operable with the keyboard alone, in a sensible order.
- [ ] Every interactive element has an accessible name (visible text, `aria-label`, or `sr-only`).
- [ ] Focus is visible — the global `:focus-visible` ring is never removed, only restyled.
- [ ] Focus goes somewhere sensible after an action — dialog/drawer close returns focus to the
      trigger (see `useReturnFocus`; this does **not** happen by default for controlled dialogs).
- [ ] Form controls are inside `<Field>`; validation errors use `role="alert"` and focus moves to
      the first offender on submit.
- [ ] Status messages go through a live region; errors are `role="alert"`, the rest `role="status"`.
- [ ] Auto-dismissing UI pauses on hover **and** `focus-within` — otherwise a keyboard user's
      target vanishes mid-reach.
- [ ] Heading levels descend without gaps; a visually-hidden `<h2>` for a section is fine.
- [ ] Tested with `prefers-reduced-motion: reduce`: no content is missing and no information is lost.
- [ ] Decorative elements are `aria-hidden="true"` (gradients, icons next to text, split-text copies).
- [ ] No `tabIndex={0}` on non-interactive elements — that is a tab stop that does nothing.

Prefer a headless library (Radix) or a native element over hand-rolled ARIA. The theme switch is
real radio inputs precisely so arrow-key navigation comes from the platform.

---

## 8. Performance checklist

- [ ] New page is `React.lazy`'d in `router.tsx`.
- [ ] A heavy dependency is imported only by the route that needs it (check the `vite build` chunk
      list — Swiper must not appear in the home-page graph).
- [ ] Animations touch only `transform` / `opacity` / `clip-path` / `filter`.
- [ ] No `scroll` or `resize` listener writes React state. Scrub with ScrollTrigger and write to
      the DOM, or the whole subtree re-renders every frame.
- [ ] `Intl` formatters are module-scope constants, not created per render.
- [ ] List items that live inside a high-frequency parent are `memo`'d, with a comment saying why.
- [ ] Store subscriptions are atomic selectors.
- [ ] `will-change` is applied via the `will-animate` utility on elements that actually animate —
      not sprayed across the page, where it wastes compositor memory.

---

## 9. TypeScript

- `strict`, plus `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `noImplicitOverride`,
  `erasableSyntaxOnly`, `verbatimModuleSyntax`. Each has caught something real.
- `noUncheckedIndexedAccess` makes `array[i]` possibly-`undefined`. Handle it — that is the point.
- `erasableSyntaxOnly` bans parameter properties and enums. Declare class fields explicitly
  (see `HttpError`) and use `as const` objects instead of enums.
- No `any`, enforced by lint. `unknown` + a narrowing function at the boundary
  (`utils/error.ts`, `config/env.ts`).
- Casts are allowed in exactly one situation: composing a library's generic middleware behind our
  own API (`createStore`). They are contained in that one file and commented. A cast in a component
  is a design problem.
- Derive types from values (`VariantProps<typeof buttonVariants>`, `keyof typeof MOTION_PRESETS`)
  rather than maintaining a parallel union that can drift.

> **⚠ Gotcha — `keyof ImportMetaEnv` is useless.**
> Vite's `ImportMetaEnv` has an `[key: string]: any` index signature, so `keyof` widens to
> `string | number` and indexing launders `any` into your app. Declare your own
> `AppImportMetaEnv` and key off that (`src/vite-env.d.ts`) to get a real literal union and a
> compile error on a typo'd variable name.

---

> **⚠ Gotcha — ESLint flat-config spread order.**
> `tseslint.configs.disableTypeChecked` carries its own `languageOptions`. Spread
> it _after_ your own `languageOptions` and it silently overwrites them — Node
> globals vanish and every `process` reference becomes `no-undef`. Spread the
> preset first, then override.

---

## 10. Adding a feature

All site copy lives in [src/data/resume.ts](../src/data/resume.ts). Components never hard-code
content — if a string appears in the UI, it came from there.

```bash
src/features/pricing/
├── api/pricing.api.ts
├── hooks/usePlans.ts
├── components/PlanCard.tsx
├── types.ts
├── PricingPage.tsx        # default export
└── index.ts               # public API
```

1. Add the path to `config/routes.ts` (`ROUTES` + `NAV_ITEMS`) — header, drawer and footer update
   themselves.
2. Add a lazy route in `app/router.tsx`.
3. Data: `api/pricing.api.ts` calling the shared `api`, wrapped in `hooks/usePlans.ts` over
   `useAsync`.
4. UI: compose `components/ui` primitives. If you need a third variant of something that exists,
   extend its `*.variants.ts` rather than writing a new component.
5. Animate with `<Reveal>` / `<AnimatedText>` / `<StaggerGroup>`. Only reach for `useGsapContext`
   when you need a real timeline.
6. Export the public surface from `index.ts`.
7. Run `npm run lint && npm run typecheck && npm run build` — **and load the page.**

---

## 11. Review checklist

Reject on sight:

- A magic duration, easing, colour or breakpoint literal in a component.
- A second implementation of something in `hooks/`, `lib/` or `services/`.
- `fetch` outside `HttpClient`.
- A raw Tailwind palette colour.
- A `useEffect` doing animation work (it must be `useLayoutEffect`, and really it must be
  `useGsapContext`).
- An animation with no reduced-motion story.
- A new store not created via `createStore`.
- A cross-feature import that bypasses the feature's `index.ts`.
- A `role`/`aria-*` attribute hand-rolled where a Radix primitive or native element exists.
- "It compiles" as the definition of done. Run `npm run verify && npm run smoke`.

---

## 12. Known trade-offs

Stated plainly, because undocumented trade-offs get rediscovered as bugs.

- **`useAsync` is not a cache.** No dedup, no background refetch, no shared cache across
  components. Deliberate — it keeps the scaffold dependency-free. The moment two components need
  the same data, swap its body for TanStack Query; the feature hooks are already the right shape.
- **`RouteTransition` keeps the outgoing route element mounted** for ~200ms during the exit tween.
  Its hooks still run against the _new_ location, which is fine for content pages but would matter
  for a route reading `useParams` during exit. Shorten or remove the exit tween there.
- **`splitText` flattens nested inline markup**, because it operates on `textContent`. Split leaf
  elements, not containers. `<AnimatedText>` therefore accepts `string` only — enforced by its
  props type.
- **Split text appears twice in the DOM** (visually-hidden + `aria-hidden`). Correct for screen
  readers, slightly redundant for crawlers. Accepted.
- **Browser smoke test, but no unit tests.** `npm run smoke` (see
  [scripts/smoke.mjs](../scripts/smoke.mjs)) drives headless Chrome over CDP with zero
  dependencies and asserts 19 behaviours that are hard to unit-test and easy to break: animation
  end-states, focus management, exit animations actually completing, theme persistence, and
  reduced-motion output. It found both of the runtime bugs documented above.
  There is no unit suite; the seams are ready for one (`HttpClient` takes injected config, `env` is
  a single module to stub, presets are pure data, every hook is isolated). Start with Vitest +
  Testing Library on `useAsync`, `toast.store`, `splitText` and the `Field` ARIA wiring.
- **Web fonts load from Google Fonts** via `<link>` in `index.html`. Self-host with `@fontsource`
  for a stricter CSP and one less third-party connection.
