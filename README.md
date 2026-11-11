# Wire DLC — Веб-платформа клиента для Minecraft 1.21.11 (Fabric)

Минималистичный, современный сайт и личный кабинет для клиента **Wire DLC** на базе **Next.js (App Router)**, **Tailwind CSS v4**, **Framer Motion** и **SQLite (`node:sqlite`)** с архитектурным слоем для подключения **Supabase (PostgreSQL)**.

## Реализованный функционал

- **Публичный лендинг (`/`)**:
  - Hero с 3D-логотипом заказчика (`public/brand/wire-logo.png`), кнопками **«Скачать бесплатно»** и **«Купить»**.
  - Секция преимуществ (аккуратные обходы античитов, нативная база `1.21.11 Fabric`, ClickGUI, HWID-защита).
  - Интерактивный прототип **ClickGUI** прямо в браузере (переключение категорий `Combat / Movement / Visuals / Misc`, поиск, тогглы и слайдеры) + слоты под игровые скриншоты.
  - Блок тарифов и способов оплаты + FAQ-аккордеон.
- **Страница тарифов (`/pricing`)**:
  - **30 дней (Month)** — `150 ₽`
  - **90 дней (3 Months)** — `200 🍊` (с пометкой про мандарины и полем уточнения при заказе)
  - **Навсегда (Lifetime)** — `500 ₽` (выделенная карточка)
  - **Дополнительно**: версия `1.21.11 fabric`, **Сброс HWID — 170 ₽**
  - **Способы оплаты**: СБП, Карты РФ, Криптовалюта (USDT, TON, LTC), UA карты через поддержку.
- **Аутентификация (`/login`, `/register`, `/api/auth/*`)**:
  - Вход и регистрация через Email/никнейм + пароль (`bcryptjs` + HTTP-only JWT-сессия `jose`).
  - Задел под Discord OAuth2 (`/api/auth/discord`) через переменные окружения.
  - Скрытая регистрация администратора по инвайт-коду (`/register?invite=...` или поле «Инвайт»).
- **Личный кабинет (`/dashboard`)**:
  - Защищён в `src/middleware.ts` и на сервере.
  - Отображение статуса подписки (`free`, `month`, `quarter`, `lifetime`).
  - Скачивание бесплатной заглушки (`/api/download/free` отдаёт валидный `.jar` с `fabric.mod.json`) и полной сборки для подписчиков.
  - Раздел HWID: копирование ключа, создание заявки на платный сброс (170 ₽) и кнопка демо-сброса HWID для тестирования MVP.
  - История заказов.
- **Админ-панель (`/admin`, только для `MrDarko` / `role = 'admin'`)**:
  - Список пользователей, поиск, выдача/отзыв подписки, смена роли, сброс HWID.
  - Таблица заказов с фильтрацией и подтверждением оплаты (автоматически активирует подписку или сбрасывает HWID).
  - Редактор контента главной страницы (`site_settings`).

## Быстрый старт

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте `http://localhost:3000`.

## Тестовые учётные данные (локальный SQLite seed)

При первом запуске создаётся база `data/wiredlc.db` и тестовые пользователи:

- **Администратор**: логин `MrDarko` (или `mrdarko@wiredlc.dev`), пароль `MrDarkoAdmin!2026` (переопределяется через `ADMIN_SEED_PASSWORD`).
- **Обычный пользователь (Month)**: `kairo@example.com` / `PlayerPass!2026`
- **Бесплатный аккаунт (Free)**: `frost@example.com` / `PlayerPass!2026`

## Переход на Supabase и деплой на Vercel (Продакшен)

На Vercel без переменных Supabase проект запускается в безопасном serverless-режиме (`/tmp` / in-memory fallback, без ошибок read-only ФС), но для постоянного хранения пользователей и заказов подключите **Supabase**:

1. Создайте проект в Supabase и выполните SQL-миграцию из `supabase/schema.sql` в SQL Editor.
2. В настройках проекта Vercel (Environment Variables) добавьте:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET` (случайная строка ≥ 32 символов)
   - `ADMIN_SEED_PASSWORD` (пароль для первичного сидинга `MrDarko`)
3. `SupabaseAdapter` (`src/lib/db/supabase.ts`) активируется **автоматически** при наличии ключей Supabase (или при `DB_PROVIDER="supabase"`).
4. При необходимости настройте `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`.
