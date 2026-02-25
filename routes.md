# API Documentation

Полная документация всех HTTP эндпоинтов и WebSocket событий для фронтенда.

**Base URL:** `http://localhost:3000/api`
**WebSocket URL:** `ws://localhost:3000`

---

## Содержание

- [HTTP API](#http-api)
  - [Формат ответа](#формат-ответа)
  - [Auth](#auth)
  - [User](#user)
  - [Friends](#friends)
  - [Themes](#themes)
  - [Games](#games)
  - [Админ](#админ)
  - [Health](#health)
- [WebSocket API](#websocket-api)
  - [Подключение](#подключение)
  - [Rooms](#rooms-events)
  - [Game](#game-events)
  - [Chat](#chat-events)
  - [Notifications](#notifications-events)
  - [AI Generation](#ai-generation-events)
  - [Main Gateway](#main-gateway-events)
- [Типы данных](#типы-данных)
- [Коды ошибок](#коды-ошибок)

---

## HTTP API

Все эндпоинты (кроме помеченных `@Public`) требуют JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

### Формат ответа

Все HTTP-ответы оборачиваются `ResponseInterceptor`:
```typescript
{
  status: 'success';
  data: T;              // Данные эндпоинта
}
```

Пример: если эндпоинт возвращает `{ message: "ok" }`, HTTP-ответ будет:
```json
{
  "status": "success",
  "data": {
    "message": "ok"
  }
}
```

Ниже документированы только поля внутри `data`.

---

### Auth

Rate limit: 30 запросов / минуту для всех auth endpoints.

#### POST `/auth/register`
Регистрация нового пользователя.

**Публичный:** Да

**Request Body:**
```typescript
{
  email: string;      // Валидный email, макс. 255 символов
  name: string;       // 2-100 символов
  password: string;   // 8-72 символа, минимум 1 заглавная, 1 строчная, 1 цифра
}
```

**Response (201):**
```typescript
{
  user: {
    id: string;       // UUID
    email: string;
    name: string;
  };
  access_token: string;
}
```

**Cookies:**
- `refresh_token` (httpOnly, secure в production, sameSite: strict, path: /api/auth, maxAge: 7 дней)

**Ошибки:**
- `400` - Валидация не пройдена (невалидный email, пароль не соответствует требованиям, имя вне диапазона 2-100 символов)
- `409` - Email уже используется
- `429` - Превышен лимит запросов (30/мин)

---

#### POST `/auth/login`
Вход в систему.

**Публичный:** Да

**Request Body:**
```typescript
{
  email: string;      // Валидный email, макс. 255 символов
  password: string;
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
  };
  access_token: string;
}
```

**Cookies:**
- `refresh_token` (httpOnly, secure в production, sameSite: strict, path: /api/auth)

**Ошибки:**
- `400` - Валидация не пройдена (невалидный email, отсутствуют обязательные поля)
- `401` - Неверные учетные данные
- `429` - Превышен лимит запросов (30/мин)

---

#### POST `/auth/refresh`
Обновление access token по refresh token из cookie.

**Публичный:** Да

**Request:** Cookie с `refresh_token`

**Response (200):**
```typescript
{
  access_token: string;
}
```

**Cookies:**
- Новый `refresh_token` (ротация токенов)

**Ошибки:**
- `401` - Refresh token отсутствует, невалидный или истёкший
- `429` - Превышен лимит запросов (30/мин)

---

#### POST `/auth/logout`
Выход из системы.

**Публичный:** Да

**Response (200):**
```typescript
{
  message: "Logged out successfully"
}
```

**Cookies:**
- `refresh_token` очищается

**Ошибки:**
- `429` - Превышен лимит запросов (30/мин)

---

### User

#### GET `/user/init`
Получение начальных данных пользователя при загрузке приложения.

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    created_at: number;
  };
  pending_requests_count: number;
  active_room_id: string | null;
  active_game_id: string | null;
}
```

**Ошибки:**
- `401` - Отсутствует или невалидный JWT токен
- `404` - Пользователь не найден
- `429` - Превышен лимит запросов

---

#### GET `/user/profile`
Профиль текущего пользователя.

**Response (200):**
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: number;
  stats: {
    games_played: number;
    games_won: number;
    win_rate: number;
    total_territories_captured: number;
    total_questions_answered: number;
    total_correct_answers: number;
  };
}
```

**Ошибки:**
- `401` - Отсутствует или невалидный JWT токен
- `404` - Пользователь не найден
- `429` - Превышен лимит запросов

---

#### GET `/user/profile/:user_id`
Публичный профиль другого пользователя.

**Параметры:**
- `user_id` - UUID пользователя

**Response (200):**
```typescript
{
  id: string;
  name: string;
  created_at: number;
  stats: {
    games_played: number;
    games_won: number;
    win_rate: number;
    total_territories_captured: number;
    total_questions_answered: number;
    total_correct_answers: number;
  };
}
```

**Ошибки:**
- `400` - Невалидный UUID формат user_id
- `401` - Отсутствует или невалидный JWT токен
- `404` - Пользователь не найден
- `429` - Превышен лимит запросов

---

#### PUT `/user/profile`
Обновление профиля.

**Request Body:**
```typescript
{
  name?: string;      // 2-100 символов (опционально)
}
```

**Response (200):**
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: number;
  stats: {
    games_played: number;
    games_won: number;
    win_rate: number;
    total_territories_captured: number;
    total_questions_answered: number;
    total_correct_answers: number;
  };
}
```

**Ошибки:**
- `400` - Валидация не пройдена (невалидное имя)
- `401` - Отсутствует или невалидный JWT токен
- `429` - Превышен лимит запросов

---

#### GET `/user/search`
Поиск пользователей по имени. Текущий пользователь исключается из результатов.

**Query Parameters:**
```typescript
{
  query: string;      // 2-100 символов, обязательный
  limit?: number;     // 1-50, по умолчанию 20
  offset?: number;    // >= 0, по умолчанию 0
}
```

**Response (200):**
```typescript
{
  users: Array<{
    id: string;
    name: string;
    stats: {
      games_played: number;
      games_won: number;
    };
  }>;
  total: number;
}
```

**Ошибки:**
- `400` - Валидация не пройдена (невалидные query параметры)
- `401` - Отсутствует или невалидный JWT токен
- `429` - Превышен лимит запросов

---

### Friends

#### GET `/user/friends`
Список друзей текущего пользователя.

**Response (200):**
```typescript
Array<{
  id: string;
  name: string;
  stats: {
    games_played: number;
    games_won: number;
  };
  added_at: number;
}>
```

**Ошибки:**
- `401` - Отсутствует или невалидный JWT токен
- `429` - Превышен лимит запросов

---

#### GET `/user/friends/requests`
Входящие запросы в друзья.

**Response (200):**
```typescript
Array<{
  id: string;           // ID запроса
  from_user: {
    id: string;
    name: string;
  };
  created_at: number;
}>
```

**Ошибки:**
- `401` - Отсутствует или невалидный JWT токен
- `429` - Превышен лимит запросов

---

#### POST `/user/friends/request`
Отправить запрос в друзья. Отправляет WebSocket `notification` (type: `friend_request`) получателю.

**Request Body:**
```typescript
{
  user_id: string;    // UUID пользователя
}
```

**Response (201):**
```typescript
{
  request_id: string;
}
```

**Ошибки:**
- `400` - Нельзя отправить запрос самому себе / валидация не пройдена
- `401` - Отсутствует или невалидный JWT токен
- `404` - Пользователь не найден
- `409` - Уже друзья / запрос уже отправлен / этот пользователь уже отправил вам запрос
- `429` - Превышен лимит запросов

---

#### POST `/user/friends/accept`
Принять запрос в друзья. Отправляет WebSocket `notification` (type: `friend_accepted`) отправителю заявки.

**Request Body:**
```typescript
{
  request_id: string; // UUID запроса
}
```

**Response (200):**
```typescript
{
  message: "Friend request accepted"
}
```

**Ошибки:**
- `400` - Можно принимать только запросы, отправленные вам
- `401` - Отсутствует или невалидный JWT токен
- `404` - Запрос не найден
- `409` - Запрос уже обработан
- `429` - Превышен лимит запросов

---

#### POST `/user/friends/reject`
Отклонить запрос в друзья.

**Request Body:**
```typescript
{
  request_id: string; // UUID запроса
}
```

**Response (200):**
```typescript
{
  message: "Friend request rejected"
}
```

**Ошибки:**
- `400` - Можно отклонять только запросы, отправленные вам
- `401` - Отсутствует или невалидный JWT токен
- `404` - Запрос не найден
- `409` - Запрос уже обработан
- `429` - Превышен лимит запросов

---

#### DELETE `/user/friends/:user_id`
Удалить из друзей.

**Параметры:**
- `user_id` - UUID друга

**Response (200):**
```typescript
{
  message: "Friend removed"
}
```

**Ошибки:**
- `400` - Невалидный UUID формат user_id
- `401` - Отсутствует или невалидный JWT токен
- `404` - Дружба не найдена
- `429` - Превышен лимит запросов

---

### Themes

#### GET `/themes/popular`
Список тем с пагинацией, поиском и фильтрацией.

**Query Parameters:**
```typescript
{
  q?: string;              // Строка поиска (опционально)
  difficulty?: 'easy' | 'medium' | 'hard';  // Фильтр по сложности
  sort?: 'popular' | 'recent' | 'played';   // Сортировка, по умолчанию 'popular'
  page?: number;           // Номер страницы, по умолчанию 1
  size?: number;           // 1-50, по умолчанию 10
}
```

**Response (200):**
```typescript
{
  themes: Array<{
    id: string;
    name: string;
    description: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    likes: number;
    dislikes: number;
    times_played: number;
    questions_count: number;
    created_by: {
      user_id: string;
      name: string;
    } | null;
    created_at: number;
  }>;
  pagination: {
    page: number;
    size: number;
    total_pages: number;
    total_items: number;
  };
}
```

**Ошибки:**
- `400` - Валидация не пройдена (невалидные query параметры)
- `401` - Отсутствует или невалидный JWT токен
- `429` - Превышен лимит запросов

---

#### GET `/themes/:theme_id`
Детальная информация о теме.

**Параметры:**
- `theme_id` - UUID темы

**Response (200):**
```typescript
{
  id: string;
  name: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  likes: number;
  dislikes: number;
  times_played: number;
  questions_count: number;
  created_by: {
    user_id: string;
    name: string;
  } | null;
  created_at: number;
}
```

**Ошибки:**
- `400` - Невалидный UUID формат theme_id
- `401` - Отсутствует или невалидный JWT токен
- `404` - Тема не найдена
- `429` - Превышен лимит запросов

---

#### POST `/themes/:theme_id/rate`
Оценить постоянную тему после игры.

**Параметры:**
- `theme_id` - UUID темы

**Request Body:**
```typescript
{
  game_id: string;         // UUID игры (обязательно)
  rating: 'like' | 'dislike';
  difficulty_rating: 'easy' | 'medium' | 'hard';
}
```

**Response (200):**
```typescript
{
  success: true
}
```

**Ошибки:**
- `400` - Невалидный UUID формат theme_id / валидация не пройдена
- `401` - Отсутствует или невалидный JWT токен
- `404` - Тема не найдена
- `429` - Превышен лимит запросов

---

### Games

#### POST `/games/:game_id/rate-temp-theme`
Оценить временную тему после игры. Используется для тем, созданных через AI или вручную.

**Параметры:**
- `game_id` - UUID игры

**Request Body:**
```typescript
{
  rating: 'like' | 'dislike' | 'skip';
  difficulty_rating?: 'easy' | 'medium' | 'hard';
}
```

**Response (200):**
```typescript
{
  success: true;
  theme_saved: boolean;    // true если тема сохранена (получила первый лайк)
  theme_id: string | null; // ID сохранённой темы (только если theme_saved=true)
}
```

> Сервер собирает оценки от всех игроков. Если хотя бы 1 лайк → тема сохраняется в PostgreSQL.

**Ошибки:**
- `400` - Невалидный UUID / валидация не пройдена
- `401` - Отсутствует или невалидный JWT токен
- `404` - Игра не найдена / не временная тема
- `409` - Уже проголосовали
- `429` - Превышен лимит запросов

---

### Админ

#### POST `/themes/admin/create`
Создание темы админом (сразу в PostgreSQL).

**Request Body:**
```typescript
{
  name: string;                 // 2-255 символов
  description?: string;         // До 1000 символов
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Array<{            // 50-100 вопросов
    question: string;
    answers: string[];
    correct_answer: number;
  }>;
}
```

**Response (201):**
```typescript
{
  theme_id: string;
  name: string;
  questions_count: number;
}
```

> Требуется роль админа. Тема сразу сохраняется с `is_active=true`.

**Ошибки:**
- `400` - Валидация не пройдена
- `401` - Отсутствует или невалидный JWT токен
- `403` - Требуется роль админа
- `429` - Превышен лимит запросов

---

### Health

#### GET `/health`
Проверка состояния сервера.

**Публичный:** Да

**Response (200):**
```typescript
{
  status: "ok";
  timestamp: number;
}
```

---

## WebSocket API

### Подключение

**URL:** `ws://localhost:3000`
**Namespace:** `/`

**Аутентификация:**
```typescript
const socket = io('ws://localhost:3000', {
  auth: {
    token: accessToken  // JWT access token
  },
  transports: ['websocket']
});
```

**События подключения:**
- `connect` - Успешное подключение. Сервер автоматически подписывает сокет на персональную комнату `user:{userId}`, нотифицирует онлайн-друзей (`friend:online`).
- `connect_error` - Ошибка подключения (неверный/истёкший токен)
- `disconnect` - Отключение. Сервер нотифицирует друзей (`friend:offline`), очищает сессию.

**Поведение при disconnect (комнаты):**
- **Владелец** комнаты (INACTIVE или WAITING): остаётся в комнате, может переподключиться через `room:get_state`
- **Обычный игрок** в WAITING комнате: удаляется из комнаты, остальные получают `room:player_left` с `disconnected: true`
- **В игре**: отдельная reconnect-логика с `reconnect_deadline` (60 сек)

---

### Rooms Events

#### `room:create` (emit)
Создание INACTIVE комнаты (без темы). Тема добавляется позже через `room:upload_theme` или `room:generate_theme`.
Все поля опциональны — можно отправить пустой объект `{}`, будут использованы значения по умолчанию.

> **Flow создания комнаты с временной темой:**
> 1. `room:create` - создать INACTIVE комнату (пустой payload или частичное переопределение)
> 2. `room:update_params` - (опционально) настроить параметры
> 3. `room:generate_theme` (AI) или `room:upload_theme` (JSON) - создать тему в комнате
> 4. `room:activate` - активировать комнату для присоединения игроков

**Данные:**
```typescript
{
  players_count?: number;      // 2-4, по умолчанию 2
  time_per_question?: number;  // 10-45 секунд, по умолчанию 20
  time_per_turn?: number;      // 15-60 секунд, по умолчанию 30
  extra_time_per_turn?: number;// 10-30 секунд, по умолчанию 15
  game_timer?: number | null;  // 600-3600 (секунды), null = без ограничения, по умолчанию null
  is_private?: boolean;        // по умолчанию false
}
```

> **Примечание:** Тема не передаётся при создании. Комната создаётся со статусом `inactive`, `theme` равен `null`.

**Ответ (room:created):** RoomState (полное состояние комнаты со статусом `inactive`)

> **Если пользователь уже в комнате:** старая комната полностью удаляется (вместе с темой и вопросами), другие игроки получают `room:kicked` с причиной `"Room was deleted by owner"`, и создаётся новая комната.

**Ошибки (room:error):**
- `VALIDATION_ERROR` - Невалидные данные

---

#### `room:join` (emit)
Присоединение к комнате.

**Данные (один из вариантов):**
```typescript
{
  room_id?: string;           // UUID комнаты
  invite_code?: string;       // 6 символов
}
```

**Ответ (room:state):** RoomState

**Broadcast (room:player_joined):**
```typescript
{
  player: {
    user_id: string;
    name: string;
    color: string;
    is_ready: boolean;
  };
  current_players: number;
  status: 'waiting' | 'ready';
}
```

**Ошибки (room:error):**
- `ALREADY_IN_ROOM` - Вы уже находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `ROOM_FULL` - Комната заполнена
- `ROOM_INACTIVE` - Комната в статусе inactive, владелец ещё не активировал
- `INVALID_STATUS` - Комната не принимает игроков
- `VALIDATION_ERROR` - Невалидные данные

---

#### `room:leave` (emit)
Покинуть комнату.

**Данные:** нет

**Ответ (room:left):**
```typescript
{
  success: true
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате

**Broadcast (room:player_left):**
```typescript
{
  user_id: string;
  name: string | null;        // Имя покинувшего игрока
  new_owner_id?: string;      // Если владелец сменился
  kicked: boolean;
  disconnected: boolean;
}
```

---

#### `room:kick` (emit)
Выгнать игрока (только владелец).

**Данные:**
```typescript
{
  user_id: string;            // UUID игрока
}
```

**Ответ (room:kick_success):**
```typescript
{
  success: true
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может выгонять игроков
- `CANNOT_KICK_SELF` - Нельзя выгнать самого себя
- `PLAYER_NOT_IN_ROOM` - Игрок не находится в этой комнате

---

#### `room:ready` (emit)
Переключить готовность.

**Данные:** нет

**Ответ (room:ready_toggled):**
```typescript
{
  is_ready: boolean
}
```

**Broadcast (room:player_ready):**
```typescript
{
  user_id: string;
  is_ready: boolean;
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена

---

#### `room:update_params` (emit)
Обновить параметры комнаты (только владелец, только для INACTIVE комнат).

**Данные:**
```typescript
{
  players_count?: number;        // 2-4
  time_per_question?: number;    // 10-45 секунд
  time_per_turn?: number;        // 15-60 секунд
  extra_time_per_turn?: number;  // 10-30 секунд
  game_timer?: number | null;    // 600-3600 секунд или null
  is_private?: boolean;
}
```

**Ответ (room:state):** RoomState

**Broadcast (room:params_updated):**
```typescript
{
  params: {
    players_count: number;
    time_per_question: number;
    time_per_turn: number;
    extra_time_per_turn: number;
    game_timer: number | null;
    is_private: boolean;
  }
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может изменять параметры
- `ROOM_ALREADY_ACTIVE` - Параметры можно изменять только для неактивных комнат

---

#### `room:generate_theme` (emit)
Сгенерировать тему через AI (только владелец, только для INACTIVE комнат).

**Данные:**
```typescript
{
  theme_name: string;            // 2-255 символов
}
```

**Ответ (room:theme_generation_started):**
```typescript
{
  room_id: string;
  generation_started: boolean;
  theme_name: string;
}
```

**Broadcast (room:theme_generation_started):**
```typescript
{
  theme_name: string;
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может генерировать тему
- `ROOM_ALREADY_ACTIVE` - Тему можно создать только для неактивных комнат
- `THEME_EXISTS` - В комнате уже есть тема

---

#### `room:upload_theme` (emit)
Загрузить тему из JSON (только владелец, только для INACTIVE комнат).

**Данные:**
```typescript
{
  theme_name: string;            // 2-255 символов
  questions: Array<{             // Ровно 80 вопросов
    question: string;            // 1-1000 символов
    answers: string[];           // Ровно 4 варианта ответа
    correct_answer: number;      // 0-3
  }>;
}
```

**Ответ (room:state):** RoomState

**Broadcast (room:theme_uploaded):**
```typescript
{
  theme_name: string;
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может загружать тему
- `ROOM_ALREADY_ACTIVE` - Тему можно создать только для неактивных комнат
- `THEME_EXISTS` - В комнате уже есть тема
- `INVALID_QUESTIONS_COUNT` - Тема должна содержать ровно 80 вопросов

---

#### `room:get_prompt` (emit)
Получить промпт для ручной генерации через свой AI (только владелец, только для INACTIVE комнат).

> **Важно:** `theme_name` и `upload_method: 'manual'` сохраняются в комнату сразу при вызове. Это позволяет не передавать `theme_name` повторно в `room:upload_theme_raw`. Для смены названия — `room:clear_uploaded_questions`, затем `room:get_prompt` с новым названием.

**Данные:**
```typescript
{
  theme_name: string;            // 2-255 символов
}
```

**Ответ (room:prompt):**
```typescript
{
  prompt: string;                // Готовый промпт для вставки в AI
  theme_name: string;            // Сохранённое название темы
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может получить промпт
- `ROOM_ALREADY_ACTIVE` - Промпт можно получить только для неактивных комнат

---

#### `room:upload_theme_raw` (emit)
Загрузить вопросы (только владелец, только для INACTIVE комнат). Поддерживает накопление вопросов порциями.

> **Flow ручной загрузки через свой AI:**
> 1. `room:get_prompt` - получить промпт для нужной темы (название темы сохраняется автоматически)
> 2. Пользователь копирует промпт → вставляет в свой AI → копирует ответ
> 3. `room:upload_theme_raw` - загрузить ответ AI (`theme_name` уже сохранён на шаге 1)
> 4. Если `is_complete: false` — повторить шаги 2-3 (вопросы накапливаются)
> 5. Когда `is_complete: true` — `room:activate`

**Данные:**
```typescript
{
  theme_name?: string;           // 2-255 символов, опционально (уже сохранён через room:get_prompt)
  raw_text: string | object;     // Строка (сырой ответ AI, мин. 10 символов) или JSON-объект (например {questions: [...]})
}
```

**Ответ (room:theme_raw_uploaded):**
```typescript
{
  loaded: number;                // Общее количество загруженных вопросов
  total: number;                 // Необходимое количество (80)
  invalid_count: number;         // Невалидных вопросов в этой порции
  is_complete: boolean;          // true если набрано >= 80, тема готова
}
```

**Broadcast (room:theme_progress):**
```typescript
{
  loaded: number;
  total: number;
  is_complete: boolean;
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может загружать тему
- `ROOM_ALREADY_ACTIVE` - Тему можно загрузить только для неактивных комнат
- `INVALID_FORMAT` - Не удалось извлечь валидные вопросы из текста
- `THEME_NAME_REQUIRED` - theme_name обязателен, если не был задан через `room:get_prompt` ранее

---

#### `room:clear_uploaded_questions` (emit)
Очистить накопленные вопросы для начала заново (только владелец, только для INACTIVE комнат).

**Данные:** нет

**Ответ (room:state):** RoomState

**Broadcast (room:theme_deleted):**
```typescript
{
  theme_name: null;
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может очищать вопросы
- `ROOM_ALREADY_ACTIVE` - Нельзя очистить вопросы активной комнаты
- `NO_THEME` - В комнате нет темы

---

#### `room:activate` (emit)
Активировать комнату (только владелец, только для INACTIVE комнат с темой).

**Данные:** нет

**Ответ (room:state):** RoomState

**Broadcast (room:activated):**
```typescript
{
  status: 'waiting';
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может активировать ее
- `ROOM_NOT_INACTIVE` - Комната не в статусе inactive
- `NO_THEME` - Необходимо создать тему перед активацией
- `INVALID_QUESTIONS_COUNT` - Тема должна содержать ровно 80 вопросов

---

#### `room:delete_theme` (emit)
Удалить тему из комнаты (только владелец, только для INACTIVE комнат).

**Данные:** нет

**Ответ (room:state):** RoomState

**Broadcast (room:theme_deleted):**
```typescript
{
  theme_name: null;
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может удалять тему
- `ROOM_ALREADY_ACTIVE` - Нельзя удалить тему из активной комнаты
- `NO_THEME` - В комнате нет темы

---

#### `room:deactivate` (emit)
Деактивировать комнату (только владелец, только для WAITING комнат).

**Данные:** нет

**Ответ (room:state):** RoomState

**Broadcast (room:deactivated):**
```typescript
{
  status: 'inactive';
}
```

**Действия:**
- Статус меняется WAITING → INACTIVE
- Все игроки кроме владельца удаляются из комнаты
- Удаленные игроки получают событие `room:kicked` с причиной "Room was deactivated by owner"
- Комната удаляется из публичного списка

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может деактивировать ее
- `ROOM_NOT_ACTIVE` - Комната не активна

---

#### `room:get_state` (emit)
Получить текущее состояние комнаты (для переподключения).

**Данные:** нет

**Ответ (room:state):** RoomState

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена

> Используется при переподключении клиента для восстановления состояния комнаты.
> Сначала клиент получает active_room_id из init endpoint, затем вызывает room:get_state.
> При вызове сокет автоматически подключается к Socket.IO комнате, что необходимо для получения broadcast-событий после перезагрузки страницы.

---

#### `room:start` (emit)
Начать игру (только владелец, все должны быть готовы).

**Данные:** нет

**Ответ (game:starting):**
```typescript
{
  room: RoomState
}
```

**Ошибки (room:error):**
- `NOT_IN_ROOM` - Вы не находитесь в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `NOT_OWNER` - Только владелец комнаты может начать игру
- `PLAYERS_NOT_READY` - Не все игроки готовы
- `NOT_ENOUGH_PLAYERS` - Нужно минимум 2 игрока для начала

После этого придёт событие `game:started`.

---

#### `rooms:subscribe` (emit)
Подписаться на обновления лобби (список публичных комнат).

**Данные:** нет

**Ответ (rooms:list):**
```typescript
Array<{
  id: string;
  owner_name: string;
  theme_name: string | null;
  players_count: number;      // Максимум игроков
  current_players: number;    // Текущее количество
  players: Array<{
    user_id: string;
    name: string;
  }>;
}>
```

> Возвращает только WAITING, не заполненные комнаты (макс. 50).
> Событие `rooms:list` также приходит при изменении списка комнат.

---

#### `rooms:unsubscribe` (emit)
Отписаться от обновлений лобби.

**Данные:** нет

**Ответ (rooms:unsubscribed):**
```typescript
{
  success: true
}
```

---

### Game Events

#### `game:started` (listen)
Игра началась.

**Данные:**
```typescript
{
  game_id: string;
  theme_id: string | null;    // null для временных тем
  theme_name: string;
  is_temp_theme: boolean;     // true если тема временная
  players: Array<{
    user_id: string;
    name: string;
    color: string;
    player_index: number;
    is_connected: boolean;
    extra_time_remaining: number;
    territories_count: number;
    questions_answered: number;
    correct_answers: number;
  }>;
  cells: Array<{
    q: number;                // Координата колонки (axial)
    r: number;                // Координата строки (axial)
    owner_id: string | null;
    player_index: number | null;
    is_base: boolean;
  }>;
  config: {
    time_per_question: number;
    time_per_turn: number;
    extra_time_per_turn: number;
    game_timer: number | null;
  };
  player_order: number[];     // Порядок ходов
  game_timer_ends_at: number | null;  // Unix timestamp
}
```

---

#### `game:turn` (listen)
Начало хода игрока.

**Данные:**
```typescript
{
  turn_number: number;
  current_player_index: number;
  available_moves: Array<{ q: number; r: number }>;
  time_limit: number;         // Миллисекунды
  extra_time_remaining: number;
  started_at: number;         // Unix timestamp
}
```

---

#### `game:select_cell` (emit)
Выбор клетки для захвата/атаки.

**Данные:**
```typescript
{
  q: number;                  // Координата колонки
  r: number;                  // Координата строки
}
```

**Ответ (game:cell_selected):**
```typescript
{
  q: number;
  r: number;
}
```

**Ошибки (game:error):**
- `NOT_IN_GAME` - Вы не участвуете в игре
- `GAME_NOT_FOUND` - Игра не найдена
- `INVALID_PHASE` - Не фаза выбора клетки
- `NO_ACTIVE_TURN` - Нет активного хода
- `NOT_YOUR_TURN` - Сейчас не ваш ход
- `INVALID_MOVE` - Недопустимый выбор клетки
- `CELL_NOT_FOUND` - Клетка не найдена
- `NO_QUESTIONS` - Нет доступных вопросов

После выбора придёт событие `game:question`.

---

#### `game:question` (listen)
Вопрос для игрока(ов).

**Данные:**
```typescript
{
  question_id: string;
  question: string;
  answers: string[];          // 4 варианта ответа
  time_limit: number;         // Миллисекунды
  started_at: number;         // Unix timestamp
  target_cell: { q: number; r: number };
  is_battle: boolean;         // true = сражение с другим игроком
  defender_index: number | null;  // Индекс защитника при сражении
}
```

---

#### `game:answer` (emit)
Ответ на вопрос.

**Данные:**
```typescript
{
  answer_index: number;       // 0-3
}
```

**Ответ (game:answer_submitted):**
```typescript
{
  resolved: boolean;          // true = результат готов
  waiting_for_opponent?: boolean;  // true = ожидание ответа соперника
}
```

**Ошибки (game:error):**
- `NOT_IN_GAME` - Вы не участвуете в игре
- `GAME_NOT_FOUND` - Игра не найдена
- `INVALID_PHASE` - Не фаза вопроса
- `NO_ACTIVE_QUESTION` - Нет активного вопроса
- `PLAYER_NOT_FOUND` - Игрок не найден
- `INVALID_ANSWER` - Невалидный индекс ответа
- `NOT_IN_BATTLE` - Вы не участвуете в этом сражении
- `ALREADY_ANSWERED` - Вы уже ответили
- `NOT_YOUR_TURN` - Сейчас не ваш ход
- `NO_QUESTION` - Вопрос не найден
- `NO_BATTLE_DATA` - Данные сражения не найдены

После ответов всех участников придёт событие `game:answer_result`.

---

#### `game:answer_result` (listen)
Результат хода.

**Данные:**
```typescript
{
  turn_number: number;
  result: {
    type: 'solo_capture' | 'battle_won' | 'battle_lost' | 'battle_draw' | 'timeout' | 'skip';
    turn_number: number;
    player_index: number;
    cell: { q: number; r: number } | null;
    question_id?: string;
    player_answer?: PlayerAnswer;
    defender_answer?: PlayerAnswer;
    cell_captured: boolean;
    cell_owner_changed_from: number | null;
  };
  updated_cells: Array<HexCell>;
  updated_players: Array<GamePlayer>;
}
```

---

#### `game:forfeit` (emit)
Сдаться.

**Данные:** нет

**Ответ (game:forfeited):**
```typescript
{
  success: true
}
```

**Ошибки (game:error):**
- `NOT_IN_GAME` - Вы не участвуете в игре
- `GAME_ENDED` - Игра уже завершена
- `PLAYER_NOT_FOUND` - Игрок не найден

После этого придёт событие `game:ended` всем игрокам.

---

#### `game:reconnect` (emit)
Переподключение к активной игре.

**Данные:** нет

**Ответ (game:state):**
```typescript
{
  phase: 'starting' | 'waiting_turn' | 'question_phase' | 'turn_result' | 'finished';
  players: GamePlayer[];
  cells: HexCell[];
  current_turn: TurnState | null;
  game_timer_ends_at: number | null;
}
```

**Ошибки (game:error):**
- `NOT_IN_GAME` - Вы не участвуете в игре
- `GAME_NOT_FOUND` - Игра не найдена

---

#### `game:state` (emit)
Запросить текущее состояние игры.

**Данные:** нет

**Ответ (game:state):** GameStatePayload (см. выше)

**Ошибки (game:error):**
- `NOT_IN_GAME` - Вы не участвуете в игре
- `GAME_NOT_FOUND` - Игра не найдена

---

#### `game:ended` (listen)
Игра завершена.

**Данные:**
```typescript
{
  end_reason: 'conquest' | 'last_standing' | 'game_timer' | 'forfeit';
  winner_index: number | null;
  winner_name: string | null;
  final_standings: Array<{
    player_index: number;
    user_id: string;
    name: string;
    place: number;            // 1, 2, 3, 4
    territories: number;
    questions_answered: number;
    correct_answers: number;
  }>;
  game_duration: number;      // Миллисекунды
  theme_id: string | null;    // null для временных тем
  theme_name: string;
  is_temp_theme: boolean;     // true если тема временная
}
```

> Если `is_temp_theme=true`, клиент должен показать окно оценки темы.
> Оценка отправляется через `POST /games/:game_id/rate-temp-theme`.
> От оценок зависит будет ли тема сохранена (нужен хотя бы 1 лайк).

---

#### `game:player_disconnected` (listen)
Игрок отключился.

**Данные:**
```typescript
{
  user_id: string;
  player_index: number;
  name: string;
}
```

---

#### `game:player_reconnected` (listen)
Игрок переподключился.

**Данные:**
```typescript
{
  user_id: string;
  player_index: number;
  name: string;
}
```

---

#### `game:player_forfeited` (listen)
Игрок сдался.

**Данные:**
```typescript
{
  user_id: string;
  player_index: number;
  name: string;
  updated_cells: HexCell[];
}
```

---

### Chat Events

#### `chat:send` (emit)
Отправить сообщение в чат комнаты или игры.

**Данные:**
```typescript
{
  room_id?: string;           // UUID комнаты
  game_id?: string;           // UUID игры
  content: string;            // 1-500 символов
}
```

**Ответ (chat:sent):**
```typescript
{
  id: string;
  type: 'user';
  user_id: string;
  user_name: string;
  content: string;
  room_id?: string;
  game_id?: string;
  timestamp: number;
}
```

**Broadcast (chat:message):** ChatMessage (см. типы данных)

**Ошибки (chat:error):**
- `USER_NOT_FOUND` - Пользователь не найден
- `NOT_IN_ROOM` - Вы не находитесь в этой комнате
- `NOT_IN_GAME` - Вы не участвуете в этой игре
- `INVALID_TARGET` - Необходимо указать room_id или game_id
- `SEND_FAILED` - Не удалось отправить сообщение
- `VALIDATION_ERROR` - Невалидные данные

---

#### `chat:history` (emit)
Получить историю сообщений.

**Данные:**
```typescript
{
  room_id?: string;           // UUID комнаты
  game_id?: string;           // UUID игры
  limit?: number;             // 1-100
}
```

**Ответ (chat:history):**
```typescript
Array<ChatMessage>
```

**Ошибки (chat:error):**
- `NOT_IN_ROOM` - Вы не находитесь в этой комнате
- `NOT_IN_GAME` - Вы не участвуете в этой игре
- `INVALID_TARGET` - Необходимо указать room_id или game_id
- `HISTORY_FAILED` - Не удалось получить историю сообщений
- `VALIDATION_ERROR` - Невалидные данные

---

#### `chat:message` (listen)
Новое сообщение в чате (пользовательское или системное).

**Данные:** ChatMessage (см. типы данных)

---

### Notifications Events

#### `notification` (listen)
Уведомление. Приходит в персональную комнату `user:{userId}`.

**Данные:**
```typescript
{
  id: string;
  type: 'friend_request'
      | 'friend_accepted'
      | 'game_invite'
      | 'game_invite_accepted'
      | 'game_invite_rejected'
      | 'game_invite_expired';
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  data?: {
    // friend_request:
    request_id?: string;
    // game_invite:
    invite_id?: string;
    room_id?: string;
    room_name?: string;
    theme_name?: string;
    players_count?: number;
    current_players?: number;
    expires_at?: number;
  };
  timestamp: number;
}
```

---

#### `friend:invite_to_room` (emit)
Пригласить друга в комнату.

**Данные:**
```typescript
{
  friend_user_id: string;     // UUID друга
}
```

**Ответ (friend:invite_sent):**
```typescript
{
  success: true;
  invite_id: string;
}
```

**Ошибки (friend:invite_error):**
- `USER_NOT_FOUND` - Пользователь не найден
- `NOT_IN_ROOM` - Отправитель не в комнате
- `ROOM_NOT_FOUND` - Комната не найдена
- `ROOM_FULL` - Комната заполнена
- `NOT_FRIENDS` - Не друзья
- `USER_BUSY` - Пользователь уже в комнате
- `USER_OFFLINE` - Пользователь офлайн
- `INVITE_EXISTS` - Приглашение уже отправлено
- `INVITE_FAILED` - Не удалось отправить приглашение

---

#### `friend:accept_invite` (emit)
Принять приглашение.

**Данные:**
```typescript
{
  invite_id: string;
}
```

**Ответ (friend:invite_accepted):**
```typescript
{
  success: true;
  room_id: string;
}
```

**Ошибки (friend:invite_error):**
- `INVITE_NOT_FOUND` - Приглашение не найдено или истекло
- `ROOM_NOT_FOUND` - Комната больше не существует
- `ROOM_FULL` - Комната уже заполнена
- `ACCEPT_FAILED` - Не удалось принять приглашение

После принятия нужно подключиться к комнате через `room:join`.

---

#### `friend:reject_invite` (emit)
Отклонить приглашение.

**Данные:**
```typescript
{
  invite_id: string;
}
```

**Ответ (friend:invite_rejected):**
```typescript
{
  success: true
}
```

**Ошибки (friend:invite_error):**
- `INVITE_NOT_FOUND` - Приглашение не найдено
- `REJECT_FAILED` - Не удалось отклонить приглашение

---

#### `friend:get_invites` (emit)
Получить список активных приглашений.

**Данные:** нет

**Ответ (friend:invites_list):**
```typescript
Array<{
  id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  room_id: string;
  room_name: string;
  theme_name: string;
  players_count: number;
  current_players: number;
  created_at: number;
  expires_at: number;
}>
```

---

#### `friend:online` (listen)
Друг онлайн.

**Данные:**
```typescript
{
  user_id: string;
  name: string | null;
  timestamp: number;
}
```

---

#### `friend:offline` (listen)
Друг офлайн.

**Данные:**
```typescript
{
  user_id: string;
  name: string | null;
  timestamp: number;
}
```

---

### AI Generation Events

События для отслеживания прогресса генерации темы через AI внутри комнаты.
Отправляются владельцу комнаты после вызова `room:generate_theme`.

#### `ai:progress` (listen)
Прогресс генерации (отправляется после каждого батча из 20 вопросов).

**Данные:**
```typescript
{
  session_id: string;
  status: 'generating';
  progress: {
    generated: number;      // 20, 40, 60...
    total: 80;
  };
}
```

---

#### `ai:ready` (listen)
Генерация завершена успешно.

**Данные:**
```typescript
{
  session_id: string;
  status: 'ready';
  progress: {
    generated: 80;
    total: 80;
  };
}
```

> После этого события генерация завершена, тема привязана к комнате.

---

#### `ai:error` (listen)
Ошибка при генерации.

**Данные:**
```typescript
{
  session_id: string;
  status: 'error';
  error: string;
  progress: {
    generated: number;      // Сколько успели сгенерировать
    total: 80;
  };
}
```

> При ошибке частично сгенерированные вопросы удаляются.

---

### Main Gateway Events

#### `ping` (emit)
Проверка связи.

**Данные:** нет

**Ответ (pong):**
```typescript
{
  timestamp: number;
}
```

---

## Типы данных

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  room_id?: string;
  game_id?: string;
  user_id: string | null;       // null для системных
  user_name: string | null;     // null для системных
  content: string;
  system_type?: 'player_joined' | 'player_left' | 'player_kicked'
          | 'game_starting' | 'game_started' | 'game_ended'
          | 'player_disconnected' | 'player_reconnected' | 'player_forfeited';
  timestamp: number;
}
```

### HexCell
```typescript
interface HexCell {
  q: number;                  // Координата колонки (axial)
  r: number;                  // Координата строки (axial)
  owner_id: string | null;    // UUID владельца или null (нейтральная)
  player_index: number | null;// Индекс игрока (0-3) или null
  is_base: boolean;           // База игрока
}
```

### GamePlayer
```typescript
interface GamePlayer {
  user_id: string;
  name: string;
  color: string;              // HEX цвет
  player_index: number;       // 0-3
  is_connected: boolean;
  extra_time_remaining: number; // Миллисекунды
  territories_count: number;
  questions_answered: number;
  correct_answers: number;
}
```

### PlayerAnswer
```typescript
interface PlayerAnswer {
  user_id: string;
  player_index: number;
  answer_index: number;       // 0-3
  answered_at: number;        // Unix timestamp
  is_correct: boolean;
  response_time: number;      // Миллисекунды
}
```

### ThemeInfo
```typescript
interface ThemeInfo {
  name: string;                              // Название темы
  upload_method: 'manual' | 'ai' | null;    // Способ загрузки темы
  questions_loaded: number;                  // Количество загруженных вопросов (0-80)
  questions_total: number;                   // Необходимое количество (80)
}
```

### RoomState
```typescript
interface RoomState {
  id: string;
  owner_id: string;
  players_count: number;
  time_per_question: number;
  time_per_turn: number;
  extra_time_per_turn: number;
  game_timer: number | null;
  is_private: boolean;
  invite_code: string;
  status: 'inactive' | 'waiting' | 'ready';
  created_at: number;
  players: RoomPlayer[];
  theme: ThemeInfo | null;    // null пока тема не создана
}
```

> **Статусы:**
> - `inactive` — комната в режиме настройки (создание темы, параметры). Нельзя присоединиться.
> - `waiting` — активная комната, принимает игроков.
> - `ready` — зарезервировано (не используется).
>
> **theme.upload_method:**
> - `'manual'` — тема загружена вручную (через `room:get_prompt` + `room:upload_theme_raw` или `room:upload_theme`)
> - `'ai'` — тема сгенерирована через AI (через `room:generate_theme`)
> - `null` — способ ещё не определён

### RoomPlayer
```typescript
interface RoomPlayer {
  user_id: string;
  name: string;
  color: string;
  is_ready: boolean;
}
```

---

## Коды ошибок

### HTTP ошибки
| Код | Описание |
|-----|----------|
| 400 | Bad Request - Ошибка валидации |
| 401 | Unauthorized - Отсутствует или невалидный токен |
| 403 | Forbidden - Нет прав доступа |
| 404 | Not Found - Ресурс не найден |
| 409 | Conflict - Конфликт (например, email уже существует) |
| 429 | Too Many Requests - Превышен лимит запросов |
| 500 | Internal Server Error - Внутренняя ошибка сервера |

### WebSocket ошибки (коды в ответах)
| Код | Описание |
|-----|----------|
| `UNAUTHORIZED` | Не авторизован |
| `VALIDATION_ERROR` | Невалидные данные |
| `USER_NOT_FOUND` | Пользователь не найден |
| `THEME_NOT_FOUND` | Тема не найдена |
| `THEME_EXISTS` | В комнате уже есть тема |
| `NO_THEME` | В комнате нет темы |
| `INVALID_QUESTIONS_COUNT` | Тема должна содержать ровно 80 вопросов |
| `INVALID_FORMAT` | Не удалось извлечь валидные вопросы из текста |
| `THEME_NAME_REQUIRED` | theme_name обязателен, если не был задан через `room:get_prompt` |
| `INVALID_PLAYERS_COUNT` | Тема поддерживает другое количество игроков |
| `ROOM_NOT_FOUND` | Комната не найдена |
| `ROOM_FULL` | Комната заполнена |
| `ROOM_INACTIVE` | Комната в статусе inactive, владелец ещё не активировал |
| `ROOM_NOT_INACTIVE` | Комната не в статусе inactive |
| `ROOM_NOT_ACTIVE` | Комната не в статусе waiting |
| `ROOM_ALREADY_ACTIVE` | Действие разрешено только для inactive комнат |
| `ALREADY_IN_ROOM` | Уже в комнате (только для `room:join`; `room:create` автоматически удаляет старую комнату) |
| `NOT_IN_ROOM` | Не в комнате |
| `NOT_OWNER` | Не владелец комнаты |
| `INVALID_STATUS` | Комната не принимает игроков |
| `CANNOT_KICK_SELF` | Нельзя выгнать самого себя |
| `PLAYER_NOT_IN_ROOM` | Игрок не в комнате |
| `PLAYERS_NOT_READY` | Не все игроки готовы |
| `NOT_ENOUGH_PLAYERS` | Недостаточно игроков |
| `GAME_NOT_FOUND` | Игра не найдена |
| `GAME_START_FAILED` | Не удалось запустить игру |
| `GAME_ENDED` | Игра уже завершена |
| `NOT_IN_GAME` | Не в игре |
| `NOT_YOUR_TURN` | Не ваш ход |
| `INVALID_PHASE` | Неверная фаза игры |
| `NO_ACTIVE_TURN` | Нет активного хода |
| `NO_ACTIVE_QUESTION` | Нет активного вопроса |
| `INVALID_MOVE` | Недопустимый ход |
| `CELL_NOT_FOUND` | Клетка не найдена |
| `NO_QUESTIONS` | Нет доступных вопросов |
| `PLAYER_NOT_FOUND` | Игрок не найден |
| `INVALID_ANSWER` | Невалидный индекс ответа |
| `NOT_IN_BATTLE` | Не участвует в сражении |
| `ALREADY_ANSWERED` | Уже ответил |
| `NO_QUESTION` | Вопрос не найден |
| `NO_BATTLE_DATA` | Данные сражения не найдены |
| `INVALID_TARGET` | Не указан room_id или game_id |
| `SEND_FAILED` | Не удалось отправить сообщение |
| `HISTORY_FAILED` | Не удалось получить историю |
| `NOT_FRIENDS` | Не друзья |
| `USER_BUSY` | Пользователь занят |
| `USER_OFFLINE` | Пользователь офлайн |
| `INVITE_NOT_FOUND` | Приглашение не найдено |
| `INVITE_EXPIRED` | Приглашение истекло |
| `INVITE_EXISTS` | Приглашение уже отправлено |
| `INVITE_FAILED` | Не удалось отправить приглашение |
| `ACCEPT_FAILED` | Не удалось принять приглашение |
| `REJECT_FAILED` | Не удалось отклонить приглашение |
| `AI_SERVICE_UNAVAILABLE` | AI сервис недоступен |
| `AI_GENERATION_FAILED` | Ошибка генерации AI |
| `NOT_TEMP_THEME` | Игра не с временной темой |
| `ALREADY_VOTED` | Уже проголосовали за тему |
| `VOTING_CLOSED` | Голосование завершено |

---

## Hex Grid координаты

Используется система axial координат для гексагональной сетки:
- `q` - колонка (увеличивается вправо)
- `r` - строка (увеличивается вниз-вправо для pointy-top гексов)

**Соседи клетки:**
```
          (0, -1)    (1, -1)
              \      /
       (-1, 0) — q,r — (1, 0)
              /      \
         (-1, 1)    (0, 1)
```

**Формулы:**
- East: `(q+1, r)`
- West: `(q-1, r)`
- Northeast: `(q+1, r-1)`
- Northwest: `(q, r-1)`
- Southeast: `(q, r+1)`
- Southwest: `(q-1, r+1)`

---

## Rate Limiting

- Общий лимит: 100 запросов / минуту
- Auth endpoints: 30 запросов / минуту
- WebSocket: без ограничений (только авторизованные подключения)

---

## Цвета игроков

Цвета назначаются в порядке присоединения к комнате:
1. `#E53935` (красный)
2. `#1E88E5` (синий)
3. `#43A047` (зеленый)
4. `#FB8C00` (оранжевый)
