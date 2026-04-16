# Bitrix Integration

Contract between the frontend template and the Bitrix backend.

## Principle

The frontend delivers a ready-made HTML template with sections. The backend replaces content without altering the structure.

## What can be changed

- Text, links, images (src, alt)
- Number of repeating elements (cards, slides)
- Form data (action, hidden fields)
- Block visibility (hide/show a section)

## What must not be changed without prior agreement

- BEM classes (`class="btn btn--blue"`)
- data-attributes (`data-promo-mini-slider`, `data-anim`, `data-section`)
- HTML nesting structure (element order within a section)
- aria-attributes
- CSS/JS inclusion order

## Repeating elements

Cards, slides, etc. are rendered via a PHP loop. Slider pagination is generated automatically by JS — the backend only needs to output the cards:

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

## SVG sprite

The sprite `src/assets/icons/sprite.svg` is inlined into `<body>` during the build. It **does not** end up in `dist/` as a separate file.

On the Bitrix side — copy `src/assets/icons/sprite.svg` into the template and insert its contents at the beginning of `<body>`:

```php
<?php include $_SERVER['DOCUMENT_ROOT'] . '/local/templates/opeka/sprite.svg'; ?>
```

**Do not use** an external `<use href="/sprite.svg#icon-plus">` — it will break due to CORS.

## JS initialization after AJAX

The `main.js` script registers a public API on `window.OpekaFront`.
All init functions are idempotent — calling them again is safe.

After AJAX-loading content, call:

```js
// container — the DOM element where the new HTML was loaded
window.OpekaFront.init(document.querySelector('.ajax-container'))
```

On initial page load, `init()` is called automatically on the entire `document`.

## Including assets

Assets are included via `manifest.json` — file hashes change with every build.

Full PHP example, manifest format, and entry point table are in [build-output.md](./build-output.md).

Minimal example:

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

## Acceptance checklist

- [ ] HTML classes match the template (BEM unchanged)
- [ ] data-attributes are preserved (`data-promo-mini-slider`, `data-anim`, `data-section`)
- [ ] Assets are included via manifest.json (CSS + JS)
- [ ] Images: `alt`, `width`, `height`, `loading="lazy"` below the fold
- [ ] SVG sprite is inlined in `<body>`
- [ ] Repeated init calls do not break components (AJAX)
- [ ] Forms: frontend validation works, action points to the backend