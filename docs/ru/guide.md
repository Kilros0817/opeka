# Руководство разработчика

Единый документ — всё что нужно знать для работы с проектом «Опека».

---

## Что это

Статический многостраничный HTML-шаблон сайта сети пансионатов «Опека». Собирается в `dist/` и натягивается на Bitrix. Без React/Vue — Vite + ванильный JS + SCSS.

---

## Быстрый старт

```bash
nvm use            # Node 20
npm install
npm run dev        # http://localhost:5173/
```

Pre-commit hook автоматически прогоняет линтеры. Ошибки блокируют коммит.

---

## Архитектура

### Структура папок

```
src/
├── styles/                  Глобальный слой
│   ├── tokens/              Дизайн-токены (цвета, отступы, типографика, радиусы, z-index, брейкпоинты)
│   ├── base/                Сброс, шрифты, утилиты
│   └── main.scss            Агрегатор
│
├── components/
│   ├── atoms/               Простые UI-элементы (button, tag, text-link, pagination)
│   └── molecules/           Составные с поведением (promo-mini-card, promo-mini-slider)
│
├── sections/                Блоки страницы (hero, site-header, its-opeka)
├── pages/                   Точки входа (home, styleguide)
│
├── animations/
│   ├── engine.js            Движок: находит data-anim, вызывает пресеты
│   └── presets/             Анимации по скроллу/появлению
│
├── scripts/
│   ├── main.js              Единственный JS-entry, подключает всё
│   └── modules/             Кросс-компонентные утилиты
│
└── assets/
    ├── fonts/               WOFF2
    ├── icons/sprite.svg     SVG-спрайт
    ├── images/              Картинки
    └── videos/              Видео
```

### Ключевые механизмы

| Механизм | Как работает |
|---|---|
| HTML-композиция | `<component src="sections/hero/hero.html">` — плагин `posthtml-component` подставляет партиалы при сборке |
| Авто-импорт SCSS | `import.meta.glob()` в `main.js` подхватывает `*.scss` из components/ и sections/. Регистрировать новый файл не нужно |
| Ручной init JS | Компоненты с JS экспортируют `init*()`, импорт и вызов — вручную в `main.js` → `init(root)` |
| Дизайн-токены | Все значения — в `styles/tokens/`. Компоненты: `@use 'styles/tokens' as *` |
| Анимации | Декларативные `data-anim="имя-пресета"`. Пресеты в `animations/presets/`. GSAP в секциях запрещён |
| Линтеры | Stylelint + HTMLHint + ESLint, на pre-commit через husky + lint-staged |
| Контрактные проверки | `npm run lint:contracts` — строгие проверки production-кода (`style=""`, `console.*`, TODO, неправильные asset-пути) |
| Сборка | Multi-page Vite → `dist/` с `manifest.json` для Bitrix-интеграции |
| Витрина | Визуальный каталог всех компонентов: `http://localhost:5173/src/pages/styleguide/` |

### JS runtime для Bitrix

`main.js` регистрирует публичный API:

```js
window.OpekaFront.init(container)  // После AJAX-подгрузки контента
```

При первой загрузке `init()` вызывается автоматически на весь `document`.

### Порядок работы (flow)

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

Каждый слой должен быть проверен в витрине до перехода к следующему. Если секции нужна кнопка, которой ещё нет — сначала atom, потом секция.

---

## Правила вёрстки

### BEM — строго

```
.block                        — имя блока = имя папки
.block__element               — элемент
.block--modifier              — модификатор (вид, размер, состояние)
```

- Максимум 3 уровня вложенности в SCSS
- **Запрещено:** `.hero a`, `.hero .btn` (каскад через теги или чужие блоки)
- Каскад в контексте: `.card--in-catalog .card__title` (через модификатор, не через родителя)

### Цвета — только из токенов

```scss
@use '../../../styles/tokens' as *;

.my-card__title {
  color: $color-text-primary;      // ✓ токен
  color: #22294f;                   // ✗ хардкод запрещён
}
```

Все цвета: `src/styles/tokens/_palette.scss` → `_semantic.scss`.

Исключение: Figma-effect colors (градиенты, blob-эффекты), уникальные для одной секции — оставлять в SCSS секции с `// stylelint-disable color-no-hex`.

### Отступы — только из токенов

```scss
padding: $space-md;                // ✓ (16px)
padding: 16px;                     // ✗ магические px запрещены
```

Шкала: `$space-xs` (4px), `$space-sm` (8px), `$space-md` (16px), `$space-lg` (24px), `$space-xl` (40px), `$space-2xl` (64px), `$space-3xl` (96px).

### Типографика — через миксины

```scss
.card__title { @include type-m-20; }            // Medium 20/1 -0.4px
.card__desc  { @include type-r-16; }            // Regular 16/20
.hero__title { @include type-h1-desktop; }      // Medium 82/0.8 -3.28px

@include mobile { @include type-h1-mobile; }    // адаптив
```

Пресеты: `type-h1-desktop`, `type-h1-mobile`, `type-h2-desktop`, `type-h2-mobile`, `type-m-12`, `type-m-14`, `type-m-16`, `type-m-20`, `type-r-16`.

### Брейкпоинты — два миксина

```scss
.hero__promo {
  // desktop-стили по умолчанию (mobile-first НЕ используется)

  @include mobile {
    // переопределения для ≤767px
  }
}
```

Только `@include mobile` и `@include desktop`. Произвольные viewport `@media` запрещены.

Исключение: accessibility/media capability queries, например `@media (prefers-reduced-motion: reduce)`.

### Анимации — через data-anim

```html
<h2 data-anim="reveal-up" data-anim-delay="0.1">Заголовок</h2>
```

GSAP в коде секций запрещён. Нужна новая анимация — создаётся пресет в `src/animations/presets/`.

### HTML

- Семантика: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Кнопки — `<button type="...">`, ссылки — `<a href="...">`
- Картинки: `alt`, `width`, `height`, `loading="lazy"` ниже первого экрана
- HTML-assets из `src/assets/`: использовать `../../assets/...`, не `/src/assets/...`
- `style="..."` запрещён
- JS-хуки — через `data-*`, не через `id`
- Lorem ipsum запрещён — реалистичный контент

### Иконки — SVG-спрайт

```html
<svg class="btn__icon" aria-hidden="true"><use href="#icon-plus" /></svg>
```

Все иконки в `src/assets/icons/sprite.svg`. `fill="currentColor"` — цвет наследуется от `color` родителя.

**Не использовать** внешний `<use href="/sprite.svg#...">` — сломается из-за CORS на Bitrix.

---

## Как создать atom

Атом — простой UI-элемент без бизнес-логики: кнопка, тег, ссылка, пагинация.

```bash
cp -r src/components/atoms/_template/ src/components/atoms/<name>/
```

1. Переименовать файлы: `_template.scss` → `<name>.scss`, `_template.styleguide.html` → `<name>.styleguide.html`
2. Переименовать BEM-блок `.template` → `.<name>` во всех файлах
3. Заполнить SCSS — только токены, без хардкод-цветов и магических px
4. Создать витрину: все варианты × состояния + HTML-сниппет с кнопкой Copy
5. Подключить витрину в `src/pages/styleguide/components.html`:
   ```html
   <component src="components/atoms/<name>/<name>.styleguide.html"></component>
   ```
6. `npm run lint && npm run build` ✓

**SCSS подключится автоматически** через `import.meta.glob`.

---

## Как создать molecule

Молекула — композиция атомов или компонент с JS-поведением: карточка, слайдер, аккордеон.

```bash
cp -r src/components/molecules/_template/ src/components/molecules/<name>/
```

1. Переименовать файлы и BEM-блок
2. Заполнить SCSS
3. Если есть JS (`<name>.js`) — положить рядом, импортировать в `src/scripts/main.js`:
   ```js
   import { initMyComponent } from '../components/molecules/<name>/<name>.js'
   // добавить вызов в функцию init(root):
   initMyComponent(root)
   ```
4. Создать витрину + контракт контента для CMS
5. Подключить витрину в `src/pages/styleguide/components.html`
6. `npm run lint && npm run build` ✓

### Требования к JS компонентов

```js
export function initMyComponent(root = document) {
  root.querySelectorAll('[data-my-component]').forEach((el) => {
    if (el.dataset.myComponentReady === 'true') return

    const items = el.querySelectorAll('.my-component__item')
    if (items.length === 0) return       // ← guard ДО флага

    el.dataset.myComponentReady = 'true' // ← флаг ПОСЛЕ проверки
    // логика
  })
}
```

- `root` параметр — для AJAX-совместимости (Bitrix вызывает `window.OpekaFront.init(container)`)
- Ready-flag **после** проверки дочерних элементов — пустой контейнер не блокирует повторный init
- Элементы искать по `data-*`, не по `id`
- `prefers-reduced-motion` — уважать

---

## Как создать секцию

Секция — горизонтальная полоса страницы: hero, шапка, «Опека — это».

```bash
cp -r src/sections/_template/ src/sections/<name>/
```

1. Переименовать файлы и BEM-блок `template-section` → `<name>`
2. Заполнить HTML + SCSS
3. Если есть JS — положить рядом, импортировать в `src/scripts/main.js`
4. Подключить в страницу:
   ```html
   <component src="sections/<name>/<name>.html"></component>
   ```
5. Витрина — только для переиспользуемых секций (header, footer)
6. `npm run lint && npm run build` ✓

**SCSS подключится автоматически.** JS — вручную в `main.js`.

Все секции в `src/sections/`, независимо от переиспользуемости. Page-specific layout (`.home-shell`) — в `pages/<name>/`.

---

## Как создать страницу

```bash
cp -r src/pages/_template/ src/pages/<name>/
```

1. Переименовать `_template.html` → `<name>.html`, заполнить `<title>`
2. Подключить секции через `<component>`
3. **Обязательно** зарегистрировать в `vite.config.mjs` → `rollupOptions.input`:
   ```js
   '<name>': resolve(__dirname, 'src/pages/<name>/<name>.html'),
   ```
4. Page-specific стили: `<name>.scss` + `<name>.js` (с `import './<name>.scss'`), в HTML:
   ```html
   <script type="module" src="./<name>.js"></script>
   ```
5. `npm run lint && npm run build` ✓

---

## Как добавить анимацию

1. Скопировать `src/animations/presets/_template.js` → `src/animations/presets/<name>.js`
2. Реализовать пресет. JSDoc обязателен: что делает, какие `data-*` параметры
3. Зарегистрировать в `src/animations/engine.js`
4. Добавить демо в `src/pages/styleguide/animations.html`

**В коде секций GSAP запрещён.** Нужна новая анимация — обсуждение с лидом, потом пресет.

---

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер, http://localhost:5173/ |
| `npm run build` | Сборка в dist/ |
| `npm run preview` | Превью собранного dist/ |
| `npm run lint` | Все линтеры (SCSS + HTML + JS) |
| `npm run lint:scss` | Только Stylelint |
| `npm run lint:html` | Только HTMLHint |
| `npm run lint:js` | Только ESLint |
| `npm run lint:contracts` | Строгие проверки production-кода |

### lint:contracts

Отдельный скрипт, который проверяет весь `src/` на production-нарушения:

- `style=""` — inline styles запрещены
- `console.*` — убрать перед коммитом
- `TODO/FIXME/HACK/XXX` — незакрытые задачи
- `/src/assets/` в HTML — запрещено; для картинок/видео использовать `../../assets/...`
- `/src/assets/` в SCSS — запрещено, кроме `@font-face` в `src/styles/base/_typography.scss`

Исключает `_template/` и `*.styleguide.*` файлы. Запускается в `npm run lint` и pre-commit.

---

## Линтеры и конфиги

| Инструмент | Конфиг | Что проверяет |
|---|---|---|
| Stylelint | `.stylelintrc.json` | SCSS: BEM, токены, hex-цвета (warning), вложенность |
| HTMLHint | `.htmlhintrc` | HTML: alt, парные теги, спец-символы |
| ESLint | `eslint.config.js` | JS |
| husky + lint-staged | `package.json` | Автозапуск на pre-commit |

---

## Витрина (Styleguide)

Визуальный каталог всех компонентов: `http://localhost:5173/src/pages/styleguide/`

Каждый компонент обязан иметь витрину:
- Все варианты (размеры × цвета × состояния)
- HTML-сниппет с кнопкой Copy — бэкендер копирует отсюда
- Контракт контента для CMS (лимиты символов, обязательные поля)

---

## DoD — Definition of Done

### Компонент готов, если:

- [ ] BEM-именование, имя блока = имя папки
- [ ] Цвета только из токенов
- [ ] Отступы только из `$space-*`
- [ ] Типографика через `@include type-*`
- [ ] Все состояния в витрине: default, hover, focus-visible, disabled
- [ ] HTML-сниппет актуален
- [ ] JS (если есть): импортирован в `main.js`, идемпотентный init
- [ ] `npm run lint && npm run build` ✓

### Секция готова, если:

- [ ] HTML с финальной BEM-разметкой
- [ ] SCSS без хардкод-цветов и магических px
- [ ] Адаптив проверен на 393 / 768 / 1366 / 1536 px
- [ ] Длинный текст (2× обычного) — вёрстка не ломается
- [ ] Картинки: `alt`, `width`, `height`, `loading="lazy"`
- [ ] Анимации через `data-anim`, без GSAP в секции
- [ ] JS (если есть): импортирован в `main.js`
- [ ] Tab-навигация, focus visible
- [ ] `npm run lint && npm run build` ✓

---

## Зависимости

**Любая новая npm-зависимость — только через согласование с лидом.**

Обоснование: зачем, альтернативы, размер бандла, лицензия.

Запрещены: jQuery, Lodash, Moment.js, CSS-фреймворки (Bootstrap, Tailwind), UI-библиотеки.

---

## PR и код-ревью

- Один компонент / секция / страница = один PR
- Ветка `feature/<name>` от `develop`
- Жизнь ветки — 1–2 дня максимум
- Никто не мержит свои PR — только лид
- Перед PR: `npm run lint && npm run lint:contracts && npm run build`

---

## Каталог компонентов

### Atoms

| Имя | Папка | Витрина |
|---|---|---|
| `.btn` | `src/components/atoms/button/` | `components.html#comp-button-mini` |
| `.text-link` | `src/components/atoms/text-link/` | `components.html#comp-text-link` |
| `.tag` | `src/components/atoms/tag/` | `components.html#comp-tag` |
| `.pagination` | `src/components/atoms/pagination/` | `components.html#comp-pagination` |

### Molecules

| Имя | Папка | Витрина |
|---|---|---|
| `.promo-mini-card` | `src/components/molecules/promo-mini-card/` | `components.html#comp-promo-mini-card` |
| `.promo-mini-slider` | `src/components/molecules/promo-mini-slider/` | `components.html#comp-promo-mini-slider` |

---

## Каталог секций

| Имя | Папка | Где используется |
|---|---|---|
| `.site-header` | `src/sections/site-header/` | Все страницы |
| `.hero` | `src/sections/hero/` | Главная |
| `.its-opeka` | `src/sections/its-opeka/` | Главная |

---

## Каталог анимаций

| `data-anim` | Файл | Что делает |
|---|---|---|
| `reveal-up` | `src/animations/presets/reveal-up.js` | Появление снизу-вверх с fade |

---

## Для бэкенда

- Сборка и manifest.json: [build-output.md](./build-output.md)
- Интеграция с Bitrix (контракт, AJAX, SVG-спрайт): [bitrix-integration.md](./bitrix-integration.md)
