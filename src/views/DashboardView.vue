<template>
  <GameStart placement="games" />
  <div class="games">
    <div v-if="currentRoom" class="games__waiting">
      <GameWaiting :room="currentRoom" />
    </div>
    <div class="games__content">
      <div class="games__saved">
        <h2>Сохраненные темы</h2>
        <div class="games__filters">
          <MainInput name="search" placeholder="Поиск тем" v-model="search" size="large" />
        </div>
        <n-scrollbar x-scrollable trigger="none">
          <div class="games__saved-list">
            <PopularGameCard />
            <PopularGameCard />
            <PopularGameCard />
            <PopularGameCard />
            <PopularGameCard />
            <PopularGameCard />
            <PopularGameCard />
          </div>
        </n-scrollbar>
      </div>
    </div>
    <div class="games__content">
      <div class="games__active">
        <h2>Ожидают игры</h2>
        <ActiveRoomsList/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PopularGameCard from '@/components/ui/card/PopularGameCard.vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import { onMounted, ref, computed } from 'vue'
import GameStart from '@/components/games/GameStart.vue'
import GameWaiting from '@/components/games/GameWaiting.vue'
import { api, type Theme } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { NScrollbar } from 'naive-ui'
import { isErrorMessage } from '@/utils/error.ts'
import ActiveRoomsList from '@/components/rooms/ActiveRoomsList.vue'
import { useRoomStore } from '@/stores/useRoomStore.ts'

const roomStore = useRoomStore()
const processingStore = useProcessingStore()
const search = ref<string>('')

const currentRoom = computed(() => roomStore.room)

const popularGames = ref<Theme[]>([])

async function fetchPopularGames() {
  try {
    processingStore.startLoading()
    const res = await api.themes.popular()
    popularGames.value = res.themes
    console.log(res.themes)
  } catch (e) {
    if (isErrorMessage(e, 'error'))
      processingStore.setMessage('error', 'Ошбка', 'Ошибка получения сохраненных тем')
  } finally {
    processingStore.stopLoading()
  }
}

onMounted(() => {
  fetchPopularGames()
})
</script>

<style scoped lang="scss">
.games {
  padding: 48px $side-padding 64px $side-padding;
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
