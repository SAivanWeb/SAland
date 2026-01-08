<template>
  <div class="players">
    <h2 class="players__title">Ожидание игроков</h2>
    <div class="players__list">
      <PlayerIcon name="Oleg" />
    </div>
    <MainButton v-if="role === 'user'" title="Выйти" size="medium" />
    <MainButton v-else title="Отменить" size="medium" />
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import PlayerIcon from '@/components/games/PlayerIcon.vue'

interface Props {
  role: string
  players?: Array<string>
}

const props = defineProps<Props>()
</script>

<style scoped lang="scss">
.players {
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid $border;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
