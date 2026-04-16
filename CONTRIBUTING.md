# Contributing

Все правила, архитектура и how-to — в **[docs/ru/guide.md](docs/ru/guide.md)**.

Этот файл — только быстрые чеклисты и правила PR.

---

## Быстрые чеклисты

### Atom (кнопка, тег, ссылка)

1. `cp -r src/components/atoms/_template/ src/components/atoms/<name>/`
2. Переименовать файлы и BEM-блок
3. SCSS — только токены
4. Витрина: варианты × состояния + HTML-сниппет
5. Подключить витрину в `styleguide/components.html`
6. `npm run lint && npm run build` ✓

### Molecule (карточка, слайдер)

1. `cp -r src/components/molecules/_template/ src/components/molecules/<name>/`
2. Переименовать файлы и BEM-блок
3. SCSS + JS (если есть поведение)
4. JS → импортировать в `src/scripts/main.js`
5. Витрина + контракт контента
6. `npm run lint && npm run build` ✓

### Секция

1. `cp -r src/sections/_template/ src/sections/<name>/`
2. Переименовать файлы и BEM-блок
3. HTML + SCSS. JS → в `main.js`
4. `<component>` в страницу
5. `npm run lint && npm run build` ✓

### Страница

1. `cp -r src/pages/_template/ src/pages/<name>/`
2. Зарегистрировать в `vite.config.mjs` → `rollupOptions.input`
3. `npm run lint && npm run build` ✓

---

## Порядок работы (flow)

Работа идёт снизу вверх — от токенов к странице. Не добавлять секцию на страницу, пока все её части не готовы и не в витрине.

```
1. Токены          Новый цвет, отступ, типографика? → styles/tokens/
       ↓
2. Atoms           Кнопка, тег, ссылка → витрина ✓
       ↓
3. Molecules       Карточка, слайдер (из атомов) → витрина ✓
       ↓
4. Секция          HTML + SCSS + анимации → витрина (если reusable) ✓
       ↓
5. Страница        Собрать секции через <component>
```

**Правило:** каждый слой должен быть проверен в витрине до перехода к следующему. Если секции нужна кнопка, которой ещё нет — сначала atom, потом секция.

---

## PR

- Один компонент / секция / страница = один PR
- Ветка `feature/<name>` от `develop`
- Жизнь ветки — 1–2 дня
- Никто не мержит свои PR — только лид
- Перед PR:
  ```bash
  npm run lint && npm run lint:contracts && npm run build
  ```

---

## Каталог компонентов

### Atoms

| Имя | Папка |
|---|---|
| `.btn` | `src/components/atoms/button/` |
| `.text-link` | `src/components/atoms/text-link/` |
| `.tag` | `src/components/atoms/tag/` |
| `.pagination` | `src/components/atoms/pagination/` |

### Molecules

| Имя | Папка |
|---|---|
| `.promo-mini-card` | `src/components/molecules/promo-mini-card/` |
| `.promo-mini-slider` | `src/components/molecules/promo-mini-slider/` |

### Секции

| Имя | Папка |
|---|---|
| `.site-header` | `src/sections/site-header/` |
| `.hero` | `src/sections/hero/` |
| `.its-opeka` | `src/sections/its-opeka/` |

### Анимации

| `data-anim` | Файл |
|---|---|
| `reveal-up` | `src/animations/presets/reveal-up.js` |

При добавлении — обновить эти таблицы.

---

# Contributing (EN)

All rules, architecture, and how-to guides are in **[docs/en/guide.md](docs/en/guide.md)**.

This file contains only quick checklists and PR rules.

---

## Quick checklists

### Atom (button, tag, link)

1. `cp -r src/components/atoms/_template/ src/components/atoms/<name>/`
2. Rename files and BEM block
3. SCSS — tokens only
4. Showcase: variants × states + HTML snippet
5. Include showcase in `styleguide/components.html`
6. `npm run lint && npm run build` ✓

### Molecule (card, slider)

1. `cp -r src/components/molecules/_template/ src/components/molecules/<name>/`
2. Rename files and BEM block
3. SCSS + JS (if interactive)
4. JS → import in `src/scripts/main.js`
5. Showcase + content contract
6. `npm run lint && npm run build` ✓

### Section

1. `cp -r src/sections/_template/ src/sections/<name>/`
2. Rename files and BEM block
3. HTML + SCSS. JS → in `main.js`
4. `<component>` in the page
5. `npm run lint && npm run build` ✓

### Page

1. `cp -r src/pages/_template/ src/pages/<name>/`
2. Register in `vite.config.mjs` → `rollupOptions.input`
3. `npm run lint && npm run build` ✓

---

## Workflow

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

**Rule:** each layer must be verified in the showcase before moving to the next one. If a section needs a button that doesn't exist yet — create the atom first, then the section.

---

## PR

- One component / section / page = one PR
- Branch `feature/<name>` from `develop`
- Branch lifetime — 1–2 days
- Nobody merges their own PRs — only the lead
- Before PR:
  ```bash
  npm run lint && npm run lint:contracts && npm run build
  ```

---

## Component catalog

### Atoms

| Name | Path |
|---|---|
| `.btn` | `src/components/atoms/button/` |
| `.text-link` | `src/components/atoms/text-link/` |
| `.tag` | `src/components/atoms/tag/` |
| `.pagination` | `src/components/atoms/pagination/` |

### Molecules

| Name | Path |
|---|---|
| `.promo-mini-card` | `src/components/molecules/promo-mini-card/` |
| `.promo-mini-slider` | `src/components/molecules/promo-mini-slider/` |

### Sections

| Name | Path |
|---|---|
| `.site-header` | `src/sections/site-header/` |
| `.hero` | `src/sections/hero/` |
| `.its-opeka` | `src/sections/its-opeka/` |

### Animations

| `data-anim` | File |
|---|---|
| `reveal-up` | `src/animations/presets/reveal-up.js` |

Update these tables when adding new entries.