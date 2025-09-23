<template>
  <div
    class="center"
    :class="{
      full_screen: full_screen == true,
      background_cover: cover_flag == true,
    }"
    v-if="if_show == true"
  >
    <div
      class="atom-spinner"
      :class="{
        large_spinner: size == 'large',
        small_spinner: size == 'small',
      }"
    >
      <div class="spinner-inner">
        <div class="spinner-line"></div>
        <div class="spinner-line"></div>
        <div class="spinner-line"></div>
        <!--Chrome renders little circles malformed :(-->
        <div class="spinner-circle">&#9679;</div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
export default {
  name: 'SpinnerComp',
  props: {
    size: { type: String, default: 'normal' },
    full_screen: { type: Boolean, default: true },
    cover_flag: { type: Boolean, default: true }
  },
  setup() {
    const if_show = ref(false)

    return {
      if_show
    }
  },
  methods: {
    show() {
      if(!this.if_show){
        this.if_show = true
        document.body.style.overflow = 'hidden'
      }
    },
    hide() {
      if(this.if_show) {
        this.if_show = false
        document.body.style.overflow = ''
      }
    }
  }
}
</script>

<style lang="css" scoped>
.center {
  z-index: 9999;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
}

.background_cover {
  background: #88888830;
}

.full_screen {
  width: 100vw;
  height: 100vh;
  position: fixed;
}

.atom-spinner,
.atom-spinner * {
  box-sizing: border-box;
}

.atom-spinner {
  height: 120px;
  width: 120px;
  overflow: hidden;
}

.large_spinner {
  height: 180px;
  width: 180px;
}

.small_spinner {
  height: 60px;
  width: 60px;
}

.atom-spinner .spinner-inner {
  position: relative;
  display: block;
  height: 100%;
  width: 100%;
}

.atom-spinner .spinner-circle {
  display: block;
  position: absolute;
  color: #409eff;
  font-size: calc(60px * 0.28);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.atom-spinner .spinner-line {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation-duration: 1s;
  border-left-width: calc(60px / 20);
  border-top-width: calc(60px / 20);
  border-left-color: #409eff;
  border-left-style: solid;
  border-top-style: solid;
  border-top-color: transparent;
}

.atom-spinner .spinner-line:nth-child(1) {
  animation: atom-spinner-animation-1 1s linear infinite;
  transform: rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
}

.atom-spinner .spinner-line:nth-child(2) {
  animation: atom-spinner-animation-2 1s linear infinite;
  transform: rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
}

.atom-spinner .spinner-line:nth-child(3) {
  animation: atom-spinner-animation-3 1s linear infinite;
  transform: rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
}

@keyframes atom-spinner-animation-1 {
  100% {
    transform: rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
  }
}

@keyframes atom-spinner-animation-2 {
  100% {
    transform: rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
  }
}

@keyframes atom-spinner-animation-3 {
  100% {
    transform: rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
  }
}
</style>
