# Документация для фронтенда: Игровой процесс

Полное описание последовательности WebSocket-событий и HTTP-запросов для начала и ведения игры.

---

## Содержание

1. [Роли и терминология](#роли-и-терминология)
2. [Фаза 1: Активация комнаты (INACTIVE → WAITING)](#фаза-1-активация-комнаты-inactive--waiting)
3. [Фаза 2: Ожидание игроков (WAITING)](#фаза-2-ожидание-игроков-waiting)
4. [Фаза 3: Запуск игры](#фаза-3-запуск-игры)
5. [Фаза 4: Игровой процесс](#фаза-4-игровой-процесс)
6. [Типы событий по роли](#типы-событий-по-роли)
7. [Переподключение](#переподключение)

---

## Роли и терминология

| Роль | Описание |
|------|----------|
| **Владелец (owner)** | Создатель комнаты. Управляет комнатой, запускает игру. |
| **Игрок (player)** | Присоединившийся участник. Может быть готов/не готов. |

**Статусы комнаты:**
- `inactive` — комната в настройке, нельзя присоединиться
- `waiting` — комната активна, принимает игроков

---

## Фаза 1: Активация комнаты (INACTIVE → WAITING)

Эта фаза выполняется **только владельцем**. Предполагается, что комната уже создана (`room:create`) и тема добавлена.

### 1.1 Предусловия для активации

Перед вызовом `room:activate` тема должна быть готова:
- 80 вопросов загружены (через AI, JSON или вручную)
- Статус комнаты: `inactive`

Проверить текущее состояние:
```javascript
socket.emit('room:get_state', {});
socket.on('room:state', (state) => {
  // state.theme.questions_loaded === 80
  // state.status === 'inactive'
});
```

### 1.2 Если тема ещё не создана

#### Вариант A: AI-генерация

```javascript
// 1. Запустить генерацию
socket.emit('room:generate_theme', { theme_name: 'История России' });

// 2. Получить подтверждение старта
socket.on('room:theme_generation_started', ({ theme_name }) => {
  // показать прогресс-бар
});

// 3. Следить за прогрессом (после каждого батча из 20 вопросов)
socket.on('ai:progress', ({ session_id, status, progress }) => {
  // progress.generated: 20, 40, 60, 80
  // progress.total: 80
  // обновить прогресс-бар
});

// 4. Генерация завершена
socket.on('ai:ready', ({ session_id, status, progress }) => {
  // progress.generated === 80 — тема готова к активации
});

// 5. Ошибка генерации
socket.on('ai:error', ({ session_id, error, progress }) => {
  // показать ошибку, предложить повторить
});
```

#### Вариант B: Загрузка JSON (ровно 80 вопросов)

```javascript
socket.emit('room:upload_theme', {
  theme_name: 'История России',
  questions: [
    {
      question: 'В каком году произошла Октябрьская революция?',
      answers: ['1905', '1917', '1921', '1941'],
      correct_answer: 1  // индекс 0-3
    },
    // ... ещё 79 вопросов
  ]
});

// Ответ — полное состояние комнаты
socket.on('room:state', (state) => {
  // state.theme.questions_loaded === 80
});

// Broadcast всем в комнате
socket.on('room:theme_uploaded', ({ theme_name }) => {
  // тема загружена
});
```

#### Вариант C: Ручная загрузка через свой AI (порциями)

```javascript
// 1. Получить промпт (название темы сохраняется на сервере)
socket.emit('room:get_prompt', { theme_name: 'История России' });

socket.on('room:prompt', ({ prompt, theme_name }) => {
  // prompt — текст для вставки в ChatGPT/Claude/Gemini
  // скопировать prompt, вставить в AI, скопировать ответ
});

// 2. Загрузить ответ AI (можно по частям — накапливается)
socket.emit('room:upload_theme_raw', {
  // theme_name уже сохранён на сервере, можно не передавать
  raw_text: '<ответ от AI>'  // строка или JSON-объект
});

// Личный ответ отправителю
socket.on('room:theme_raw_uploaded', ({ loaded, total, invalid_count, is_complete }) => {
  // loaded: сколько всего загружено сейчас
  // total: 80
  // invalid_count: сколько невалидных в этой порции
  // is_complete: true если >= 80, можно активировать

  if (!is_complete) {
    // повторить шаг 2 с новой порцией
  }
});

// Broadcast всем в комнате
socket.on('room:theme_progress', ({ loaded, total, is_complete }) => {
  // обновить прогресс у всех
});

// 3. Если нужно начать заново (сбросить загруженные вопросы)
socket.emit('room:clear_uploaded_questions', {});
socket.on('room:state', (state) => { /* сброшено */ });
socket.on('room:theme_deleted', ({ theme_name }) => { /* broadcast */ });
```

### 1.3 Активация комнаты

После того как тема готова (80 вопросов):

```javascript
socket.emit('room:activate', {});

// Ответ владельцу
socket.on('room:state', (state) => {
  // state.status === 'waiting'
  // теперь другие игроки могут присоединиться
});

// Broadcast всем в комнате
socket.on('room:activated', ({ status }) => {
  // status === 'waiting'
  // показать кнопку "поделиться ссылкой" / invite_code
});
```

**Возможные ошибки:**
```javascript
socket.on('room:error', ({ code, message }) => {
  // 'NOT_OWNER' — только владелец
  // 'ROOM_NOT_INACTIVE' — комната уже активна
  // 'NO_THEME' — тема не создана
  // 'INVALID_QUESTIONS_COUNT' — не 80 вопросов
});
```

---

## Фаза 2: Ожидание игроков (WAITING)

### 2.1 Поток владельца (после активации)

Владелец остаётся в комнате. Ему доступно:

```javascript
// Поделиться кодом приглашения (из room:state)
const inviteCode = roomState.invite_code; // например "ABC123"

// Пригласить друга через WebSocket
socket.emit('friend:invite_to_room', { friend_user_id: 'uuid' });
socket.on('friend:invite_sent', ({ success, invite_id }) => {
  // приглашение отправлено
});

// Выгнать игрока
socket.emit('room:kick', { user_id: 'uuid' });
socket.on('room:kick_success', ({ success }) => { /* выгнан */ });

// Деактивировать комнату (вернуть в INACTIVE, выгнать всех)
socket.emit('room:deactivate', {});
socket.on('room:state', (state) => {
  // state.status === 'inactive'
  // все игроки кроме владельца удалены
});
```

### 2.2 Поток игрока: присоединение к комнате

```javascript
// Присоединиться по room_id
socket.emit('room:join', { room_id: 'uuid' });

// Присоединиться по invite_code (6 символов, без учёта регистра)
socket.emit('room:join', { invite_code: 'ABC123' });

// Ответ присоединившемуся — полное состояние комнаты
socket.on('room:state', (state) => {
  // state.players — список всех игроков
  // state.theme — информация о теме
  // state.owner_id — ID владельца
});

// Broadcast остальным игрокам
socket.on('room:player_joined', ({ player, current_players, status }) => {
  // player.user_id, player.name, player.color
  // current_players — текущее количество
});
```

**Ошибки при присоединении:**
```javascript
socket.on('room:error', ({ code, message }) => {
  // 'ALREADY_IN_ROOM' — уже в комнате
  // 'ROOM_NOT_FOUND' — комната не найдена
  // 'ROOM_FULL' — комната заполнена
  // 'ROOM_INACTIVE' — владелец ещё не активировал
  // 'INVALID_STATUS' — не принимает игроков
});
```

### 2.3 События при выходе игрока

```javascript
// Игрок сам вышел
socket.emit('room:leave', {});
socket.on('room:left', ({ success }) => { /* подтверждение */ });

// Broadcast остальным
socket.on('room:player_left', ({
  user_id,
  name,
  new_owner_id,  // если вышел владелец
  kicked,        // если выгнан
  disconnected   // если отключился
}) => {
  if (new_owner_id) {
    // обновить UI — новый владелец
  }
});

// Игрок выгнан (персонально выгнанному)
socket.on('room:kicked', ({ room_id, reason }) => {
  // reason: 'You were kicked by the room owner'
  //         'Room was deactivated by owner'
  //         'Room was deleted by owner'
  // перенаправить в лобби
});
```

---

## Фаза 3: Запуск игры

Запускает только **владелец** при условии: в комнате набралось `players_count` игроков.

### 3.1 Владелец запускает игру

```javascript
socket.emit('room:start', {});

// Немедленный ответ — переходное состояние
socket.on('game:starting', ({ room }) => {
  // room — текущее состояние комнаты
  // показать "игра запускается..."
});
```

**Ошибки запуска:**
```javascript
socket.on('room:error', ({ code, message }) => {
  // 'NOT_OWNER' — только владелец
  // 'NOT_ENOUGH_PLAYERS' — не набралось players_count игроков
  // 'ROOM_NOT_FOUND' — комната не найдена
});
```

### 3.2 Игра началась (все игроки)

После `game:starting` асинхронно приходит `game:started`:

```javascript
socket.on('game:started', ({
  game_id,
  theme_id,        // null для временных тем
  theme_name,
  is_temp_theme,   // true если AI/ручная тема
  players,         // массив игроков с координатами стартовых позиций
  cells,           // все ячейки поля
  config,          // time_per_question, time_per_turn и т.д.
  player_order,    // порядок ходов [0, 1, 2, ...]
  game_timer_ends_at  // null или Unix timestamp конца игры
}) => {
  // Сохранить game_id для переподключения
  localStorage.setItem('active_game_id', game_id);

  // Инициализировать гексагональное поле
  initHexGrid(cells);

  // Инициализировать игроков
  initPlayers(players);

  // Запустить таймер игры если есть
  if (game_timer_ends_at) {
    startGameTimer(game_timer_ends_at);
  }
});
```

#### Структура `players` в `game:started`

```typescript
players: Array<{
  user_id: string;
  name: string;
  color: string;           // '#E53935', '#1E88E5', '#43A047', '#FB8C00'
  player_index: number;    // 0-3
  is_connected: boolean;
  extra_time_remaining: number;
  territories_count: number;
  questions_answered: number;
  correct_answers: number;
}>
```

#### Структура `cells` в `game:started`

```typescript
cells: Array<{
  q: number;               // axial координата (колонка)
  r: number;               // axial координата (строка)
  owner_id: string | null; // UUID владельца или null
  player_index: number | null; // индекс игрока 0-3 или null
  is_base: boolean;        // стартовая позиция игрока
}>
```

---

## Фаза 4: Игровой процесс

### 4.1 Начало хода

Событие приходит **только текущему игроку**, чей ход:

```javascript
socket.on('game:turn', ({
  turn_number,
  current_player_index,   // чей ход
  available_moves,        // доступные клетки для хода [{q, r}, ...]
  time_limit,             // миллисекунды на ход
  extra_time_remaining,
  started_at              // Unix timestamp начала хода
}) => {
  const isMyTurn = current_player_index === myPlayerIndex;

  if (isMyTurn) {
    // подсветить available_moves на поле
    // запустить таймер time_limit
    highlightCells(available_moves);
    startTurnTimer(time_limit, started_at);
  }
  // Если не ваш ход — показать что ходит другой игрок
});
```

### 4.2 Выбор клетки

Только активный игрок отправляет:

```javascript
// Пользователь кликнул на клетку
socket.emit('game:select_cell', {
  q: selectedCell.q,
  r: selectedCell.r
});

// Подтверждение выбора (всем игрокам)
socket.on('game:cell_selected', ({
  q,
  r
}) => {
  // выделить выбранную клетку на поле всем игрокам
  // ждать вопрос
});
```

**Ошибки выбора:**
```javascript
socket.on('game:error', ({ code, message }) => {
  // 'NOT_YOUR_TURN' — не ваш ход
  // 'INVALID_MOVE' — недопустимая клетка
  // 'INVALID_PHASE' — не фаза выбора клетки
  // 'NO_QUESTIONS' — вопросы закончились
});
```

### 4.3 Вопрос

Приходит **участникам битвы** — при захвате свободной клетки только атакующему, при атаке на чужую — обоим игрокам:

```javascript
socket.on('game:question', ({
  question_id,
  question,          // текст вопроса
  answers,           // 4 варианта ответа
  time_limit,        // миллисекунды на ответ
  started_at,        // Unix timestamp начала вопроса
  target_cell,       // { q, r } — клетка за которую борьба
  is_battle,         // true если поединок (другой игрок тоже отвечает)
  defender_index     // player_index защитника (null при соло-захвате)
}) => {
  // Показать модальное окно с вопросом
  // Показать варианты ответов
  // Запустить таймер time_limit
  showQuestion({ question, answers, time_limit, started_at });

  if (is_battle) {
    showBattleIndicator(defender_index);
  }
});
```

### 4.4 Ответ на вопрос

```javascript
// Пользователь выбрал ответ
socket.emit('game:answer', {
  answer_index: 2  // индекс 0-3
});

// Подтверждение что ответ принят
socket.on('game:answer_submitted', ({
  resolved,               // true если результат уже известен
  waiting_for_opponent    // true если ждём ответа соперника
}) => {
  if (waiting_for_opponent) {
    // показать "ждём ответа соперника..."
  }
});
```

**Если другой игрок ответил (для поединка):**
```javascript
// Этот игрок уже ответил — ждём второго
// Событие 'game:answer_submitted' с waiting_for_opponent: false
// придёт когда оба ответят
```

### 4.5 Результат хода

Приходит всем после ответа всех участников или истечения времени.

**После получения этого события фронтенд показывает правильный ответ и результат:**
- **Соло-захват** — 5 секунд до следующего хода
- **Батл** — 7 секунд до следующего хода

```javascript
socket.on('game:answer_result', ({
  turn_number,
  result: {
    type,                  // 'solo_capture' | 'battle_won' | 'battle_lost' | 'battle_draw' | 'timeout' | 'skip'
    player_index,          // кто ходил
    cell,                  // { q, r } клетка
    player_answer,         // ответ атакующего
    defender_answer,       // ответ защитника (только при поединке)
    cell_captured,         // захвачена ли клетка
    cell_owner_changed_from // предыдущий владелец (null если свободная)
  },
  correct_answer_index,    // индекс правильного ответа (0-3). Отсутствует при skip (пропуск хода без вопроса).
  updated_cells,           // массив изменившихся клеток
  updated_players          // массив игроков с обновлёнными данными
}) => {
  // Обновить поле
  updateCells(updated_cells);

  // Обновить счёт игроков
  updatePlayers(updated_players);

  // Подсветить варианты ответов:
  // - correct_answer_index → зелёный
  // - player_answer?.answer_index (если неверный) → красный
  // - defender_answer?.answer_index (если неверный) → красный
  if (correct_answer_index !== undefined) {
    highlightAnswers(correct_answer_index, result.player_answer, result.defender_answer);
  }

  // Показать результат (захват / поражение / ничья / победитель батла)
  showRoundResult(result);

  // Следующий game:turn придёт автоматически:
  // - через 5 сек для соло-захвата
  // - через 7 сек для батла
});
```

#### Структура `player_answer` / `defender_answer`:

```typescript
{
  user_id: string;
  player_index: number;
  answer_index: number;   // выбранный ответ (0-3)
  answered_at: number;    // Unix timestamp ответа
  is_correct: boolean;
  response_time: number;  // миллисекунды с начала вопроса
}
```

#### Логика подсветки ответов на фронте:

| Вариант | Цвет |
|---------|------|
| `correct_answer_index` | Зелёный (всегда) |
| `player_answer.answer_index` при `is_correct: false` | Красный |
| `defender_answer.answer_index` при `is_correct: false` | Красный |
| Вариант не выбран никем | Без подсветки |

#### Таблица исходов поединка

| Тип результата | Условие |
|----------------|---------|
| `battle_won` | Атакующий ответил правильно; защитник нет ИЛИ атакующий быстрее |
| `battle_lost` | Защитник ответил правильно быстрее; или атакующий не ответил |
| `battle_draw` | Оба не ответили или оба правильно с одинаковым временем |
| `solo_capture` | Захват свободной клетки — правильный ответ |
| `timeout` | Время на ответ истекло |

### 4.6 Удаление игрока из игры (таймаут хода)

```javascript
socket.on('game:player_forfeited', ({
  user_id,
  player_index,
  name,
  updated_cells    // клетки которые стали свободными
}) => {
  updateCells(updated_cells);
  showMessage(`${name} сдался`);
});
```

### 4.7 Сдаться

```javascript
socket.emit('game:forfeit', {});

socket.on('game:forfeited', ({ success }) => {
  // вы сдались
});

// Другие игроки получат
socket.on('game:player_forfeited', ({ user_id, player_index, name, updated_cells }) => {
  // обновить поле
});
```

---

## Завершение игры

```javascript
socket.on('game:ended', ({
  end_reason,       // 'conquest' | 'last_standing' | 'game_timer' | 'forfeit'
  winner_index,     // player_index победителя (null при ничьей)
  winner_name,
  final_standings,  // места всех игроков
  game_duration,    // длительность в миллисекундах
  theme_id,         // null для временных тем
  theme_name,
  is_temp_theme     // true если тема AI/ручная
}) => {
  // Показать экран результатов

  if (is_temp_theme) {
    // Показать окно оценки темы
    showThemeRating();
  }
});
```

#### Оценка временной темы (HTTP)

Если `is_temp_theme === true`, нужно собрать оценку от всех игроков:

```javascript
// После завершения игры
await fetch(`/api/games/${game_id}/rate-temp-theme`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rating: 'like',          // 'like' | 'dislike' | 'skip'
    difficulty_rating: 'medium'  // 'easy' | 'medium' | 'hard'
  })
});

// Ответ
// { success: true, theme_saved: boolean, theme_id: string | null }
// theme_saved: true — тема сохранена (получила хоть 1 лайк от кого-то)
```

#### Оценка постоянной темы (HTTP)

Если `is_temp_theme === false`:

```javascript
await fetch(`/api/themes/${theme_id}/rate`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    game_id: game_id,
    rating: 'like',
    difficulty_rating: 'medium'
  })
});
```

---

## Типы событий по роли

### Владелец (owner)

| Действие | Emit | On (ответ) |
|----------|------|-----------|
| Активировать комнату | `room:activate` | `room:state`, `room:activated` (broadcast) |
| Деактивировать комнату | `room:deactivate` | `room:state`, `room:deactivated` (broadcast) |
| Выгнать игрока | `room:kick` | `room:kick_success` |
| Запустить игру | `room:start` | `game:starting` (broadcast) |
| Удалить тему | `room:delete_theme` | `room:state`, `room:theme_deleted` (broadcast) |

### Игрок (не владелец)

| Действие | Emit | On (ответ) |
|----------|------|-----------|
| Присоединиться | `room:join` | `room:state` |
| Покинуть | `room:leave` | `room:left` |

### Все игроки (в игре)

| Действие | Emit | On (ответ) |
|----------|------|-----------|
| Выбрать клетку | `game:select_cell` | `game:cell_selected` (broadcast) |
| Ответить на вопрос | `game:answer` | `game:answer_submitted` → `game:answer_result` (broadcast) |
| Сдаться | `game:forfeit` | `game:forfeited` → `game:player_forfeited` (broadcast) |

### Только listen (все игроки получают)

| Событие | Когда |
|---------|-------|
| `game:started` | Игра запущена |
| `game:turn` | Начало хода (только текущий игрок) |
| `game:question` | Вопрос (только участники битвы) |
| `game:answer_result` | Результат хода |
| `game:player_forfeited` | Кто-то сдался |
| `game:player_disconnected` | Кто-то отключился |
| `game:player_reconnected` | Кто-то переподключился |
| `game:ended` | Игра завершена |

---

## Переподключение

### Восстановление комнаты

```javascript
// 1. При загрузке приложения
const { active_room_id, active_game_id } = await fetch('/api/user/init').then(r => r.json()).then(r => r.data);

// 2. Если есть активная комната
if (active_room_id) {
  socket.emit('room:get_state', {});
  socket.on('room:state', (state) => {
    // восстановить UI комнаты
  });
}
```

### Восстановление игры

```javascript
// Если есть активная игра
if (active_game_id) {
  socket.emit('game:reconnect', {});
  socket.on('game:state', ({
    phase,          // 'waiting_turn' | 'question_phase' | 'finished'
    players,
    cells,
    current_turn,
    game_timer_ends_at
  }) => {
    // Восстановить состояние UI

    if (phase === 'question_phase' && current_turn) {
      // Показать активный вопрос если он есть
    }
  });
}
```

### Отключение во время игры (для остальных)

```javascript
socket.on('game:player_disconnected', ({ user_id, player_index, name }) => {
  // показать что игрок отключился
  // у него есть 60 сек на переподключение
});

socket.on('game:player_reconnected', ({ user_id, player_index, name }) => {
  // игрок вернулся
});
```

---

## Полная последовательность (схема)

```
ВЛАДЕЛЕЦ                          ИГРОК 1                        ИГРОК 2
   |                                 |                               |
[room:activate]                      |                               |
   |                                 |                               |
room:state (inactive→waiting)        |                               |
room:activated (broadcast)           |                               |
   |                                 |                               |
   |                          [room:join]                     [room:join]
   |                                 |                               |
   |                           room:state                      room:state
   |                    room:player_joined(broadcast)   room:player_joined(broadcast)
   |                                 |                               |
[room:start]                         |                               |
   |                                 |                               |
game:starting (broadcast)    game:starting (broadcast)    game:starting (broadcast)
game:started (broadcast)     game:started (broadcast)     game:started (broadcast)
   |                                 |                               |
   |═══════════════════ ИГРА НАЧАЛАСЬ ══════════════════════════════|
   |                                 |                               |
game:turn → [game:select_cell]       |                               |
   |                                 |                               |
game:cell_selected (broadcast)       |                               |
game:question (владелец получает)    |                               |
   |                                 |                               |
[game:answer]                        |                               |
   |                                 |                               |
game:answer_submitted                |                               |
game:answer_result (broadcast)       |                               |
   |                                 |                               |
   |              game:turn → [game:select_cell]                     |
   |                                 |                               |
   |                     game:cell_selected (broadcast)              |
   |                  game:question (игрок 1 + игрок 2 если атака)  |
   |                                 |                               |
   |                          [game:answer]                   [game:answer]
   |                                 |                               |
   |                      game:answer_submitted           game:answer_submitted
   |               game:answer_result (broadcast)   game:answer_result (broadcast)
   |                                 |                               |
   |═════════════════ ... ходы продолжаются ... ═══════════════════|
   |                                 |                               |
game:ended (broadcast)       game:ended (broadcast)       game:ended (broadcast)
```
