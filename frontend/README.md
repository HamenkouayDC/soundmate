# SoundMate Frontend

Frontend-часть проекта SoundMate — приложения для знакомств на основе музыкальных вкусов.

## Стек

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

## Требования

Перед запуском нужно установить:

* Node.js LTS
* npm
* backend SoundMate

Frontend может работать с backend в двух режимах:

```text
local API — http://localhost:8000/api/v1
prod API — https://team17.st.ifbest.org/api/v1
```

Frontend по умолчанию запускается по адресу:

```text
http://localhost:5173
```

## Настройка окружения

В папке `frontend` нужно создать файл `.env.local`.

Можно скопировать пример:

```powershell
copy .env.example .env.local
```

Для локальной разработки в `.env.local` должно быть:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Для demo/prod API можно временно поставить:

```env
VITE_API_URL=https://team17.st.ifbest.org/api/v1
```

Важно: после изменения `VITE_API_URL` нужно перезапустить frontend.

Файл `.env.local` не нужно добавлять в Git, потому что он используется только локально.

## Примеры env-файлов

В проекте используются примеры env-файлов:

```text
frontend/.env.example — пример для локального backend
frontend/.env.production.example — пример для prod/demo backend
```

Содержимое `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Содержимое `frontend/.env.production.example`:

```env
VITE_API_URL=https://team17.st.ifbest.org/api/v1
```

## Режимы API

### Локальная разработка

В локальном режиме frontend обращается к backend, который запущен на компьютере разработчика:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Backend нужно запускать отдельно:

```powershell
cd C:\Users\MSI\Desktop\soundmate\backend
.\.venv\Scripts\python.exe manage.py runserver
```

Swagger локального backend:

```text
http://localhost:8000/api/docs/
```

### Prod / demo

В prod/demo режиме frontend обращается к backend на сервере:

```env
VITE_API_URL=https://team17.st.ifbest.org/api/v1
```

Swagger prod backend:

```text
https://team17.st.ifbest.org/api/docs/
```

После переключения с local API на prod API лучше выйти из аккаунта и зарегистрировать нового пользователя, потому что токены от локального backend не подходят для prod backend.

## Установка зависимостей

Из папки `frontend` выполнить:

```powershell
npm install
```

Обычно `npm install` нужно выполнять:

* при первом запуске проекта;
* после `git pull`, если появились новые зависимости;
* если была удалена папка `node_modules`.

## Запуск backend

Локальный backend запускается в отдельном терминале:

```powershell
cd C:\Users\MSI\Desktop\soundmate\backend
.\.venv\Scripts\python.exe manage.py runserver
```

Если backend был обновлён, перед запуском нужно выполнить:

```powershell
cd C:\Users\MSI\Desktop\soundmate
git pull --rebase origin main
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

## Запуск frontend

Frontend запускается во втором терминале:

```powershell
cd C:\Users\MSI\Desktop\soundmate\frontend
npm run dev
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:5173
```

## Проверка сборки

Перед push желательно проверить production-сборку:

```powershell
cd C:\Users\MSI\Desktop\soundmate\frontend
npm run build
```

Если сборка прошла успешно, в терминале будет сообщение вида:

```text
✓ built in ...
```

## Доступные страницы

```text
/register — регистрация пользователя
/login — вход пользователя
/profile — профиль текущего пользователя
/music — подключение музыкальных сервисов
/feed — mock-лента анкет
/matches — mock-страница матчей
/chat/:matchId — mock-чат с пользователем
/random — пример несуществующего адреса, открывает страницу 404
```

## Авторизация

Frontend работает с backend API:

```text
POST /auth/register/ — регистрация
POST /auth/login/ — вход
POST /auth/refresh/ — обновление access token
GET /users/me/ — получение текущего пользователя
```

На страницах `/login` и `/register` оставлены только email и пароль.

Альтернативные способы входа и регистрации через Google, Telegram и другие сервисы сейчас не используются.

После входа frontend сохраняет `access` и `refresh` токены в `localStorage`.

Закрытые страницы защищены через `ProtectedRoute`:

```text
/profile
/music
/feed
/matches
/chat/:matchId
```

Если пользователь не авторизован и пытается открыть закрытую страницу, его перенаправляет на:

```text
/login
```

Публичные страницы защищены через `PublicRoute`:

```text
/login
/register
```

Если пользователь уже авторизован и пытается открыть `/login` или `/register`, его перенаправляет на:

```text
/feed
```

Корневой маршрут `/` тоже делает редирект:

```text
если пользователь авторизован → /feed
если пользователь не авторизован → /login
```

Если при запросе к backend `access token` устарел, frontend пробует обновить его через `refresh token`.

Если `refresh token` недействителен, токены удаляются, а пользователь отправляется на страницу входа.

## Текущий frontend-flow

Сейчас реализован такой пользовательский путь:

```text
регистрация → вход → профиль → редактирование профиля → музыка → лента → матчи → чат
```

## Профиль

Страница `/profile` получает текущего пользователя через backend endpoint:

```text
GET /users/me/
```

Редактирование профиля подключено к backend endpoint:

```text
PATCH /profiles/me/
```

На странице отображаются:

* имя пользователя;
* email;
* дата регистрации;
* статус подключения к backend;
* музыкальные интересы mock;
* preview карточки профиля.

Пользователь может изменить:

* имя;
* дату рождения;
* описание “О себе”.

После нажатия на кнопку `Сохранить` данные отправляются на backend.

После обновления страницы сохранённые данные остаются, потому что они хранятся на backend.

Поле `Город` пока остаётся mock-полем и не отправляется на backend, потому что его нет в текущем контракте профиля.

## Music Passport

Страница `/music` подключена к backend music connections API.

Используемые endpoints:

```text
GET /music/connections/ — получить список подключённых сервисов
POST /music/connections/ — создать подключение музыкального сервиса
DELETE /music/connections/:id/ — отключить музыкальный сервис
```

Доступные провайдеры:

```text
spotify
lastfm
soundcloud
yandex
```

На странице есть карточки:

* Spotify;
* Last.fm;
* SoundCloud;
* Yandex Music.

Пользователь может:

* посмотреть статус подключений;
* подключить сервис;
* отключить сервис;
* подключить сервис повторно после отключения;
* обновить страницу и увидеть сохранённое состояние.

Сейчас это backend stub без настоящего OAuth.

То есть подключение сохраняется через backend, но реальная авторизация Spotify, Last.fm, SoundCloud или Yandex Music будет добавлена позже.

На frontend исправлено дёргание layout при подключении/отключении сервиса: карточки больше не заменяются на общий loading-блок после каждого действия, а состояние обновляется локально.

## Лента

Страница `/feed` сейчас использует mock-данные.

На странице есть:

* карточки пользователей;
* процент совместимости;
* общие жанры;
* общие исполнители;
* кнопки действия;
* локальное переключение карточек;
* toast-уведомление после лайка или пропуска.

После появления backend endpoint’ов ленту можно будет заменить на реальные данные.

## Матчи

Страница `/matches` сейчас использует mock-данные.

На странице есть:

* список пользователей, с которыми есть совпадение;
* процент совместимости;
* общие жанры и исполнители;
* переход в mock-чат.

Позже эта страница должна получать реальные совпадения после взаимных лайков.

## Чат

Страница `/chat/:matchId` сейчас работает на mock-данных.

В чате есть:

* информация о пользователе;
* процент совместимости;
* общие жанры;
* общие исполнители;
* mock-сообщения;
* поле ввода;
* локальная отправка сообщений.

Сообщения не сохраняются на backend и исчезают после перезагрузки страницы.

## 404

Для несуществующих адресов добавлена страница 404.

Например:

```text
http://localhost:5173/random
```

Покажет страницу:

```text
Страница не найдена
```

## UI-компоненты

В проект добавлены переиспользуемые UI-компоненты:

```text
src/components/ui/Button.tsx — общая кнопка
src/components/ui/Input.tsx — общий input
src/components/ui/Tag.tsx — общий tag/chip
src/components/ui/PageHeader.tsx — общий заголовок страницы
src/components/ui/DecorativeDisc.tsx — декоративный фоновый диск
```

Эти компоненты используются для уменьшения дублирования кода и упрощения дальнейшей работы с дизайном.

## Layout-компоненты

```text
src/components/layout/AppHeader.tsx — общий header приложения
src/components/layout/ProtectedRoute.tsx — защита закрытых маршрутов
src/components/layout/PublicRoute.tsx — редирект авторизованных пользователей с публичных страниц
```

## API-файлы frontend

```text
src/shared/api/apiClient.ts — базовый API-клиент
src/shared/api/authApi.ts — auth-запросы
src/shared/api/userApi.ts — запрос текущего пользователя
src/shared/api/profileApi.ts — получение и обновление профиля
src/shared/api/musicApi.ts — music connections API
src/shared/api/tokenStorage.ts — работа с токенами
```

## Что уже подключено к backend

```text
регистрация
логин
refresh token
получение текущего пользователя
редактирование профиля через PATCH /profiles/me/
получение music connections
создание music connection
отключение music connection
повторное подключение music connection после отключения
```

## Что пока работает на mock-данных

```text
/feed
/matches
/chat/:matchId
музыкальные жанры
любимые исполнители
процент совместимости
preview карточки профиля
город в профиле
```

## Что зависит от будущего backend

```text
поле города в профиле
загрузка фото
реальная лента рекомендаций
лайки и пропуски через API
реальные матчи
реальный чат
сохранение сообщений
OAuth для Spotify / Last.fm / SoundCloud / Yandex Music
импорт треков и артистов
музыкальный анализ и рекомендации
режим "Волна"
```

## Основные файлы frontend

```text
src/App.tsx — маршруты приложения
src/main.tsx — точка входа React
src/index.css — базовые стили

src/pages/RegisterPage.tsx — регистрация
src/pages/LoginPage.tsx — вход
src/pages/ProfilePage.tsx — профиль
src/pages/MusicPage.tsx — подключение музыкальных сервисов
src/pages/FeedPage.tsx — лента
src/pages/MatchesPage.tsx — матчи
src/pages/ChatPage.tsx — чат
src/pages/NotFoundPage.tsx — 404

src/components/layout/AppHeader.tsx — общий header
src/components/layout/ProtectedRoute.tsx — защита закрытых маршрутов
src/components/layout/PublicRoute.tsx — редирект авторизованных пользователей

src/components/ui/Button.tsx — кнопка
src/components/ui/Input.tsx — поле ввода
src/components/ui/Tag.tsx — тег
src/components/ui/PageHeader.tsx — заголовок страницы
src/components/ui/DecorativeDisc.tsx — декоративный диск

src/shared/api/apiClient.ts — базовый API-клиент
src/shared/api/authApi.ts — auth-запросы
src/shared/api/userApi.ts — запрос текущего пользователя
src/shared/api/profileApi.ts — профиль
src/shared/api/musicApi.ts — музыкальные подключения
src/shared/api/tokenStorage.ts — токены
```

## Демо-сценарий

Для проверки frontend можно пройти такой сценарий:

```text
1. Запустить backend.
2. Запустить frontend.
3. Открыть /register и создать пользователя.
4. Войти через /login.
5. Открыть /profile.
6. Нажать "Редактировать профиль".
7. Изменить имя, дату рождения и описание.
8. Нажать "Сохранить".
9. Обновить страницу и проверить, что данные сохранились.
10. Перейти в /music.
11. Подключить Spotify.
12. Отключить Spotify.
13. Подключить Spotify снова.
14. Обновить страницу и проверить, что Spotify остался подключённым.
15. Перейти в /feed.
16. Поставить лайк или перейти к следующей анкете.
17. Открыть /matches.
18. Открыть чат с одним из пользователей.
19. Написать mock-сообщение.
20. Открыть несуществующий адрес и проверить 404.
21. Выйти из аккаунта и проверить ProtectedRoute.
```

## Быстрый запуск для демонстрации

Backend:

```powershell
cd C:\Users\MSI\Desktop\soundmate\backend
.\.venv\Scripts\python.exe manage.py runserver
```

Frontend:

```powershell
cd C:\Users\MSI\Desktop\soundmate\frontend
npm run dev
```

## Быстрая проверка Git перед push

Перед финальным push можно выполнить:

```powershell
cd C:\Users\MSI\Desktop\soundmate
git status
```

Если изменения готовы:

```powershell
git add frontend
git commit -m "fix: improve frontend week 2 demo flow"
git pull --rebase origin main
git push origin main
```
