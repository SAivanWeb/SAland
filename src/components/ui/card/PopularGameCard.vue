<template>
  <div class="card">
    <div class="card__header">
      <h3 class="card__title">{{ theme.name }}</h3>
    </div>
    <div class="card__stats">
      <div class="card__stat card__stat--like">
        <n-icon size="18">
          <Like />
        </n-icon>
        <span>{{ theme.likes }}</span>
      </div>
      <div class="card__stat card__stat--dislike">
        <n-icon size="18">
          <Dislike />
        </n-icon>
        <span>{{ theme.dislikes }}</span>
      </div>
      <div class="card__stat card__stat--rating">
        <n-icon size="24">
          <Difficult />
        </n-icon>
        <span>{{ themeDifficulty(theme.difficulty) }}</span>
      </div>
    </div>
    <div class="card__footer">
      <MainButton title="Играть" size="small" color="purple" @click="createRoom(theme.id)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import { NIcon } from 'naive-ui'
import Like from '@/assets/icons/like.vue'
import Dislike from '@/assets/icons/dislike.vue'
import Difficult from '@/assets/icons/difficult.vue'
import type { Theme } from '@/api'
import { useRoomStore } from '@/stores/useRoomStore.ts'
import {useRouter} from 'vue-router'

interface Props {
  theme: Theme
}

const props = defineProps<Props>()
const router = useRouter()
const roomStore = useRoomStore()

const themeDifficulty = (type: string) => {
  if (type === 'hard') {
    return 'Тяжелая'
  } else if (type === 'medium') {
    return 'Средняя'
  } else if (type === 'easy') {
    return 'Легкая'
  }
}

const createRoom = (id: string) => {
  roomStore.createRoom()
  router.push({ path: '/game-create', query: { theme: id }, state: { fresh: true } })
}
</script>

<style scoped lang="scss">
.card {
  padding: 16px;
  background: $primary-yellow;
  border-radius: $border-radius;
  border: 2px solid $border;
  box-shadow: $box-shadow;
  min-width: 280px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__title {
    color: $text-dark;
    @include body-1-bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__stats {
    display: flex;
    gap: 8px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 2px solid $border;
    flex: 1;

    & span {
      @include body-2-bold;
      color: $text-dark;
    }

    &--like {
      background: $primary-green;
    }

    &--dislike {
      background: $primary-red;
    }

    &--rating {
      background: $primary-blue;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: stretch;

    & button {
      width: 100%;
    }
  }
}
</style>
