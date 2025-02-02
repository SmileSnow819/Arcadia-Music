<template>
  <div class="frequency">
    <div ref="spark-line" class="spark-line"></div>
  </div>
</template>

<script setup lang="ts">
  import { shallowRef, inject, useTemplateRef, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import type Player from '@renderer/utils/player'
  import * as echarts from 'echarts'
  import { useStateStore } from '@renderer/store/stateStore'
  const stateStore = useStateStore()
  const sparkline = useTemplateRef('spark-line')
  const player = inject('player') as Player
  const buffer = shallowRef([]) as any
  let id = {} as any
  let myChart = {} as any
  onMounted(() => {
    nextTick(() => {
      myChart = echarts.init(sparkline.value)
      myChart.setOption({
        polar: {
          radius: ['70%', '100%']
        },
        radiusAxis: {
          show: false,
          max: 255 ** 2.72
        },
        angleAxis: {
          type: 'category',
          startAngle: 90,
          show: false
        },
        tooltip: {},
        series: {
          itemStyle: {
            // 一般情况下，圆角的设置是在 itemStyle 中
            borderRadius: [10, 10, 10, 10]
          },
          animationDuration: 100,
          animationDurationUpdate: 100,
          type: 'bar',
          data: new Array(64).fill(0),
          coordinateSystem: 'polar',
          label: {
            show: false,
            position: 'middle',
            formatter: '{b}: {c}'
          }
        }
      })
      id = player.onFrequency((frequency) => {
        buffer.value = Array.from(frequency)
        myChart.setOption({
          color: [stateStore.trackMainColor.color || 'white'],
          animationEasingUpdate: 'linear',
          series: {
            animationDuration: 50,
            animationDurationUpdate: 50,
            type: 'bar',
            data: buffer.value.slice(0, 64).map((e) => e ** 3),
            coordinateSystem: 'polar'
          }
        })
      })
    })
  })
  onBeforeUnmount(() => {
    clearInterval(id)
    myChart = null
  })
</script>

<style lang="scss" scoped>
  .frequency {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .spark-line {
    height: 100%;
    width: 100%;
    align-self: center;
    position: relative;
  }
</style>
