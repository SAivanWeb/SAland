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

ИИ генерирует вопросы по мере необходимости, но с ограничением повторов.

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
- ИИ задаёт один и тот же вопрос обоим игрокам
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
      "name": "string",
      "created_at": "string"
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
        "name": "string",
                "is_online": "boolean",
        "active_game_id": "string?"
      }
    ],
    "pending_friend_requests": [
      {
        "user_id": "string",
        "name": "string",
                "sent_at": "string"
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
        "is_online": "boolean",
    "stats": {
      "games_played": "number",
      "games_won": "number",
      "win_rate": "number"
    },
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
- `limit` — максимум результатов (по умолчанию 20)

**Response:**
```json
{
  "data": {
    "users": [
      {
        "user_id": "string",
        "name": "string",
                "is_online": "boolean",
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

> Популярные темы игр

**Query params:**
- `limit` — количество (по умолчанию 10)

**Response:**
```json
{
  "data": {
    "themes": [
      {
        "theme_id": "string",
        "name": "string",
        "description": "string?",
        "games_played": "number",
        "likes": "number",
        "dislikes": "number",
        "difficulty": "easy | medium | hard",
        "categories": ["string"]
      }
    ]
  }
}
```

---

### GET `themes/search`

> Поиск тем

**Query params:**
- `q` — строка поиска
- `category` — фильтр по категории
- `difficulty` — фильтр по сложности
- `limit` — количество результатов

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
        "categories": ["string"]
      }
    ]
  }
}
```

---

### GET `themes/categories`

> Список категорий тем

**Response:**
```json
{
  "data": {
    "categories": [
      {
        "id": "string",
        "name": "string",
        "themes_count": "number"
      }
    ]
  }
}
```

---

### POST `themes/:theme_id/rate`

> Оценка темы после игры

**Body:**
```json
{
  "rating": "like | dislike"
}
```

---

## История игр

### GET `games/history`

> История игр пользователя

**Query params:**
- `limit` — количество (по умолчанию 20)
- `offset` — смещение для пагинации

**Response:**
```json
{
  "data": {
    "games": [
      {
        "game_id": "string",
        "theme_name": "string",
        "played_at": "string",
        "duration_seconds": "number",
        "players": [
          {
            "user_id": "string",
            "name": "string",
            "place": "number",
            "territories": "number"
          }
        ],
        "user_place": "number",
        "is_winner": "boolean"
      }
    ],
    "total": "number"
  }
}
```

---

### GET `games/:game_id`

> Детали конкретной игры

**Response:**
```json
{
  "data": {
    "game_id": "string",
    "theme_id": "string",
    "theme_name": "string",
    "started_at": "string",
    "ended_at": "string",
    "duration_seconds": "number",
    "players": [
      {
        "user_id": "string",
        "name": "string",
        "color": "string",
        "place": "number",
        "final_territories": "number",
        "questions_answered": "number",
        "correct_answers": "number"
      }
    ],
    "winner_id": "string",
    "end_reason": "conquest | elimination | timeout | forfeit"
  }
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

> TODO: Описать схему БД

---

# Заметки

- При создании готовой комнаты (из списка «популярные») не происходит переход на страницу создания — сразу для админа создаётся блок комнаты на главной с кнопкой начала при наборе нужного кол-ва игроков
- Сохранённой комнате нельзя изменить параметры (её может удалить или изменить только админ сайта)
- Принятие приглашения в игру: пользователя переносит на главную страницу, в URL появляется параметр `room_id` активной комнаты, на странице появляется блок с комнатой
