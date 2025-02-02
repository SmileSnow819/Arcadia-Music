<template>
  <v-app class="app">
    <div class="background" :style="stateStore.backgroundImage"></div>
    <div v-if="stateStore.background.background === 'none'" class="background-mask"></div>
    <Tips></Tips>
    <DeskLyric v-if="stateStore.openLyric"></DeskLyric>
    <RouterView>
      <template #default="{ Component }">
        <Transition>
          <Component :is="Component" />
        </Transition>
      </template>
    </RouterView>
  </v-app>
</template>

<script setup lang="ts">
  import { inject } from 'vue'
  import type Player from '@renderer/utils/player'
  import { type Setting } from '@renderer/utils/setting'
  import { useStateStore } from './store/stateStore'
  import { useUserStore } from './store/userStore'
  import { useRouter } from 'vue-router'
  import DeskLyric from './components/publicComponents/DeskLyric.vue'
  import Tips from './components/publicComponents/Tips.vue'
  const userStore = useUserStore()
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const globalSetting = inject('setting') as Setting
  player.volume = globalSetting.settings.volume
  player.playMode = globalSetting.settings.playMode
  userStore.getNetEaseCloudAccount()
  //如果有自定义背景图片，加载图像
  if (globalSetting.settings.imgDir) {
    stateStore.background.background = 'none'
    window.electron.ipcRenderer
      .invoke('read-img', globalSetting.settings.imgDir)
      .then((img: Uint8Array) => {
        //转化为二进制
        const blob = new Blob([img])
        stateStore.backgroundImage.backgroundImage = `url(${URL.createObjectURL(blob)})`
      })
  }
  const router = useRouter()
  const homePage = JSON.parse(localStorage.getItem('settings') as string).homePage
  router.push({ name: homePage || 'local' })
</script>
<style lang="scss">
  .v-enter-active {
    animation: enter 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }
  .v-leave-active {
    animation: leave 0.4s cubic-bezier(0.455, 0.03, 0.515, 0.955);
  }
  .background {
    width: 100%;
    height: 100%;
    position: absolute;
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
  @keyframes leave {
    0% {
      transform: translate(0%, 0%);
    }
    100% {
      transform: translate(100%, 0%);
    }
  }
  @keyframes enter {
    0% {
      transform: translate(100%, 0%);
    }
    100% {
      transform: translate(0%, 0%);
    }
  }
  .app {
    user-select: none;
    width: 100vw;
    height: 100vh;
  }
  /* 滚动条整体样式 */
  ::-webkit-scrollbar {
    width: 7px; /* 滚动条宽度 */
    height: 10px; /* 垂直滚动条高度，如果需要的话 */
  }

  /* 滚动条轨道 */
  ::-webkit-scrollbar-track {
    display: none;
    // background: rgb(var(--v-theme-surface)); /* 轨道颜色 */
    // border-radius: 10px; /* 滑块圆角 */
    // opacity: 0.1;
  }

  /* 滚动条滑块 */
  ::-webkit-scrollbar-thumb {
    background: rgb(var(--v-theme-on-background)); /* 滑块颜色 */
    border-radius: 10px; /* 滑块圆角 */
  }
</style>
