#!/usr/bin/env bash
# lint-contracts.sh — строгие проверки production-кода.
# Ловит паттерны, которые линтеры пропускают или не проверяют.
# Исключаются: styleguide, _template.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

PROD_DIRS=(
  src
)

errors=0

check_pattern() {
  local label="$1"
  local pattern="$2"
  local glob="$3"
  local ignore_pattern="${4:-}"

  local matches
  matches=$(grep -rn \
    --exclude-dir=styleguide \
    --exclude-dir=_template \
    --include="$glob" \
    -E "$pattern" "${PROD_DIRS[@]}" 2>/dev/null \
    | grep -v '\.styleguide\.' || true)

  if [ -n "$ignore_pattern" ]; then
    matches=$(echo "$matches" | grep -v -E "$ignore_pattern" || true)
  fi

  if [ -n "$matches" ]; then
    echo -e "${RED}[FAIL]${NC} $label"
    echo "$matches" | while IFS= read -r line; do
      echo "  $line"
    done
    echo ""
    errors=$((errors + 1))
  fi
}

echo "Checking production code contracts..."
echo ""

check_pattern 'style="" — inline styles запрещены, используй BEM + SCSS-токены' \
  'style="' '*.html'

check_pattern 'console.log — убрать перед коммитом' \
  'console\.(log|debug|warn|error)' '*.js'

check_pattern 'TODO/FIXME — незакрытые задачи в production-коде' \
  '(TODO|FIXME|HACK|XXX)' '*.html'

check_pattern 'TODO/FIXME — незакрытые задачи в production-коде' \
  '(TODO|FIXME|HACK|XXX)' '*.js'

check_pattern 'TODO/FIXME — незакрытые задачи в production-коде' \
  '(TODO|FIXME|HACK|XXX)' '*.scss'

check_pattern '/src/assets/ в SCSS — прямые пути запрещены, кроме @font-face в base/_typography.scss' \
  '/src/assets/' '*.scss' 'src/styles/base/_typography\.scss:.*\/src\/assets\/fonts\/'

check_pattern '/src/assets/ в HTML — используй относительный Vite-путь ../../assets/...' \
  '/src/assets/' '*.html'

if [ "$errors" -gt 0 ]; then
  echo -e "${RED}Found $errors contract violation(s).${NC}"
  exit 1
else
  echo -e "${GREEN}All production contracts OK.${NC}"
  exit 0
fi
