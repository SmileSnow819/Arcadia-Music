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
  import { inject, ref, onBeforeUnmount } from 'vue'
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
  const baseURL = globalSetting.settings.tracksDir
  player.volume = globalSetting.settings.volume
  player.playMode = globalSetting.settings.playMode

  userStore.getNetEaseCloudAccount()
  const currentTrack = player.currentTrack
  const state = ref(player.getPlayState())
  //初始化最近播放列表
  async function init() {
    const tracksList = (await window.electron.ipcRenderer.invoke(
      'store-get',
      'recentPlay'
    )) as any[]
    if (!tracksList) return
    const localTracks = tracksList.filter((track) => track.local)
    const netEaseTracks = tracksList.filter((track) => !track.local)
    let localTracksData = [] as any[]
    let netEaseTracksData = [] as any[]
    if (localTracks.length !== 0) {
      localTracksData = await window.electron.ipcRenderer.invoke(
        'read-music-data',
        baseURL,
        localTracks.map((item: any) => item.id)
      )
      localTracksData.forEach((track: any) => {
        track.al.picUrl = URL.createObjectURL(new Blob(track.al.picUrl))
      })
    }
    if (netEaseTracks.length !== 0) {
      const ids = netEaseTracks.map((item: any) => {
        return {
          id: item.id
        }
      })
      netEaseTracksData = (await window.api.netEaseCloud.song_detail({ ids })).songs
    }

    const recentPlay = tracksList.map((trackInfo: any) => {
      if (trackInfo.local) {
        return localTracksData.find((item: any) => item.path === trackInfo.id)
      } else {
        return netEaseTracksData.find((item: any) => item.id === trackInfo.id)
      }
    })
    stateStore.recentPlay.unshift(...recentPlay)
  }
  init()
  function FPlayStateChange(isPlaying) {
    isPlaying ? (state.value = 1) : (state.value = 0)
    if (currentTrack.value.name && isPlaying) {
      stateStore.tip = '播放：' + currentTrack.value.name
      if (stateStore.recentPlay.length > 0 && stateStore.recentPlay[0].id == currentTrack.value.id)
        return
      if (stateStore.recentPlay.length == 100) {
        stateStore.recentPlay.pop()
        stateStore.recentPlay.unshift(Object.assign({}, currentTrack.value))
      } else {
        stateStore.recentPlay.unshift(Object.assign({}, currentTrack.value))
      }
      window.electron.ipcRenderer.invoke(
        'store-set',
        'recentPlay',
        stateStore.recentPlay.map((track) => {
          return {
            id: track.local ? track.path : track.id,
            local: track.local || false
          }
        })
      )
    }
  }
  const ids = player.onPlay(FPlayStateChange)
  onBeforeUnmount(() => {
    player.removeOnPlay(ids)
  })

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
