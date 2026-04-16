# Компоненты (`<x-*>`)

Страницы и секции собираются из мелких HTML-блоков — кнопок, тегов, карточек, слайдеров — через [posthtml-component](https://github.com/thewebartisan7/posthtml-components). Каждый блок — отдельная папка в `src/components/<слой>/<имя>/`, используется через кастомный тег `<x-имя>`.

## Зачем это надо

- **Консистентность.** Разработчик не может уйти от дизайна — кнопка это всегда `<x-button variant="blue">`, а не самописный `<button class="...">`.
- **Меньше писанины.** Повторяющаяся разметка (обёртки иконок, span'ы лейблов, aria-атрибуты) живёт в компоненте один раз, а не копируется в каждую секцию.
- **Единый источник правды.** Стайлгайд показывает все варианты; разработчик копирует сниппеты вместо того чтобы придумывать разметку.
- **Подсказки в IDE.** `web-types.json` генерируется автоматом из JSDoc в `<script props>` — после создания компонента WebStorm знает его тег, атрибуты и enum-значения.

## Быстрый старт

Использовать готовый компонент в странице или секции:

```html
<x-button href="/catalog/" size="medium" variant="blue" icon="plus">
  Все пансионаты
</x-button>

<x-tag size="sm" color="red" icon="fire">Скидка 20%</x-tag>
```

Никаких import или script — PostHTML резолвит `<x-*>` на этапе сборки.

## Устройство компонента

```
src/components/atoms/button/
├── button.html              ← разметка + <script props>
├── button.scss              ← BEM-стили, подхватываются глобом
└── button.styleguide.html   ← живые примеры для styleguide/components.html
```

Правило именования: **имя файла = имя папки = имя тега** (без префикса `x-`). Значит `button/button.html` становится `<x-button>`.

Генератор игнорирует `_template/*`, `*.styleguide.html`, `*.inner.html`.

## Как писать компонент

### 1. Опишите API в `<script props>`

```html
<script props>
  /*
   * x-tag
   *
   * Небольшой UPPERCASE-лейбл с опциональной иконкой.
   *
   * Props:
   *   size — sm | md (default: sm)
   *   color — red | green | tr-grey (default: red)
   *   icon — id иконки без префикса "icon-"
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

Правила JSDoc (генератор именно это парсит):

- **Первая непустая строка** — имя тега: `x-tag`.
- Всё между этой строкой и `Props:` становится описанием компонента.
- Под `Props:` — каждая строка в формате `имя — описание`. Опциональные маркеры:
  - `(default: X)` — показывается как дефолт в подсказках IDE.
  - `A | B | C` где-то в описании — автоматически распознаётся как enum для автокомплита.

Держите `<script props>` минимальным: дефолты, сборка классов, a11y-проверки. Не вычисляйте флаги для шаблона — условие кладите прямо в `<if>`.

### 2. Напишите шаблон

Доступные директивы:

- `{{ выражение }}` — подстановка значения из `module.exports`.
- `<yield></yield>` — содержимое, переданное между `<x-name>...</x-name>`.
- `<slot-ИМЯ></slot-ИМЯ>` — именованный слот с дефолтным содержимым; заполняется через `<fill-ИМЯ>` при использовании.
- `<if condition="js-выражение">...</if>` — условный рендер.
- `<each loop="item in items">...</each>` — цикл.

Пример с двумя корневыми ветками и опциональной иконкой:

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

Две ветки, дублирующие ~4 строки нутра — это нормально. Выносить в partial стоит, только когда дубль больше ~10 строк.

### 3. Passthrough-атрибуты

Любой атрибут, не объявленный в `props`, пробрасывается на корневой элемент. `class` и `style` мержатся, остальные — перезаписываются. То есть `aria-*`, `data-*` и `disabled` работают «из коробки»:

```html
<x-button variant="blue" class="hero__cta" aria-controls="menu" data-open>
  Открыть меню
</x-button>
```

Если IDE ругается на passthrough-атрибут (например, `disabled is not allowed here`), добавьте его в `Props:` в JSDoc как passthrough:

```
*   disabled — passthrough boolean; disables the element (use only on <button>)
```

### 4. Именованные слоты (мульти-слотовые компоненты)

Когда в компоненте несколько «дырок» под контент — используйте именованные слоты. **Разделитель — `-`, не `:`** (чтобы IDE не считала `fill:xxx` XML-namespace'ом — это настроено в `vite.config.mjs` как `slotSeparator: '-'`).

Компонент:

```html
<article class="card">
  <h3 class="card__title"><slot-title></slot-title></h3>
  <p class="card__desc"><slot-desc></slot-desc></p>
</article>
```

Использование:

```html
<x-card>
  <fill-title>Заголовок</fill-title>
  <fill-desc>Описание</fill-desc>
</x-card>
```

## Демонстрация в стайлгайде

У каждого компонента есть `<имя>.styleguide.html`. Для сниппетов кода — `<sg-snippet title="...">`: плагин сам эскейпит HTML и оборачивает его в блок с заголовком и кнопкой Copy. В snippet'е пишется обычный HTML без `&lt;`/`&gt;`:

```html
<sg-snippet title="x-button">
  <x-button variant="blue">Отправить</x-button>
</sg-snippet>
```

## Как добавить новый компонент

1. Скопируйте `src/components/atoms/_template/` в новую папку с именем компонента, например `src/components/atoms/card/`.
2. Переименуйте файлы внутри: `card.html`, `card.scss`, `card.styleguide.html`.
3. Заполните файлы по правилам JSDoc выше.
4. Подключите `card.styleguide.html` из `src/pages/styleguide/components.html`.
5. Всё. Ручной регистрации нигде нет:
   - Vite-плагин сам сканирует папки компонентов.
   - `web-types.json` регенерируется при каждом сохранении (dev) или сборке.
   - SCSS подтягивается через glob в `src/scripts/main.js`.

## Готовые примеры в проекте

- `x-button` — ветвление `<a>`/`<button>` по `href`, опциональная иконка, режим icon-only.
- `x-text-link` — та же логика, меньше размером, `icon-pos="left|right"`.
- `x-tag` — простая обёртка с иконкой и лейблом.
- `x-pagination` — `<each>` + валидация в `<script props>`.
- `x-promo-mini-card` — именованные слоты (`<fill-tag>`/`<fill-title>`/`<fill-desc>`/`<fill-link>`).
- `x-promo-mini-slider` — оборачивает `<x-promo-mini-card>` через `<yield>` + auto-controls.

## Конвенции

- **BEM** в именах классов SCSS, корневой класс = имя компонента (`.btn`, `.tag`, `.promo-mini-card`).
- **a11y.** Icon-only кнопки обязаны иметь `aria-label`; декоративные SVG — `aria-hidden="true"`.
- **Шаблон читается сверху вниз.** Условия — в `<if>`, а не в флагах из `<script props>`.
- **Passthrough важнее новых пропсов.** Если атрибут уже стандартный HTML/ARIA — он прокинется сам, не надо оборачивать.
- **Стайлгайд — источник правды.** Если непонятно как использовать компонент — скопируйте из его `.styleguide.html`.