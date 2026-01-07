<template>
  <MainContainer>
    <div class="games">
      <div class="games__container">
        <div class="games__content">
          <h2 class="games__subtitle">Популярные игры</h2>
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
            <ActiveGameCard/>
            <ActiveGameCard/>
            <ActiveGameCard/>
            <ActiveGameCard/>
          </div>
        </div>
      </div>
    </div>
  </MainContainer>
</template>

<script setup lang="ts">
import MainContainer from '@/components/template/MainContainer.vue'
import PopularGameCard from '@/components/ui/card/PopularGameCard.vue'
import ActiveGameCard from '@/components/ui/card/ActiveGameCard.vue'
</script>

<style scoped lang="scss">
.games {
  &__container {
    display: grid;
    grid-template-columns: 1fr 2px 1fr;
    grid-gap: 24px;
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
