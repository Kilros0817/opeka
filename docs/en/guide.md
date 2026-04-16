# Developer Guide

A single document covering everything you need to know to work on the "Opeka" project.

---

## What is this

A static multi-page HTML template for the "Opeka" eldercare facility network website. It builds into `dist/` and is integrated with Bitrix CMS. No React/Vue — Vite + vanilla JS + SCSS.

---

## Quick start

```bash
nvm use            # Node 20
npm install
npm run dev        # http://localhost:5173/
```

A pre-commit hook automatically runs linters. Errors block the commit.

---

## Architecture

### Folder structure

```
src/
├── styles/                  Global layer
│   ├── tokens/              Design tokens (colors, spacing, typography, radii, z-index, breakpoints)
│   ├── base/                Reset, fonts, utilities
│   └── main.scss            Aggregator
│
├── components/
│   ├── atoms/               Simple UI elements (button, tag, text-link, pagination)
│   └── molecules/           Composite elements with behavior (promo-mini-card, promo-mini-slider)
│
├── sections/                Page blocks (hero, site-header, its-opeka)
├── pages/                   Entry points (home, styleguide)
│
├── animations/
│   ├── engine.js            Engine: finds data-anim, calls presets
│   └── presets/             Scroll/reveal animations
│
├── scripts/
│   ├── main.js              Single JS entry, wires everything together
│   └── modules/             Cross-component utilities
│
└── assets/
    ├── fonts/               WOFF2
    ├── icons/sprite.svg     SVG sprite
    ├── images/              Images
    └── videos/              Videos
```

### Key mechanisms

| Mechanism | How it works |
|---|---|
| HTML composition | `<component src="sections/hero/hero.html">` — the `posthtml-component` plugin injects partials at build time |
| Auto-import SCSS | `import.meta.glob()` in `main.js` picks up `*.scss` from components/ and sections/. No manual registration needed |
| Manual JS init | Components with JS export `init*()`, import and call manually in `main.js` via `init(root)` |
| Design tokens | All values live in `styles/tokens/`. Components use: `@use 'styles/tokens' as *` |
| Animations | Declarative `data-anim="preset-name"`. Presets in `animations/presets/`. Direct GSAP usage in sections is prohibited |
| Linters | Stylelint + HTMLHint + ESLint, on pre-commit via husky + lint-staged |
| Contract checks | `npm run lint:contracts` — strict production code checks (`style=""`, `console.*`, TODO, invalid asset paths) |
| Build | Multi-page Vite to `dist/` with `manifest.json` for Bitrix integration |
| Showcase | Visual catalog of all components: `http://localhost:5173/src/pages/styleguide/` |

### JS runtime for Bitrix

`main.js` registers a public API:

```js
window.OpekaFront.init(container)  // After AJAX content loading
```

On initial page load, `init()` is called automatically on the entire `document`.

### Workflow

Work bottom-up — from tokens to the page. Do not add a section to the page until all its parts are ready and showcased.

```
1. Tokens           New color, spacing, typography? → styles/tokens/
       ↓
2. Atoms            Button, tag, link → showcase ✓
       ↓
3. Molecules        Card, slider (from atoms) → showcase ✓
       ↓
4. Section          HTML + SCSS + animations → showcase (if reusable) ✓
       ↓
5. Page             Assemble sections via <component>
```

Each layer must be verified in the showcase before moving to the next one. If a section needs a button that doesn't exist yet — create the atom first, then the section.

---

## Markup rules

### BEM — strictly enforced

```
.block                        — block name = folder name
.block__element               — element
.block--modifier              — modifier (variant, size, state)
```

- Maximum 3 levels of nesting in SCSS
- **Prohibited:** `.hero a`, `.hero .btn` (cascading through tags or foreign blocks)
- Contextual cascade: `.card--in-catalog .card__title` (via modifier, not via parent)

### Colors — tokens only

```scss
@use '../../../styles/tokens' as *;

.my-card__title {
  color: $color-text-primary;      // ✓ token
  color: #22294f;                   // ✗ hardcoded values prohibited
}
```

All colors: `src/styles/tokens/_palette.scss` -> `_semantic.scss`.

Exception: Figma effect colors (gradients, blob effects) unique to a single section may remain in the section's SCSS with `// stylelint-disable color-no-hex`.

### Spacing — tokens only

```scss
padding: $space-md;                // ✓ (16px)
padding: 16px;                     // ✗ magic px values prohibited
```

Scale: `$space-xs` (4px), `$space-sm` (8px), `$space-md` (16px), `$space-lg` (24px), `$space-xl` (40px), `$space-2xl` (64px), `$space-3xl` (96px).

### Typography — via mixins

```scss
.card__title { @include type-m-20; }            // Medium 20/1 -0.4px
.card__desc  { @include type-r-16; }            // Regular 16/20
.hero__title { @include type-h1-desktop; }      // Medium 82/0.8 -3.28px

@include mobile { @include type-h1-mobile; }    // responsive
```

Presets: `type-h1-desktop`, `type-h1-mobile`, `type-h2-desktop`, `type-h2-mobile`, `type-m-12`, `type-m-14`, `type-m-16`, `type-m-20`, `type-r-16`.

### Breakpoints — two mixins

```scss
.hero__promo {
  // desktop styles by default (mobile-first is NOT used)

  @include mobile {
    // overrides for <=767px
  }
}
```

Only `@include mobile` and `@include desktop`. Custom viewport `@media` queries are prohibited.

Exception: accessibility/media capability queries, for example `@media (prefers-reduced-motion: reduce)`.

### Animations — via data-anim

```html
<h2 data-anim="reveal-up" data-anim-delay="0.1">Заголовок</h2>
```

Direct GSAP usage in section code is prohibited. Need a new animation — create a preset in `src/animations/presets/`.

### HTML

- Semantics: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Buttons use `<button type="...">`, links use `<a href="...">`
- Images: `alt`, `width`, `height`, `loading="lazy"` below the fold
- HTML assets from `src/assets/`: use `../../assets/...`, not `/src/assets/...`
- `style="..."` is prohibited
- JS hooks use `data-*`, not `id`
- Lorem ipsum is prohibited — use realistic content

### Icons — SVG sprite

```html
<svg class="btn__icon" aria-hidden="true"><use href="#icon-plus" /></svg>
```

All icons live in `src/assets/icons/sprite.svg`. `fill="currentColor"` — color is inherited from the parent's `color`.

**Do not use** external `<use href="/sprite.svg#...">` — it will break due to CORS on Bitrix.

---

## How to create an atom

An atom is a simple UI element without business logic: button, tag, link, pagination.

```bash
cp -r src/components/atoms/_template/ src/components/atoms/<name>/
```

1. Rename files: `_template.scss` -> `<name>.scss`, `_template.styleguide.html` -> `<name>.styleguide.html`
2. Rename BEM block `.template` -> `.<name>` in all files
3. Write SCSS — tokens only, no hardcoded colors or magic px values
4. Create a showcase: all variants x states + HTML snippet with a Copy button
5. Include the showcase in `src/pages/styleguide/components.html`:
   ```html
   <component src="components/atoms/<name>/<name>.styleguide.html"></component>
   ```
6. `npm run lint && npm run build` ✓

**SCSS is picked up automatically** via `import.meta.glob`.

---

## How to create a molecule

A molecule is a composition of atoms or a component with JS behavior: card, slider, accordion.

```bash
cp -r src/components/molecules/_template/ src/components/molecules/<name>/
```

1. Rename files and BEM block
2. Write SCSS
3. If there is JS (`<name>.js`) — place it alongside, import in `src/scripts/main.js`:
   ```js
   import { initMyComponent } from '../components/molecules/<name>/<name>.js'
   // add the call inside the init(root) function:
   initMyComponent(root)
   ```
4. Create a showcase + content contract for CMS
5. Include the showcase in `src/pages/styleguide/components.html`
6. `npm run lint && npm run build` ✓

### JS requirements for components

```js
export function initMyComponent(root = document) {
  root.querySelectorAll('[data-my-component]').forEach((el) => {
    if (el.dataset.myComponentReady === 'true') return

    const items = el.querySelectorAll('.my-component__item')
    if (items.length === 0) return       // ← guard BEFORE flag

    el.dataset.myComponentReady = 'true' // ← flag AFTER check
    // logic
  })
}
```

- `root` parameter — for AJAX compatibility (Bitrix calls `window.OpekaFront.init(container)`)
- Ready flag **after** checking child elements — an empty container does not block re-init
- Find elements via `data-*`, not `id`
- `prefers-reduced-motion` — respect it

---

## How to create a section

A section is a horizontal page band: hero, header, "Opeka is".

```bash
cp -r src/sections/_template/ src/sections/<name>/
```

1. Rename files and BEM block `template-section` -> `<name>`
2. Write HTML + SCSS
3. If there is JS — place it alongside, import in `src/scripts/main.js`
4. Include in the page:
   ```html
   <component src="sections/<name>/<name>.html"></component>
   ```
5. Showcase — only for reusable sections (header, footer)
6. `npm run lint && npm run build` ✓

**SCSS is picked up automatically.** JS must be manually imported in `main.js`.

All sections live in `src/sections/`, regardless of reusability. Page-specific layout (`.home-shell`) goes in `pages/<name>/`.

---

## How to create a page

```bash
cp -r src/pages/_template/ src/pages/<name>/
```

1. Rename `_template.html` -> `<name>.html`, fill in the `<title>`
2. Include sections via `<component>`
3. **Required:** register in `vite.config.mjs` -> `rollupOptions.input`:
   ```js
   '<name>': resolve(__dirname, 'src/pages/<name>/<name>.html'),
   ```
4. Page-specific styles: `<name>.scss` + `<name>.js` (with `import './<name>.scss'`), in HTML:
   ```html
   <script type="module" src="./<name>.js"></script>
   ```
5. `npm run lint && npm run build` ✓

---

## How to add an animation

1. Copy `src/animations/presets/_template.js` -> `src/animations/presets/<name>.js`
2. Implement the preset. JSDoc is required: what it does, which `data-*` parameters it accepts
3. Register in `src/animations/engine.js`
4. Add a demo to `src/pages/styleguide/animations.html`

**Direct GSAP usage in section code is prohibited.** Need a new animation — discuss with the lead first, then create a preset.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server, http://localhost:5173/ |
| `npm run build` | Build to dist/ |
| `npm run preview` | Preview the built dist/ |
| `npm run lint` | All linters (SCSS + HTML + JS) |
| `npm run lint:scss` | Stylelint only |
| `npm run lint:html` | HTMLHint only |
| `npm run lint:js` | ESLint only |
| `npm run lint:contracts` | Strict production code checks |

### lint:contracts

A standalone script that checks all of `src/` for production contract violations:

- `style=""` — inline styles are prohibited
- `console.*` — remove before committing
- `TODO/FIXME/HACK/XXX` — unresolved tasks
- `/src/assets/` in HTML — prohibited; use `../../assets/...` for images/videos
- `/src/assets/` in SCSS — prohibited, except `@font-face` in `src/styles/base/_typography.scss`

Excludes `_template/` and `*.styleguide.*` files. It runs as part of `npm run lint` and pre-commit.

---

## Linters and configs

| Tool | Config | What it checks |
|---|---|---|
| Stylelint | `.stylelintrc.json` | SCSS: BEM, tokens, hex colors (warning), nesting |
| HTMLHint | `.htmlhintrc` | HTML: alt attributes, paired tags, special characters |
| ESLint | `eslint.config.js` | JS |
| husky + lint-staged | `package.json` | Auto-run on pre-commit |

---

## Showcase (Styleguide)

Visual catalog of all components: `http://localhost:5173/src/pages/styleguide/`

Every component must have a showcase entry:
- All variants (sizes x colors x states)
- HTML snippet with a Copy button — backend developers copy from here
- Content contract for CMS (character limits, required fields)

---

## DoD — Definition of Done

### A component is done when:

- [ ] BEM naming, block name = folder name
- [ ] Colors from tokens only
- [ ] Spacing from `$space-*` only
- [ ] Typography via `@include type-*`
- [ ] All states in the showcase: default, hover, focus-visible, disabled
- [ ] HTML snippet is up to date
- [ ] JS (if any): imported in `main.js`, idempotent init
- [ ] `npm run lint && npm run build` ✓

### A section is done when:

- [ ] HTML with final BEM markup
- [ ] SCSS without hardcoded colors or magic px values
- [ ] Responsive layout verified at 393 / 768 / 1366 / 1536 px
- [ ] Long text (2x normal) — layout does not break
- [ ] Images: `alt`, `width`, `height`, `loading="lazy"`
- [ ] Animations via `data-anim`, no GSAP in section code
- [ ] JS (if any): imported in `main.js`
- [ ] Tab navigation, focus visible
- [ ] `npm run lint && npm run build` ✓

---

## Dependencies

**Any new npm dependency requires approval from the lead.**

Justification required: why it's needed, alternatives considered, bundle size impact, license.

Prohibited: jQuery, Lodash, Moment.js, CSS frameworks (Bootstrap, Tailwind), UI libraries.

---

## PRs and code review

- One component / section / page = one PR
- Branch `feature/<name>` from `develop`
- Branch lifetime — 1-2 days maximum
- Nobody merges their own PRs — only the lead does
- Before a PR: `npm run lint && npm run lint:contracts && npm run build`

---

## Component catalog

### Atoms

| Name | Folder | Showcase |
|---|---|---|
| `.btn` | `src/components/atoms/button/` | `components.html#comp-button-mini` |
| `.text-link` | `src/components/atoms/text-link/` | `components.html#comp-text-link` |
| `.tag` | `src/components/atoms/tag/` | `components.html#comp-tag` |
| `.pagination` | `src/components/atoms/pagination/` | `components.html#comp-pagination` |

### Molecules

| Name | Folder | Showcase |
|---|---|---|
| `.promo-mini-card` | `src/components/molecules/promo-mini-card/` | `components.html#comp-promo-mini-card` |
| `.promo-mini-slider` | `src/components/molecules/promo-mini-slider/` | `components.html#comp-promo-mini-slider` |

---

## Section catalog

| Name | Folder | Used in |
|---|---|---|
| `.site-header` | `src/sections/site-header/` | All pages |
| `.hero` | `src/sections/hero/` | Homepage |
| `.its-opeka` | `src/sections/its-opeka/` | Homepage |

---

## Animation catalog

| `data-anim` | File | What it does |
|---|---|---|
| `reveal-up` | `src/animations/presets/reveal-up.js` | Fade-in from bottom to top |

---

## For backend developers

- Build output and manifest.json: [build-output.md](./build-output.md)
- Bitrix integration (contract, AJAX, SVG sprite): [bitrix-integration.md](./bitrix-integration.md)
