# Интеграция с Bitrix

Контракт между фронтенд-шаблоном и Bitrix-бэкендом.

## Принцип

Фронтенд поставляет готовый HTML-шаблон с секциями. Бэкенд заменяет контент, не трогая структуру.

## Что можно менять

- Тексты, ссылки, картинки (src, alt)
- Количество повторяющихся элементов (карточки, слайды)
- Данные форм (action, hidden fields)
- Видимость блоков (скрыть/показать секцию)

## Что нельзя менять без согласования

- BEM-классы (`class="btn btn--blue"`)
- data-атрибуты (`data-promo-mini-slider`, `data-anim`, `data-section`)
- Структуру вложенности HTML (порядок элементов внутри секции)
- aria-атрибуты
- Порядок подключения CSS/JS

## Повторяющиеся элементы

Карточки, слайды и т.п. выводятся PHP-циклом. Пагинация слайдера генерируется JS автоматически — бэкенду достаточно вывести карточки:

```php
<div class="promo-mini-slider" data-promo-mini-slider data-rotate="5000"
     aria-roledescription="carousel" aria-label="Акции">

  <?php foreach ($promos as $i => $promo): ?>
  <article class="promo-mini-card promo-mini-card--in-slider"
           aria-label="Слайд <?= $i + 1 ?> из <?= count($promos) ?>">
    <div class="promo-mini-card__bg" aria-hidden="true"></div>
    <div class="promo-mini-card__content">
      <span class="tag tag--sm tag--red">
        <svg class="tag__icon" aria-hidden="true"><use href="#icon-fire" /></svg>
        <span class="tag__label"><?= htmlspecialchars($promo['tag']) ?></span>
      </span>
      <div class="promo-mini-card__body">
        <div class="promo-mini-card__text">
          <h3 class="promo-mini-card__title"><?= htmlspecialchars($promo['title']) ?></h3>
          <p class="promo-mini-card__desc"><?= htmlspecialchars($promo['desc']) ?></p>
        </div>
        <a href="<?= $promo['url'] ?>" class="text-link text-link--blue">
          <svg class="text-link__icon" aria-hidden="true"><use href="#icon-plus" /></svg>
          <span class="text-link__label">Узнать больше</span>
        </a>
      </div>
    </div>
  </article>
  <?php endforeach; ?>

  <div class="promo-mini-slider__controls">
    <div class="pagination" aria-label="Пагинация слайдов"></div>
    <div class="promo-mini-slider__nav">
      <button type="button" class="btn btn--mini btn--icon-only btn--pill btn--tr-grey"
              aria-label="Предыдущий слайд" data-slider-prev>
        <svg class="btn__icon" aria-hidden="true"><use href="#icon-chevron-left" /></svg>
      </button>
      <button type="button" class="btn btn--mini btn--icon-only btn--pill btn--tr-grey"
              aria-label="Следующий слайд" data-slider-next>
        <svg class="btn__icon" aria-hidden="true"><use href="#icon-chevron-right" /></svg>
      </button>
    </div>
  </div>
</div>
```

## SVG-спрайт

Спрайт `src/assets/icons/sprite.svg` инлайнится в `<body>` при сборке. В `dist/` он **не попадает** как отдельный файл.

На Bitrix-стороне — скопировать `src/assets/icons/sprite.svg` в шаблон и вставить содержимое в начало `<body>`:

```php
<?php include $_SERVER['DOCUMENT_ROOT'] . '/local/templates/opeka/sprite.svg'; ?>
```

**Не использовать** внешний `<use href="/sprite.svg#icon-plus">` — сломается из-за CORS.

## JS-инициализация при AJAX

Скрипт `main.js` регистрирует публичный API на `window.OpekaFront`.
Все init-функции идемпотентны — повторный вызов безопасен.

После AJAX-подгрузки контента вызвать:

```js
// container — DOM-элемент, в который загружен новый HTML
window.OpekaFront.init(document.querySelector('.ajax-container'))
```

При первой загрузке страницы `init()` вызывается автоматически на весь `document`.

## Подключение ассетов

Ассеты подключаются через `manifest.json` — хеши файлов меняются при каждой сборке.

Полный PHP-пример, формат manifest и таблица entry-точек — в [build-output.md](./build-output.md).

Минимальный пример:

```php
<?php
$assetsBase = '/local/templates/opeka/dist/';
$manifest = json_decode(
    file_get_contents($_SERVER['DOCUMENT_ROOT'] . $assetsBase . '.vite/manifest.json'),
    true,
);
$main = $manifest['src/scripts/main.js'];
foreach ($main['css'] as $css) {
    echo '<link rel="stylesheet" href="' . $assetsBase . $css . '">';
}
echo '<script type="module" src="' . $assetsBase . $main['file'] . '"></script>';
?>
```

## Чек-лист приёмки

- [ ] HTML-классы совпадают с шаблоном (BEM без изменений)
- [ ] data-атрибуты сохранены (`data-promo-mini-slider`, `data-anim`, `data-section`)
- [ ] Ассеты подключены через manifest.json (CSS + JS)
- [ ] Картинки: `alt`, `width`, `height`, `loading="lazy"` ниже первого экрана
- [ ] SVG-спрайт инлайнится в `<body>`
- [ ] Повторный вызов init не ломает компоненты (AJAX)
- [ ] Формы: frontend-валидация работает, action указывает на бэкенд