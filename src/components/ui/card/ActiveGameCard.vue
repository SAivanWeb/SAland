<template>
  <div v-if="item" class="card">
    <div class="card__info">
      <h3 class="card__title">{{ item.theme_name }}</h3>
      <div class="card__meta">
        <div class="card__players-count">
          <n-icon size="18">
            <People />
          </n-icon>
          <span>{{ item.players.length }}/{{ item.players_count }}</span>
        </div>
      </div>
    </div>
    <div class="card__players">
      <div v-for="player in item.players" :key="player.user_id" class="card__player card__player--filled">
        <PlayerIcon :name="player.name" />
      </div>
      <div v-for="n in emptySlots" :key="'empty-' + n" class="card__player card__player--empty">
        <n-icon size="24" color="#858585">
          <AddCircle />
        </n-icon>
      </div>
    </div>
    <div class="card__action">
      <MainButton title="Войти" size="medium" color="yellow" @click="join(item.id)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { People, AddCircle } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { computed } from 'vue'
import type { RoomListItem } from '@/api'
import { useRoomStore } from '@/stores/useRoomStore.ts'

const props = defineProps<{
  item: RoomListItem
}>()
const roomStore = useRoomStore()

const emptySlots = computed(() => props.item.players_count - props.item.players.length)

const join = (id: string) => {
  roomStore.joinRoom(id)
}
</script>

<style scoped lang="scss">
.card {
  padding: 16px 20px;
  background: $primary-green;
  border-radius: $border-radius;
  border: 2px solid $border;
  box-shadow: $box-shadow;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s ease;

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__title {
    color: $text-dark;
    @include body-1-bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__players-count {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: $primary-orange;
    border: 2px solid $border;
    border-radius: 6px;

    & span {
      @include body-2-bold;
      color: $text-dark;
    }
  }

  &__players {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__player {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s ease;

    &--empty {
      border-radius: 50%;
      border: 2px solid $border;
      background: $background;
      cursor: pointer;

      &:hover {
        background: $primary-yellow;
        transform: scale(1.1);
      }
    }
  }

  &__action {
    margin-left: auto;
  }
}
</style>
