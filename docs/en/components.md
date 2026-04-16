# Components (`<x-*>`)

Pages and sections are composed from small HTML building blocks — buttons, tags, cards, sliders — using [posthtml-component](https://github.com/thewebartisan7/posthtml-components). Each block is a self-contained folder under `src/components/<layer>/<name>/` and is used via a custom tag `<x-name>`.

## Why bother

- **Consistency.** Developers can't drift from the design — a button is always `<x-button variant="blue">`, not a hand-rolled `<button class="...">`.
- **Less typing.** Repeated markup (icon wrappers, label spans, aria attributes) lives in the component once, not in every section.
- **Single source of truth.** The styleguide shows every variant; developers copy snippets instead of inventing markup.
- **IDE autocomplete.** `web-types.json` is auto-generated from `<script props>` JSDoc — after you write a component, WebStorm knows its tag, attributes, and enum values.

## Quick start

Use an existing component in a page or section:

```html
<x-button href="/catalog/" size="medium" variant="blue" icon="plus">
  All homes
</x-button>

<x-tag size="sm" color="red" icon="fire">Sale 20%</x-tag>
```

No import, no script tag — PostHTML resolves `<x-*>` at build time.

## Anatomy of a component

```
src/components/atoms/button/
├── button.html              ← markup + <script props>
├── button.scss              ← BEM styles, auto-imported via glob
└── button.styleguide.html   ← live examples for styleguide/components.html
```

Naming rule: **file name = folder name = tag name** (without the `x-` prefix). So `button/button.html` becomes `<x-button>`.

The generator ignores `_template/*`, `*.styleguide.html`, and `*.inner.html`.

## Writing a component

### 1. Declare the API with `<script props>`

```html
<script props>
  /*
   * x-tag
   *
   * Small uppercase label with optional icon.
   *
   * Props:
   *   size — sm | md (default: sm)
   *   color — red | green | tr-grey (default: red)
   *   icon — sprite id without "icon-" prefix
   */
  const size = props.size || 'sm'
  const color = props.color || 'red'
  const icon = props.icon || ''

  module.exports = {
    icon,
    cls: ['tag', 'tag--' + size, 'tag--' + color].join(' '),
  }
</script>
```

JSDoc rules (the generator parses this):

- **First non-empty line** must be the tag name: `x-tag`.
- Anything between that line and `Props:` becomes the component description.
- Under `Props:`, each line is `name — description`. Optional markers:
  - `(default: X)` — shown as default in IDE hints.
  - `A | B | C` anywhere in the description — auto-detected as an enum for IDE autocomplete.

Keep `<script props>` minimal: defaults, class assembly, a11y checks. Don't compute flags for the template — put the condition in `<if>` instead.

### 2. Write the template

Available directives:

- `{{ expression }}` — inline value from `module.exports`.
- `<yield></yield>` — children passed to `<x-name>...</x-name>`.
- `<slot-NAME></slot-NAME>` — named default slot; filled by `<fill-NAME>` in usage.
- `<if condition="js expression">...</if>` — conditional render.
- `<each loop="item in items">...</each>` — loop.

Example with two root branches and optional icon:

```html
<if condition="href">
  <a href="{{ href }}" class="{{ cls }}">
    <if condition="icon"><svg class="tag__icon" aria-hidden="true"><use href="#icon-{{ icon }}"/></svg></if>
    <span class="tag__label"><yield></yield></span>
  </a>
</if>

<if condition="!href">
  <button type="{{ type }}" class="{{ cls }}">
    <if condition="icon"><svg class="tag__icon" aria-hidden="true"><use href="#icon-{{ icon }}"/></svg></if>
    <span class="tag__label"><yield></yield></span>
  </button>
</if>
```

Two branches duplicating ~4 lines of inner markup is fine. Only extract a partial when the duplication exceeds ~10 lines.

### 3. Passthrough attributes

Any attribute that isn't declared in `props` passes through to the root element. `class` and `style` are merged; everything else overrides. So `aria-*`, `data-*`, and `disabled` work for free:

```html
<x-button variant="blue" class="hero__cta" aria-controls="menu" data-open>
  Open menu
</x-button>
```

If an IDE warns about a passthrough attribute (e.g. `disabled is not allowed here`), add it to `Props:` in the JSDoc as a passthrough:

```
*   disabled — passthrough boolean; disables the element (use only on <button>)
```

### 4. Named slots (multi-slot components)

When a component has more than one content hole, use named slots. **The separator is `-`, not `:`** (avoids XML-namespace warnings in IDEs — configured in `vite.config.mjs` as `slotSeparator: '-'`).

Component:

```html
<article class="card">
  <h3 class="card__title"><slot-title></slot-title></h3>
  <p class="card__desc"><slot-desc></slot-desc></p>
</article>
```

Usage:

```html
<x-card>
  <fill-title>Hello</fill-title>
  <fill-desc>World</fill-desc>
</x-card>
```

## Styleguide showcase

Each component has `<name>.styleguide.html`. For code snippets use `<sg-snippet title="...">` — a plugin escapes the HTML and wraps it in a block with a title bar and Copy button. You write real HTML without `&lt;`/`&gt;`:

```html
<sg-snippet title="x-button">
  <x-button variant="blue">Submit</x-button>
</sg-snippet>
```

## Adding a new component

1. Copy `src/components/atoms/_template/` to a new folder with your component name, e.g. `src/components/atoms/card/`.
2. Rename the files inside: `card.html`, `card.scss`, `card.styleguide.html`.
3. Fill the template following the JSDoc rules above.
4. Include `card.styleguide.html` from `src/pages/styleguide/components.html`.
5. That's it. No manual registration:
   - Vite plugin scans component folders automatically.
   - `web-types.json` regenerates on every save (dev) or build.
   - SCSS is auto-imported via glob in `src/scripts/main.js`.

## Examples in the repo

- `x-button` — `<a>`/`<button>` switch by `href`, optional icon, icon-only mode.
- `x-text-link` — same idea, smaller, `icon-pos="left|right"`.
- `x-tag` — simple wrapper with icon + label.
- `x-pagination` — `<each>` + validation in `<script props>`.
- `x-promo-mini-card` — named slots (`<fill-tag>`/`<fill-title>`/`<fill-desc>`/`<fill-link>`).
- `x-promo-mini-slider` — composes `<x-promo-mini-card>`s via `<yield>` + auto controls.

## Conventions

- **BEM** class names in SCSS, root class = component name (`.btn`, `.tag`, `.promo-mini-card`).
- **a11y.** Icon-only buttons must have `aria-label`; decorative SVGs use `aria-hidden="true"`.
- **Keep the template readable top-to-bottom.** Put conditions in `<if>`, not as flags in `<script props>`.
- **Favor passthrough over new props.** If an attribute is already a standard HTML/ARIA attribute, it flows through — don't wrap it.
- **Styleguide is the source of truth.** When in doubt how to use a component, copy from its `.styleguide.html`.