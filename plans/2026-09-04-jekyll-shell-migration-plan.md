# TID Group — миграция на общий шаблон (Jekyll + GitHub Pages)

*Создан: 4 сентября 2026*
*Основание: отчёт «Один шаблон на 21 страницу» (инспекция от 4 сентября 2026)*
*Цель: убрать 21 копию хедера/футера, сайт открывается на https://tidgroup.es/*

---

## §0. Инструкция агенту: как работать с этим планом

**Этот файл — единственный источник истины о прогрессе.** Он лежит в git, поэтому состояние
переживает перезапуск сессии, смену машины и смену исполнителя.

### Порядок работы в каждой сессии

1. Прочитать §0, §1 (статус), §3 (инварианты).
2. Выполнить «быструю проверку здоровья» из §1.
3. Найти **первую незакрытую задачу** (`- [ ]`) по порядку фаз. Задачи внутри фазы выполнять
   строго сверху вниз; фазы не перескакивать, если в шапке фазы не написано «можно параллельно».
4. Выполнить задачу.
5. Выполнить блок **Проверка** этой задачи. Проверка не прошла → см. п. 8.
6. Поставить `[x]`, дописать строку в журнал (§6).
7. Закоммитить: изменения кода **и** этот файл одним коммитом, сообщение
   `plan(<ID>): <что сделано>` (например `plan(C3): head.html include`).
8. Если проверка не прошла: **не ставить `[x]`**. Записать в журнал строку со статусом
   `BLOCKED` и причиной, остановиться и спросить владельца. Не «доделывать по-своему»,
   если это меняет решения из §2.

### Жёсткие правила

- Никогда не ставить `[x]` без прохождения блока «Проверка».
- Не выполнять `git push --force`, не переписывать историю, не трогать ветку `main`
  до фазы J.
- Не менять текст внутри `<main>`. Разрешено менять только пути к ассетам и только там,
  где это прямо предписано задачей.
- Не удалять и не переименовывать атрибуты `data-key` — на них держится перевод.
- Никакие действия с DNS и доменом без явного подтверждения владельца (фаза J).
- Если задача требует решения, которого нет в плане (например, какой текст description
  для страницы) — спросить владельца, а не придумывать молча.

### Обозначения

- `- [ ]` / `- [x]` — задача. У каждой есть ID (`A1`, `C3`, `E-07`).
- **Проверка** — объективный критерий готовности. Если критерий машинный, он приведён
  командой.
- 🔒 — задача, требующая подтверждения владельца до выполнения.

---

## §1. Статус

**Агент обновляет этот блок после каждой задачи.**

| Поле | Значение |
|---|---|
| Текущая фаза | `A — не начата` |
| Последняя выполненная задача | `—` |
| Дата последнего обновления | `—` |
| Рабочая ветка | `migration/jekyll-shell` (создаётся в A1) |
| Следующее действие | `A1 — создать ветку` |
| Блокеры | `нет` |
| Прод затронут | `нет` |

### Быстрая проверка здоровья (запускать в начале каждой сессии)

```bash
cd /d/Projects/agency-new-design
git status --short && git branch --show-current
git log --oneline -5
ls _config.yml _layouts _includes _data 2>/dev/null   # появятся в фазе C
gh api repos/nestaleks/tidgroup-new/pages --jq '{status, cname, html_url}'
```

---

## §2. Целевая архитектура и принятые решения

### Исходные данные (замеры от 4 сентября 2026)

| Показатель | Значение |
|---|---|
| HTML-страниц | 21 |
| Всего строк HTML | 6318 |
| Из них внутри `<main>` (уникальный контент) | 3982 |
| Обвязка (head + header + footer + скрипты) | **2336 строк (37%)**, в среднем 111 на страницу |
| Вариантов хедера / футера / head / блока скриптов | 1 / 2 / 7 / 3 |
| Мест правки при изменении пункта меню | 42 |
| Изображений | 253 файла, 35 МБ |
| Внутренних ссылок на `.html` | 262 |

### Решения (менять только с согласия владельца)

| № | Решение | Почему |
|---|---|---|
| Р1 | **Jekyll**, а не Eleventy/Astro | GitHub Pages собирает Jekyll сам; в репозитории уже включён Pages (`build_type: legacy` → Jekyll 3.10). Ноль инструментов на сервере, ноль зависимостей в проде. |
| Р2 | `url: https://tidgroup.es`, **`baseurl: ""`** | Сайт живёт в корне домена. |
| Р3 | Расширения `.html` в URL **сохраняем** | Страницы уже проиндексированы как `/services.html`. Дефолтный permalink Jekyll для страниц это и даёт. **Не ставить `permalink: pretty`** — иначе URL станут `/services/` и понадобятся редиректы. |
| Р4 | Пути к ассетам — через `{{ '/path' \| relative_url }}` | Один шаблон работает и для корневых, и для вложенных страниц; при этом не зависит от глубины файла. |
| Р5 | Скрипты подключаются **условно** через `page.scripts` | jQuery+magnific реально нужны на 6 страницах из 21 (см. §2.1), а грузятся на 17. |
| Р6 | Меню — данные (`_data/nav.yml`), а не разметка | Один список для хедера и футера, отсюда же подсветка активного пункта. |
| Р7 | Верификация — локально (`jekyll serve` на корне `/`) | Только локальный корень совпадает по структуре путей с целевым доменом. На `nestaleks.github.io/tidgroup-new/` после фазы C пути будут вести на корень домена github.io — **это ожидаемо, не баг** (см. J-предупреждение). |
| Р8 | `plans/`, `tools/`, `Gemfile*` исключаются из сборки | Внутренние файлы не должны публиковаться на tidgroup.es. |

### §2.1. Карта скриптов (проверено grep'ом по разметке)

| Набор | Что подключает | Страницы | Основание |
|---|---|---|---|
| база (всегда) | `translate.js`, `main.js` | все 21 | переводы, меню, кнопка «наверх» |
| `home` | GSAP + ScrollTrigger + TextPlugin (CDN), затем `animations.js` | `index.html` | единственная страница с GSAP-анимациями |
| `gallery` | `jquery-3.7.1.min.js`, `jquery.magnific-popup.min.js` | `gallery.html`, `projects/boho-corner.html`, `projects/can-marques.html`, `projects/foners-club.html`, `projects/marina-residence.html`, `projects/solivar.html` | наличие `.popup-gallery` и/или `.listing__item` (модалки) |

Остальные **11 страниц** (about, news, все `gallery/*`, все `news/*`) сейчас грузят jQuery
(87 КБ) + magnific (20 КБ), не используя их. После миграции — перестанут.

Порядок подключения в `index.html` сохранить как сейчас: GSAP → translate → main → animations.

### §2.2. Целевое дерево

```
_config.yml                 # url, baseurl, exclude, defaults
Gemfile                     # только для локального превью
_layouts/
  default.html              # единственный каркас страницы
_includes/
  head.html                 # <head> целиком: meta, OG, canonical, шрифты, app.css
  header.html               # хедер, меню из _data/nav.yml
  footer.html               # футер, меню из _data/nav.yml, контакты из _data/contacts.yml
  scripts.html              # условное подключение скриптов
_data/
  nav.yml                   # пункты меню
  contacts.yml              # телефон, email
tools/
  snapshot.mjs              # снимок состояния страниц (Playwright)
  compare.mjs               # диф снимков «до/после»
snapshots/                  # результаты снимков (в git не коммитить, см. A2)
plans/                      # этот план (из сборки исключён)
index.html  about.html  ... # только front matter + содержимое <main>
css/  js/  images/          # без изменений
CNAME  favicon.ico
```

### §2.3. Что миграция исправляет попутно

Всё это — следствия копипаста, найденные при инспекции:

| Дефект | Масштаб | Как закрывается |
|---|---|---|
| В футере главной классы `menu__item` → на ≤1120px ссылки невидимы (`opacity: 0` от правила мобильного меню) | 1 страница, но это главная | общий футер (C5) |
| `<title>Puerto de Soller</title>` | 14 страниц | фаза F |
| Нет `meta description`, нет OG-тегов | 21 страница | C3 + фаза F |
| Favicon подключён только на 6 страницах, и с неверным `type="image/svg+xml"` для `.ico` | 15 без favicon | C3 |
| Тултип кнопки «наверх» на украинском (`title="Повернутися нагору"`) | 15 страниц | G5 |
| `href="../../images/..."` на страницах в `gallery/` — лишний уровень вверх | 6 страниц × 16 ссылок = 96 | G1 |
| Нет подсветки активного пункта меню | 21 страница | H1 |

Про `../../`: на `https://tidgroup.es/gallery/gallery_01.html` эти пути **сейчас работают**
только потому, что браузер обрезает выход выше корня. На project-URL GitHub Pages они уже
дают 404 (проверено: `https://nestaleks.github.io/images/gallery/01/gallery_01_01.jpg` → 404).
Оставлять их нельзя.

---

## §3. Инварианты — что нельзя сломать

Проверяется в фазе I, но держать в голове постоянно.

- [ ] Текст внутри `<main>` совпадает 1:1 с исходным (кроме путей по G1/G7).
- [ ] Все атрибуты `data-key` сохранены → работает `js/translate.js`.
- [ ] URL страниц не изменились: `/`, `/services.html`, `/projects/solivar.html` и т. д.
- [ ] Файл `CNAME` с `tidgroup.es` остался в корне репозитория.
- [ ] `css/*` и `js/*` не переписываются (исключение: одно новое правило `.menu__link.is-active` в H1).
- [ ] Пути в CSS (`url(../images/...)`, 8 штук) не трогаем — они относительны файлу CSS и остаются верными.
- [ ] Переключатель языка EN/ES работает на всех страницах и помнит выбор между переходами.
- [ ] Мобильное меню открывается/закрывается, каскад пунктов на месте.
- [ ] Галереи magnific работают на 6 страницах из §2.1, модалки — на 5 страницах проектов.
- [ ] Кнопка `#upBtn` есть на всех страницах и работает.
- [ ] Кодировка UTF-8, кириллица в комментариях CSS/JS не побилась.

---

## §4. Фазы

### Фаза A — страховка и базовая линия

Цель: получить эталон «как сайт выглядит сейчас», чтобы потом доказать, что ничего не сломалось.

- [ ] **A1. Создать рабочую ветку**
  ```bash
  git checkout -b migration/jekyll-shell
  ```
  **Проверка:** `git branch --show-current` → `migration/jekyll-shell`.
  `main` до фазы J не трогаем: Pages деплоит именно `main`, поэтому прод остаётся живым.

- [ ] **A2. Дополнить `.gitignore`**
  Добавить: `_site/`, `.jekyll-cache/`, `.sass-cache/`, `Gemfile.lock`, `snapshots/`.
  **Проверка:** `git check-ignore -v _site snapshots .jekyll-cache` печатает правила для всех трёх.

- [ ] **A3. Написать `tools/snapshot.mjs`**
  Скрипт обходит все страницы и по каждой собирает машинно-сравнимый снимок.
  Playwright установлен глобально: `D:/home/nestaleks/.npm-global/node_modules/playwright`
  (импортировать через `createRequire` по абсолютному пути — так это работало при инспекции).
  Снимать по каждой странице:
  - `title`, `meta[name=description]`, `link[rel=canonical]`;
  - количество `<link rel=stylesheet>` и `<script src>` + их список;
  - `document.images`: список тех, у которых `naturalWidth === 0` (**битые картинки**);
  - ошибки в консоли и `pageerror`;
  - список внутренних `href` (для проверки ссылок);
  - вычисленные стили ключевых элементов: `.menu__link` (font-family, font-size, color),
    `.current-lang` (текст, размеры), `.header` (высота), `.footer__company-link`
    (opacity — ловит дефект главной), `.services-page__item` (если есть);
  - скриншоты 1440×900 и 390×800.
  Список страниц брать из `git ls-files '*.html'`.
  Запуск: `node tools/snapshot.mjs <base-url> <out-dir>`.
  **Проверка:** скрипт отрабатывает без исключений и создаёт по 21 JSON и 42 PNG.

- [ ] **A4. Снять эталон «до»**
  ```bash
  # терминал 1 (из корня проекта):
  python -m http.server 8080      # или: npx serve -l 8080 .
  # терминал 2:
  node tools/snapshot.mjs http://localhost:8080 snapshots/before
  ```
  **Проверка:** `snapshots/before/` содержит 21 JSON; в журнале (§6) зафиксировано,
  сколько битых картинок и ошибок консоли найдено **до** миграции (ожидаемо: 0 битых,
  т.к. локальный корень спасает `../../`; ошибок консоли 0).

- [ ] **A5. Написать `tools/compare.mjs`**
  Сравнивает два каталога снимков и печатает различия по страницам.
  Ключи, которые меняются намеренно, задаются списком игнора параметром
  (`--ignore title,description,canonical,scripts,stylesheets`).
  **Проверка:** `node tools/compare.mjs snapshots/before snapshots/before` → «различий нет».

- [ ] **A6. Зафиксировать фазу**
  ```bash
  git add -A && git commit -m "plan(A): baseline snapshots and verification tooling"
  git push -u origin migration/jekyll-shell
  ```
  **Проверка:** ветка видна на GitHub, `git status` чист.

---

### Фаза B — локальная сборка Jekyll

Цель: научиться собирать сайт локально и доказать, что **пустая** сборка (без шаблонов)
не меняет ни одного байта. Это отделяет проблемы окружения от проблем шаблонов.

- [ ] **B1. Поднять локальный Jekyll**
  План А (основной) — Ruby на Windows:
  ```bash
  # RubyInstaller 3.1.x x64 WITH DEVKIT, затем:
  ridk install        # выбрать пункт 3 (MSYS2 and MINGW development toolchain)
  gem install bundler
  ```
  `Gemfile`:
  ```ruby
  source "https://rubygems.org"
  gem "github-pages", group: :jekyll_plugins   # пинует ту же версию Jekyll, что и GitHub Pages
  ```
  ```bash
  bundle install
  bundle exec jekyll --version
  ```
  План Б, если `bundle install` не собирается (нативные расширения):
  ```bash
  docker run --rm -v "/d/Projects/agency-new-design:/srv/jekyll" -p 4000:4000 \
    jekyll/jekyll:4 jekyll serve --host 0.0.0.0
  ```
  План В, если Ruby и Docker недоступны: собирать через GitHub Actions
  (`actions/jekyll-build-pages`), скачивать артефакт и проверять его локально статик-сервером.
  Дороже по времени цикла, но работоспособно.
  **Проверка:** `bundle exec jekyll build` (или эквивалент) завершается без ошибок.
  В журнал записать, какой план (А/Б/В) сработал и какая версия Jekyll.

- [ ] **B2. Минимальный `_config.yml` и «пустая» сборка**
  ```yaml
  url: https://tidgroup.es
  baseurl: ""
  exclude:
    - plans/
    - tools/
    - snapshots/
    - Gemfile
    - Gemfile.lock
    - README.md
    - .gitignore
  ```
  Ни у одной страницы ещё нет front matter, поэтому Jekyll должен просто скопировать файлы.
  **Проверка:** сборка проходит; и содержимое совпадает с исходником:
  ```bash
  bundle exec jekyll build
  diff -r --exclude=_site --exclude=.git --exclude=plans --exclude=tools \
       --exclude=snapshots --exclude=Gemfile --exclude=Gemfile.lock \
       --exclude=README.md --exclude=.gitignore . _site
  ```
  Ожидание: различий нет (или только в служебных файлах). Если Jekyll ругается на Liquid —
  это неожиданно: `{{`/`{%` в контенте нет (проверено при инспекции), значит смотреть на
  конкретный файл из сообщения.

- [ ] **B3. Снять снимок сборки и сравнить с эталоном**
  ```bash
  python -m http.server 8081 --directory _site
  node tools/snapshot.mjs http://localhost:8081 snapshots/b3-empty-build
  node tools/compare.mjs snapshots/before snapshots/b3-empty-build
  ```
  **Проверка:** различий нет ни по одной странице. Это точка, после которой можно доверять
  инструментам.

- [ ] **B4. Зафиксировать**
  `git commit -m "plan(B): local Jekyll build reproduces the site byte-for-byte"`

---

### Фаза C — каркас шаблона

Цель: собрать шаблон и данные. Страницы на него **пока не переводим** — сборка на этой фазе
обязана остаться прежней.

- [ ] **C1. Полный `_config.yml`**
  ```yaml
  title: TID Group
  description: Property development, investment and property services in Mallorca, Spain.
  url: https://tidgroup.es
  baseurl: ""
  lang: en

  defaults:
    - scope: { path: "" }
      values: { layout: default }

  exclude:
    - plans/
    - tools/
    - snapshots/
    - Gemfile
    - Gemfile.lock
    - README.md
    - .gitignore
  ```
  `defaults` избавляет от строки `layout: default` в каждой странице.
  **Внимание:** изменения `_config.yml` не подхватываются `jekyll serve` на ходу — перезапускать.
  **Проверка:** `bundle exec jekyll build` без ошибок; `_site` по-прежнему как исходник
  (страницы без front matter, `defaults` к ним не применяется).

- [ ] **C2. `_data/nav.yml` и `_data/contacts.yml`**
  ```yaml
  # _data/nav.yml — порядок как в текущем меню
  - key: menu-home
    label: Home
    url: /
    active_on: /
  - key: menu-projects
    label: Projects
    url: /#projects
    active_on: ""          # якорь на главной: активным не помечаем
  - key: menu-investments
    label: Investments
    url: /investments.html
    active_on: /investments.html
  - key: menu-services
    label: Services
    url: /services.html
    active_on: /services.html
  - key: menu-contacts
    label: Contacts
    url: /contacts.html
    active_on: /contacts.html
  ```
  ```yaml
  # _data/contacts.yml
  phone: "+34658058102"
  email: "office@tidgroup.es"
  ```
  Ключи `data-key` в футере другие (`footer-home` и т. д.) — их берём как `footer-{{ item.key | remove: 'menu-' }}`
  или добавляем в nav.yml отдельное поле `footer_key`. Выбрать второй вариант: явное лучше.
  **Проверка:** `bundle exec jekyll build` без ошибок; значения читаются
  (проверить временным `{{ site.data.nav | size }}` в тестовом файле, затем удалить).

- [ ] **C3. `_includes/head.html`**
  Собрать `<head>` из текущего (эталон — `index.html`), добавив то, чего нет ни на одной странице:
  ```liquid
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ page.title | default: site.title }}</title>
    <meta name="description" content="{{ page.description | default: site.description }}">
    <link rel="canonical" href="{{ page.url | absolute_url }}">
    <link rel="icon" href="{{ '/favicon.ico' | relative_url }}" type="image/x-icon">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="TID Group">
    <meta property="og:title" content="{{ page.title | default: site.title }}">
    <meta property="og:description" content="{{ page.description | default: site.description }}">
    <meta property="og:url" content="{{ page.url | absolute_url }}">
    <meta property="og:image" content="{{ page.og_image | default: '/images/og-default.jpg' | absolute_url }}">
    <meta name="twitter:card" content="summary_large_image">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="{{ '/app.css' | relative_url }}" rel="stylesheet">
  </head>
  ```
  Что здесь изменено осознанно: 4 запроса к Google Fonts → 1; у Poppins и Jost урезаны
  начертания (сейчас тянутся все 100–900 + курсивы, а используются они только в фолбэках
  `base.css` и трёх правилах `project.css`); `type` favicon исправлен на `image/x-icon`.
  **Проверка:** сборка проходит. Визуальную проверку шрифтов делаем в D4 (сравнение
  `font-family`/`font-size` в снимке обязано совпасть с эталоном).

- [ ] **C4. `_includes/header.html`**
  Разметку взять из любой страницы — все 21 идентичны. Заменить:
  - `href`/`src` → `{{ '...' | relative_url }}`;
  - список пунктов → цикл по `site.data.nav`;
  - добавить класс `is-active` (правило CSS появится в H1).
  ```liquid
  {% for item in site.data.nav %}
    <li class="menu__item">
      <a class="menu__link{% if item.active_on != "" and page.url == item.active_on %} is-active{% endif %}"
         href="{{ item.url | relative_url }}" data-key="{{ item.key }}">{{ item.label }}</a>
    </li>
  {% endfor %}
  ```
  **Проверка:** сборка проходит; в собранном HTML тестовой страницы 5 пунктов, порядок и
  `data-key` совпадают с исходником.

- [ ] **C5. `_includes/footer.html`**
  Эталон — футер `about.html` (**не** `index.html`: там дефектные классы `menu__item`).
  Пункты — цикл по `site.data.nav` с `footer_key`; телефон и email — из `_data/contacts.yml`.
  **Проверка:** в собранном футере класс `footer__company-item` (не `menu__item`), 5 пунктов,
  телефон и email на месте.

- [ ] **C6. `_includes/scripts.html`**
  ```liquid
  {% if page.scripts contains 'home' %}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js"></script>
  {% endif %}
  {% if page.scripts contains 'gallery' %}
    <script src="{{ '/js/jquery-3.7.1.min.js' | relative_url }}"></script>
    <script src="{{ '/js/jquery.magnific-popup.min.js' | relative_url }}"></script>
  {% endif %}
  <script src="{{ '/js/translate.js' | relative_url }}"></script>
  <script src="{{ '/js/main.js' | relative_url }}"></script>
  {% if page.scripts contains 'home' %}
    <script src="{{ '/js/animations.js' | relative_url }}"></script>
  {% endif %}
  ```
  Порядок важен: `translate.js` до `main.js`, `animations.js` после `main.js`, GSAP до всех.
  **Проверка:** сборка проходит; на странице без `scripts` в front matter выводятся ровно два
  тега `<script src>`.

- [ ] **C7. `_layouts/default.html`**
  ```liquid
  <!DOCTYPE html>
  <html lang="{{ site.lang }}">
  {% include head.html %}
  <body{% if page.body_class %} class="{{ page.body_class }}"{% endif %}>
    {% include header.html %}
    <main class="main">
      <button onclick="topFunction()" id="upBtn" title="Up" data-key="up-button">
        <img src="{{ '/images/upbtn.svg' | relative_url }}" alt="">
      </button>
      {{ content }}
    </main>
    {% include footer.html %}
    {% include scripts.html %}
  </body>
  </html>
  ```
  Кнопка `#upBtn` переезжает в шаблон (в исходниках она внутри `<main>` на каждой странице) —
  значит из `<main>` каждой страницы её нужно удалить при переводе (фазы D, E).
  **Проверка:** сборка проходит; `_site` пока не изменился (страницы ещё без front matter).

- [ ] **C8. Зафиксировать**
  `git commit -m "plan(C): layout, includes and nav data"`

---

### Фаза D — пилот на трёх страницах

Цель: проверить шаблон на всех трёх типах страниц до массового переноса.
Выбраны: `index.html` (набор `home`, самая сложная), `services.html` (без доп. скриптов),
`projects/solivar.html` (набор `gallery`, вложенная папка, 712 строк, модалки).

- [ ] **D1. Перевести `index.html`**
  Front matter:
  ```yaml
  ---
  title: TID Group — Property Development in Mallorca
  description: <из таблицы F>
  scripts: [home]
  ---
  ```
  Из файла удалить: `<!DOCTYPE>`, `<html>`, `<head>`, `<header>`, `<footer>`, теги `<script>`,
  обёртку `<main>` и кнопку `#upBtn`. Остаётся только содержимое `<main>`.
  **Проверка:** `bundle exec jekyll build`; в `_site/index.html` есть хедер, футер, 4 скрипта
  (3 GSAP + animations) плюс translate/main; кнопка `#upBtn` ровно одна.

- [ ] **D2. Перевести `services.html`** (front matter без `scripts`).
  **Проверка:** в `_site/services.html` ровно 2 тега `<script src>`; хедер и футер на месте.

- [ ] **D3. Перевести `projects/solivar.html`** (`scripts: [gallery]`).
  **Проверка:** в `_site/projects/solivar.html` 4 скрипта (jquery, magnific, translate, main);
  пути к ассетам ведут на `/images/...`, `/css/...`, `/js/...`.

- [ ] **D4. Сравнить пилот с эталоном**
  ```bash
  python -m http.server 8081 --directory _site
  node tools/snapshot.mjs http://localhost:8081 snapshots/d4-pilot
  node tools/compare.mjs snapshots/before snapshots/d4-pilot --ignore title,description,canonical,scripts,stylesheets
  ```
  **Проверка (все пункты обязательны):**
  - для трёх переведённых страниц: битых картинок 0, ошибок консоли 0;
  - `font-family` и `font-size` у `.menu__link` совпадают с эталоном;
  - высота `.header` совпадает с эталоном;
  - на скриншотах 1440 и 390 нет визуальных отличий, кроме подсветки активного пункта меню;
  - остальные 18 страниц в дифе не изменились.

- [ ] **D5. Зафиксировать**
  `git commit -m "plan(D): pilot pages on the shared layout"`

---

### Фаза E — перевод остальных 18 страниц

Механическая работа, по одной странице. Правило для каждой: из файла остаётся **только
содержимое `<main>`** (без самого тега `<main>` и без `#upBtn`), сверху — front matter.
Наборы скриптов — строго по §2.1.

Корневые:
- [ ] **E-01** `about.html` — скрипты: нет (jQuery не нужен: ни `.popup-gallery`, ни модалок)
- [ ] **E-02** `contacts.html` — скрипты: нет
- [ ] **E-03** `investments.html` — скрипты: нет
- [ ] **E-04** `news.html` — скрипты: нет
- [ ] **E-05** `gallery.html` — скрипты: `[gallery]`

Галерея (вложенные, здесь же чинится `../../` по G1):
- [ ] **E-06** `gallery/gallery_01.html` — скрипты: нет
- [ ] **E-07** `gallery/gallery_02.html` — скрипты: нет
- [ ] **E-08** `gallery/gallery_03.html` — скрипты: нет
- [ ] **E-09** `gallery/gallery_04.html` — скрипты: нет
- [ ] **E-10** `gallery/gallery_05.html` — скрипты: нет
- [ ] **E-11** `gallery/gallery_06.html` — скрипты: нет

Новости:
- [ ] **E-12** `news/news-01.html` — скрипты: нет
- [ ] **E-13** `news/news-02.html` — скрипты: нет
- [ ] **E-14** `news/news-03.html` — скрипты: нет

Проекты:
- [ ] **E-15** `projects/boho-corner.html` — скрипты: `[gallery]`
- [ ] **E-16** `projects/can-marques.html` — скрипты: `[gallery]`
- [ ] **E-17** `projects/foners-club.html` — скрипты: `[gallery]`
- [ ] **E-18** `projects/marina-residence.html` — скрипты: `[gallery]`

**Проверка после каждой страницы:** `bundle exec jekyll build` без ошибок; в собранном файле
есть хедер/футер, ожидаемое число скриптов, одна кнопка `#upBtn`.

- [ ] **E-19. Сплошная проверка после переноса**
  ```bash
  node tools/snapshot.mjs http://localhost:8081 snapshots/e19-all
  node tools/compare.mjs snapshots/before snapshots/e19-all --ignore title,description,canonical,scripts,stylesheets
  ```
  **Проверка:** по всем 21 странице битых картинок 0, ошибок консоли 0; расхождений в
  стилях хедера/футера нет; в `.footer__company-link` opacity = 1 на 390px **на всех** страницах
  (дефект главной закрыт).

- [ ] **E-20. Зафиксировать**
  `git commit -m "plan(E): all 21 pages on the shared layout"`

---

### Фаза F — метаданные страниц

Цель: осмысленные `title` и `description` вместо 14 «Puerto de Soller», плюс OG-картинка.
Язык метаданных — английский (язык разметки по умолчанию).

- [ ] **F1. 🔒 Согласовать таблицу с владельцем.** Ниже — предложения; владелец правит формулировки.
- [ ] **F2. Внести title/description в front matter всех 21 страницы** (по согласованной таблице).
- [ ] **F3. Подготовить `images/og-default.jpg`** — 1200×630, логотип на фото Майорки.
      Пока не готово — временно указать существующий файл, например `/images/mallorca-1.jpg`.
- [ ] **F4. Проставить `og_image` страницам проектов** (по фону из `css/home.css`:
      `solivar-bg.jpg`, `boho-corner-bg.jpg`, `can-marques-bg.jpg`, `foners-bg.jpg`, marina).
- [ ] **F5. Проверка уникальности:** ни один `title` не повторяется, у всех есть `description`
      длиной 70–160 символов:
  ```bash
  grep -h "<title>" _site/*.html _site/*/*.html | sort | uniq -d   # пусто
  grep -L 'name="description"' _site/*.html _site/*/*.html         # пусто
  ```

| # | Страница | Предлагаемый `title` | `description` (черновик) |
|---|---|---|---|
| 1 | `index.html` | TID Group — Property Development in Mallorca | Property development, investment and full-cycle real estate services in Mallorca, Spain. |
| 2 | `about.html` | About TID Group | Who we are: a Mallorca-based team handling land, construction, sales and rentals. |
| 3 | `services.html` | Services — TID Group | Land selection and purchase, consulting, property sales, rentals, valuation and legal support. |
| 4 | `investments.html` | Investments — TID Group | Investment opportunities in Mallorca property: projects, terms and expected returns. |
| 5 | `contacts.html` | Contacts — TID Group | Get in touch with TID Group in Mallorca by phone or email. |
| 6 | `gallery.html` | Gallery — TID Group | Photographs of completed and ongoing TID Group projects in Mallorca. |
| 7 | `news.html` | News — TID Group | News and analysis on the Mallorca property market from TID Group. |
| 8 | `projects/solivar.html` | Puerto de Soller — TID Group | Residential project in Port de Soller, Mallorca: layouts, details and gallery. |
| 9 | `projects/boho-corner.html` | Boho Corner, Palma — TID Group | Boho Corner in Palma de Mallorca: apartments, specifications and gallery. |
| 10 | `projects/can-marques.html` | Can Marques, Palma — TID Group | Can Marques in Palma de Mallorca: apartments, specifications and gallery. |
| 11 | `projects/foners-club.html` | Foners Club, Palma — TID Group | Foners Club in Palma de Mallorca: apartments, specifications and gallery. |
| 12 | `projects/marina-residence.html` | Marina Residence, Palma — TID Group | Marina Residence in Palma de Mallorca: apartments, specifications and gallery. |
| 13 | `gallery/gallery_01.html` | Project Gallery 1 — TID Group | 🔒 нужны настоящие названия: в разметке стоит заглушка «Project or Place Name» |
| 14 | `gallery/gallery_02.html` | Project Gallery 2 — TID Group | 🔒 то же |
| 15 | `gallery/gallery_03.html` | Project Gallery 3 — TID Group | 🔒 то же |
| 16 | `gallery/gallery_04.html` | Project Gallery 4 — TID Group | 🔒 то же |
| 17 | `gallery/gallery_05.html` | Project Gallery 5 — TID Group | 🔒 то же |
| 18 | `gallery/gallery_06.html` | Project Gallery 6 — TID Group | 🔒 то же |
| 19 | `news/news-01.html` | Are Condos Still a Good Investment? — TID Group | Market Watch: whether condominiums remain a sound investment in today's market. |
| 20 | `news/news-02.html` | The History of Great Design — TID Group | From ancient craftsmanship to modern innovation: how design thinking evolved. |
| 21 | `news/news-03.html` | Designers Who Changed Everything — TID Group | The designers who reshaped how we live, build and interact with objects. |

Замечание для владельца: на шести страницах `gallery/*` в разметке стоит текст-заглушка
«Project or Place Name» и «Process planning, building or renovation old house». Это отдельная
задача по контенту, вне миграции, но метаданные без настоящих названий сделать нельзя.

- [ ] **F6. Зафиксировать** — `git commit -m "plan(F): per-page metadata"`

---

### Фаза G — чистка путей и подключений

- [ ] **G1. Починить `../../images/...` на шести страницах `gallery/*`**
  96 ссылок (по 16 на страницу) заменить на `{{ '/images/gallery/NN/...' | relative_url }}`.
  **Проверка:** `grep -rn '\.\./\.\./' *.html */*.html` → пусто; в снимке битых картинок 0.

- [ ] **G2. Свести пути внутри `<main>` к `relative_url`** (рекомендуется, не обязательно)
  Оставшиеся `./images/...` и `../images/...` внутри контента работают, но зависят от глубины
  файла. Перевод на `relative_url` снимает зависимость. Делать скриптом с проверкой после
  каждой пачки файлов.
  **Проверка:** `grep -rn 'src="\.\.\?/' *.html */*.html` → пусто; битых картинок 0.

- [ ] **G3. Проверить экономию на скриптах**
  **Проверка:** `grep -l jquery _site/*.html _site/*/*.html` возвращает ровно 6 файлов
  (`gallery.html` + 5 проектов); `grep -l gsap _site/*.html` — только `index.html`.

- [ ] **G4. Проверить favicon и шрифты на всех страницах**
  **Проверка:** `grep -c 'rel="icon"' _site/*.html _site/*/*.html` — везде 1;
  `grep -c 'fonts.googleapis.com/css2' _site/index.html` — 1 (был 4).

- [ ] **G5. Тултип кнопки «наверх»**
  В шаблоне `title="Up"` (на 15 страницах было `title="Повернутися нагору"`).
  Добавить `up-button` в `js/translate.js` (eng: `Up`, esp: `Arriba`) и `data-key` на кнопку.
  **Внимание:** `changeLang` пишет в `textContent`, а нужен `title` — либо расширить
  `changeLang` поддержкой `data-key-attr="title"`, либо оставить тултип без перевода.
  🔒 Решение за владельцем; по умолчанию — оставить `title="Up"` без перевода (минимум риска).
  **Проверка:** `grep -c 'Повернутися' _site/*.html _site/*/*.html` → 0.

- [ ] **G6. `app.css` и цепочка `@import`** (опционально, можно отложить в фазу K)
  14 `@import` — это водопад загрузки. Заменить на список `<link>` в `head.html` или на
  один собранный файл.
  **Проверка:** число CSS-запросов в снимке уменьшилось, визуальных отличий нет.

- [ ] **G7. Зафиксировать** — `git commit -m "plan(G): asset paths and script loading"`

---

### Фаза H — то, что стало возможным

- [ ] **H1. Подсветка активного пункта меню**
  В `css/header.css` добавить правило для `.menu__link.is-active` (в стиле существующего
  `:hover`: цвет `--accent-gold` и подчёркивание `::after` шириной 70%, но без реакции на hover).
  **Проверка:** на `/services.html` активен пункт Services, на `/` — Home; на `/projects/solivar.html`
  активных пунктов нет (осознанное решение Р6: Projects — якорь на главной).

- [ ] **H2. Футерное меню из тех же данных** (если не сделано в C5)
  **Проверка:** правка `_data/nav.yml` меняет и хедер, и футер одновременно.

- [ ] **H3. Зафиксировать** — `git commit -m "plan(H): active nav state"`

---

### Фаза I — приёмка

Ни одна задача фазы J не начинается, пока все пункты I не закрыты.

- [ ] **I1. Полный снимок и диф**
  ```bash
  node tools/snapshot.mjs http://localhost:8081 snapshots/after
  node tools/compare.mjs snapshots/before snapshots/after --ignore title,description,canonical,scripts,stylesheets
  ```
  **Проверка:** все расхождения объяснимы и намеренны; список расхождений выписан в журнал.

- [ ] **I2. Битые картинки:** 0 на всех 21 странице (было — проверить по A4).
- [ ] **I3. Ошибки консоли:** 0 на всех 21 странице.
- [ ] **I4. Внутренние ссылки:** все 262 ссылки на `.html` ведут на существующие файлы в `_site`.
  Скрипт: собрать `href` из снимка, проверить наличие файла.
- [ ] **I5. Ручной чеклист** (в браузере, `_site` на localhost):
  - [ ] EN → ES → EN на главной; выбор сохраняется при переходе на другую страницу
  - [ ] мобильное меню (390px): открытие, закрытие крестиком, закрытие по фону, каскад пунктов
  - [ ] ссылки в футере видны на 390px (**на главной в первую очередь**)
  - [ ] галерея magnific: `gallery.html` и одна страница проекта
  - [ ] модалки апартаментов: одна страница проекта, открытие и закрытие
  - [ ] кнопка «наверх» появляется при скролле и работает
  - [ ] хедер: состояние `.scrolled` при прокрутке, анимация появления при загрузке
  - [ ] ховер карточек услуг (`/services.html`)
  - [ ] активный пункт меню на всех корневых страницах
- [ ] **I6. Итоговые метрики в журнал:** число строк HTML до/после
  (`git ls-files '*.html' | xargs wc -l`), число файлов, размер `_site`.
- [ ] **I7. Зафиксировать** — `git commit -m "plan(I): acceptance checks passed"`

---

### Фаза J — вывод в прод и домен

🔒 **Вся фаза выполняется только с подтверждением владельца.** Здесь затрагивается живой сайт.

- [ ] **J1. 🔒 Выяснить, где сейчас живёт tidgroup.es**
  ```bash
  nslookup tidgroup.es
  nslookup www.tidgroup.es
  curl -sI https://tidgroup.es | head -5
  ```
  Записать в журнал текущие A/AAAA/CNAME записи и определить хостинг. Пока это не сделано,
  DNS не менять: возможно, домен обслуживает другой сервер, и переключение уронит рабочий сайт.
  Заранее снизить TTL записей (например до 300 с) — за сутки до переключения.

- [ ] **J2. Слить ветку в `main`**
  ```bash
  git checkout main && git merge --no-ff migration/jekyll-shell
  git push origin main
  ```
  **Проверка:** сборка Pages завершилась успешно:
  ```bash
  gh api repos/nestaleks/tidgroup-new/pages/builds/latest --jq '{status, error: .error.message}'
  ```
  **Ожидаемо и не является багом:** на `https://nestaleks.github.io/tidgroup-new/` пути будут
  битыми — `baseurl` пустой, потому что цель — корень домена (решение Р2/Р7). Проверять
  результат нужно локально и затем на самом домене.

- [ ] **J3. 🔒 Привязать домен в настройках Pages**
  ```bash
  gh api -X PUT repos/nestaleks/tidgroup-new/pages -f cname=tidgroup.es
  gh api repos/nestaleks/tidgroup-new/pages --jq '{cname, status, https_enforced}'
  ```
  Файл `CNAME` в репозитории уже содержит `tidgroup.es` и должен совпадать со настройкой.
  **Проверка:** `cname` = `tidgroup.es`.

- [ ] **J4. 🔒 DNS у регистратора** (делает владелец)
  Апекс `tidgroup.es` — четыре A-записи: `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`; при поддержке IPv6 — AAAA: `2606:50c0:8000::153`,
  `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.
  `www` — CNAME на `nestaleks.github.io`.
  Актуальные адреса перед применением сверить с документацией GitHub Pages.
  **Проверка:** `nslookup tidgroup.es` отдаёт адреса GitHub.

- [ ] **J5. Дождаться сертификата и включить HTTPS**
  ```bash
  gh api repos/nestaleks/tidgroup-new/pages --jq '{status, https_enforced, protected_domain_state}'
  gh api -X PUT repos/nestaleks/tidgroup-new/pages -F https_enforced=true
  ```
  **Проверка:** `https://tidgroup.es` открывается с валидным сертификатом.

- [ ] **J6. Приёмка на проде**
  ```bash
  node tools/snapshot.mjs https://tidgroup.es snapshots/prod
  node tools/compare.mjs snapshots/after snapshots/prod
  ```
  **Проверка:** битых картинок 0, ошибок консоли 0, расхождений с локальной сборкой нет;
  выборочно открыть 5 страниц руками, включая одну вложенную.

- [ ] **J7. 🔒 Старый хостинг не выключать 7 дней** (страховка на случай откат).
  Записать в журнал дату, после которой можно отключать.

---

### Фаза K — необязательные хвосты (после стабилизации прода)

Можно выполнять по отдельности и в любом порядке.

- [ ] **K1. `sitemap.xml` и `robots.txt`** — плагин `jekyll-sitemap` поддерживается GitHub Pages.
- [ ] **K2. Страница `404.html`** с общим шаблоном.
- [ ] **K3. Перевести Pages на сборку через Actions** (`build_type: workflow`) — контроль версии
      Jekyll и возможность прогонять проверки в CI до деплоя.
- [ ] **K4. Прогнать снимки в CI** — `tools/snapshot.mjs` на каждый PR.
- [ ] **K5. Оптимизация изображений** — 253 файла, 35 МБ: пережать, добавить `loading="lazy"`,
      рассмотреть WebP. Отдельная задача, к шаблонам не относится.
- [ ] **K6. Контент страниц `gallery/*`** — заменить заглушки «Project or Place Name».
- [ ] **K7. Проверить необходимость Poppins и Jost** — остались в фолбэках `base.css` и трёх
      правилах `project.css`; если не нужны, убрать из запроса шрифтов.

---

## §5. Откат

| Ситуация | Действие |
|---|---|
| Сломалось на любой фазе A–I | Работа идёт в ветке, `main` не тронут: `git checkout main`. Прод не затронут вообще. |
| Нужно откатить одну задачу | `git revert <sha>` этой задачи. |
| Сломалось после слияния (J2) | `git revert -m 1 <sha-merge-коммита>` и push — Pages пересоберёт предыдущее состояние. Крайний вариант: `git reset --hard ee9d37b` + `git push --force-with-lease` (только с подтверждением владельца). |
| Сломался домен (J3–J5) | Вернуть DNS-записи на прежний хостинг (записаны в журнале на J1) и снять custom domain: `gh api -X PUT repos/nestaleks/tidgroup-new/pages -f cname=`. Старый хостинг ещё жив по J7. |
| Pages не собирается | `gh api repos/nestaleks/tidgroup-new/pages/builds/latest --jq '.error.message'` — там текст ошибки Jekyll. |

Опорные точки истории: `1c88d7f` — начальный коммит GitHub, `ee9d37b` — импорт сайта
до миграции.

---

## §6. Журнал выполнения

Агент **дописывает** строку после каждой задачи. Не переписывать и не сокращать старые строки.

| Дата | Задачи | Коммит | Статус | Заметки |
|---|---|---|---|---|
| 2026-09-04 | — | `ee9d37b` | — | План создан. Работа не начата. |

---

## §7. Приложение А — инвентарь страниц

| Страница | Строк | Внутри `<main>` | Скрипты сейчас | Скрипты после |
|---|---:|---:|---|---|
| `index.html` | 394 | 276 | GSAP + animations | `home` |
| `about.html` | 155 | 44 | jQuery + magnific | — |
| `contacts.html` | 156 | 46 | — | — |
| `services.html` | 186 | 76 | — | — |
| `investments.html` | 148 | 38 | — | — |
| `gallery.html` | 151 | 40 | jQuery + magnific | `gallery` |
| `news.html` | 144 | 33 | jQuery + magnific | — |
| `gallery/gallery_01…06.html` | 165 ×6 | 55 ×6 | jQuery + magnific | — |
| `news/news-01.html` | 128 | 18 | jQuery + magnific | — |
| `news/news-02.html` | 130 | 20 | jQuery + magnific | — |
| `news/news-03.html` | 134 | 24 | jQuery + magnific | — |
| `projects/boho-corner.html` | 758 | 645 | jQuery + magnific | `gallery` |
| `projects/can-marques.html` | 832 | 719 | jQuery + magnific | `gallery` |
| `projects/foners-club.html` | 470 | 357 | jQuery + magnific | `gallery` |
| `projects/marina-residence.html` | 829 | 716 | jQuery + magnific | `gallery` |
| `projects/solivar.html` | 713 | 600 | jQuery + magnific | `gallery` |

## §8. Приложение Б — ожидаемый результат

| Операция | Сейчас | После |
|---|---|---|
| Изменить пункт меню | 42 места в 21 файле | 1 файл (`_data/nav.yml`) |
| Изменить телефон в футере | 21 файл | 1 файл (`_data/contacts.yml`) |
| Добавить тег в `<head>` | 21 файл | 1 файл (`_includes/head.html`) |
| Добавить страницу | скопировать 111 строк обвязки | front matter + контент |
| Объём HTML | 6318 строк | ≈4100 строк |
| jQuery + magnific (107 КБ) | грузится на 17 страницах | на 6 (где реально нужен) |
| Запросов к Google Fonts | 4 | 1 |
