<template>
  <div class="tips">
    <Tip
      v-for="(tip, i) in tips"
      :key="tip.time"
      :tips-mask="FTips"
      :tip="tip.tip"
      :index="i"
    ></Tip>
  </div>
</template>

<script setup lang="ts">
  import { watch, shallowReactive, type ShallowReactive } from 'vue'
  import { useStateStore } from '@renderer/store/stateStore'
  const tips = shallowReactive([]) as ShallowReactive<Array<any>>
  const tipsMask = [] as Array<boolean>
  const stateStore = useStateStore()
  let preTime = 0
  function FTips() {
    return tipsMask
  }
  watch(
    () => stateStore.tip,
    () => {
      if (!stateStore.tip) return
      const data = {
        time: Date.now(),
        tip: stateStore.tip
      }
      const index = tipsMask.findIndex((item) => !item)
      if (index !== -1) {
        tips.splice(index, 1, data)
        tipsMask.splice(index, 1, true)
      } else {
        tips.push(data)
        tipsMask.push(true)
      }
      stateStore.tip = ''
      preTime = Date.now()
      setTimeout(() => {
        if (Date.now() - preTime > 5000) {
          tipsMask.splice(0, tipsMask.length)
          tips.splice(0, tips.length)
        }
      }, 6000)
    }
  )
</script>

<style lang="scss" scoped>
  .tips {
    height: 0px;
    overflow: visible;
    position: absolute;
    top: 10%;
    z-index: 5000;
    pointer-events: none;
    transition: all 0.3s;
  }
</style>
