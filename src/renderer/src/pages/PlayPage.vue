<template>
  <div class="play-page" :style="playPageBackground">
    <div class="background" :style="backgroundImage"></div>
    <div class="background-mask"></div>
    <div class="background-shadow" :style="boxShadow"></div>
    <div class="nav-bar">
      <v-btn class="v-btn" variant="text" size="32" icon @click="$router.go(-1)">
        <v-icon icon="mdi-arrow-left"> </v-icon>
      </v-btn>
      <v-spacer class="drag"></v-spacer>
      <Menu />
    </div>
    <div class="page">
      <SongControl class="song-control" />
      <v-spacer></v-spacer>
      <ShowModel class="lyric" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import Menu from '@renderer/components/navigator/components/Menu.vue'
  import SongControl from '@renderer/components/playPage/SongControl.vue'
  import ShowModel from '@renderer/components/playPage/ShowModel.vue'
  import { computed, inject, ref, watch } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { getAverageRGB } from '@renderer/hooks/colorHook'
  import { onBeforeRouteLeave } from 'vue-router'

  const stateStore = useStateStore()
  const preColor = stateStore.trackMainColor.color
  const imgSize = 512
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const backgroundImage = ref({
    backgroundImage: '',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  })
  const mainColor = ref('rgba(0, 0, 0, 0.5)')
  const playPageBackground = computed(() => {
    return {
      backgroundColor: mainColor.value,
      color: stateStore.trackMainColor.color
    }
  })
  const boxShadow = computed(() => {
    return {
      boxShadow: `inset 5px 5px 20px 0px ${mainColor.value}, inset -5px -5px 20px 0px ${mainColor.value}`
    }
  })
  onBeforeRouteLeave((_to, _from) => {
    stateStore.trackMainColor.color = preColor
  })
  const coverImg = computed(() => {
    if (currentTrack.value.local) {
      return currentTrack.value.al.picUrl
    } else {
      return currentTrack.value.al.picUrl + `?param=${imgSize}y${imgSize}`
    }
  })
  watch(
    currentTrack,
    () => {
      getAverageRGB(coverImg.value).then((averageRGB) => {
        // 增强颜色对比度
        // 获得颜色均值
        const maxChannelValue = Math.max(...averageRGB)
        averageRGB = averageRGB.map((item) => (item / maxChannelValue) * 255)

        mainColor.value = `rgb(${averageRGB[0]},${averageRGB[1]},${averageRGB[2]})`
        stateStore.trackMainColor.color = `rgb(${averageRGB[0]},${averageRGB[1]},${averageRGB[2]})`
      })
      backgroundImage.value.backgroundImage = `url(${coverImg.value}`
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  .play-page {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 2;
    background: none;
  }
  .background {
    width: 100%;
    height: 100%;
    position: absolute;
    filter: blur(10px);
    border-radius: 20px;
    z-index: 0;
  }
  .background-mask {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0.3;
    z-index: 0;
    background-color: black;
  }
  .background-shadow {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 2000;
    pointer-events: none;
    opacity: 0.8;
  }
  .page {
    width: 100%;
    height: 100%;
    padding: 8%;
    display: flex;
    // inset /* 右侧阴影 */ 200px 0 0 0 rgba(255, 24, 24, 0.5),
    // inset/* 底部阴影 */ 0 200px 0 0 rgba(255, 24, 24, 0.5),
    // inset/* 左侧阴影 */ 0 -200px 0 0 rgba(255, 24, 24, 0.5);
  }
  .nav-bar {
    height: 12%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 84%;
    left: 8%;
  }
  .drag {
    height: 100%;
    -webkit-app-region: drag;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .song-control {
    width: 40%;
  }
  .lyric {
    width: 55%;
  }
</style>
