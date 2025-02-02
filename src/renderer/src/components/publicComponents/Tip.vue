<template>
  <div
    class="tip"
    :class="{ show: showTip, hide: !showTip }"
    :style="stateStore.background"
    @animationend="FHide($event)"
    elevation="10"
  >
    <div class="tip-text">{{ tip }}</div>
    <v-progress-linear v-model="progress" color="primary"></v-progress-linear>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineProps, defineEmits } from 'vue'
  import { useStateStore } from '@renderer/store/stateStore'
  const emit = defineEmits(['hided'])
  const stateStore = useStateStore()
  const progress = ref(100)
  const showTip = ref(true)
  const props = defineProps({
    index: {
      type: Number,
      default: ''
    },
    tipsMask: {
      type: Function,
      default: () => []
    },
    tip: {
      type: String
    }
  })
  const index = props.index
  const tipsMask = props.tipsMask() as boolean[]
  let id = setInterval(() => {
    progress.value -= 5
    if (progress.value <= 0) {
      showTip.value = false
      clearInterval(id)
    }
  }, 120)
  function FHide(event: AnimationEvent) {
    if (event.animationName === 'hide-animation') {
      while (tipsMask[index]) {
        tipsMask[index] = false
      }
    }
  }
</script>

<style lang="scss">
  .tip {
    transition: all 0.3s;
    width: 200px;
    backdrop-filter: blur(50px);
    border-radius: 0 10px 0px 0;
    padding: 5px;
    margin: 5px 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: rgb(var(--v-theme-on-surface));
    z-index: 5000;
    text-align: center;
  }

  @keyframes show-animation {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(10px);
    }
  }
  @keyframes hide-animation {
    0% {
      transform: translateX(10px);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  .show {
    animation: show-animation 0.5s forwards;
  }
  .hide {
    animation: hide-animation 0.5s forwards;
  }
  .tip-text {
    color: rgb(var(--v-theme-on-surface));
  }
</style>
