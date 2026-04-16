# Сборка и подключение ассетов

Что попадает в `dist/` после `npm run build` и как подключать на стороне Bitrix.

## Структура dist/

```
dist/
├── .vite/manifest.json        Карта entry → ассеты
├── assets/
│   ├── main-<hash>.css        Общие стили (atoms, molecules, секции, токены)
│   ├── main-<hash>.js         Общий JS (анимации, слайдеры, OpekaFront.init)
│   ├── home-<hash>.css        Page-specific стили главной (.home-shell)
│   ├── tt-hoves-pro-*.woff2   Шрифты
│   └── ...                    Картинки, видео из HTML (`../../assets/...`)
└── src/pages/
    └── home/home.html         Справочный HTML (Bitrix его НЕ использует)
```

## Entry-точки

В `vite.config.mjs` зарегистрированы стабильные entry-точки. Их ключи в manifest **не меняются** между сборками — меняются только хеши файлов.

| Manifest-ключ | Что содержит | Подключать на production |
|---|---|---|
| `src/scripts/main.js` | Общий JS + CSS (компоненты, анимации, токены) | Да, на каждой странице |
| `src/pages/home/home.html` | Page-specific CSS главной | Да, только на главной |

Styleguide-entry (`styleguide-*`) — только для витрины, на production не подключать.

## Как читать manifest.json

```json
{
  "src/scripts/main.js": {
    "file": "assets/main-CRzvZU5O.js",
    "isEntry": true,
    "css": ["assets/main-Cas78-22.css"],
    "assets": ["assets/tt-hoves-pro-regular-BHAaSbe0.woff2", "..."]
  },
  "src/pages/home/home.html": {
    "file": "assets/home-Dhtw_Jux.css",
    "src": "src/pages/home/home.html"
  }
}
```

- `src/scripts/main.js` → `file` — JS-бандл, `css` — массив CSS-файлов.
- `src/pages/home/home.html` → `file` — page-specific CSS (JS у страницы пока нет).
- Пути в manifest **относительные** к корню `dist/`. PHP добавляет свой `$assetsBase`.
- Картинки/видео, подключённые прямо в HTML через `../../assets/...`, копируются в `dist/assets/` с hash и переписываются в built HTML. Они не являются JS/CSS entry и поэтому не обязаны появляться в manifest.

## PHP-пример для Bitrix

```php
<?php
// $assetsBase — путь от корня сайта до папки dist/.
// Примеры:
//   '/local/templates/opeka/dist/'
//   '/dist/'
$assetsBase = '/local/templates/opeka/dist/';

$manifest = json_decode(
    file_get_contents($_SERVER['DOCUMENT_ROOT'] . $assetsBase . '.vite/manifest.json'),
    true,
);

// --- Общие ассеты (на каждой странице) ---
$main = $manifest['src/scripts/main.js'];

foreach ($main['css'] as $css) {
    echo '<link rel="stylesheet" href="' . $assetsBase . $css . '">';
}
echo '<script type="module" src="' . $assetsBase . $main['file'] . '"></script>';

// --- Page-specific ассеты (только на главной) ---
$home = $manifest['src/pages/home/home.html'];

if (!empty($home['file']) && str_ends_with($home['file'], '.css')) {
    echo '<link rel="stylesheet" href="' . $assetsBase . $home['file'] . '">';
}
?>
```

## Добавление новой страницы

1. Создать `src/pages/<name>/<name>.html` и `<name>.js` (импортирующий `<name>.scss`).
2. Зарегистрировать HTML в `vite.config.mjs` → `rollupOptions.input`.
3. В PHP подключить `src/scripts/main.js` (общее) + `src/pages/<name>/<name>.html` (page-specific).

## Важно

- Хеши в именах файлов меняются при каждой сборке — **не хардкодить имена**.
- `manifest.json` — источник правды для JS/CSS entry. HTML-ассеты (`poster`, `video`, `img`) уже переписаны в built HTML.
- Пути в manifest относительные — PHP **сам добавляет** `$assetsBase`.
- Built HTML в `dist/src/pages/` — справочный артефакт. Bitrix его не использует напрямую.
