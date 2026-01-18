# Интеллектуальные Территории

> Рабочие варианты названия: «Квиз-Империя», «Захват знаний», «Мозговая карта»

---

## 1. Общая информация

| Параметр | Значение |
|----------|----------|
| Жанр | Стратегическая интеллектуальная игра |
| Количество игроков | 2–4 |
| Продолжительность партии | 20–40 минут |
| Тип вопросов | Генерируются ИИ (разной сложности) |
| Цель игры | Захватить все территории ИЛИ остаться единственным игроком с территориями |

---

## 2. Игровое поле

### 2.1 Поле

- Игровое поле — гексагональная сетка, количество территорий зависит от числа игроков:
  - 2 игрока: 7 территорий (радиус 1)
  - 3 игрока: 10 территорий (радиус 2, 9 ячеек исключено для треугольной формы)
  - 4 игрока: 17 территорий (радиус 2, 2 ячейки исключено)
- Каждая территория соединена минимум с 1 и максимум с 6 соседними
- Поле фиксированное и симметричное

### 2.2 Старт

- Каждый игрок в начале получает 1 стартовую территорию
- Стартовые территории:
  - Заданны точками

---

## 3. Подготовка к игре

### 3.1 Начальные параметры

Каждый игрок:
- Получает 1 территорию
- Имеет 0 очков

### 3.2 Количество вопросов

Минимальный пул: 50–70 вопросов на игру

---

## 4. Ход игры

Ходы идут по очереди по часовой стрелке.

В свой ход игрок может:
1. Попытаться захватить одну соседнюю территорию
2. ИЛИ объявить поединок за спорную территорию

---

## 5. Захват свободной территории

### Условия

Территория:
- Свободна
- Граничит с территорией игрока
- На неё претендует только один игрок

### Процесс

- Ответ на 1 вопрос из пула
- Время на ответ: задано в параметрах игры
- Формат: один правильный ответ (выбор из 4 вариантов)

### Результат

- ✅ Правильно → территория переходит игроку
- ❌ Неправильно → территория остаётся свободной до следующего хода

---

## 6. Спорная территория (поединок)

> Если двое или более игроков могут захватить одну и ту же свободную территорию.

### Захват территории другого игрока

**Формат:**
- вопрос обоим игрокам
- Побеждает игрок, который ответил правильно или, если оба ответили правильно, то тот кто ответил быстрее

## 9. Победа

Победа наступает, если:
- Игрок контролирует все территории
- Все остальные игроки потеряли свои территории
- По таймеру: выигрывает игрок с наибольшим числом территорий
- Остальные игроки вышли из игры

---

# API Specification

## Общий формат ответа

```json
{
  "status": "boolean",
  "code": "number",
  "data": {}
}
```

---

## Авторизация

### POST `auth/register`

> Регистрация нового пользователя

**Body:**
```json
{
  "email": "string",
  "name": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "data": {
    "user_id": "string",
    "email": "string",
    "name": "string",
    "access_token": "string"
  }
}
```

**Cookie (httpOnly, secure):**
```
refresh_token=string; Path=/; HttpOnly; Secure; SameSite=Strict
```

---

### POST `auth/login`

> Вход в систему

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** (аналогично register)

---

### POST `auth/refresh`

> Обновление access_token. Refresh token передаётся автоматически через cookie.

**Response:**
```json
{
  "data": {
    "access_token": "string"
  }
}
```

**Ошибки:**
- `401` — refresh_token истёк или невалиден

---

### POST `auth/logout`

> Выход из системы. Инвалидирует refresh_token.

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

---

## Пользователь

### GET `user/init`

> Инициализация при загрузке приложения. Возвращает данные пользователя и активную сессию.

**Response:**
```json
{
  "data": {
    "user_id": "string",
    "email": "string",
    "name": "string",
    "active_room_id": "string?",
    "active_game_id": "string?"
  }
}
```

> Если есть `active_game_id` — пользователь в активной игре, редирект на `/game/{id}`
> Если есть `active_room_id` — пользователь в комнате ожидания

---

### GET `user/profile`

> Профиль текущего пользователя

**Response:**
```json
{
  "data": {
    "user": {
      "user_id": "string",
      "email": "string",
      "name": "string"
    },
    "stats": {
      "games_played": "number",
      "games_won": "number",
      "win_rate": "number",
      "total_territories_captured": "number"
    },
    "friends": [
      {
        "user_id": "string",
        "name": "string"
      }
    ],
    "pending_friend_requests": [
      {
        "user_id": "string",
        "name": "string"
      }
    ]
  }
}
```

---

### GET `user/profile/:user_id`

> Профиль другого пользователя

**Response:**
```json
{
  "data": {
    "user_id": "string",
    "name": "string",
    "is_friend": "boolean",
    "friend_request_sent": "boolean",
    "friend_request_received": "boolean"
  }
}
```

---

### PUT `user/profile`

> Обновление профиля

**Body:**
```json
{
  "name": "string?"
}
```

**Response:**
```json
{
  "data": {
    "user_id": "string",
    "name": "string"
  }
}
```

---

### GET `user/search`

> Поиск пользователей

**Query params:**
- `q` — строка поиска (минимум 2 символа)

**Response:**
```json
{
  "data": {
    "users": [
      {
        "user_id": "string",
        "name": "string",
        "is_friend": "boolean"
      }
    ]
  }
}
```

---

### POST `user/friends/request`

> Отправка заявки в друзья

**Body:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "data": {
    "request_id": "string",
    "status": "pending"
  }
}
```

---

### POST `user/friends/accept`

> Принятие заявки в друзья

**Body:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

---

### POST `user/friends/reject`

> Отклонение заявки в друзья

**Body:**
```json
{
  "user_id": "string"
}
```

---

### DELETE `user/friends/:user_id`

> Удаление из друзей

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

---

## Темы игр

### GET `themes/popular`

> Популярные темы с пагинацией

**Query params:**
- `page` — номер страницы (по умолчанию 1)
- `size` — количество элементов на странице (по умолчанию 10, максимум 50)

**Response:**
```json
{
  "data": {
    "themes": [
      {
        "theme_id": "string",
        "name": "string",
        "description": "string?",
        "difficulty": "easy | medium | hard",
        "players_count": "number",
        "likes": "number",
        "dislikes": "number",
        "times_played": "number"
      }
    ],
    "pagination": {
      "page": "number",
      "size": "number",
      "total_pages": "number",
      "total_items": "number"
    }
  }
}
```

---

### GET `themes/search`

> Поиск тем

**Query params:**
- `q` — строка поиска
- `difficulty` — фильтр по сложности
- `page` — номер страницы (по умолчанию 1)
- `size` — количество элементов на странице (по умолчанию 10, максимум 50)

**Response:**
```json
{
  "data": {
    "themes": [
      {
        "theme_id": "string",
        "name": "string",
        "description": "string?",
        "difficulty": "easy | medium | hard",
        "players_count": "number",
        "likes": "number",
        "dislikes": "number",
        "times_played": "number"
      }
    ],
    "pagination": {
      "page": "number",
      "size": "number",
      "total_pages": "number",
      "total_items": "number"
    }
  }
}
```

---


### POST `themes/:theme_id/rate`

> Оценка темы после игры

**Body:**
```json
{
  "rating": "like | dislike",
  "difficulty_rating": "easy | medium | hard"
}
```

---

# WebSocket API

> Используется Socket.IO для real-time коммуникации

## Подключение

```javascript
const socket = io('wss://server', {
  auth: {
    token: 'access_token'
  }
})
```

При подключении:
1. Клиент передаёт `access_token` в параметре `auth`
2. Сервер валидирует токен и связывает сокет с пользователем
3. Сервер автоматически подписывает на персональные события (`notification`, `friend:*`)
4. Если у пользователя есть активная игра/комната — автоматически подключает к ней

**События при подключении:**
- `connect` — успешное подключение
- `connect_error` — ошибка (невалидный токен, сервер недоступен)
- `disconnect` — отключение

---

## Комнаты (Lobby)

### Клиент → Сервер

#### `room:create`

> Создание новой комнаты

```json
{
  "theme_id": "string?",
  "theme_name": "string",
  "players_count": 2,
  "time_per_question": 20,
  "is_private": false
}
```

**Ответ:** `room:created` создателю, `rooms:list` всем в лобби

---

#### `room:join`

> Присоединение к комнате

```json
{
  "room_id": "string"
}
```

**Ответ:** `room:state` всем в комнате, `rooms:list` всем в лобби

---

#### `room:leave`

> Выход из комнаты

```json
{}
```

> `room_id` не нужен — сервер знает в какой комнате пользователь

**Ответ:** `room:player_left` оставшимся, `rooms:list` всем в лобби

---

#### `room:kick`

> Исключение игрока из комнаты (только владелец)

```json
{
  "user_id": "string"
}
```

---

#### `room:start`

> Запуск игры (только владелец, когда комната заполнена)

```json
{}
```

**Ответ:** `game:started` всем в комнате

---

#### `rooms:subscribe`

> Подписка на обновления списка комнат (при входе в лобби)

```json
{}
```

**Ответ:** `rooms:list`

---

#### `rooms:unsubscribe`

> Отписка от обновлений списка комнат (при выходе из лобби)

```json
{}
```

---

### Сервер → Клиент

#### `room:created`

> Подтверждение создания комнаты (создателю)

```json
{
  "room_id": "string",
  "invite_code": "string"
}
```

---

#### `room:state`

> Полное состояние комнаты

```json
{
  "room_id": "string",
  "status": "waiting | ready",
  "owner_id": "string",
  "theme_id": "string?",
  "theme_name": "string",
  "players_count": "number",
  "time_per_question": "number",
  "is_private": "boolean",
  "invite_code": "string",
  "players": [
    {
      "user_id": "string",
      "name": "string",
            "color": "string",
      "is_ready": "boolean"
    }
  ]
}
```

**Статусы:**
- `waiting` — ожидание игроков
- `ready` — все игроки на месте, владелец может начать

---

#### `room:player_joined`

> Игрок присоединился

```json
{
  "user_id": "string",
  "name": "string",
    "color": "string"
}
```

---

#### `room:player_left`

> Игрок покинул комнату

```json
{
  "user_id": "string",
  "reason": "left | kicked | disconnected",
  "new_owner_id": "string?"
}
```

> `new_owner_id` — если владелец вышел, права передаются другому игроку

---

#### `room:kicked`

> Вас исключили из комнаты (персональное)

```json
{
  "room_id": "string"
}
```

---

#### `rooms:list`

> Список публичных комнат в лобби

```json
{
  "rooms": [
    {
      "room_id": "string",
      "theme_name": "string",
      "owner_name": "string",
      "players_count": "number",
      "current_players": "number",
      "players": [
        {
          "user_id": "string",
          "name": "string"
        }
      ]
    }
  ]
}
```

---

## Игровой процесс

### Клиент → Сервер

#### `game:select_cell`

> Выбор ячейки для захвата (в свой ход)

```json
{
  "cell_id": "number"
}
```

**Ответ:** `game:question` участникам битвы

---

#### `game:answer`

> Ответ на вопрос

```json
{
  "answer_index": "number"
}
```

**Ответ:** после ответа всех/таймаута — `game:answer_result`, затем `game:state`

---

#### `game:forfeit`

> Сдаться

```json
{}
```

**Ответ:** `game:player_forfeited` всем, возможно `game:ended`

---

#### `game:reconnect`

> Переподключение к активной игре

```json
{
  "game_id": "string"
}
```

**Ответ:** `game:state` с полным состоянием

---

### Сервер → Клиент

#### `game:started`

> Игра началась

```json
{
  "game_id": "string",
  "theme_name": "string",
  "time_per_question": "number",
  "cells": [
    {
      "id": "number",
      "q": "number",
      "r": "number",
      "owner": "number | null",
      "is_start": "boolean"
    }
  ],
  "players": [
    {
      "id": "number",
      "user_id": "string",
      "name": "string",
            "color": "string",
      "territories": "number"
    }
  ],
  "current_turn": "number",
  "turn_deadline": "number"
}
```

---

#### `game:state`

> Обновление состояния игры

```json
{
  "cells": [
    {
      "id": "number",
      "owner": "number | null"
    }
  ],
  "players": [
    {
      "id": "number",
      "territories": "number",
      "is_eliminated": "boolean"
    }
  ],
  "current_turn": "number",
  "turn_deadline": "number"
}
```

---

#### `game:turn`

> Начало хода (персональное для текущего игрока)

```json
{
  "available_cells": ["number"],
  "turn_deadline": "number"
}
```

---

#### `game:cell_selected`

> Игрок выбрал ячейку (всем)

```json
{
  "user_id": "string",
  "cell_id": "number",
  "is_contested": "boolean",
  "contestants": ["string"]
}
```

---

#### `game:question`

> Вопрос для битвы за ячейку

```json
{
  "cell_id": "number",
  "question": "string",
  "answers": ["string", "string", "string", "string"],
  "time_limit": "number",
  "deadline": "number",
  "participants": [
    {
      "user_id": "string",
      "name": "string"
    }
  ]
}
```

---

#### `game:player_answered`

> Игрок ответил (без раскрытия ответа)

```json
{
  "user_id": "string"
}
```

---

#### `game:answer_result`

> Результат раунда

```json
{
  "cell_id": "number",
  "correct_answer": "number",
  "cell_owner": "number | null",
  "results": [
    {
      "user_id": "string",
      "answer_index": "number | null",
      "time_ms": "number",
      "is_correct": "boolean"
    }
  ]
}
```

---

#### `game:player_forfeited`

> Игрок сдался

```json
{
  "user_id": "string",
  "player_id": "number"
}
```

---

#### `game:player_disconnected`

> Игрок отключился

```json
{
  "user_id": "string",
  "player_id": "number",
  "reconnect_deadline": "number"
}
```

---

#### `game:player_reconnected`

> Игрок переподключился

```json
{
  "user_id": "string",
  "player_id": "number"
}
```

---

#### `game:ended`

> Игра завершена

```json
{
  "winner_id": "string?",
  "reason": "conquest | elimination | timeout | forfeit | disconnect",
  "final_scores": [
    {
      "user_id": "string",
      "name": "string",
      "place": "number",
      "territories": "number",
      "questions_answered": "number",
      "correct_answers": "number"
    }
  ],
  "theme_id": "string?"
}
```

> `theme_id` передаётся для возможности оценить тему

---

## Чат (привязан к игре)

> Каждая игра имеет свой чат. Чат доступен с момента создания комнаты и до конца игры.

### Клиент → Сервер

#### `chat:send`

> Отправка сообщения

```json
{
  "message": "string"
}
```

> Сервер автоматически определяет чат по текущей комнате/игре пользователя

---

#### `chat:history`

> Запрос истории сообщений

```json
{
  "before_id": "string?",
  "limit": 50
}
```

**Ответ:** `chat:history`

---

### Сервер → Клиент

#### `chat:message`

> Новое сообщение

```json
{
  "message_id": "string",
  "user_id": "string",
  "user_name": "string",
    "message": "string",
  "timestamp": "number",
  "type": "user | system"
}
```

**Типы сообщений:**
- `user` — обычное сообщение от пользователя
- `system` — системное (игрок присоединился, игра началась и т.д.)

---

#### `chat:history`

> История сообщений

```json
{
  "messages": [
    {
      "message_id": "string",
      "user_id": "string?",
      "user_name": "string",
      "message": "string",
      "timestamp": "number",
      "type": "user | system"
    }
  ],
  "has_more": "boolean"
}
```

---

## Друзья и приглашения

### Клиент → Сервер

#### `friend:invite_to_room`

> Пригласить друга в комнату

```json
{
  "user_id": "string"
}
```

---

#### `friend:accept_invite`

> Принять приглашение в комнату

```json
{
  "room_id": "string"
}
```

**Ответ:** автоматический `room:join`

---

#### `friend:reject_invite`

> Отклонить приглашение

```json
{
  "room_id": "string"
}
```

---

### Сервер → Клиент

#### `notification`

> Уведомление

```json
{
  "id": "string",
  "type": "game_invite | friend_request | friend_accepted | game_started",
  "data": {
    "from_user_id": "string",
    "from_user_name": "string",
    "room_id": "string?",
    "room_name": "string?",
    "game_id": "string?"
  },
  "timestamp": "number"
}
```

**Типы:**
- `game_invite` — приглашение в комнату
- `friend_request` — заявка в друзья
- `friend_accepted` — заявка принята
- `game_started` — игра с участием друга началась (для наблюдения)

---

#### `friend:online`

> Друг появился онлайн

```json
{
  "user_id": "string"
}
```

---

#### `friend:offline`

> Друг ушёл оффлайн

```json
{
  "user_id": "string"
}
```

---

## Ошибки

#### `error`

> Ошибка при выполнении действия

```json
{
  "code": "string",
  "message": "string",
  "details": {}
}
```

**Коды ошибок:**
- `unauthorized` — не авторизован / токен истёк
- `room_not_found` — комната не найдена
- `room_full` — комната заполнена
- `room_already_started` — игра уже началась
- `not_room_owner` — только владелец может выполнить действие
- `not_in_room` — вы не в комнате
- `game_not_found` — игра не найдена
- `not_your_turn` — не ваш ход
- `invalid_cell` — недопустимая ячейка (не соседняя / уже занята)
- `already_answered` — вы уже ответили
- `question_timeout` — время на ответ истекло
- `user_not_found` — пользователь не найден
- `already_friends` — уже в друзьях
- `rate_limit` — слишком много запросов

---

# База данных

## Общие принципы

- Чаты игр не сохраняются в БД (только в памяти во время игры)
- Темы изначально создаются как временные; при получении первого лайка переносятся в постоянное хранилище
- Все временные метки хранятся в формате Unix timestamp (миллисекунды)
- UUID используется для всех идентификаторов

---

## Схема таблиц

### `users`

> Основная таблица пользователей

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `email` | VARCHAR(255) | Email (уникальный) |
| `name` | VARCHAR(100) | Отображаемое имя |
| `password_hash` | VARCHAR(255) | Хэш пароля (bcrypt) |
| `created_at` | BIGINT | Дата регистрации |
| `updated_at` | BIGINT | Дата последнего обновления |

**Индексы:**
- `UNIQUE(email)`
- `INDEX(name)` — для поиска пользователей

---

### `refresh_tokens`

> Refresh-токены для авторизации

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `user_id` | UUID | FK → users.id |
| `token_hash` | VARCHAR(255) | Хэш токена |
| `expires_at` | BIGINT | Время истечения |
| `created_at` | BIGINT | Дата создания |

**Индексы:**
- `INDEX(user_id)`
- `INDEX(token_hash)`
- `INDEX(expires_at)` — для очистки истекших токенов

---

### `user_stats`

> Статистика игроков

| Поле | Тип | Описание |
|------|-----|----------|
| `user_id` | UUID | PK, FK → users.id |
| `games_played` | INT | Количество сыгранных игр |
| `games_won` | INT | Количество побед |
| `total_territories_captured` | INT | Всего захвачено территорий |
| `total_questions_answered` | INT | Всего отвечено вопросов |
| `total_correct_answers` | INT | Всего правильных ответов |

**Вычисляемые поля (не хранятся):**
- `win_rate` = games_won / games_played

---

### `friendships`

> Связи дружбы между пользователями (двусторонние)

| Поле | Тип | Описание |
|------|-----|----------|
| `user_id` | UUID | FK → users.id |
| `friend_id` | UUID | FK → users.id |
| `created_at` | BIGINT | Дата добавления |

**Индексы:**
- `PRIMARY KEY(user_id, friend_id)`
- `INDEX(friend_id, user_id)` — для обратного поиска

> При добавлении в друзья создаются две записи: (A, B) и (B, A)

---

### `friend_requests`

> Заявки в друзья

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `from_user_id` | UUID | FK → users.id (отправитель) |
| `to_user_id` | UUID | FK → users.id (получатель) |
| `status` | ENUM | `pending`, `accepted`, `rejected` |
| `created_at` | BIGINT | Дата отправки |
| `updated_at` | BIGINT | Дата обновления статуса |

**Индексы:**
- `INDEX(to_user_id, status)` — для списка входящих заявок
- `INDEX(from_user_id, to_user_id)` — для проверки существующей заявки

---

### `themes`

> Постоянные (популярные) темы игр

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | VARCHAR(255) | Название темы |
| `description` | TEXT | Описание (опционально) |
| `difficulty` | ENUM | `easy`, `medium`, `hard` |
| `players_count` | INT | Количество игроков (2-4) |
| `likes` | INT | Количество лайков |
| `dislikes` | INT | Количество дизлайков |
| `times_played` | INT | Сколько раз играли |
| `created_at` | BIGINT | Дата создания |
| `promoted_at` | BIGINT | Дата переноса из временных |

**Индексы:**
- `INDEX(likes DESC, created_at DESC)` — для списка популярных
- `INDEX(name)` — для поиска

---

### `temp_themes`

> Временные темы (до получения первого лайка)

> Активная тема, сохранена только пока есть активная комната или игра, сохранится только если игра получит 1 лайк по окончанию игры
> не входят в список популярных игр

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | VARCHAR(255) | Название темы |
| `description` | TEXT | Описание (опционально) |
| `difficulty` | ENUM | `easy`, `medium`, `hard` |
| `created_at` | BIGINT | Дата создания |
| `expires_at` | BIGINT | Время удаления (TTL) |

**Индексы:**
- `INDEX(expires_at)` — для очистки устаревших

> Темы удаляются автоматически через 24 часа, если не получили лайк

---

### `theme_ratings`

> Оценки тем пользователями. Используется для защиты от накрутки и аналитики в админ-дашборде.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `theme_id` | UUID | FK → themes.id |
| `user_id` | UUID | FK → users.id |
| `rating` | ENUM | `like`, `dislike` |
| `difficulty_rating` | ENUM | `easy`, `medium`, `hard` |
| `game_id` | UUID | ID игры, после которой поставлена оценка |
| `created_at` | BIGINT | Дата оценки |

**Индексы:**
- `UNIQUE(theme_id, user_id)` — один пользователь = одна оценка
- `INDEX(theme_id)`

---

### `games`

> Завершённые игры (история). Используется для статистики пользователей и аналитики в админ-дашборде.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `theme_id` | UUID | FK → themes.id (nullable) |
| `theme_name` | VARCHAR(255) | Название темы (копия) |
| `players_count` | INT | Количество игроков |
| `time_per_question` | INT | Время на вопрос (сек) |
| `winner_id` | UUID | FK → users.id (nullable при ничьей) |
| `end_reason` | ENUM | `conquest`, `elimination`, `timeout`, `forfeit`, `disconnect` |
| `started_at` | BIGINT | Время начала |
| `ended_at` | BIGINT | Время окончания |

**Индексы:**
- `INDEX(winner_id)`
- `INDEX(ended_at DESC)` — для истории

---

### `game_players`

> Участники завершённых игр. Детальная статистика по каждому игроку для истории и аналитики.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `game_id` | UUID | FK → games.id |
| `user_id` | UUID | FK → users.id |
| `player_index` | INT | Индекс игрока в игре (0-3) |
| `place` | INT | Занятое место (1-4) |
| `final_territories` | INT | Территорий в конце |
| `questions_answered` | INT | Отвечено вопросов |
| `correct_answers` | INT | Правильных ответов |
| `color` | VARCHAR(20) | Цвет игрока |

**Индексы:**
- `INDEX(game_id)`
- `INDEX(user_id, game_id)` — для истории игрока

---

## Таблицы для активных игр (в памяти / Redis)

> Следующие данные хранятся в Redis для быстрого доступа и автоматически удаляются после завершения игры.

### `active_rooms:{room_id}` (Hash)

```
{
  "id": "uuid",
  "owner_id": "uuid",
  "theme_id": "uuid?",
  "theme_name": "string",
  "players_count": 2,
  "time_per_question": 20,
  "is_private": false,
  "invite_code": "ABC123",
  "status": "waiting|ready",
  "created_at": 1234567890
}
```

### `room_players:{room_id}` (List/Set)

```
[
  { "user_id": "uuid", "name": "string", "color": "#FF0000", "is_ready": true }
]
```

### `active_games:{game_id}` (Hash)

```
{
  "id": "uuid",
  "room_id": "uuid",
  "theme_id": "uuid?",
  "theme_name": "string",
  "time_per_question": 20,
  "current_turn": 0,
  "turn_deadline": 1234567890,
  "status": "playing|question|finished",
  "started_at": 1234567890
}
```

### `game_cells:{game_id}` (Hash)

```
{
  "0": { "q": 0, "r": 0, "owner": null, "is_start": false },
  "1": { "q": 1, "r": 0, "owner": 0, "is_start": true },
  ...
}
```

### `game_players:{game_id}` (List)

```
[
  { "id": 0, "user_id": "uuid", "name": "string", "color": "#FF0000", "territories": 1, "is_eliminated": false }
]
```

### `user_session:{user_id}` (Hash)

```
{
  "active_room_id": "uuid?",
  "active_game_id": "uuid?",
  "socket_id": "string",
  "last_seen": 1234567890
}
```

---

## Индексы Redis

| Ключ | Тип | Описание |
|------|-----|----------|
| `public_rooms` | Sorted Set | Публичные комнаты (score = created_at) |
| `user:{user_id}:room` | String | ID комнаты пользователя |
| `user:{user_id}:game` | String | ID игры пользователя |
| `online_users` | Set | Онлайн пользователи |
| `user:{user_id}:friends_online` | Set | Онлайн друзья |

---

## Жизненный цикл данных

### Тема

```
1. Создаётся игра с новой темой → temp_themes
2. Игра завершается, пользователь ставит лайк
3. Тема переносится temp_themes → themes
4. Счётчики likes/players_count инкрементируются
```

### Комната → Игра

```
1. Создаётся комната → active_rooms (Redis)
2. Игроки присоединяются → room_players (Redis)
3. Владелец запускает игру:
   - active_rooms удаляется
   - active_games создаётся
   - game_cells, game_players создаются
4. Игра завершается:
   - Данные сохраняются в games, game_players (PostgreSQL)
   - Статистика user_stats обновляется
   - Redis-данные удаляются
```

---

## TTL политики (Redis)

| Ключ | TTL | Описание |
|------|-----|----------|
| `active_rooms:*` | 1 час | Неактивные комнаты удаляются |
| `active_games:*` | 2 часа | Максимальная длительность игры |
| `user_session:*` | 24 часа | Сессии пользователей |
| `temp_themes:*` | 24 часа | Временные темы |

---

## Миграции

### Начальная миграция

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- User stats
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INT NOT NULL DEFAULT 0,
    games_won INT NOT NULL DEFAULT 0,
    total_territories_captured INT NOT NULL DEFAULT 0,
    total_questions_answered INT NOT NULL DEFAULT 0,
    total_correct_answers INT NOT NULL DEFAULT 0
);

-- Friendships
CREATE TABLE friendships (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    PRIMARY KEY (user_id, friend_id)
);
CREATE INDEX idx_friendships_reverse ON friendships(friend_id, user_id);

-- Friend requests
CREATE TYPE friend_request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status friend_request_status NOT NULL DEFAULT 'pending',
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    updated_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);
CREATE INDEX idx_friend_requests_to ON friend_requests(to_user_id, status);
CREATE INDEX idx_friend_requests_pair ON friend_requests(from_user_id, to_user_id);

-- Themes
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    players_count INT NOT NULL DEFAULT 2,
    likes INT NOT NULL DEFAULT 0,
    dislikes INT NOT NULL DEFAULT 0,
    times_played INT NOT NULL DEFAULT 0,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    promoted_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);
CREATE INDEX idx_themes_popular ON themes(likes DESC, created_at DESC);
CREATE INDEX idx_themes_name ON themes(name);

-- Temp themes
CREATE TABLE temp_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    expires_at BIGINT NOT NULL
);
CREATE INDEX idx_temp_themes_expires ON temp_themes(expires_at);

-- Theme ratings
CREATE TYPE rating_type AS ENUM ('like', 'dislike');
CREATE TABLE theme_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating rating_type NOT NULL,
    difficulty_rating difficulty_level NOT NULL,
    game_id UUID NOT NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000),
    UNIQUE(theme_id, user_id)
);
CREATE INDEX idx_theme_ratings_theme ON theme_ratings(theme_id);

-- Games history
CREATE TYPE game_end_reason AS ENUM ('conquest', 'elimination', 'timeout', 'forfeit', 'disconnect');
CREATE TABLE games (
    id UUID PRIMARY KEY,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    theme_name VARCHAR(255) NOT NULL,
    players_count INT NOT NULL,
    time_per_question INT NOT NULL,
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    end_reason game_end_reason NOT NULL,
    started_at BIGINT NOT NULL,
    ended_at BIGINT NOT NULL
);
CREATE INDEX idx_games_winner ON games(winner_id);
CREATE INDEX idx_games_ended ON games(ended_at DESC);

-- Game players
CREATE TABLE game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_index INT NOT NULL,
    place INT NOT NULL,
    final_territories INT NOT NULL,
    questions_answered INT NOT NULL,
    correct_answers INT NOT NULL,
    color VARCHAR(20) NOT NULL
);
CREATE INDEX idx_game_players_game ON game_players(game_id);
CREATE INDEX idx_game_players_user ON game_players(user_id, game_id);
```

---

# Заметки

- При создании готовой комнаты (из списка «популярные») не происходит переход на страницу создания — сразу для админа создаётся блок комнаты на главной с кнопкой начала при наборе нужного кол-ва игроков
- Сохранённой комнате нельзя изменить параметры (её может удалить или изменить только админ сайта)
- Принятие приглашения в игру: пользователя переносит на главную страницу, в URL появляется параметр `room_id` активной комнаты, на странице появляется блок с комнатой