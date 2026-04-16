# Opeka Front

HTML-шаблон сайта сети пансионатов «Опека». Vite + ванильный JS + SCSS. Собирается в `dist/` для натяжки на Bitrix.

## Quick start

```bash
nvm use          # Node 20
npm install
npm run dev      # http://localhost:5173/
```

## Documentation

| | |
|---|---|
| **[Руководство (RU)](docs/ru/guide.md)** | Архитектура, правила, how-to, чеклисты |
| **[Guide (EN)](docs/en/guide.md)** | Architecture, rules, how-to, checklists |
| [Сборка и ассеты (RU)](docs/ru/build-output.md) / [(EN)](docs/en/build-output.md) | manifest.json, PHP for Bitrix |
| [Bitrix-интеграция (RU)](docs/ru/bitrix-integration.md) / [(EN)](docs/en/bitrix-integration.md) | Contract, AJAX-init, SVG sprite |

## Commands

| Command | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build → `dist/` |
| `npm run lint` | Stylelint + HTMLHint + ESLint |
| `npm run lint:contracts` | Strict production code checks |

## Styleguide

Visual component catalog: `http://localhost:5173/src/pages/styleguide/`