# Changelog

[← Назад к корневому README](README.md)

Этот файл — **регламент**. Реальные релиз-ноуты хранятся в JSON в `public/releases/` и используются приложением.

## Где хранится информация о релизах

- `public/releases/unreleased.json` — изменения, которые еще не релизнуты.
- `public/releases/{{VERSION}}.json` — релизные заметки по версии.
- `public/releases/index.json` — индекс (latest + список релизов).

## Когда обновлять

Обновляйте `public/releases/unreleased.json`, если изменение влияет на:

- поведение приложения (UI/UX, логика);
- публичные интерфейсы компонентов/плагинов/композиций;
- инфраструктуру фронта (сборка, деплой, конфигурация);
- тестовую инфраструктуру (новые проверки, пороги, обязательные шаги);
- безопасность или производительность клиента.

Не нужно обновлять `public/releases/unreleased.json` для:

- исключительно форматирования кода;
- внутренних рефакторингов без изменения поведения;
- внутренних оптимизаций без измеримого влияния на UX/перфоманс;
- реэкспортов, перемещения файлов и смены путей импортов без изменения публичного API;
- правок тестовых хелперов без изменения обязательных проверок, порогов и процессов;
- мелких правок комментариев, не влияющих на работу.

## Тон и язык

Релиз‑ноуты читают пользователи. Пишите так, чтобы было понятно без знания внутренней архитектуры:

- используйте простой, нейтральный тон без жаргона и внутренних терминов;
- описывайте эффект для пользователя, а не техническую реализацию;
- избегайте названий файлов, папок, классов и тикетов;
- формулируйте коротко (1–2 предложения), в настоящем времени;
- если изменение потенциально влияет на поведение, укажите что именно изменилось.

## Формат JSON

Формат `public/releases/{{VERSION}}.json`:

```json
{
  "version": "1.3.0",
  "date": "2026-02-06",
  "sections": {
    "Added": ["..."],
    "Changed": ["..."],
    "Fixed": ["..."]
  }
}
```

Формат `public/releases/unreleased.json`:

```json
{
  "version": "unreleased",
  "date": "2026-02-06",
  "sections": {
    "Added": ["..."],
    "Changed": ["..."],
    "Fixed": ["..."]
  }
}
```

Формат `public/releases/index.json`:

```json
{
  "latest": "1.3.0",
  "unreleased": "releases/unreleased.json",
  "releases": [
    {
      "version": "1.3.0",
      "date": "2026-02-06",
      "file": "releases/1.3.0.json"
    }
  ]
}
```

Правила:

- `sections` содержит только категории, которые есть в релизе.
- Одна строка в массиве = одно изменение.

## Сценарии и примеры

Примеры строк для `sections`:

- `Added`: "Экран истории заказов с фильтрами и пагинацией."
- `Changed`: "Поиск теперь выполняется с debounce 300 мс."
- `Fixed`: "Исправлено дрожание модального окна при открытии на Safari 16."
- `Removed`: "Удалён компонент Button, заменён на UIButton."
- `Security`: "Заменён небезопасный npm-пакет."

## CI/CD (формирование JSON)

Генерация JSON должна происходить **до сборки фронта**, чтобы файлы попали в билд.

### Пример GitLab CI job

Ниже пример job, который берет `public/releases/unreleased.json`,
а при наличии тега релиза создает файл версии и обновляет `index.json`.

```yaml
release_notes:
  stage: release
  image: python:3.12-alpine
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
  script:
    - python - <<'PY'
import json
import os
import datetime
from pathlib import Path

root = Path("public/releases")
root.mkdir(parents=True, exist_ok=True)

unreleased_path = root / "unreleased.json"
if not unreleased_path.exists():
    raise SystemExit("public/releases/unreleased.json not found")

unreleased = json.loads(unreleased_path.read_text(encoding="utf-8"))

# выставим дату, если ее нет
release_date = os.environ.get("RELEASE_DATE") or datetime.date.today().isoformat()
if not unreleased.get("date"):
    unreleased["date"] = release_date
    unreleased_path.write_text(
        json.dumps(unreleased, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

index_path = root / "index.json"
if index_path.exists():
    index = json.loads(index_path.read_text(encoding="utf-8") or "{}")
else:
    index = {}

version = os.environ.get("RELEASE_VERSION") or os.environ.get("CI_COMMIT_TAG")
if version:
    release = {**unreleased, "version": version, "date": release_date}
    (root / f"{version}.json").write_text(
        json.dumps(release, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    releases = [r for r in index.get("releases", []) if r.get("version") != version]
    releases.insert(0, {"version": version, "date": release_date, "file": f"releases/{version}.json"})
    index["latest"] = version
    index["releases"] = releases

index["unreleased"] = "releases/unreleased.json"
index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
PY
  artifacts:
    paths:
      - public/releases
```
