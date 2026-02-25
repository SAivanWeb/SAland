<template>
  <ModalContainer v-model:show="show" modal-width="500px">
    <template #header>
      <h3>Поиск пользователей</h3>
    </template>
    <template #body>
      <form @submit.prevent="fetchPlayers" class="modal__search">
        <MainInput name="search" placeholder="Введите имя игрока" v-model="searchParams.query" />
        <MainButton
          title="Найти"
          size="large"
          attrType="submit"
          :disabled="searchParams.query.length < 2"
          color="purple"
        />
      </form>
      <div v-if="players && players.total !== 0" class="modal__users">
        <n-popover
          style="padding: 12px 16px"
          v-for="item in players.users"
          :key="item.id"
          trigger="hover"
          placement="bottom"
        >
          <template #trigger>
            <PlayerIcon :name="item.name" no-tooltip />
          </template>
          <div class="player-actions">
            <span>{{ item.name }}</span>
            <MainButton title="Добавить" size="small" color="green" @click="addFriend(item.id)" />
          </div>
        </n-popover>
      </div>
      <div v-else-if="players && players.total === 0" class="modal__not-found">
        Пользователи не найдены
      </div>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import { NPopover } from 'naive-ui'
import { computed, ref } from 'vue'
import {
  api,
  type SearchUsersParams,
  type SearchUsersResponse,
} from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import ModalContainer from '@/components/template/ModalContainer.vue'
import { isErrorMessage } from '@/utils/error.ts'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const processingStore = useProcessingStore()
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const searchParams = ref<SearchUsersParams>({
  query: '',
  limit: 10,
})

const players = ref<SearchUsersResponse>()

async function fetchPlayers() {
  try {
    processingStore.startLoading()
    players.value = await api.user.search(searchParams.value)
  } catch (e) {
    console.log(e)
  } finally {
    processingStore.stopLoading()
  }
}

async function addFriend(id: string) {
  try {
    processingStore.startLoading()
    await api.friends.sendRequest({ user_id: id })
    emit('update:show', false)
    processingStore.setMessage('success', 'Запрос в друзья', 'Запрос отправлен')
  } catch (e) {
    if (isErrorMessage(e, 'Friend request already sent')) processingStore.setMessage('error', 'Запрос в друзья', 'Запрос уже был отправлен')
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss">
.player-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;

  & span {
    @include body-1;
  }
}
</style>
