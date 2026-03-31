<template>
  <GameStart placement="games" />
  <div class="games">
    <div v-if="currentRoom" class="games__waiting">
      <GameWaiting :room="currentRoom" />
    </div>
    <div class="games__content">
      <div class="games__saved">
        <h3>Сохраненные темы</h3>
        <div class="games__filters">
          <MainInput name="search" placeholder="Поиск тем" v-model="search" size="large" />
        </div>
        <n-scrollbar x-scrollable trigger="none">
          <div class="games__saved-list">
            <PopularGameCard v-for="item in popularGames" :key="item.id" :theme="item" />
          </div>
        </n-scrollbar>
      </div>
    </div>
    <div class="games__content">
      <div class="games__active">
        <h3>Ожидают игры</h3>
        <ActiveRoomsList/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PopularGameCard from '@/components/ui/card/PopularGameCard.vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import { onMounted, ref, computed, watch } from 'vue'
import GameStart from '@/components/games/GameStart.vue'
import GameWaiting from '@/components/games/GameWaiting.vue'
import { api, type Theme } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { NScrollbar } from 'naive-ui'
import { isErrorMessage } from '@/utils/error.ts'
import ActiveRoomsList from '@/components/rooms/ActiveRoomsList.vue'
import { useRoomStore } from '@/stores/useRoomStore.ts'
import {useUserStore} from '@/stores/useUserStore.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const roomStore = useRoomStore()
const processingStore = useProcessingStore()
const search = ref<string>('')
let searchDebounce: ReturnType<typeof setTimeout> | null = null

const currentRoom = computed(() =>
  roomStore.room?.owner_id === userStore.currentUser?.user.id ? null : roomStore.room,
)

watch(
  () => roomStore.room,
  (room) => {
    if (room?.owner_id === userStore.currentUser?.user.id && !history.state?.left) {
      router.push('/game-create')
    }
  },
  { immediate: true },
)

const popularGames = ref<Theme[]>([])

async function fetchPopularGames(q?: string) {
  try {
    processingStore.startLoading()
    const res = await api.themes.popular({ q })
    popularGames.value = res.themes
  } catch (e) {
    if (isErrorMessage(e, 'error'))
      processingStore.setMessage('error', 'Ошибка', 'Ошибка получения сохраненных тем')
  } finally {
    processingStore.stopLoading()
  }
}

watch(search, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => fetchPopularGames(val), 400)
})

onMounted(() => {
  fetchPopularGames()
  roomStore.initRoom()
})
</script>

<style scoped lang="scss">
.games {
  padding: 48px $side-padding 64px $side-padding;

  @include md {
    padding-top: 24px;
    padding-bottom: 40px;
  }
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__waiting {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  &__content {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  &__saved {
    display: flex;
    flex-direction: column;
    padding: 20px 20px 0 20px;
    background: #fff;
    box-shadow: $box-shadow;
    border: 2px solid $border;
    border-radius: $border-radius;

    &-list {
      display: flex;
      gap: 20px;
      padding: 20px 0;
    }
  }

  &__filters {
    margin-top: 12px;
  }

  &__active {
    background: #fff;
    border: 2px solid $border;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

// Стилизация скроллбара Naive UI в стиле необрутализма
:deep(.n-scrollbar-rail) {
  &.n-scrollbar-rail--horizontal {
    height: 8px !important;
    bottom: px !important;
  }

  & > .n-scrollbar-rail__scrollbar {
    height: 8px !important;
  }
}

:deep(.n-scrollbar-rail__scrollbar) {
  background: $primary-yellow !important;

  &:hover {
    background: $primary-orange !important;
  }
}
</style>
