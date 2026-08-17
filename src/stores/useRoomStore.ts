import { defineStore } from 'pinia'
import { type RoomState, useWebSocket } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useUserStore } from '@/stores/useUserStore.ts'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export const useRoomStore = defineStore('RoomStore', () => {
  const ws = useWebSocket()
  const processingStore = useProcessingStore()
  const router = useRouter()

  const room = ref<RoomState | null>(null)

  function onClickTimeout(role: string) {
    if (room.value) {
      if (role === 'admin') {
        if (room.value.theme) {
          processingStore.setActiveRoom(room.value.theme.name, 'admin')
        } else {
          processingStore.setActiveRoom('Черновик', 'admin')
        }
      } else {
        if (room.value.theme) {
          processingStore.setActiveRoom(room.value.theme.name, 'user')
        }
      }
    }
  }

  function joinRoom(payload: string) {
    ws.rooms.join({ room_id: payload })
  }

  function leaveRoom() {
    ws.rooms.leave()
  }

  function createRoom(): Promise<void> {
    return new Promise((resolve) => {
      const unsub = ws.rooms.onCreated(() => {
        unsub()
        resolve()
      })
      ws.rooms.create()
    })
  }

  function initRoom() {
    ws.rooms.getState()
  }

  ws.rooms.onCreated((data) => {
    room.value = data
  })

  ws.rooms.onState((data) => {
    const userStore = useUserStore()
    room.value = data
    if (window.location.pathname !== '/game-create' && window.location.pathname !== '/games') {
      if (room.value && userStore.currentUser?.user.id === room.value.owner_id) {
        const timer = setTimeout(() => onClickTimeout('admin'), 3500)
        const withTracking = (fn: () => void) => () => {
          clearTimeout(timer)
          fn()
        }
        processingStore.setMessage('info', 'Активная комната', 'У вас есть активная комната.', {
          label: 'Подключиться',
          onClick: withTracking(() => router.push(`/game-create`)),
        })
      } else if (room.value && userStore.currentUser?.user.id !== room.value.owner_id) {
        const timer = setTimeout(() => onClickTimeout('user'), 3500)
        const withTracking = (fn: () => void) => () => {
          clearTimeout(timer)
          fn()
        }
        processingStore.setMessage('info', 'Активная комната', 'У вас есть активная комната.', {
          label: 'Подключиться',
          onClick: withTracking(() => router.push(`/games`)),
        })
      }
    } else if (window.location.pathname === '/games') {
      // Не редиректим обратно, если пользователь только что сам покинул комнату
      if (
        room.value &&
        userStore.currentUser?.user.id === room.value.owner_id &&
        !window.history.state?.left
      ) {
        router.push('/game-create')
      }
    }
  })

  ws.rooms.onPlayerJoined((data) => {
    if (room.value) {
      room.value.players.push(data.player)
      room.value.status = data.status
    }
  })

  ws.rooms.onPlayerLeft((data) => {
    if (room.value) {
      room.value.players = room.value.players.filter((p) => p.user_id !== data.user_id)
    }
  })

  ws.rooms.onLeft(() => {
    room.value = null
  })

  ws.rooms.onKicked((data) => {
    room.value = null
    if (
      data.reason === 'Room was deactivated by owner' ||
      data.reason === 'Room was deleted by owner'
    ) {
      processingStore.setMessage('info', 'Активвная комната', 'Комната была закрыта владельцем')
    } else {
      processingStore.setMessage(
        'info',
        'Вы исключены из комнаты',
        'Администратор исключил вас из комнаты',
      )
    }
  })

  ws.rooms.onError((err) => {
    if (err.code === 'NOT_IN_ROOM') {
      router.push('/games')
    }
  })

  ws.game.onStarting(() => {
    room.value = null
    processingStore.setMessage('info', 'Запуск игры', 'Игра запускается, ожидайте')
    router.push('/game')
  })

  return { room, createRoom, initRoom, joinRoom, leaveRoom }
})
