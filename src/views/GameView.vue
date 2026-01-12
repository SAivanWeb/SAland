<template>
  <div class="game__user first">
    <div class="game__user-name">MC_TRAHER</div>
    <div class="game__user-stat">Захвачено: <span>5</span></div>
  </div>
  <div class="game__user second">
    <div class="game__user-name">MC_TRAHER</div>
    <div class="game__user-stat">Захвачено: <span>5</span></div>
  </div>
  <div class="game__user third">
    <div class="game__user-name">MC_TRAHER</div>
    <div class="game__user-stat">Захвачено: <span>5</span></div>
  </div>
  <div class="game__user fourth">
    <div class="game__user-name">MC_TRAHER</div>
    <div class="game__user-stat">Захвачено: <span>5</span></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.game {
  &__user {
    padding: 12px 16px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid $border;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: absolute;
    &.first {
      top: 12px;
      left: 12px;
    }
    &.second {
      right: 12px;
      top: 12px;
    }
    &.third {
      bottom: 12px;
      left: 12px;
    }
    &.fourth {
      right: 12px;
      bottom: 12px;
    }

    &-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: $primary;
    }

    &-stat {
      font-size: 1.2rem;
      font-weight: 500;
    }
  }
}
</style>
