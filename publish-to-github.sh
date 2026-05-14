#!/usr/bin/env bash
# Публикация на GitHub и запуск GitHub Pages (workflow уже в репозитории).
# Требуется: аккаунт GitHub, созданный пустой репозиторий (без README).
#
# Использование:
#   export GITHUB_USER="ваш_логин"
#   export REPO="имя-репозитория"
#   bash publish-to-github.sh
#
# После первого push: на GitHub откройте
#   Settings → Pages → Build and deployment → Source: GitHub Actions

set -euo pipefail
cd "$(dirname "$0")"

if [[ -z "${GITHUB_USER:-}" || -z "${REPO:-}" ]]; then
  echo "Задайте переменные: GITHUB_USER и REPO"
  echo "Пример: GITHUB_USER=mylogin REPO=uyutnaya-kuhnya bash publish-to-github.sh"
  exit 1
fi

ORIGIN="https://github.com/${GITHUB_USER}/${REPO}.git"

if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$ORIGIN"
else
  git remote add origin "$ORIGIN"
fi

echo "Пуш в $ORIGIN ..."
git push -u origin main

echo ""
echo "Дальше на GitHub:"
echo "  1. Settings → Pages → Source: выберите «GitHub Actions» (не «Deploy from branch»)."
echo "  2. Дождитесь зелёного workflow «Deploy to GitHub Pages»."
echo "  3. Сайт: https://${GITHUB_USER}.github.io/${REPO}/"
