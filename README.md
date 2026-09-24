# Tavheeda Bashir Bara — Proposal Specialist portfolio

Portfolio site for **Tavheeda Bashir Bara**, APMP Certified Proposal Specialist, built on a
modular, DRY, animation-first React + TypeScript architecture.

All site content comes from one file — [src/data/resume.ts](src/data/resume.ts) — transcribed from
the source CV. Nothing is invented: figures, role bullets, contract vehicles, tools, certifications
and education are verbatim. A CV update is a one-file change.

```
React 19 · TypeScript 6 (strict) · Vite 8 · Tailwind CSS v4 · GSAP 3 (+ScrollTrigger)
Swiper 14 · Zustand 5 · React Router 8 · Radix UI · CVA · ESLint 9 + Prettier
```

**Verified state:** `tsc` clean under `strict` + `noUncheckedIndexedAccess`; `eslint .` clean
(0 errors / 0 warnings, typed linting + `jsx-a11y` + `react-hooks` v6); `vite build` succeeds with
per-route code splitting; **19/19 browser checks pass** (`npm run smoke`) across all four routes,
covering focus management, theme persistence, exit animations, reduced motion and mobile
fallbacks.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173

npm run typecheck    # tsc, app + node configs
npm run lint         # eslint (flat config, type-aware)
npm run format       # prettier, incl. Tailwind class sorting
npm run build        # typecheck + production build
npm run preview      # serve dist/

npm run verify       # lint + typecheck + build
npm run smoke        # 21 browser checks against a running preview server
```

`npm run smoke` drives headless Chrome over CDP with **no test dependencies**
([scripts/smoke.mjs](scripts/smoke.mjs)). It asserts the things a type checker cannot see —
animation end-states, focus restoration, exit animations completing, theme persistence,
reduced-motion output, and the mobile fallbacks. Start `npm run preview` first, or pass a URL:
`npm run smoke -- http://localhost:5173`.

Environment: copy `.env.example` → `.env.local`. `.env.development` / `.env.production` are
committed defaults. Variables are parsed and validated **once**, in
[src/config/env.ts](src/config/env.ts) — nothing else in the app touches `import.meta.env`.

---

## 1. Folder structure

Feature-based, not type-based. The rule: **shared code lives in a global folder; everything a single
feature owns lives inside that feature.** A feature can be deleted by deleting its directory.

```
tavheeda_bashir_website/
├── index.html                    # theme bootstrap script (pre-paint, no FOUC)
├── vite.config.ts                # @/ alias, vendor chunk strategy
├── tsconfig.json                 # app program (strict); tsconfig.node.json for build files
├── eslint.config.js              # flat config: type-aware + a11y + hooks + import sorting
├── .prettierrc.json              # incl. prettier-plugin-tailwindcss
├── .env.example / .development / .production
├── public/favicon.svg
│
└── src/
    ├── main.tsx                  # entry: mounts <App/> in StrictMode
    ├── App.tsx                   # providers + RouterProvider
    ├── vite-env.d.ts             # AppImportMetaEnv → typed env keys
    │
    ├── app/                      # ── composition root (wiring only, no UI)
    │   ├── AppProviders.tsx      #    ErrorBoundary → Theme → Tooltip → ToastViewport
    │   └── router.tsx            #    route table; React.lazy per page
    │
    ├── config/                   # ── constants & design decisions as data
    │   ├── animation.ts          #    EASE / DURATION / STAGGER / MOTION_PRESETS  ← motion system
    │   ├── constants.ts          #    STORAGE_KEYS, BREAKPOINTS, MEDIA_QUERIES, TOAST_DEFAULTS
    │   ├── env.ts                #    the ONLY reader of import.meta.env
    │   ├── routes.ts             #    ROUTES + NAV_ITEMS (router, header, drawer, footer)
    │   └── site.ts               #    site metadata, social links
    │
    ├── styles/
    │   └── globals.css           # ── design tokens, @theme mapping, base layer, @utility
    │
    ├── lib/                      # ── framework-agnostic helpers (no React state)
    │   ├── cn.ts                 #    clsx + tailwind-merge
    │   └── gsap/
    │       ├── index.ts          #    registers plugins once, sets global defaults
    │       ├── motion.ts         #    playPreset() / batchReveal() — the preset runner
    │       └── splitText.ts      #    dependency-free word/char/line splitter with masks
    │
    ├── hooks/                    # ── shared, feature-agnostic hooks
    │   ├── useGsapContext.ts     #    THE animation primitive (scoped + auto-reverting)
    │   ├── useAnimatedPresence.ts#    enter/exit choreography for transient surfaces
    │   ├── useAsync.ts           #    one loading/error/data machine, abort-safe
    │   ├── useMediaQuery.ts      #    + usePrefersReducedMotion / useIsDesktop / useHasHover
    │   ├── useDisclosure.ts  useEventListener.ts  useLocalStorage.ts
    │   └── index.ts              #    public API of the hooks layer
    │
    ├── services/                 # ── the single HTTP boundary
    │   ├── api.ts                #    configured client + interceptors + ENDPOINTS map
    │   ├── http/client.ts        #    fetch wrapper: timeout, retry+backoff, typed errors
    │   ├── http/errors.ts        #    HttpError / NetworkError / TimeoutError + isRetryableError
    │   └── index.ts
    │
    ├── store/                    # ── global state
    │   ├── createStore.ts        #    store factory (devtools + optional persist), used by ALL stores
    │   ├── ui.store.ts           #    mobile nav, intro-played flag + atomic selectors
    │   └── index.ts
    │
    ├── components/               # ── shared UI, organised by responsibility
    │   ├── ui/                   #    primitives: Button, Card, Badge, Field/Input/Textarea,
    │   │                         #    Modal, Tooltip, Spinner, Skeleton (+ *.variants.ts)
    │   ├── motion/               #    Reveal, StaggerGroup, AnimatedText, HorizontalScroll,
    │   │                         #    ScrollProgress, RouteTransition
    │   └── common/               #    Container/Section, SectionHeading, ErrorBoundary,
    │                             #    RouteFallback, SkipLink
    │
    ├── layouts/                  # ── application shell
    │   ├── RootLayout.tsx        #    SkipLink → Header → main(ErrorBoundary→Suspense) → Footer
    │   └── components/           #    Header, Footer, NavLinks, MobileNav
    │
    ├── data/
    │   └── resume.ts             # ── ALL site content, transcribed from the CV
    │
    ├── features/                 # ── self-contained slices
    │   ├── home/                 #    Hero, Highlights, Summary, Expertise, Credentials
    │   ├── experience/           #    api/ hooks/ components/ + ExperiencePage
    │   ├── contact/              #    api/ hooks/ components/ + ContactPage
    │   ├── notifications/        #    store/ components/ hooks/ types.ts  (the toast system)
    │   ├── theme/                #    store/ hooks/ components/  (dark/light/system)
    │   └── misc/                 #    NotFoundPage
    │
    └── utils/                    # ── pure functions
        ├── error.ts  id.ts  misc.ts  storage.ts
        └── index.ts
```

### The anatomy of a feature

Every feature follows the same shape, so any engineer can navigate an unfamiliar one:

```
features/experience/
├── api/experience.api.ts     # resolves CV data with the same async shape as any API
├── hooks/useRoles.ts         # feature data hook (wraps the shared useAsync)
├── components/               # feature-only components
│   ├── RoleCard.tsx
│   ├── VehiclesCarousel.tsx  # Swiper integration
│   └── DomainsRail.tsx       # pinned horizontal scroll
├── ExperiencePage.tsx        # composition only — default export, for React.lazy
└── index.ts                  # PUBLIC API. Other features import only from here.
```

**Dependency direction** (enforced by review, and by `no-restricted-imports` for deep relatives):

```
features/ ──→ components/ ──→ hooks/ ──→ lib/ ──→ utils/
    │              │             │
    └──────────────┴─────────────┴──→ config/   services/   store/

layouts/ ──→ components/, features/*/index.ts (public API only)
app/     ──→ everything (it is the composition root)
```

Nothing in `config/`, `lib/`, `utils/`, `services/` or `hooks/` ever imports from `features/`.

---

## 2. Deliverables map

Everything the brief asked for, and where it lives.

| Requirement                                  | Implementation                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Feature-based modular structure              | `src/features/*` each with `api/ hooks/ components/ types.ts index.ts`                                 |
| Shared hooks                                 | [src/hooks/](src/hooks/) — 7 hooks, one barrel                                                         |
| Shared UI primitives                         | [src/components/ui/](src/components/ui/)                                                               |
| Centralised API layer                        | [src/services/http/client.ts](src/services/http/client.ts) + [api.ts](src/services/api.ts)             |
| State management                             | Zustand via one factory: [src/store/createStore.ts](src/store/createStore.ts)                          |
| Routing + lazy pages                         | [src/app/router.tsx](src/app/router.tsx) (`React.lazy` + `<Suspense>`)                                 |
| Headless/accessible components               | Radix Tooltip + Dialog + Slot, native radios for the theme switch                                      |
| GSAP page transitions                        | [RouteTransition.tsx](src/components/motion/RouteTransition.tsx)                                       |
| Scroll-triggered + staggered animation       | [Reveal.tsx](src/components/motion/Reveal.tsx), [motion.ts](src/lib/gsap/motion.ts)                    |
| `useLayoutEffect` performance                | [useGsapContext.ts](src/hooks/useGsapContext.ts) — every animation goes through it                     |
| Text reveal (word/char/line, mask)           | [AnimatedText.tsx](src/components/motion/AnimatedText.tsx) + [splitText.ts](src/lib/gsap/splitText.ts) |
| Horizontal scroll section                    | [HorizontalScroll.tsx](src/components/motion/HorizontalScroll.tsx) (pinned)                            |
| Swiper: momentum, snap, touch + mouse        | [ShowcaseCarousel.tsx](src/features/showcase/components/ShowcaseCarousel.tsx)                          |
| Dark/light + system + persistence            | [src/features/theme/](src/features/theme/) + bootstrap script in `index.html`                          |
| CSS-variable theming                         | [src/styles/globals.css](src/styles/globals.css)                                                       |
| Tooltip (fade+scale, smart placement)        | [Tooltip.tsx](src/components/ui/Tooltip.tsx)                                                           |
| Toast system (variants, stack, auto-dismiss) | [src/features/notifications/](src/features/notifications/)                                             |
| Lazy loading / code splitting / memo         | `router.tsx`, `vite.config.ts` `manualChunks`, `memo` on list items                                    |
| ESLint + Prettier + absolute imports + env   | `eslint.config.js`, `.prettierrc.json`, `@/*`, `src/config/env.ts`                                     |
| Best-practices guide                         | [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md)                                                       |

---

## 3. The five ideas that make it DRY

Each of these exists exactly once. If you find yourself writing a second one, that is the bug.

**1. One motion system — [`config/animation.ts`](src/config/animation.ts).**
Easing, durations, stagger rhythm and every from/to state live in `MOTION_PRESETS`. No component
contains a magic `0.6` or `'power3.out'`. Retuning the product's entire feel is a one-file diff.

**2. One animation primitive — [`useGsapContext`](src/hooks/useGsapContext.ts).**
Registers plugins, runs setup in a layout effect (so the `from` state lands before paint), scopes
selectors to the component, reverts every tween/timeline/ScrollTrigger on cleanup, and exposes
`reduced` for motion preferences. Components describe _what_ animates, never the lifecycle.

**3. One enter/exit contract — [`useAnimatedPresence`](src/hooks/useAnimatedPresence.ts).**
React unmounts before you can animate. This hook separates _intent_ (`open`) from _presence_
(`mounted`), so Tooltip, Modal, MobileNav and Toast all get real exit animations from one
implementation. Reduced motion fast-forwards the same state machine (`progress(1)`) rather than
branching.

**4. One network boundary — [`services/http/client.ts`](src/services/http/client.ts).**
Timeouts, retry with jittered backoff, abort composition, typed error taxonomy and interceptors.
Features own a thin `*.api.ts`; nothing in the app calls `fetch`.

**5. One theming rule — semantic tokens only.**
Components use `bg-surface-raised`, `text-content-muted`, `border-line`. They never name a palette
colour. Dark mode is then free: swap the CSS variables, change nothing else.

---

## 4. Theming

Tailwind v4 is CSS-first — the theme _is_ [`src/styles/globals.css`](src/styles/globals.css), and
there is intentionally no `tailwind.config.js`. Three layers:

```css
:root {
  --surface: …;
  --content: …;
} /* 1. raw tokens, light */
.dark {
  --surface: …;
  --content: …;
} /* 2. raw tokens, dark  */
@theme inline {
  --color-surface: var(--surface);
} /* 3. → utilities */
```

Because the mapping is `inline`, `bg-surface` emits `var(--surface)` directly: toggling `.dark`
re-themes the document with no extra CSS and no React re-render.

The flow: `index.html` bootstrap script applies the class **before first paint** (no flash) →
`ThemeProvider` keeps `<html>` in sync afterwards → `useTheme()` derives `resolved` from the
persisted `mode` plus a live `prefers-color-scheme` subscription, so `system` users follow their OS
in real time. Only `mode` is persisted; the resolved value is always derived.

---

## 5. Performance

- **Route-level code splitting** — `React.lazy` per page. The home page never downloads Swiper;
  the 103 kB Swiper vendor chunk ships only with `/experience`.
- **Vendor chunking** — GSAP, Swiper, Radix, Router and React split for cache stability.
- **Transform-only animation** — every preset animates `transform` / `opacity` / `clip-path`.
  No `top`, `left`, `width` or `height` tweens on the hot path.
- **No scroll listeners driving React state** — the progress bar and the counters are scrubbed by
  ScrollTrigger and write to the DOM directly. Zero re-renders while scrolling.
- **`memo` where it is load-bearing** — `RoleCard` and the carousel slides (Swiper fires
  `onProgress` every frame of a drag) and `ToastItem` (a new toast must not restart existing countdowns).
- **Atomic Zustand selectors** — `useUiStore(selectMobileNavOpen)` re-renders on one boolean, not on
  every store write.
- **CSS for micro-interactions, GSAP for choreography** — hover/press states are single-property
  CSS transitions; GSAP is reserved for multi-element and scroll-bound motion.

---

## 6. Accessibility

Not a pass at the end — a constraint in the primitives.

- Radix owns focus trapping, collision-aware positioning and `aria-*` wiring for Tooltip/Dialog.
- `<Field>` wires `htmlFor` / `id` / `aria-describedby` / `aria-invalid` / `aria-required` through
  context, so controls cannot be wired wrong.
- The theme switch is real `<input type="radio">` inside a `<fieldset>` — arrow-key navigation comes
  from the platform.
- Toasts: labelled region, `aria-live="polite"`, errors escalated to `role="alert"`, auto-dismiss
  pauses on hover **and** focus-within, `Escape` clears the stack.
- `AnimatedText` renders a clean visually-hidden copy of the text and marks the shredded copy
  `aria-hidden`, so a split headline is announced as one sentence.
- `prefers-reduced-motion` is honoured in CSS **and** across the whole GSAP layer; the pinned
  horizontal rail degrades to native scroll-snap.
- `useReturnFocus` restores focus to the opening element when a dialog or drawer closes — Radix
  cannot do this for _controlled_ dialogs, which is a silent, common a11y regression.
- Skip link is the first tab stop; one global `:focus-visible` style that is never removed.

---

## 7. Where to start reading

1. [src/config/animation.ts](src/config/animation.ts) — the motion vocabulary.
2. [src/hooks/useGsapContext.ts](src/hooks/useGsapContext.ts) — how animation attaches to React.
3. [src/components/motion/Reveal.tsx](src/components/motion/Reveal.tsx) — what a consumer looks like.
4. [src/styles/globals.css](src/styles/globals.css) — the token system.
5. [docs/BEST_PRACTICES.md](docs/BEST_PRACTICES.md) — the rules, and the reasoning behind them.
