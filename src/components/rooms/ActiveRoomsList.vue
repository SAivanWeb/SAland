<template>
  <div class="rooms">
    <template v-if="rooms?.length">
      <ActiveGameCard v-for="item in rooms" :key="item.id" :item="item" />
    </template>
    <div v-else class="rooms__nodata">Нет активных комнат</div>
  </div>
</template>

<script setup lang="ts">
import ActiveGameCard from '@/components/ui/card/ActiveGameCard.vue'
import { type RoomListItem, useWebSocket } from '@/api'
import { onMounted, onUnmounted, ref } from 'vue'

const ws = useWebSocket()
const unsubs: (() => void)[] = []
const rooms = ref<RoomListItem[]>()

onMounted(() => {
  ws.rooms.subscribeLobby()
  unsubs.push(
    ws.rooms.onList((data) => {
      rooms.value = data
    }),
  )
})

onUnmounted(() => {
  unsubs.forEach((fn) => fn())
  ws.rooms.unsubscribeLobby()
})
</script>

<style scoped lang="scss">
.rooms {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__nodata {
    @include body-1-bold;
    color: $text-grey;
    margin: 0 auto;
  }
}
</style>
