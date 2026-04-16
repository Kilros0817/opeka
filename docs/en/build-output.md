# Build and Asset Integration

What ends up in `dist/` after `npm run build` and how to integrate assets on the Bitrix side.

## dist/ Structure

```
dist/
├── .vite/manifest.json        Entry → assets map
├── assets/
│   ├── main-<hash>.css        Shared styles (atoms, molecules, sections, tokens)
│   ├── main-<hash>.js         Shared JS (animations, sliders, OpekaFront.init)
│   ├── home-<hash>.css        Page-specific styles for the homepage (.home-shell)
│   ├── tt-hoves-pro-*.woff2   Fonts
│   └── ...                    Images/videos referenced from HTML (`../../assets/...`)
└── src/pages/
    └── home/home.html         Reference HTML (Bitrix does NOT use it)
```

## Entry Points

Stable entry points are registered in `vite.config.mjs`. Their manifest keys **do not change** between builds — only file hashes change.

| Manifest Key | Contents | Load in Production |
|---|---|---|
| `src/scripts/main.js` | Shared JS + CSS (components, animations, tokens) | Yes, on every page |
| `src/pages/home/home.html` | Page-specific CSS for the homepage | Yes, only on the homepage |

Styleguide entries (`styleguide-*`) are for the showcase only — do not load them in production.

## How to Read manifest.json

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

- `src/scripts/main.js` → `file` — JS bundle, `css` — array of CSS files.
- `src/pages/home/home.html` → `file` — page-specific CSS (no page-level JS yet).
- Paths in the manifest are **relative** to the `dist/` root. PHP prepends its own `$assetsBase`.
- Images/videos referenced directly from HTML via `../../assets/...` are copied to `dist/assets/` with a hash and rewritten in built HTML. They are not JS/CSS entries, so they do not have to appear in the manifest.

## PHP Example for Bitrix

```php
<?php
// $assetsBase — path from the site root to the dist/ folder.
// Examples:
//   '/local/templates/opeka/dist/'
//   '/dist/'
$assetsBase = '/local/templates/opeka/dist/';

$manifest = json_decode(
    file_get_contents($_SERVER['DOCUMENT_ROOT'] . $assetsBase . '.vite/manifest.json'),
    true,
);

// --- Shared assets (on every page) ---
$main = $manifest['src/scripts/main.js'];

foreach ($main['css'] as $css) {
    echo '<link rel="stylesheet" href="' . $assetsBase . $css . '">';
}
echo '<script type="module" src="' . $assetsBase . $main['file'] . '"></script>';

// --- Page-specific assets (homepage only) ---
$home = $manifest['src/pages/home/home.html'];

if (!empty($home['file']) && str_ends_with($home['file'], '.css')) {
    echo '<link rel="stylesheet" href="' . $assetsBase . $home['file'] . '">';
}
?>
```

## Adding a New Page

1. Create `src/pages/<name>/<name>.html` and `<name>.js` (which imports `<name>.scss`).
2. Register the HTML in `vite.config.mjs` → `rollupOptions.input`.
3. In PHP, load `src/scripts/main.js` (shared) + `src/pages/<name>/<name>.html` (page-specific).

## Important

- File name hashes change on every build — **never hardcode file names**.
- `manifest.json` is the source of truth for JS/CSS entries. HTML assets (`poster`, `video`, `img`) are already rewritten in built HTML.
- Paths in the manifest are relative — PHP **prepends** `$assetsBase` on its own.
- Built HTML in `dist/src/pages/` is a reference artifact. Bitrix does not use it directly.
