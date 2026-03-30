<template>
  <div class="players">
    <h2 class="players__title">{{ room.theme?.name }}</h2>
    <div class="players__list">
      <div v-for="player in room.players" :key="player.user_id" class="players__list-user players__list-user--filled">
        <PlayerIcon :name="player.name" />
      </div>
      <div v-for="n in emptySlots" :key="'empty-' + n" class="players__list-user players__list-user--empty">
        <n-icon size="24" color="#858585">
          <AddCircle />
        </n-icon>
      </div>
    </div>
    <MainButton title="Выйти" size="medium" @click="leave"/>
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import { useRoomStore } from '@/stores/useRoomStore.ts'
import type { RoomState } from '@/api'
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { AddCircle } from '@vicons/ionicons5'

interface Props {
  room: RoomState
}

const props = defineProps<Props>()

const roomStore = useRoomStore()

const leave = () => {
  roomStore.leaveRoom()
}

const emptySlots = computed(() => {
  if (props.room) return props.room.players_count - props.room.players.length
  return 0
})
</script>

<style scoped lang="scss">
.players {
  padding: 20px 24px;
  background: #fff;
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

    &-user {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      &--empty {
        border-radius: 50%;
        border: 2px solid $border;
        background: $background;
      }
    }
  }

  & .button{
    width: fit-content;
    margin-left: auto;
  }
}
</style>
