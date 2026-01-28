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
  padding: 20px 24px;
  background: $primary-green;
  border-radius: $border-radius;
  border: 2px solid $border;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s ease;


  &__title {
    color: $text-dark;
  }

  &__list {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
