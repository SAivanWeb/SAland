# Интеллектуальные Территории

> Рабочие варианты названия: «Квиз-Империя», «Захват знаний», «Мозговая карта»

---

## 1. Общая информация

| Параметр | Значение |
|----------|----------|
| Жанр | Стратегическая интеллектуальная игра |
| Количество игроков | 2–4 |
| Продолжительность партии | 20–40 минут |
| Тип вопросов | Статические (создаются админом сайта) |
| Цель игры | Захватить все территории ИЛИ остаться единственным игроком с территориями |


> **Создание комнаты и темы:**
> - **Flow:** создание INACTIVE комнаты (WebSocket) → настройка параметров → создание темы внутри комнаты → активация → игроки присоединяются → игра
> - **Временная тема:** создается внутри INACTIVE комнаты, хранится в Redis привязанной к room_id
> - **После игры:** если хотя бы 1 лайк → сохраняется в PostgreSQL (is_active=true), иначе удаляется
> - Темы создаются через AI-генерацию (GigaChat), загрузку JSON или ручную загрузку через свой AI (доступно всем пользователям)
> - **Ручная загрузка через свой AI:** пользователь копирует промпт (`room:get_prompt`) → вставляет в свой ChatGPT/Claude/Gemini → копирует ответ → вставляет обратно (`room:upload_theme_raw`). Поддерживается накопление вопросов порциями (если AI не может выдать 80 за раз).
> - Админские темы создаются сразу в PostgreSQL через HTTP endpoint

> **WebSocket события для управления комнатой:**
>
> **Создание и настройка (INACTIVE комната):**
> 1. `room:create` - создать INACTIVE комнату (без темы, статус INACTIVE). Payload: players_count, таймеры, is_private. Без theme_id.
> 2. `room:update_params` - настроить параметры (players_count, таймеры, приватность). Только для INACTIVE комнат.
> 3. `room:generate_theme` (AI) или `room:upload_theme` (JSON) или `room:get_prompt` + `room:upload_theme_raw` (ручной AI) или `room:select_theme` (существующая тема по ID) - создать/выбрать тему внутри комнаты
> 4. `room:delete_theme` или `room:clear_uploaded_questions` - удалить тему для пересоздания (если нужно изменить)
> 5. `room:activate` - активировать комнату (INACTIVE → WAITING), другие игроки могут присоединиться
>
> **Управление активной комнатой (WAITING):**
> - `room:join` - присоединиться к комнате (по room_id или invite_code)
> - `room:kick` - исключить игрока (только владелец)
> - `room:deactivate` - деактивировать комнату (WAITING → INACTIVE, выгнать всех игроков кроме владельца)
> - `room:start` - запустить игру (когда набралось players_count игроков)
>
> **Утилиты:**
> - `room:get_state` - получить текущее состояние (для переподключения)
> - `rooms:subscribe` / `rooms:unsubscribe` - подписка на список публичных комнат в лобби
> - Init endpoint возвращает `active_room_id` для восстановления при перезагрузке

> **Генерация вопросов AI:**
> - Вопросы генерируются батчами по 20 штук (всего 80)
> - Уже сгенерированные вопросы передаются в следующие запросы для избежания дублей
> - Правильные ответы не отправляются клиенту при превью (защита от подглядывания)
> - При ошибке AI — возвращается ошибка пользователю
> - Пользователь может отменить генерацию в любой момент

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
- Стартовые позиции фиксированы для каждой конфигурации (axial coordinates q, r):

**2 игрока (7 ячеек, радиус 1):**
- Игрок 0: q=-1, r=0 (левый)
- Игрок 1: q=1, r=0 (правый)
- Исключённых ячеек нет

**3 игрока (10 ячеек, радиус 2):**
- Игрок 0: q=0, r=-2 (верхний)
- Игрок 1: q=-2, r=2 (левый нижний)
- Игрок 2: q=2, r=0 (правый)
- Исключённые ячейки (9 шт): (-1,-1), (-2,0), (-2,1), (1,-2), (2,-2), (2,-1), (-1,2), (0,2), (1,1)

**4 игрока (17 ячеек, радиус 2):**
- Игрок 0: q=-2, r=0 (левый)
- Игрок 1: q=2, r=0 (правый)
- Игрок 2: q=-2, r=2 (левый нижний)
- Игрок 3: q=2, r=-2 (правый верхний)
- Исключённые ячейки (2 шт): (0,-2), (0,2)

---

## 3. Подготовка к игре

### 3.1 Начальные параметры

Каждый игрок:
- Получает 1 территорию
- Имеет 0 очков

### 3.2 Количество вопросов

- Фиксированный пул: 80 вопросов на тему
- Вопросы создаются через AI-генерацию или вручную админом
- При создании игры вопросы выбираются случайным образом из пула темы
- Количество вопросов не зависит от числа игроков — любая тема доступна любому составу

### 3.3 Таймеры игры

| Параметр | Значение по умолчанию | Диапазон |
|----------|----------------------|----------|
| Время на ход (выбор ячейки) | 30 сек | 15–60 сек |
| Дополнительное время на ход | 15 сек | 10–30 сек |
| Время на ответ | 20 сек | 10–45 сек |
| Таймер игры | null (без ограничения) | 600–3600 сек (или null = без ограничения) |

> Таймер игры останавливается на время ответа на вопрос

---

## 4. Ход игры

Ходы идут по очереди по часовой стрелке.

### 4.1 Действия в ход

В свой ход игрок **обязан** выбрать одну соседнюю территорию для захвата:
- Свободную территорию (соло-захват)
- Территорию другого игрока (атака/поединок)

### 4.2 Таймаут хода

1. Игроку даётся основное время на выбор ячейки
2. Если время истекло — даётся дополнительное время (предупреждение)
3. Если дополнительное время истекло — **игрок удаляется из игры**
    - Все его территории становятся свободными
    - Ход переходит к следующему игроку

---

## 5. Захват свободной территории

### Условия

Территория:
- Свободна (не принадлежит никому)
- Граничит с территорией активного игрока

### Процесс

1. Игрок выбирает свободную соседнюю ячейку
2. Получает 1 вопрос из пула темы
3. Время на ответ: задано в параметрах игры
4. Формат: выбор из 4 вариантов ответа

### Результат

| Действие игрока | Результат |
|-----------------|-----------|
| Ответил правильно | Территория переходит игроку |
| Ответил неправильно | Территория остаётся свободной |
| Не ответил (время истекло) | Территория остаётся свободной |

---

## 6. Атака на территорию противника (поединок)

> Активный игрок может атаковать соседнюю территорию, принадлежащую другому игроку.

### Условия

- Атакуемая территория принадлежит другому игроку
- Атакуемая территория граничит с территорией атакующего
- Защитник не может отказаться от поединка

### Процесс

1. Атакующий выбирает вражескую соседнюю ячейку
2. Оба игрока (атакующий и защитник) получают **один и тот же вопрос**
3. Оба отвечают одновременно (время ограничено)
4. Учитывается правильность ответа и время ответа

### Результат

| Атакующий | Защитник | Результат |
|-----------|----------|-----------|
| Правильно + быстрее | Правильно | Территория переходит атакующему |
| Правильно | Неправильно / не ответил | Территория переходит атакующему |
| Правильно | Правильно + быстрее | Территория остаётся у защитника |
| Неправильно / не ответил | Правильно | Территория остаётся у защитника |
| Неправильно / не ответил | Неправильно / не ответил | Территория остаётся у защитника |

> **Защитник сохраняет территорию** во всех случаях, кроме победы атакующего (правильный ответ + быстрее или единственный правильный ответ).

---

## 7. Победа

### Условия победы (в порядке приоритета)

| Условие | Описание |
|---------|----------|
| **Полный захват** | Игрок контролирует все территории на поле |
| **Последний выживший** | Все остальные игроки удалены из игры (таймаут хода / выход) |
| **Таймер игры** | Время игры истекло — побеждает игрок с наибольшим числом территорий |

### При ничьей по территориям (таймер)

Если у нескольких игроков одинаковое количество территорий при истечении таймера:
1. Побеждает игрок с большим количеством правильных ответов
2. Если и это равно — ничья (оба считаются победителями)

### Удаление игрока из игры

Игрок удаляется из игры, если:
- Не выбрал ячейку за основное + дополнительное время хода
- Отключился и не переподключился в течение reconnect deadline
- Нажал кнопку "Сдаться"

При удалении игрока:
- Все его территории становятся **свободными**
- Игрок больше не участвует в очереди ходов

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

### DELETE `user/account`

> Удаление аккаунта текущего пользователя. Удаляет все связанные данные (токены, статистику, друзей, жалобы).

**Response:** `204 No Content`

**Ошибки:**
- `401` — не авторизован
- `404` — пользователь не найден

---

### POST `user/report`

> Пожаловаться на другого пользователя

**Body:**
```json
{
  "reported_user_id": "string",
  "reason": "string"
}
```

> `reason`: минимум 10, максимум 1000 символов.

**Response:**
```json
{
  "data": {
    "report_id": "string"
  }
}
```

**Ошибки:**
- `400` — нельзя пожаловаться на себя / валидация не пройдена
- `404` — пользователь не найден
- `409` — жалоба на этого пользователя уже была отправлена

---

### GET `user/search`

> Поиск пользователей. Текущий пользователь исключается из результатов.

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

> Список тем с пагинацией, поиском и фильтрацией

**Query params:**
- `q` — строка поиска (опционально)
- `difficulty` — фильтр по сложности: `easy`, `medium`, `hard` (опционально)
- `sort` — сортировка: `popular` (по лайкам), `recent` (по дате), `played` (по играм). По умолчанию `popular`
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
        "likes": "number",
        "dislikes": "number",
        "times_played": "number",
        "questions_count": "number",
        "created_by": {
          "user_id": "string",
          "name": "string"
        }
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

> Оценка постоянной темы после игры

**Body:**
```json
{
  "game_id": "string",
  "rating": "like | dislike",
  "difficulty_rating": "easy | medium | hard"
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

### POST `games/:game_id/rate-temp-theme`

> Оценка временной темы после игры

**Body:**
```json
{
  "rating": "like | dislike | skip",
  "difficulty_rating": "easy | medium | hard"
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "theme_saved": "boolean",
    "theme_id": "string?"
  }
}
```

> `theme_saved` — true если тема была сохранена (получила первый лайк).
> `theme_id` — ID сохранённой темы (только если theme_saved=true).
>
> Логика сохранения:
> - Сервер собирает оценки от всех игроков
> - Если хотя бы 1 лайк → тема сохраняется в PostgreSQL
> - Если 0 лайков → тема удаляется
> - После последней оценки возвращается результат

---

### POST `themes/admin/create`

> Создание темы админом (сразу в PostgreSQL)

**Body:**
```json
{
  "name": "string",
  "description": "string?",
  "difficulty": "easy | medium | hard",
  "questions": [
    {
      "question": "string",
      "answers": ["string", "string", "string", "string"],
      "correct_answer": 0
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "theme_id": "string",
    "name": "string",
    "questions_count": "number"
  }
}
```

> Требуется роль админа. Тема сразу сохраняется в PostgreSQL с `is_active=true`.

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

### Поведение при disconnect (комнаты)

При отключении WebSocket (перезагрузка страницы, потеря связи):

| Роль | Статус комнаты | Поведение |
|------|---------------|-----------|
| **Владелец** | INACTIVE | Остаётся в комнате. При переподключении — `room:get_state` восстанавливает состояние. |
| **Владелец** | WAITING | Остаётся в комнате. При переподключении — `room:get_state` восстанавливает состояние. |
| **Обычный игрок** | WAITING | Удаляется из комнаты. Остальные получают `room:player_left` с `disconnected: true`. |

> Для игр (после `room:start`) используется отдельная reconnect-логика с `reconnect_deadline` (60 сек).

---

## Комнаты (Lobby)

### Статусы комнаты

| Статус | Описание |
|--------|----------|
| `inactive` | Комната в режиме настройки (создание темы, параметры). Нельзя присоединиться. |
| `waiting` | Активная комната, принимает игроков. Видна в лобби (если публичная). |
| `ready` | Все игроки готовы (зарезервирован, не используется в текущей реализации). |

### Переходы статусов

```
INACTIVE (room:create)
  ├─ room:update_params (разрешено)
  ├─ room:generate_theme (разрешено)
  ├─ room:upload_theme (разрешено)
  ├─ room:select_theme (разрешено)
  ├─ room:delete_theme (разрешено)
  └─ room:activate → WAITING (если тема есть, 80 вопросов)

WAITING (после активации)
  ├─ room:join (разрешено)
  ├─ room:leave (разрешено)
  ├─ room:kick (разрешено)
  ├─ room:start (разрешено) → Игра начинается (когда players_count игроков)
  └─ room:deactivate → INACTIVE (все игроки кроме владельца удаляются)
```

### Клиент → Сервер

#### `room:create`

> Создание INACTIVE комнаты (без темы). Тема добавляется позже через `room:upload_theme` или `room:generate_theme`.
> Все поля опциональны — можно отправить пустой объект `{}`, будут использованы значения по умолчанию.

```json
{}
```

Или с частичным переопределением:

```json
{
  "players_count": 4,
  "is_private": true
}
```

| Поле | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `players_count` | number? | 2 | Количество игроков (2-4) |
| `time_per_question` | number? | 20 | Секунды на ответ (10-45) |
| `time_per_turn` | number? | 30 | Секунды на выбор ячейки (15-60) |
| `extra_time_per_turn` | number? | 15 | Доп. секунды при таймауте (10-30) |
| `game_timer` | number? | null | Таймер игры в секундах (600-3600, null = без ограничения) |
| `is_private` | boolean? | false | Приватная комната |

**Ответ:** `room:created` создателю (RoomState), `rooms:list` всем в лобби (если публичная)

> Если пользователь уже находится в комнате — старая комната полностью удаляется (вместе с темой и вопросами), все другие игроки получают `room:kicked` с причиной `"Room was deleted by owner"`, и создаётся чистая новая комната.

---

#### `room:join`

> Присоединение к комнате (только WAITING комнаты)

```json
{
  "room_id": "string?",
  "invite_code": "string?"
}
```

> Необходимо указать `room_id` (UUID) или `invite_code` (6 символов, case-insensitive)

**Ответ:** `room:state` присоединившемуся, `room:player_joined` остальным в комнате

**Ошибки (room:error):**
- `ALREADY_IN_ROOM` — пользователь уже в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `ROOM_FULL` — комната заполнена
- `ROOM_INACTIVE` — комната в статусе INACTIVE, владелец ещё не активировал
- `INVALID_STATUS` — комната не принимает игроков

---

#### `room:leave`

> Выход из комнаты

```json
{}
```

> `room_id` не нужен — сервер знает в какой комнате пользователь

**Ответ:** `room:left` покинувшему (`{ success: true }`), `room:player_left` оставшимся

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате

> При выходе владельца из комнаты в статусе INACTIVE или WAITING — **комната удаляется полностью**. Все оставшиеся игроки получают `room:kicked` с причиной `"Room was deleted by owner"`.
> При выходе обычного игрока — игрок удаляется из комнаты, остальные получают `room:player_left`.
> При выходе последнего игрока — комната удаляется.

---

#### `room:kick`

> Исключение игрока из комнаты (только владелец)

```json
{
  "user_id": "string"
}
```

**Ответ:** `room:kick_success` владельцу (`{ success: true }`), `room:kicked` исключённому, `room:player_left` остальным

**Ошибки (room:error):**
- `NOT_IN_ROOM` — владелец не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может исключать
- `CANNOT_KICK_SELF` — нельзя исключить себя
- `PLAYER_NOT_IN_ROOM` — целевой игрок не в этой комнате

---

#### `room:update_params`

> Обновление параметров комнаты (только владелец, только INACTIVE комнаты)

```json
{
  "players_count": 4,
  "time_per_question": 30,
  "time_per_turn": 45,
  "extra_time_per_turn": 20,
  "game_timer": 1800,
  "is_private": true
}
```

> Все поля опциональны. Обновляются только переданные параметры.
> `game_timer` в секундах: 600-3600 (10-60 мин) или null.

**Ответ:** `room:state` отправителю, `room:params_updated` всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может изменять параметры
- `ROOM_ALREADY_ACTIVE` — параметры можно изменять только для INACTIVE комнат

---

#### `room:generate_theme`

> Запуск генерации темы через AI (только владелец, только INACTIVE комнаты)

```json
{
  "theme_name": "string"
}
```

> `theme_name`: 2-255 символов

**Ответ:** `room:theme_generation_started` отправителю и всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может генерировать тему
- `ROOM_ALREADY_ACTIVE` — тему можно создать только для INACTIVE комнат
- `THEME_EXISTS` — в комнате уже есть тема (удалите через `room:delete_theme`)

---

#### `room:select_theme`

> Привязка существующей темы из PostgreSQL к комнате (только владелец, только INACTIVE комнаты).
> Позволяет использовать уже созданную тему без генерации. После выбора тема сразу готова к `room:activate`.

```json
{
  "theme_id": "string"
}
```

> `theme_id`: UUID существующей активной темы (is_active=true, ровно 80 вопросов).

**Ответ:** `room:state` отправителю, `room:theme_selected` broadcast всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может выбирать тему
- `ROOM_ALREADY_ACTIVE` — тему можно выбрать только для INACTIVE комнат
- `THEME_EXISTS` — в комнате уже есть тема (удалите через `room:delete_theme`)
- `THEME_NOT_FOUND` — тема не найдена или неактивна
- `INVALID_QUESTIONS_COUNT` — тема должна содержать ровно 80 вопросов

---

#### `room:upload_theme`

> Загрузка темы из JSON (только владелец, только INACTIVE комнаты)

```json
{
  "theme_name": "string",
  "questions": [
    {
      "question": "string",
      "answers": ["string", "string", "string", "string"],
      "correct_answer": 0
    }
  ]
}
```

> `theme_name`: 2-255 символов. `questions`: ровно 80 вопросов, `correct_answer`: 0-3.

**Ответ:** `room:state` отправителю, `room:theme_uploaded` всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может загружать тему
- `ROOM_ALREADY_ACTIVE` — тему можно создать только для INACTIVE комнат
- `THEME_EXISTS` — в комнате уже есть тема
- `INVALID_QUESTIONS_COUNT` — тема должна содержать ровно 80 вопросов

---

#### `room:get_prompt`

> Получить промпт для ручной генерации через свой AI (только владелец, только INACTIVE комнаты)

```json
{
  "theme_name": "string"
}
```

> `theme_name`: 2-255 символов. Используется для подстановки в промпт.
> **Важно:** `theme_name` и `upload_method: 'manual'` сохраняются в комнату сразу при вызове. Это позволяет не передавать `theme_name` повторно в `room:upload_theme_raw`.
> Для смены названия темы — вызвать `room:clear_uploaded_questions` (сбросит и название, и вопросы, и upload_method), затем `room:get_prompt` с новым названием.

**Ответ:** `room:prompt` отправителю

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может получить промпт
- `ROOM_ALREADY_ACTIVE` — промпт можно получить только для INACTIVE комнат

---

#### `room:upload_theme_raw`

> Загрузка сырого текста от AI (только владелец, только INACTIVE комнаты). Поддерживает накопление вопросов порциями.

```json
{
  "theme_name": "string?",
  "raw_text": "string | object"
}
```

> `theme_name`: 2-255 символов, опционально. Если `room:get_prompt` был вызван ранее — название уже сохранено в комнате. Можно передать для переопределения.
> `raw_text`: принимает **строку** (минимум 10 символов, сырой ответ AI) или **JSON-объект** (например `{"questions": [...]}`).
> Сервер извлекает JSON из текста (стрипает markdown code blocks, ищет массив вопросов), валидирует и добавляет к уже загруженным.
> Дедупликация по тексту вопроса. Максимум 80 вопросов — лишние отбрасываются.

**Ответ:** `room:theme_raw_uploaded` отправителю, `room:theme_progress` broadcast всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может загружать тему
- `ROOM_ALREADY_ACTIVE` — тему можно загрузить только для INACTIVE комнат
- `INVALID_FORMAT` — не удалось извлечь валидные вопросы из текста
- `THEME_NAME_REQUIRED` — theme_name обязателен, если не был задан через `room:get_prompt` ранее

---

#### `room:clear_uploaded_questions`

> Очистить накопленные вопросы для начала заново (только владелец, только INACTIVE комнаты)

```json
{}
```

**Ответ:** `room:state` отправителю, `room:theme_deleted` broadcast всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может очищать вопросы
- `ROOM_ALREADY_ACTIVE` — нельзя очистить вопросы активной комнаты
- `NO_THEME` — в комнате нет темы

---

#### `room:delete_theme`

> Удаление темы из комнаты (только владелец, только INACTIVE комнаты)

```json
{}
```

**Ответ:** `room:state` отправителю, `room:theme_deleted` всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может удалять тему
- `ROOM_ALREADY_ACTIVE` — нельзя удалить тему из активной комнаты
- `NO_THEME` — в комнате нет темы

---

#### `room:activate`

> Активация комнаты (только владелец, только INACTIVE комнаты с темой из 80 вопросов)

```json
{}
```

> Переводит комнату INACTIVE → WAITING. После активации другие игроки могут присоединяться.

**Ответ:** `room:state` отправителю, `room:activated` всем в комнате

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может активировать комнату
- `ROOM_NOT_INACTIVE` — комната не в статусе INACTIVE
- `NO_THEME` — необходимо создать тему перед активацией
- `INVALID_QUESTIONS_COUNT` — тема должна содержать ровно 80 вопросов

---

#### `room:deactivate`

> Деактивация комнаты (только владелец, только WAITING комнаты)

```json
{}
```

> Переводит комнату WAITING → INACTIVE. Все игроки кроме владельца удаляются и получают `room:kicked`.

**Ответ:** `room:state` отправителю, `room:deactivated` в комнате, `room:kicked` удалённым игрокам

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может деактивировать комнату
- `ROOM_NOT_ACTIVE` — комната не в статусе WAITING

---

#### `room:get_state`

> Получение текущего состояния комнаты (для переподключения)

```json
{}
```

**Ответ:** `room:state`

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате

> Клиент получает `active_room_id` из init endpoint, затем вызывает `room:get_state`.
> При вызове сокет автоматически подключается к Socket.IO комнате (`room:{id}`), что необходимо для получения broadcast-событий после переподключения.

---

#### `room:start`

> Запуск игры (только владелец, все слоты должны быть заняты — players_count игроков в комнате)

```json
{}
```

**Ответ:** `game:starting` отправителю и всем в комнате (содержит RoomState)

**Ошибки (room:error):**
- `NOT_IN_ROOM` — пользователь не в комнате
- `ROOM_NOT_FOUND` — комната не найдена
- `NOT_OWNER` — только владелец может запустить игру
- `NOT_ENOUGH_PLAYERS` — не набралось players_count игроков

> После `game:starting` асинхронно запускается игра и приходит `game:started`.

---

#### `rooms:subscribe`

> Подписка на обновления списка комнат (при входе в лобби)

```json
{}
```

**Ответ:** `rooms:list` (массив PublicRoomInfo)

> Событие `rooms:list` приходит повторно при изменении списка комнат (создание, присоединение, удаление)

---

#### `rooms:unsubscribe`

> Отписка от обновлений списка комнат (при выходе из лобби)

```json
{}
```

**Ответ:** `rooms:unsubscribed` (`{ success: true }`)

---

### Сервер → Клиент

#### `room:created`

> Подтверждение создания комнаты (создателю). Содержит полное состояние комнаты (RoomState).

```json
{
  "id": "string",
  "owner_id": "string",
  "players_count": 2,
  "time_per_question": 20,
  "time_per_turn": 30,
  "extra_time_per_turn": 15,
  "game_timer": null,
  "is_private": false,
  "invite_code": "ABC123",
  "status": "inactive",
  "created_at": 1234567890,
  "players": [
    {
      "user_id": "string",
      "name": "string",
      "color": "#E53935"
    }
  ],
  "theme": null
}
```

---

#### `room:state`

> Полное состояние комнаты (RoomState)

```json
{
  "id": "string",
  "owner_id": "string",
  "players_count": "number",
  "time_per_question": "number",
  "time_per_turn": "number",
  "extra_time_per_turn": "number",
  "game_timer": "number | null",
  "is_private": "boolean",
  "invite_code": "string",
  "status": "inactive | waiting | ready",
  "created_at": "number",
  "players": [
    {
      "user_id": "string",
      "name": "string",
      "color": "string"
    }
  ],
  "theme": {
    "name": "string",
    "upload_method": "'manual' | 'ai' | null",
    "questions_loaded": "number",
    "questions_total": 80
  }
}
```

| Поле | Описание |
|------|----------|
| `id` | UUID комнаты |
| `theme` | Информация о теме (null пока тема не создана) |
| `theme.name` | Название темы |
| `theme.upload_method` | Способ загрузки: `'manual'` (ручная/JSON), `'ai'` (AI-генерация), `'existing'` (существующая тема), `null` |
| `theme.questions_loaded` | Количество загруженных вопросов (0-80) |
| `theme.questions_total` | Необходимое количество (80) |

**Статусы:**
- `inactive` — настройка комнаты (создание темы, параметры). Нельзя присоединиться.
- `waiting` — ожидание игроков, можно присоединиться.
- `ready` — зарезервировано.

---

#### `room:player_joined`

> Игрок присоединился (broadcast остальным в комнате)

```json
{
  "player": {
    "user_id": "string",
    "name": "string",
    "color": "string"
  },
  "current_players": "number",
  "status": "waiting"
}
```

---

#### `room:player_left`

> Игрок покинул комнату (broadcast остальным в комнате)

```json
{
  "user_id": "string",
  "name": "string | null",
  "new_owner_id": "string?",
  "kicked": "boolean?",
  "disconnected": "boolean?"
}
```

> `name` — имя игрока, который покинул комнату.
> `new_owner_id` — **не используется**: при выходе владельца комната удаляется (все получают `room:kicked`), передача прав не происходит.
> `kicked: true` — если игрок был исключён владельцем.
> `disconnected: true` — если игрок отключился.

---

#### `room:kicked`

> Вас исключили из комнаты (персональное)

```json
{
  "room_id": "string",
  "reason": "string"
}
```

> `reason`: `"You were kicked by the room owner"`, `"Room was deactivated by owner"` или `"Room was deleted by owner"`
```

---

#### `room:params_updated`

> Параметры комнаты обновлены (broadcast всем в комнате)

```json
{
  "params": {
    "players_count": "number",
    "time_per_question": "number",
    "time_per_turn": "number",
    "extra_time_per_turn": "number",
    "game_timer": "number | null",
    "is_private": "boolean"
  }
}
```

---

#### `room:theme_generation_started`

> Генерация темы через AI запущена (broadcast всем в комнате)

```json
{
  "theme_name": "string"
}
```

---

#### `room:theme_selected`

> Существующая тема выбрана (broadcast всем в комнате)

```json
{
  "theme_id": "string",
  "theme_name": "string"
}
```

---

#### `room:theme_uploaded`

> Тема загружена из JSON (broadcast всем в комнате)

```json
{
  "theme_name": "string"
}
```

---

#### `room:theme_deleted`

> Тема удалена из комнаты (broadcast всем в комнате)

```json
{
  "theme_name": null
}
```

---

#### `room:prompt`

> Промпт для ручной генерации через AI (персональное, отправителю)

```json
{
  "prompt": "string",
  "theme_name": "string"
}
```

---

#### `room:theme_raw_uploaded`

> Результат загрузки сырого текста AI (персональное, отправителю)

```json
{
  "loaded": 25,
  "total": 80,
  "invalid_count": 2,
  "is_complete": false
}
```

| Поле | Описание |
|------|----------|
| `loaded` | Общее количество загруженных вопросов |
| `total` | Необходимое количество (80) |
| `invalid_count` | Количество невалидных вопросов в этой порции |
| `is_complete` | true если набрано >= 80 вопросов, тема готова к активации |

---

#### `room:theme_progress`

> Прогресс загрузки темы (broadcast всем в комнате)

```json
{
  "loaded": 25,
  "total": 80,
  "is_complete": false
}
```

---

#### `room:activated`

> Комната активирована (broadcast всем в комнате)

```json
{
  "status": "waiting"
}
```

---

#### `room:deactivated`

> Комната деактивирована (broadcast оставшимся в комнате)

```json
{
  "status": "inactive"
}
```

---

#### `rooms:list`

> Список публичных комнат в лобби (только WAITING, не заполненные, макс. 50)

```json
[
  {
    "id": "string",
    "owner_name": "string",
    "theme_name": "string | null",
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
  "theme_id": "string?",
  "theme_name": "string",
  "is_temp_theme": "boolean",
  "time_per_question": "number",
  "time_per_turn": "number",
  "extra_time_per_turn": "number",
  "game_timer": "number | null",
  "game_end_time": "number | null",
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
  "turn_deadline": "number",
  "is_extra_time": "boolean"
}
```

| Поле | Описание |
|------|----------|
| `theme_id` | ID темы (null для временных тем) |
| `is_temp_theme` | true если тема временная (AI/ручная) |
| `game_timer` | Таймер игры в секундах (null = без ограничения) |
| `game_end_time` | Unix timestamp окончания игры по таймеру (null = без ограничения) |
| `turn_deadline` | Unix timestamp окончания хода |
| `is_extra_time` | Идёт ли сейчас дополнительное время хода |

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
      "is_active": "boolean"
    }
  ],
  "current_turn": "number",
  "turn_deadline": "number",
  "is_extra_time": "boolean",
  "game_end_time": "number | null"
}
```

> `is_active: false` — игрок удалён из игры (таймаут/выход/сдался)

---

#### `game:turn`

> Начало хода (персональное для текущего игрока)

```json
{
  "available_cells": ["number"],
  "turn_deadline": "number",
  "is_extra_time": "boolean"
}
```

> `is_extra_time: true` — это предупреждение, основное время истекло

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

> Результат раунда. После получения фронтенд показывает правильный ответ и результат хода.
> Следующий `game:turn` придёт автоматически через **5 сек** (соло-захват) или **7 сек** (батл).

```json
{
  "turn_number": "number",
  "result": {
    "type": "solo_capture | battle_won | battle_lost | battle_draw | timeout | skip",
    "turn_number": "number",
    "player_index": "number",
    "cell": { "q": "number", "r": "number" },
    "question_id": "string?",
    "player_answer": "PlayerAnswer?",
    "defender_answer": "PlayerAnswer?",
    "cell_captured": "boolean",
    "cell_owner_changed_from": "number | null"
  },
  "correct_answer_index": "number?",
  "updated_cells": ["HexCell"],
  "updated_players": ["GamePlayer"]
}
```

| Поле | Описание |
|------|----------|
| `correct_answer_index` | Индекс правильного ответа (0-3). Отсутствует при `skip` (пропуск хода без вопроса). |
| `player_answer` | Ответ атакующего (есть при соло-захвате и батле) |
| `defender_answer` | Ответ защитника (только при батле) |
| `cell_captured` | Захвачена ли клетка в результате хода |
| `cell_owner_changed_from` | Предыдущий владелец клетки (null если была свободной) |

---

#### `game:player_forfeited`

> Игрок сдался

```json
{
  "user_id": "string",
  "player_id": "number",
  "freed_cells": ["number"]
}
```

> `freed_cells` — ID ячеек, которые стали свободными

---

#### `game:player_removed`

> Игрок удалён из игры (таймаут хода, disconnect timeout)

```json
{
  "user_id": "string",
  "player_id": "number",
  "reason": "turn_timeout | disconnect_timeout",
  "freed_cells": ["number"]
}
```

---

#### `game:player_disconnected`

> Игрок отключился (ещё может переподключиться)

```json
{
  "user_id": "string",
  "player_id": "number",
  "reconnect_deadline": "number"
}
```

> Reconnect deadline: 60 секунд. Если игрок не переподключился — `game:player_removed`.

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
  "winner_ids": ["string"],
  "reason": "conquest | last_standing | game_timer | forfeit",
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
  "theme_id": "string?",
  "is_temp_theme": "boolean",
  "theme_name": "string"
}
```

| Поле | Описание |
|------|----------|
| `winner_id` | ID победителя (null при ничьей) |
| `winner_ids` | Массив ID победителей (для ничьей) |
| `reason` | Причина завершения |
| `theme_id` | ID темы (null для временных тем) |
| `is_temp_theme` | true если тема временная (требуется оценка для сохранения) |
| `theme_name` | Название темы |

> Если `is_temp_theme=true`, клиент должен показать окно оценки темы.
> От оценок зависит будет ли тема сохранена (нужен хотя бы 1 лайк).

**Причины завершения:**
- `conquest` — игрок захватил все территории
- `last_standing` — остался один активный игрок
- `game_timer` — время игры истекло
- `forfeit` — все кроме одного сдались

---

## Чат (привязан к игре)

> Каждая игра имеет свой чат. Чат доступен с момента создания комнаты и до конца игры.

**Хранение:**
- Сообщения хранятся в Redis пока комната/игра активна
- При переподключении игрок получает историю через `chat:history`
- После завершения игры чат удаляется

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

## AI-генерация (WebSocket)

> События для отслеживания прогресса генерации темы через AI внутри комнаты.
> Отправляются владельцу комнаты после вызова `room:generate_theme`.

### Сервер → Клиент

#### `ai:progress`

> Прогресс генерации (отправляется после каждого батча)

```json
{
  "session_id": "string",
  "status": "generating",
  "progress": {
    "generated": 20,
    "total": 80
  }
}
```

---

#### `ai:ready`

> Генерация завершена успешно

```json
{
  "session_id": "string",
  "status": "ready",
  "progress": {
    "generated": 80,
    "total": 80
  }
}
```

> После этого события генерация завершена, тема привязана к комнате.

---

#### `ai:error`

> Ошибка при генерации

```json
{
  "session_id": "string",
  "status": "error",
  "error": "string",
  "progress": {
    "generated": 40,
    "total": 80
  }
}
```

> При ошибке частично сгенерированные вопросы удаляются.

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
- `ROOM_NOT_FOUND` — комната не найдена
- `ROOM_FULL` — комната заполнена
- `ROOM_INACTIVE` — комната в статусе INACTIVE
- `ROOM_ALREADY_ACTIVE` — действие разрешено только для INACTIVE комнат
- `ROOM_NOT_INACTIVE` — комната не в статусе INACTIVE
- `ROOM_NOT_ACTIVE` — комната не в статусе WAITING
- `INVALID_STATUS` — комната не принимает игроков
- `NOT_OWNER` — только владелец может выполнить действие
- `NOT_IN_ROOM` — вы не в комнате
- `ALREADY_IN_ROOM` — вы уже в комнате
- `CANNOT_KICK_SELF` — нельзя исключить себя
- `PLAYER_NOT_IN_ROOM` — игрок не в этой комнате
- `THEME_EXISTS` — в комнате уже есть тема
- `NO_THEME` — в комнате нет темы
- `INVALID_QUESTIONS_COUNT` — тема должна содержать ровно 80 вопросов
- `INVALID_FORMAT` — не удалось извлечь валидные вопросы из текста
- `THEME_NAME_REQUIRED` — theme_name обязателен при первой загрузке через raw
- `NOT_ENOUGH_PLAYERS` — не набралось players_count игроков
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

- Чаты игр хранятся в Redis пока игра активна, после завершения удаляются
- Темы создаются пользователями (AI или вручную) или админом
- Пользовательские темы хранятся временно в Redis, сохраняются в PostgreSQL только после игры с лайком
- Админские темы сразу сохраняются в PostgreSQL
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

> Темы игр (создаются через AI-генерацию или админом)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `name` | VARCHAR(255) | Название темы |
| `description` | TEXT | Описание (опционально) |
| `difficulty` | ENUM | `easy`, `medium`, `hard` |
| `likes` | INT | Количество лайков |
| `dislikes` | INT | Количество дизлайков |
| `times_played` | INT | Сколько раз играли |
| `is_active` | BOOLEAN | Активна ли тема (видна в списке) |
| `created_by` | UUID | FK → users.id (автор темы, null для админских) |
| `created_at` | BIGINT | Дата создания |

**Индексы:**
- `INDEX(likes DESC, created_at DESC)` — для списка популярных
- `INDEX(name)` — для поиска
- `INDEX(is_active)` — для фильтрации активных тем
- `INDEX(created_by)` — для списка "мои темы" (будущее)

---

### `questions`

> Вопросы к темам (создаются админом)

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Первичный ключ |
| `theme_id` | UUID | FK → themes.id |
| `question` | TEXT | Текст вопроса |
| `answers` | JSONB | Массив из 4 вариантов ответа |
| `correct_answer` | INT | Индекс правильного ответа (0-3) |
| `created_at` | BIGINT | Дата создания |

**Индексы:**
- `INDEX(theme_id)` — для выборки вопросов по теме

> Фиксированное количество: 80 вопросов на тему

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
| `time_per_turn` | INT | Время на ход (сек) |
| `game_timer` | INT | Таймер игры (сек, nullable) |
| `winner_id` | UUID | FK → users.id (nullable при ничьей) |
| `end_reason` | ENUM | `conquest`, `last_standing`, `game_timer`, `forfeit` |
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

### `room:{room_id}` (String, JSON)

```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "theme_id": "uuid | null",
  "theme_name": "string | null",
  "upload_method": "'manual' | 'ai' | null",
  "players_count": 2,
  "time_per_question": 20,
  "time_per_turn": 30,
  "extra_time_per_turn": 15,
  "game_timer": null,
  "is_private": false,
  "invite_code": "ABC123",
  "status": "inactive|waiting|ready",
  "created_at": 1234567890
}
```

> `theme_id` — null до привязки постоянной темы или для временных тем
> `theme_name` — null пока тема не создана
> `upload_method` — способ загрузки темы: `'manual'` (ручная/JSON), `'ai'` (AI-генерация), `'existing'` (существующая тема), `null` (не задан)
> `status: inactive` — комната в настройке (тема, параметры), не видна в лобби
> `status: waiting` — комната активна, принимает игроков

### `room:{room_id}:players` (List)

> Список хранится как JSON-строки. Порядок = порядок присоединения.

```json
[
  { "user_id": "uuid", "name": "string", "color": "#E53935" }
]
```

### `active_games:{game_id}` (Hash)

```json
{
  "id": "uuid",
  "room_id": "uuid",
  "theme_id": "uuid?",
  "theme_name": "string",
  "is_temp_theme": false,
  "time_per_question": 20,
  "time_per_turn": 30,
  "extra_time_per_turn": 15,
  "game_timer": 1800,
  "game_end_time": 1234567890,
  "current_turn": 0,
  "turn_deadline": 1234567890,
  "is_extra_time": false,
  "status": "playing|question|finished",
  "started_at": 1234567890
}
```

> `theme_id` — null для временных тем
> `is_temp_theme` — true если тема временная (вопросы в temp_theme_questions)

### `game_cells:{game_id}` (Hash)

```json
{
  "0": { "q": 0, "r": 0, "owner": null, "is_start": false },
  "1": { "q": 1, "r": 0, "owner": 0, "is_start": true }
}
```

### `game_players:{game_id}` (List)

> JSON-строки. `is_active: false` = игрок удалён из игры.

```json
[
  { "id": 0, "user_id": "uuid", "name": "string", "color": "#FF0000", "territories": 1, "is_active": true, "correct_answers": 0, "questions_answered": 0 }
]
```

### `game_chat:{game_id}` (List)

> Сообщения чата. Удаляются вместе с игрой.

```json
[
  { "id": "uuid", "user_id": "uuid", "user_name": "string", "message": "string", "timestamp": 1234567890, "type": "user|system" }
]
```

### `user_room:{user_id}` (String)

> ID комнаты пользователя. TTL: 1 час.

```
"uuid"
```

### `user_session:{user_id}` (Hash)

```json
{
  "active_room_id": "uuid?",
  "active_game_id": "uuid?",
  "socket_id": "string",
  "last_seen": 1234567890,
  "reconnect_deadline": 1234567890
}
```

### `temp_theme:{room_id}` (Hash)

> Временная тема, привязанная к комнате

```json
{
  "name": "string",
  "created_by": "uuid",
  "created_at": 1234567890
}
```

### `temp_theme_questions:{room_id}` (List)

> Вопросы временной темы

```json
[
  {
    "question": "string",
    "answers": ["string", "string", "string", "string"],
    "correct_answer": 0
  }
]
```

### `temp_theme_votes:{game_id}` (Hash)

> Голоса за временную тему после игры

```json
{
  "total_players": 2,
  "votes_count": 0,
  "likes": 0,
  "dislikes": 0,
  "skips": 0,
  "voted_users": ["uuid1", "uuid2"]
}
```

> TTL: 10 минут (время на голосование после игры)
> После голосования всех игроков или TTL — принимается решение о сохранении

---

## Индексы Redis

| Ключ | Тип | Описание |
|------|-----|----------|
| `public_rooms` | Sorted Set | Публичные WAITING комнаты (score = created_at). Комнаты добавляются только после room:activate. |
| `user_room:{user_id}` | String | ID комнаты пользователя (TTL: 1 час) |
| `user:{user_id}:game` | String | ID игры пользователя |
| `online_users` | Set | Онлайн пользователи |
| `user:{user_id}:friends_online` | Set | Онлайн друзья |

---

## Жизненный цикл данных

### Тема (создание админом)

```
1. Админ создаёт тему через POST /themes/create
2. Тема сразу сохраняется в PostgreSQL с is_active = true
3. После игры счётчики likes/dislikes/times_played обновляются
4. Админ может деактивировать тему (is_active = false)
```

### Тема (создание внутри INACTIVE комнаты)

**Вариант A: AI-генерация**
```
1. Пользователь создаёт INACTIVE комнату → WebSocket room:create
2. Настраивает параметры → WebSocket room:update_params (опционально)
3. Запускает генерацию темы → WebSocket room:generate_theme
4. Тема генерируется и сохраняется в Redis с привязкой к room_id
5. Активирует комнату → WebSocket room:activate (статус INACTIVE → WAITING)
6. Игроки присоединяются, игра начинается
7. После завершения игры — оценка темы всеми игроками
```

**Вариант B: Загрузка JSON**
```
1. Пользователь создаёт INACTIVE комнату → WebSocket room:create
2. Настраивает параметры → WebSocket room:update_params (опционально)
3. Загружает тему из JSON → WebSocket room:upload_theme (80 вопросов)
4. Тема сохраняется в Redis с привязкой к room_id
5. Активирует комнату → WebSocket room:activate (статус INACTIVE → WAITING)
6. Игроки присоединяются, игра начинается
7. После завершения игры — оценка темы всеми игроками
```

### Сохранение темы после игры

```
1. Игра завершена
2. Всем игрокам показывается окно оценки темы
3. Каждый игрок может поставить: лайк, дизлайк или пропустить
4. Если хотя бы 1 лайк:
   - Тема сохраняется в PostgreSQL (is_active = true)
   - likes/dislikes счётчики устанавливаются по результатам голосования
5. Если 0 лайков (только дизлайки или пропуски):
   - Тема удаляется из Redis
6. Временная тема и вопросы удаляются из Redis в любом случае
```

### Удаление временных данных

| Событие | Действие |
|---------|----------|
| TTL истёк (1 час) | Комната и её тема удаляются автоматически (Redis TTL) |
| Последний игрок покинул комнату | Комната и её данные удаляются |
| Комната активирована (room:activate) | Статус INACTIVE → WAITING, тема остается в Redis, комната добавляется в public_rooms |
| Игра завершена | Временная тема удаляется, сохраняется в PostgreSQL если был лайк |
| Комната удалена без игры | Временная тема удаляется вместе с комнатой |

### Комната → Игра

```
1. Создаётся комната → room:{id} (Redis, status: inactive)
2. Владелец настраивает параметры → room:update_params
3. Владелец создаёт тему → room:upload_theme или room:generate_theme
4. Владелец активирует → room:activate (status: inactive → waiting)
5. Игроки присоединяются → room:{id}:players (Redis)
6. Создаётся чат комнаты → chat:room:{id} (Redis)
7. Владелец запускает игру (room:start):
   - active_games создаётся
   - game_cells, game_players создаются
   - Вопросы загружаются из temp_theme_questions или questions (PostgreSQL)
8. Игра завершается:
   - Данные сохраняются в games, game_players (PostgreSQL)
   - Статистика user_stats обновляется
   - Redis-данные удаляются (включая чат)
```

### Удаление игрока

```
1. Игрок не выбрал ячейку за основное время → is_extra_time = true
2. Игрок не выбрал ячейку за доп. время → game:player_removed
3. Все территории игрока становятся свободными (owner = null)
4. Игрок удаляется из очереди ходов (is_active = false)
5. Если остался 1 активный игрок → game:ended (last_standing)
```

### Отключение игрока

```
1. Игрок отключается → game:player_disconnected
2. Устанавливается reconnect_deadline (60 сек)
3. Если игрок переподключился → game:player_reconnected
4. Если deadline истёк → game:player_removed
```

---

## TTL политики (Redis)

| Ключ | TTL | Описание |
|------|-----|----------|
| `room:*` | 1 час | Комнаты удаляются при неактивности. TTL обновляется при join/leave/update. |
| `active_games:*` | 2 часа | Максимальная длительность игры |
| `game_chat:*` | 2 часа | Чат удаляется вместе с игрой |
| `user_session:*` | 24 часа | Сессии пользователей |
| `temp_theme:*` | 2 часа | Временная тема (привязана к комнате/игре) |
| `temp_theme_questions:*` | 2 часа | Вопросы временной темы |
| `temp_theme_votes:*` | 10 минут | Голоса за временную тему после игры |

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
    likes INT NOT NULL DEFAULT 0,
    dislikes INT NOT NULL DEFAULT 0,
    times_played INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);
CREATE INDEX idx_themes_popular ON themes(likes DESC, created_at DESC);
CREATE INDEX idx_themes_name ON themes(name);
CREATE INDEX idx_themes_active ON themes(is_active);
CREATE INDEX idx_themes_created_by ON themes(created_by);

-- Questions
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answers JSONB NOT NULL,
    correct_answer INT NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
    created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);
CREATE INDEX idx_questions_theme ON questions(theme_id);

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
CREATE TYPE game_end_reason AS ENUM ('conquest', 'last_standing', 'game_timer', 'forfeit');
CREATE TABLE games (
    id UUID PRIMARY KEY,
    theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
    theme_name VARCHAR(255) NOT NULL,
    players_count INT NOT NULL,
    time_per_question INT NOT NULL,
    time_per_turn INT NOT NULL,
    game_timer INT,
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

# AI-генерация вопросов

## Шаблон промпта

Файл: `src/modules/rooms/prompts/generate-questions.prompt.ts`

Промпт и константы генерации определены в коде. Вызывается через `room:generate_theme` в контексте INACTIVE комнаты.

## Параметры генерации

| Параметр | Значение |
|----------|----------|
| Всего вопросов | 80 |
| Размер батча | 20 |
| Количество запросов | 4 |
| Модель | GigaChat |

## Валидация ответа AI

После каждого запроса к AI проверять:
1. Ответ — валидный JSON
2. Массив `questions` содержит ровно `BATCH_SIZE` элементов
3. Каждый вопрос имеет:
    - `question` — непустая строка
    - `answers` — массив из 4 непустых строк
    - `correct_answer` — число от 0 до 3
4. Нет дублей вопросов (сравнение по тексту)

При ошибке валидации — retry (макс. 3 попытки), затем ошибка пользователю.

---

# Заметки

- При создании готовой комнаты (из списка «популярные») не происходит переход на страницу создания — сразу для админа создаётся блок комнаты на главной с кнопкой начала при наборе нужного кол-ва игроков
- Сохранённой комнате нельзя изменить параметры (её может удалить или изменить только админ сайта)
- Принятие приглашения в игру: пользователя переносит на главную страницу, в URL появляется параметр `room_id` активной комнаты, на странице появляется блок с комнатой