# API Documentation

Полная документация всех HTTP эндпоинтов и WebSocket событий для фронтенда.

**Base URL:** `http://localhost:3000/api`
**WebSocket URL:** `ws://localhost:3000`

---

## Содержание

- [HTTP API](#http-api)
  - [Auth](#auth)
  - [User](#user)
  - [Friends](#friends)
  - [Themes](#themes)
  - [Health](#health)
- [WebSocket API](#websocket-api)
  - [Подключение](#подключение)
  - [Rooms](#rooms-events)
  - [Game](#game-events)
  - [Chat](#chat-events)
  - [Notifications](#notifications-events)
  - [Main Gateway](#main-gateway-events)
- [Типы данных](#типы-данных)
- [Коды ошибок](#коды-ошибок)

---

## HTTP API

Все эндпоинты (кроме помеченных `@Public`) требуют JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

### Auth

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
    created_at: string;
  };
  access_token: string;
}
```

**Cookies:**
- `refresh_token` (httpOnly, secure, sameSite: lax, path: /api/auth)

**Ошибки:**
- `400` - Валидация не пройдена
- `409` - Email уже используется

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
    created_at: string;
  };
  access_token: string;
}
```

**Cookies:**
- `refresh_token` (httpOnly)

**Ошибки:**
- `401` - Неверные учетные данные

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
- `401` - Refresh token отсутствует или невалидный

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

---

### User

#### GET `/user/init`
Получение начальных данных пользователя (профиль, друзья, статистика).

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    stats: {
      games_played: number;
      games_won: number;
      total_questions: number;
      correct_answers: number;
    };
  };
  friends: Friend[];
  pending_requests: FriendRequest[];
}
```

---

#### GET `/user/profile`
Профиль текущего пользователя.

**Response (200):**
```typescript
{
  id: string;
  email: string;
  name: string;
  created_at: string;
  stats: {
    games_played: number;
    games_won: number;
    total_questions: number;
    correct_answers: number;
  };
}
```

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
  stats: {
    games_played: number;
    games_won: number;
  };
}
```

**Ошибки:**
- `404` - Пользователь не найден

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
  created_at: string;
}
```

---

#### GET `/user/search`
Поиск пользователей по имени.

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
  }>;
  total: number;
}
```

---

### Friends

#### GET `/user/friends`
Список друзей текущего пользователя.

**Response (200):**
```typescript
{
  friends: Array<{
    user_id: string;
    name: string;
    is_online: boolean;
    added_at: string;
  }>;
}
```

---

#### GET `/user/friends/requests`
Входящие запросы в друзья.

**Response (200):**
```typescript
{
  requests: Array<{
    id: string;           // ID запроса
    from_user_id: string;
    from_user_name: string;
    created_at: string;
  }>;
}
```

---

#### POST `/user/friends/request`
Отправить запрос в друзья.

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
  message: "Friend request sent"
}
```

**Ошибки:**
- `400` - Уже друзья или запрос уже отправлен
- `404` - Пользователь не найден

---

#### POST `/user/friends/accept`
Принять запрос в друзья.

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
- `404` - Запрос не найден

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

---

### Themes

#### GET `/themes/popular`
Список популярных тем.

**Query Parameters:**
```typescript
{
  limit?: number;     // 1-50, по умолчанию 20
  offset?: number;    // >= 0, по умолчанию 0
  sort_by?: 'popular' | 'newest' | 'most_played';  // по умолчанию 'popular'
}
```

**Response (200):**
```typescript
{
  themes: Array<{
    id: string;
    name: string;
    description: string;
    questions_count: number;
    games_played: number;
    likes_count: number;
    dislikes_count: number;
    author_name: string;
    created_at: string;
  }>;
  total: number;
}
```

---

#### GET `/themes/search`
Поиск тем.

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
  themes: Array<Theme>;
  total: number;
}
```

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
  description: string;
  questions_count: number;
  games_played: number;
  likes_count: number;
  dislikes_count: number;
  difficulty_ratings: {
    easy: number;
    medium: number;
    hard: number;
  };
  author_id: string;
  author_name: string;
  created_at: string;
  user_rating?: 'like' | 'dislike' | null;  // Рейтинг текущего пользователя
}
```

**Ошибки:**
- `404` - Тема не найдена

---

#### POST `/themes/:theme_id/rate`
Оценить тему.

**Параметры:**
- `theme_id` - UUID темы

**Request Body:**
```typescript
{
  rating: 'like' | 'dislike';
  difficulty_rating?: 'easy' | 'medium' | 'hard';  // Опционально
  game_id?: string;   // UUID игры, если оценка после игры
}
```

**Response (200):**
```typescript
{
  message: "Rating submitted"
}
```

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
- `connect` - Успешное подключение
- `connect_error` - Ошибка подключения (неверный/истёкший токен)
- `disconnect` - Отключение

---

### Rooms Events

#### `room:create` (emit)
Создание комнаты.

**Данные:**
```typescript
{
  theme_id: string;           // UUID темы
  players_count: number;      // 2-4
  time_per_question: number;  // 10-45 секунд
  time_per_turn: number;      // 15-60 секунд
  extra_time_per_turn: number;// 10-30 секунд
  game_timer?: number | null; // 10-60 минут, null = без ограничения
  is_private: boolean;
}
```

**Ответ (room:created):**
```typescript
{
  id: string;                 // UUID комнаты
  owner_id: string;
  theme_id: string;
  theme_name: string;
  players_count: number;
  time_per_question: number;
  time_per_turn: number;
  extra_time_per_turn: number;
  game_timer: number | null;
  is_private: boolean;
  invite_code: string;        // 6 символов для приватных комнат
  status: 'waiting' | 'ready';
  created_at: number;
  players: Array<{
    user_id: string;
    name: string;
    color: string;            // HEX цвет (#E53935, #1E88E5, #43A047, #FB8C00)
    is_ready: boolean;
  }>;
}
```

**Ошибка (room:error):**
```typescript
{
  code: string;
  message: string;
}
```

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

**Ответ (room:state):** RoomState (см. выше)

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

**Broadcast (room:player_left):**
```typescript
{
  user_id: string;
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

После этого через ~2 секунды придёт событие `game:started`.

---

#### `rooms:subscribe` (emit)
Подписаться на обновления лобби (список публичных комнат).

**Данные:** нет

**Ответ (rooms:list):**
```typescript
Array<{
  id: string;
  owner_name: string;
  theme_name: string;
  players_count: number;      // Максимум игроков
  current_players: number;    // Текущее количество
}>
```

Событие `rooms:list` также приходит при изменении списка комнат.

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
  theme_name: string;
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
  waiting_for_opponent: boolean;  // true = ожидание ответа соперника
}
```

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

---

#### `game:state` (emit)
Запросить текущее состояние игры.

**Данные:** нет

**Ответ (game:state):** GameStatePayload (см. выше)

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
}
```

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
  user_id: string;
  user_name: string;
  content: string;
  room_id?: string;
  game_id?: string;
  timestamp: number;
}
```

**Broadcast (chat:message):**
```typescript
{
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  timestamp: number;
}
```

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
Array<{
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  timestamp: number;
}>
```

---

#### `chat:message` (listen)
Новое сообщение в чате.

**Данные:** ChatMessage (см. выше)

---

#### `chat:system` (listen)
Системное сообщение.

**Данные:**
```typescript
{
  content: string;
  timestamp: number;
}
```

---

### Notifications Events

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

**Ошибки:**
- `NOT_FRIENDS` - Не друзья
- `USER_BUSY` - Пользователь уже в игре/комнате
- `NOT_IN_ROOM` - Отправитель не в комнате
- `ROOM_FULL` - Комната заполнена

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
  room_id: string;
  theme_name: string;
  players_count: number;
  current_players: number;
  created_at: number;
}>
```

---

#### `friend:room_invite` (listen)
Входящее приглашение в комнату.

**Данные:**
```typescript
{
  invite_id: string;
  from_user_id: string;
  from_user_name: string;
  room_id: string;
  theme_name: string;
  players_count: number;
  current_players: number;
}
```

---

#### `notification` (listen)
Общее уведомление.

**Данные:**
```typescript
{
  type: 'friend_request' | 'friend_accepted' | 'game_invite' | 'system';
  data: {
    // Зависит от типа
  };
  timestamp: number;
}
```

---

#### `friend:online` (listen)
Друг онлайн.

**Данные:**
```typescript
{
  user_id: string;
  name: string;
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
  name: string;
  timestamp: number;
}
```

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

### HexCell
```typescript
interface HexCell {
  q: number;                  // Координата колонки (axial)
  r: number;                  // Координата строки (axial)
  owner_id: string | null;    // UUID владельца или null (нейтральная)
  player_index: number | null;// Индекс игрока (0-3) или null
  is_base: boolean;           // База игрока (неуничтожаемая)
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

### RoomState
```typescript
interface RoomState {
  id: string;
  owner_id: string;
  theme_id: string;
  theme_name: string;
  players_count: number;
  time_per_question: number;
  time_per_turn: number;
  extra_time_per_turn: number;
  game_timer: number | null;
  is_private: boolean;
  invite_code: string;
  status: 'waiting' | 'ready';
  created_at: number;
  players: RoomPlayer[];
}
```

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
| `USER_NOT_FOUND` | Пользователь не найден |
| `THEME_NOT_FOUND` | Тема не найдена |
| `ROOM_NOT_FOUND` | Комната не найдена |
| `ROOM_FULL` | Комната заполнена |
| `ALREADY_IN_ROOM` | Уже в комнате |
| `NOT_IN_ROOM` | Не в комнате |
| `NOT_OWNER` | Не владелец комнаты |
| `NOT_ALL_READY` | Не все игроки готовы |
| `GAME_NOT_FOUND` | Игра не найдена |
| `NOT_IN_GAME` | Не в игре |
| `NOT_YOUR_TURN` | Не ваш ход |
| `INVALID_MOVE` | Недопустимый ход |
| `NOT_FRIENDS` | Не друзья |
| `USER_BUSY` | Пользователь занят |
| `INVITE_NOT_FOUND` | Приглашение не найдено |
| `INVITE_EXPIRED` | Приглашение истекло |

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
