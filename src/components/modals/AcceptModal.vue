<template>
  <ModalContainer v-model:show="show" modalWidth="500px">
    <template #header>
      <h3 v-if="type === 'own-delete' || type === 'admin-delete'">Подтвердите удаление</h3>
      <h3 v-if="type === 'game-delete'">Подтвердите удаление игры</h3>
      <h3 v-if="type === 'theme-delete'">Подтвердите удаление темы</h3>
    </template>
    <template #body>
      <p v-if="type === 'own-delete'">
        При подтверждении удаления аккаунта доступ к нему станет невозможным, а так же удалится вся
        статистика. Вы уверены что хотите удалить свой аккаунт?
      </p>
      <p v-if="type === 'admin-delete'">
        При подтверждении удаления аккаунта доступ к нему станет невозможным, а так же удалится вся
        статистика. Вы уверены что хотите удалить аккаунт пользователя <span class="bold">{{ user.name }}</span
        >?
      </p>
      <p v-if="type === 'game-delete'">
        При подтверждении удаления игры ее прогресс удалится и пользователи будут изгнаны из нее. Вы уверены что хотите удалить?
      </p>
      <p v-if="type === 'theme-delete'">
        При подтверждении удаления темы ее прогресс удалится. Вы уверены что хотите удалить?
      </p>
      <MainButton
        v-if="type === 'own-delete'"
        title="Подтвердить"
        color="red"
        @click="deleteAccount"
      />
      <MainButton
        v-if="type === 'admin-delete'"
        title="Подтвердить"
        color="red"
        @click="adminDelete"
      />
      <MainButton
        v-if="type === 'game-delete'"
        title="Подтвердить"
        color="red"
        @click="gameDelete"
      />
      <MainButton
        v-if="type === 'theme-delete'"
        title="Подтвердить"
        color="red"
        @click="themeDelete"
      />
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import ModalContainer from '@/components/template/ModalContainer.vue'
import { useApi } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { computed } from 'vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useUserStore } from '@/stores/useUserStore.ts'

interface Props {
  show: boolean
  user?: {
    userId: string
    name?: string
  }
  type: string
  gameId?: string | number
  themeId?: string | number
}

const api = useApi()
const props = defineProps<Props>()
const processingStore = useProcessingStore()
const userStore = useUserStore()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'action'): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

async function deleteAccount() {
  try {
    processingStore.startLoading()
    await api.user.deleteAccount()
    emit('update:show', false)
    await userStore.logout()
  } catch {
    processingStore.setMessage('error', 'Удаление аккаунта', 'Ошибка удаления аккаунта')
  } finally {
    processingStore.stopLoading()
  }
}

async function adminDelete() {
  try {
    processingStore.startLoading()
    await api.admin.users.delete(props.user.userId)
    emit('action')
    emit('update:show', false)
    processingStore.setMessage('success', 'Удаление аккаунта', 'Пользователь удален')
  } catch {
    processingStore.setMessage('error', 'Удаление аккаунта', 'Ошибка удаления аккаунта')
  } finally {
    processingStore.stopLoading()
  }
}

async function gameDelete() {
  try {
    processingStore.startLoading()
    await api.admin.games.delete(props.gameId)
    emit('action')
    emit('update:show', false)
    processingStore.setMessage('success', 'Удаление игры', 'Игра удалена')
  } catch {
    processingStore.setMessage('error', 'Удаление игры', 'Ошибка удаления игры')
  } finally {
    processingStore.stopLoading()
  }
}

async function themeDelete() {
  try {
    processingStore.startLoading()
    await api.admin.themes.delete(props.themeId)
    emit('action')
    emit('update:show', false)
    processingStore.setMessage('success', 'Удаление темы', 'Тема удалена')
  } catch {
    processingStore.setMessage('error', 'Удаление темы', 'Ошибка удаления темы')
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss"></style>
