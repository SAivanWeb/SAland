<template>
  <GameStart placement="games" />
  <div class="games">
    <div v-if="0" class="games__waiting">
      <GameWaiting role="user" />
    </div>
    <div class="games__container">
      <div class="games__content">
        <h2 class="games__subtitle">Популярные игры</h2>
        <MainInput name="search" placeholder="Поиск игры" v-model="search" size="large" />
        <div class="games__list">
          <PopularGameCard />
          <PopularGameCard />
          <PopularGameCard />
        </div>
      </div>
      <div class="games__divider"></div>
      <div class="games__content">
        <h2 class="games__subtitle">Ожидают игры</h2>
        <div class="games__list">
          <ActiveGameCard />
          <ActiveGameCard />
          <ActiveGameCard />
          <ActiveGameCard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PopularGameCard from '@/components/ui/card/PopularGameCard.vue'
import ActiveGameCard from '@/components/ui/card/ActiveGameCard.vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import { onMounted, ref } from 'vue'
import GameStart from '@/components/games/GameStart.vue'
import GameWaiting from '@/components/games/GameWaiting.vue'
import { api, type Theme } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

const processingStore = useProcessingStore()
const search = ref<string>('')



const popularGames = ref<Theme[]>([])

async function fetchPopularGames() {
  try {
    processingStore.startLoading()
    const res = await api.themes.popular()
    popularGames.value = res.themes;

  } catch (error) {
    console.log(error)
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
  gap: 48px;

  &__waiting {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
  }

  &__container {
    display: grid;
    grid-template-columns: 1fr 1px 1fr;
    grid-gap: 24px;
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__divider {
    border-left: 1px solid $border;
  }
}
</style>
