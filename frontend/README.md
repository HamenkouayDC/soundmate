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
* запущенный backend SoundMate

Backend по умолчанию работает по адресу:

```text
http://localhost:8000
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

Внутри `.env.local` должна быть переменная:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

Файл `.env.local` не нужно добавлять в Git, потому что он используется только локально.

Файл `.env.example` хранится в Git и нужен как пример для команды.

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

Backend запускается в отдельном терминале:

```powershell
cd C:\Users\MSI\Desktop\soundmate\backend
.\.venv\Scripts\python.exe manage.py runserver
```

Swagger доступен по адресу:

```text
http://localhost:8000/api/docs/
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

Редактирование профиля теперь подключено к backend endpoint:

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

После обновления страницы сохранённые данные остаются, потому что они уже хранятся на backend.

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
* обновить страницу и увидеть сохранённое состояние.

Сейчас это backend stub без настоящего OAuth.

То есть подключение сохраняется через backend, но реальная авторизация Spotify, Last.fm, SoundCloud или Yandex Music будет добавлена позже.

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
12. Обновить страницу и проверить, что Spotify остался подключённым.
13. Отключить Spotify.
14. Перейти в /feed.
15. Поставить лайк или перейти к следующей анкете.
16. Открыть /matches.
17. Открыть чат с одним из пользователей.
18. Написать mock-сообщение.
19. Открыть несуществующий адрес и проверить 404.
20. Выйти из аккаунта и проверить ProtectedRoute.
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
