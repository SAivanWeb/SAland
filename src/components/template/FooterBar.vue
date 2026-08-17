<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__item"></div>
      <div class="footer__menu">
        <router-link class="footer__menu-link" to="/instruction">Как играть</router-link>
        <router-link class="footer__menu-link" to="/user-politic">Правила сайта</router-link>
      </div>
      <div class="footer__item"></div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.footer {
  padding: 24px 24px calc(24px + env(safe-area-inset-bottom));
  background: $primary-orange;
  min-height: $footer-height;

  &__content {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 24px;
  }

  &__menu {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &-link {
      @include body-1-bold;
      color: $text-dark;
      text-decoration: none;
    }
  }
}
</style>
