<template>
  <div class="preloader">
    <div class="loader">
      <div class="spinner">
        <div class="container">
          <div class="hex0"></div>
          <div class="hex120"></div>
          <div class="hex240"></div>
          <div class="spinner">
            <div class="container">
              <div class="hex0"></div>
              <div class="hex120"></div>
              <div class="hex240"></div>
              <div class="spinner">
                <div class="container">
                  <div class="hex0"></div>
                  <div class="hex120"></div>
                  <div class="hex240"></div>
                  <div class="spinner">
                    <div class="container">
                      <div class="hex0"></div>
                      <div class="hex120"></div>
                      <div class="hex240"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.preloader {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, $primary 0%, $primary-hover 100%);
  box-shadow: 0 0 60px $primary-glow;
}

.loader {
  box-sizing: border-box;
  width: 100px;
  height: 100px;
  position: relative;
  filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
}

.container {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.spinner {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  animation:
    rotation0 4s infinite linear,
    resize2 4s infinite linear;
}

.hex0,
.hex120,
.hex240 {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  height: 57.74%;
  left: 0;
  top: 21.13%;
  border-left: 2px solid $background;
  border-right: 2px solid $background;
}

.hex0 {
  animation: rotation0 4s infinite linear;
}

.hex120 {
  transform: rotate(120deg);
  animation: rotation120 4s infinite linear;
}

.hex240 {
  transform: rotate(240deg);
  animation: rotation240 4s infinite linear;
}

@keyframes rotation0 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotation120 {
  0% {
    transform: rotate(120deg);
  }
  100% {
    transform: rotate(480deg);
  }
}

@keyframes rotation240 {
  0% {
    transform: rotate(240deg);
  }
  100% {
    transform: rotate(600deg);
  }
}

@keyframes resize2 {
  0%,
  33.33%,
  66.66%,
  100% {
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;
  }
  16.66%,
  49.99%,
  83.333% {
    width: 70%;
    height: 70%;
    left: 15%;
    top: 15%;
  }
}
</style>
