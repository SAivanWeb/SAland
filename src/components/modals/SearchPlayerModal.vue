<template>
  <n-modal v-model:show="isVisible">
    <n-card style="width: 500px" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="modal">
        <h3>Поиск пользователей</h3>
        <div class="modal__search">
          <MainInput name="search" placeholder="Введите имя игрока" v-model="searchParams.query" />
          <MainButton
            title="Найти"
            size="large"
            @click="fetchPlayers"
            :disabled="searchParams.query.length < 2"
          />
        </div>
        <div v-if="players" class="modal__users">
          <n-popover v-for="item in players" :key="item.id" trigger="click">
            <template #trigger>
              <PlayerIcon :name="item.name" />
            </template>
            <div class="player-actions">
              <span>{{ item.name }}</span>
              <MainButton title="Выбрать" size="small" />
            </div>
          </n-popover>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NCard, NModal, NPopover } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { api, type SearchUsersParams } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import PlayerIcon from '@/components/games/PlayerIcon.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const processingStore = useProcessingStore()
const emit = defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const isVisible = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value),
})

const searchParams = ref<SearchUsersParams>({
  query: '',
  limit: 10,
})

const players = ref()

async function fetchPlayers() {
  try {
    processingStore.startLoading()
    const res = await api.user.search(searchParams.value)
    players.value = res.users
  } catch (e) {
    console.log(e)
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss">
.modal {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__search {
    display: flex;
    gap: 12px;
  }

  &__users {
    display: flex;
    gap: 12px;
  }
}
</style>
