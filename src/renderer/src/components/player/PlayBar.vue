<template>
  <div class="play-bar">
    <ProgressLinear class="progress-linear" />
    <div class="bottom-nav" grow :style="stateStore.background">
      <SongInfos />
      <v-spacer />
      <PlayBtn />
      <v-spacer />
      <VolumeBar />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import PlayBtn from './components/PlayBtn.vue'
  import VolumeBar from './components/VolumeBar.vue'
  import SongInfos from './components/SongInfos.vue'
  import ProgressLinear from './components/ProgressLinear.vue'
  import { inject, watch } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { type Setting } from '@renderer/utils/setting'
  import { useRoute } from 'vue-router'
  import { getAverageRGB } from '@renderer/hooks/colorHook'
  const route = useRoute()
  const globalSettings = inject('setting') as Setting
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  //playPage页面不执行
  if (route.name !== 'playPage' && globalSettings.settings.theme.autoColor) {
    watch(
      currentTrack,
      () => {
        if (!currentTrack.value.al) return
        else {
          const url = currentTrack.value.al.picUrl.startsWith('http')
            ? currentTrack.value.al.picUrl + `?param=64y64`
            : currentTrack.value.al.picUrl
          getAverageRGB(url).then((averageRGB) => {
            // 增强颜色对比度
            // 获得颜色均值
            const maxChannelValue = Math.max(...averageRGB)
            averageRGB = averageRGB.map((item) => (item / maxChannelValue) * 255)
            stateStore.trackMainColor.color = `rgb(${averageRGB[0]},${averageRGB[1]},${averageRGB[2]})`
          })
        }
      },
      { immediate: true }
    )
  } else {
    //如果没有设置自动取色，就设置默认颜色
    stateStore.trackMainColor.color = 'rgb(var(--v-theme-on-surface))'
  }
</script>

<style lang="scss" scoped>
  .play-bar {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .progress-linear {
    align-self: center;
    width: 99%;
  }
  .bottom-nav {
    display: flex;
    align-items: center;
    backdrop-filter: blur(50px);
    border-radius: 20px;
  }
  :deep(.song-info) {
    width: 20%;
  }
  :deep(.volume-bar) {
    width: 20%;
  }
  :deep(.play-btn) {
    width: 40%;
  }
</style>
