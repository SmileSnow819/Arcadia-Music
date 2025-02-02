<template>
  <div class="show-model-container">
    <v-switch
      class="switch-btn"
      v-model="model"
      hide-details
      :color="stateStore.trackMainColor.color"
      @click="switchModel"
    ></v-switch>
    <Lyric v-if="model" />
    <Frequency v-else />
  </div>
</template>

<script setup lang="ts">
  import Lyric from './Lyric.vue'
  import Frequency from './Frequency.vue'
  import { ref } from 'vue'
  import { useStateStore } from '@renderer/store/stateStore'

  const stateStore = useStateStore()
  const model = ref(true)
  function switchModel() {
    model.value = !model.value
  }
</script>

<style lang="scss" scoped>
  .show-model-container {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
  }
  .switch-btn {
    position: absolute;
    right: 0;
    z-index: 1500;
  }
  :deep(.v-btn__underlay) {
    display: none;
  }
</style>
