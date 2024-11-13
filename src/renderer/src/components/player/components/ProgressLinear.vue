<template>
  <div
    class="process-container"
    ref="process-container"
    @click="FProgressUpdate"
    @mousemove="FDrag"
  >
    <v-progress-linear
      v-model="progress"
      :buffer-value="buffer"
      :color="stateStore.trackMainColor.color"
      height="7"
      rounded="lg"
    ></v-progress-linear>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onBeforeUnmount, useTemplateRef } from 'vue'
  import { inject } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { onBeforeRouteLeave } from 'vue-router'
  const processContainer = useTemplateRef('process-container')
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const progress = ref(0)
  const buffer = ref(stateStore.buffer)
  let preProgress = 0
  const fPro = player.onProgressUpdate((currentProgress: number) => {
    if (Math.abs(preProgress - currentProgress) < 1) return
    preProgress = currentProgress
    progress.value = preProgress
  })
  const fBuf = player.onBufferUpdate((currentProgress: number) => {
    buffer.value = currentProgress
  })
  onBeforeRouteLeave((_to, _from) => {
    stateStore.buffer = buffer.value
  })
  onBeforeUnmount(() => {
    player.removeProgressUpdate(fPro)
    player.removeBufferUpdate(fBuf)
  })

  function FProgressUpdate(event: MouseEvent) {
    const clickX = event.offsetX
    const target = processContainer.value as HTMLElement // 类型断言为 HTMLElement
    progress.value = (clickX / target.offsetWidth) * 100
    player.setProgress(progress.value)
  }
  function FDrag(event: MouseEvent) {
    //如果是鼠标左键
    if (event.buttons === 1) FProgressUpdate(event)
  }
  // function FWheel(event: WheelEvent) {
  //   if (event.deltaY > 0 && progress.value + 1 < 100) {
  //     progress.value += 1
  //     player.setCurrentTime(progress.value)
  //   } else if (event.deltaY < 0 && progress.value - 1 > 0) {
  //     progress.value -= 1
  //     player.setCurrentTime(progress.value)
  //   } else return
  // }
</script>

<style lang="scss" scoped>
  .process-container {
    width: 100%;
    cursor: pointer;
  }
  :deep(.v-progress-linear__determinate) {
    border-radius: 10px;
  }
  :deep(.v-progress-linear__buffer) {
    border-radius: 10px;
    opacity: 0.5;
  }
</style>
