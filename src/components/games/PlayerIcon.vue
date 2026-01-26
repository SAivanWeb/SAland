<template>
  <n-tooltip placement="bottom" trigger="hover">
    <template #trigger>
      <div class="player">{{ iconName }}</div>
    </template>
    <span> {{ name }} </span>
  </n-tooltip>
</template>

<script setup lang="ts">
import { NTooltip } from 'naive-ui';
import { computed } from 'vue'

interface Props {
  name: string
}

const props = defineProps<Props>()

const iconName = computed(() => {
  return props.name[0]
})
</script>

<style scoped lang="scss">
.player {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary 0%, $primary-hover 100%);
  border-radius: 50%;
  color: $background;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 2px 10px $primary-glow;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px $primary-glow;
  }
}
</style>
