<template>
  <div class="volume-bar">
    <div
      class="bar-container"
      @mousedown="FProgressUpdate"
      @mousemove="FDrag"
      @wheel.passive="FWheel"
    >
      <div class="linear rounded">
        <div class="finished rounded" :style="bgColor"></div>
      </div>
    </div>
    <v-btn icon variant="text" @click="FMute" :style="stateStore.trackMainColor">
      <v-icon :icon="FGetState()" size="x-large"></v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  import { inject, computed, ref } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { type Setting } from '@renderer/utils/setting'
  const globalSetting = inject('setting') as Setting
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const volume = ref(player.volume)
  const bgColor = computed(() => {
    return {
      backgroundColor: stateStore.trackMainColor.color,
      width: `${volume.value}%`
    }
  })
  let preVolume = 0
  let isMute = false
  const volumeIcon = ['mdi-volume-mute', 'mdi-volume-low', 'mdi-volume-medium', 'mdi-volume-high']
  function FSetVolume() {
    globalSetting.settings.volume = volume.value
    player.setVolume(volume.value)
  }
  function FProgressUpdate(event: MouseEvent) {
    const clickX = event.offsetX
    const target = event.target as HTMLElement // 类型断言为 HTMLElement
    const width = target?.offsetWidth
    volume.value = (clickX / width) * 100
    if (volume.value > 99) volume.value = 100
    if (volume.value < 1) volume.value = 0
    FSetVolume()
  }
  function FDrag(event: MouseEvent) {
    //如果是鼠标左键
    if (event.buttons === 1) FProgressUpdate(event)
  }
  function FWheel(event: WheelEvent) {
    if (volume.value - 1 < 0) {
      volume.value = 0
      if (volume.value + 1 > 100) volume.value = 100
      FSetVolume()
    }
    if (event.deltaY > 0) {
      volume.value + 1 > 100 ? (volume.value = 100) : (volume.value += 1)
    } else if (event.deltaY < 0) {
      volume.value - 1 < 0 ? (volume.value = 0) : (volume.value -= 1)
    }
    FSetVolume()
  }
  function FGetState() {
    if (volume.value === 0) return volumeIcon[0]
    else if (volume.value <= 33) return volumeIcon[1]
    else if (volume.value <= 66) return volumeIcon[2]
    else return volumeIcon[3]
  }
  function FMute() {
    isMute = !isMute
    if (isMute) {
      preVolume = volume.value
      volume.value = 0
    } else {
      volume.value = preVolume
    }
    FSetVolume()
  }
</script>

<style lang="scss" scoped>
  .volume-bar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .bar-container {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .finished {
    position: absolute;
    height: 100%;
    background-color: rgb(var(--v-theme-secondary));
    transition: all 0.3s;
    pointer-events: none;
  }
  .linear {
    width: 100%;
    height: 7px;
    position: relative;
    background-color: rgb(0, 0, 0);
    cursor: pointer;
    transition: all 0.5s;
  }
</style>
