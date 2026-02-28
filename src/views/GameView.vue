<template>
  <div class="game">

  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/useGameStore.ts'
import { computed, onMounted } from 'vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

const processingStore = useProcessingStore()
const gameStore = useGameStore()

const game = computed(() => {
  return gameStore.currentGame
})

onMounted(() => {
  if (!game.value) {
    processingStore.startLoading()
  }
})
</script>

<style scoped lang="scss">
.game {
  position: relative;
  width: 100%;
  height: 100vh;

}
</style>