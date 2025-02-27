<template>
  <div class="current-playlist" ref="current-playlist">
    <div class="scroll-container">
      <v-virtual-scroll
        :items="nowPlaying"
        class="current-scroll"
        @click="FClickTrack"
        @dragstart="FDragStart"
        @dragend="FDragEnd"
        @drag="FDrag"
        @contextmenu.prevent="FCopy"
      >
        <template #default="{ item, index }">
          <div class="song-container">
            <v-divider
              v-if="index === currentIndex"
              thickness="5px"
              opacity="100"
              color="primary"
              class="current-song"
              vertical
            ></v-divider>
            <SongCard
              :key="nowPlaying[index].id"
              :song="item"
              :index="index"
              :img-size="imgSize"
              :show-album="false"
              :show-time="false"
              draggable="true"
            >
              <div v-if="nowPlaying[index].local" class="local-track">本地</div>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn variant="text" :ripple="false" icon v-bind="props">
                    <v-icon icon="mdi-dots-vertical" size="large"> </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="FHeart(item)">
                    <v-list-item-title>
                      <v-icon :icon="options[0].icon"></v-icon>
                      {{ options[0].title }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    v-if="!nowPlaying[index].local"
                    @click="downloadTrack([item], baseDir)"
                  >
                    <v-list-item-title>
                      <v-icon :icon="options[1].icon"></v-icon>
                      {{ options[1].title }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="FCollectTrack(item)">
                    <v-list-item-title>
                      <v-icon :icon="options[2].icon"></v-icon>
                      {{ options[2].title }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="FRemoveTrack(item)">
                    <v-list-item-title>
                      <v-icon :icon="options[3].icon"></v-icon>
                      {{ options[3].title }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </SongCard>
          </div>
        </template>
      </v-virtual-scroll>
    </div>
    <div class="options" :style="stateStore.background">
      <v-btn variant="text" rounded="lg" icon size="small" @click="FScrollToCurrent">
        <v-icon icon="mdi-headphones"></v-icon>
        <v-tooltip activator="parent" location="left" text="当前播放"></v-tooltip>
      </v-btn>

      <v-btn variant="text" rounded="lg" icon size="small" @click="FDeletePlayList">
        <v-icon icon="mdi-delete"></v-icon>
        <v-tooltip activator="parent" location="left" text="清空列表"></v-tooltip>
      </v-btn>

      <v-btn
        variant="text"
        rounded="lg"
        icon
        size="small"
        @click="$router.push({ name: globalSetting.settings.homePage })"
      >
        <v-icon icon="mdi-home"></v-icon>
        <v-tooltip activator="parent" location="left" text="返回主页"></v-tooltip>
      </v-btn>

      <v-btn variant="text" rounded="lg" icon size="small" @click="FClearCache">
        <v-icon icon="mdi-vacuum-outline"></v-icon>
        <v-tooltip activator="parent" location="left" text="清除缓存"></v-tooltip>
      </v-btn>

      <v-btn
        variant="text"
        rounded="lg"
        icon
        size="small"
        @click="$router.push({ name: 'account' })"
      >
        <v-icon icon="mdi-account-music"></v-icon>
        <v-tooltip activator="parent" location="left" text="我的主页"></v-tooltip>
      </v-btn>
      <v-btn variant="text" rounded="lg" icon size="small" @click="FOpenLyric">
        <v-icon icon="mdi-music-clef-treble"></v-icon>
        <v-tooltip activator="parent" location="left" text="桌面歌词"></v-tooltip>
      </v-btn>

      <v-btn variant="text" rounded="lg" icon size="small" @click="FLockLyric">
        <v-icon
          :icon="stateStore.lockLyric ? 'mdi-lock-outline' : 'mdi-lock-open-outline'"
        ></v-icon>
        <v-tooltip
          activator="parent"
          location="left"
          :text="stateStore.lockLyric ? '解锁歌词' : '锁定歌词'"
        ></v-tooltip>
      </v-btn>
      <v-btn variant="text" rounded="lg" icon size="small" @click="FDownloadPage">
        <v-icon icon="mdi-download"></v-icon>
        <v-tooltip activator="parent" location="left" text="已下载"></v-tooltip>
      </v-btn>
    </div>
    <CollectDialogs
      v-if="collect"
      :track="collectTrack"
      :local="collectTrack.local || false"
      @close-dialog="collect = false"
    ></CollectDialogs>
  </div>
</template>

<script setup lang="ts">
  import {
    inject,
    shallowReactive,
    watch,
    nextTick,
    ref,
    useTemplateRef,
    onBeforeUnmount
  } from 'vue'
  import Player from '@renderer/utils/player'
  import SongCard from '@renderer/components/publicComponents/SongCard.vue'
  import { useStateStore } from '@renderer/store/stateStore'
  import { useUserStore } from '@renderer/store/userStore'
  import CollectDialogs from '@renderer/components/publicComponents/CollectDialogs.vue'
  import { useRouter } from 'vue-router'
  import { downloadTrack, heartTrack } from '@renderer/hooks/localTrackHook'
  import type { Setting } from '@renderer/utils/setting'
  const currentPlaylist = useTemplateRef('current-playlist')
  const globalSetting = inject('setting') as Setting
  const baseDir = globalSetting.settings.tracksDir
  const router = useRouter()
  const imgSize = 52
  const player = inject('player') as Player
  const collect = ref(false)
  let collectTrack = {} as any
  const nowPlaying = shallowReactive(player.playlist) as Array<any>
  const options = [
    { title: '喜欢', icon: 'mdi-heart' },
    { title: '下载', icon: 'mdi-download' },
    { title: '收藏', icon: 'mdi-star' },
    { title: '删除', icon: 'mdi-delete' }
  ]
  const stateStore = useStateStore()
  const userStore = useUserStore()
  const currentTrack = player.currentTrack
  const currentIndex = player.currentIndex
  //初始化时获得歌单，若长度小于100就拿到全部，否则只拿100
  function init() {
    const playlistLength = player.playlist.length
    if (playlistLength === 0) return
    nowPlaying.splice(0, nowPlaying.length, ...player.playlist)
  }
  init()
  watch(player.playlist, () => {
    //歌单数据改变，重新初始化
    init()
  })

  function FRemoveTrack(track: any) {
    stateStore.tip = '移除:' + track.name
    player.removeTrack(track.id)
  }
  function FScrollToCurrent() {
    //确保在dom更新后再执行
    nextTick(() => {
      const scrollContainer = currentPlaylist.value?.querySelector('.current-scroll') as HTMLElement
      const playlist = scrollContainer.children[0] as HTMLElement
      setTimeout(() => {
        scrollContainer.scrollTo({
          top: (playlist.offsetHeight / nowPlaying.length) * currentIndex.value,
          behavior: 'smooth'
        })
      }, 100)
    })
  }
  function FDeletePlayList() {
    stateStore.tip = '清空列表'
    player.clearPlayList()
    nowPlaying.splice(0, nowPlaying.length)
  }
  function FClearCache() {
    window.utils.clearCache()
  }
  function FHeart(track) {
    if (track.local) {
      heartTrack(track, true)
    }
    if (!userStore.netEaseCloud.login) {
      alert('请先登录网易云账号')
      return
    } else {
      if (track.id === currentTrack.value.id) {
        stateStore.isHeart = true
      }

      window.api.netEaseCloud.song_like(track.id, true).then(() => {
        userStore.getNetEaseCloudPlaylist()
      })
    }
    stateStore.tip = `添加喜欢:${track.name} `
  }
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
  }
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector('.current-scroll')
    const elements = [] as HTMLElement[]
    while (currentTarget !== scrollContainer) {
      elements.push(currentTarget)
      currentTarget = currentTarget.parentElement as HTMLElement
    }
    return elements
  }
  function FHasAtt(target: HTMLElement, att: string) {
    const elements = FGetAllElement(target)
    const trackIDElement = elements.find((item) => item.hasAttribute(att))
    if (trackIDElement) {
      return trackIDElement.getAttribute(att) as string
    }
    return 0
  }
  function FCopy(event) {
    let text = ''
    if (
      event.target.hasAttribute('artist-id') ||
      event.target.hasAttribute('song-name') ||
      event.target.hasAttribute('album-id')
    ) {
      text = event.target.textContent
      stateStore.tip = '复制：' + text
      navigator.clipboard.writeText(text)
    }
  }
  function FClickTrack(event) {
    const index = parseInt(FHasAtt(event.target, 'track-index') as string)
    const local = nowPlaying[index].local
    if (event.target.hasAttribute('artist-id')) {
      if (local) {
        router.push({ name: 'localArtist', params: { id: event.target.getAttribute('artist-id') } })
      } else {
        router.push({ name: 'artist', params: { id: event.target.getAttribute('artist-id') } })
      }
    } else if (event.target.hasAttribute('album-id')) {
      if (local) {
        router.push({ name: 'localAlbum', params: { id: event.target.getAttribute('album-id') } })
      } else {
        router.push({ name: 'album', params: { id: event.target.getAttribute('album-id') } })
      }
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = event.target.getAttribute('img-id')
      player.play(trackID)
    } else {
      const trackID = FHasAtt(event.target, 'track-id')
      if (trackID) {
        // //播放这首歌
        player.play(trackID)
      }
    }
  }
  let startTop = 0
  let endTop = 0
  let currentDragIndex = 0
  let offsetIndex = 0
  let scrollID: NodeJS.Timeout | undefined = undefined
  //更改这首歌在队列的位置
  function FChangeIndex() {
    if (offsetIndex === 0) {
      currentDragIndex = -1
      return
    }
    if (offsetIndex + currentDragIndex > nowPlaying.length)
      offsetIndex = nowPlaying.length - 1 - currentDragIndex
    if (offsetIndex + currentDragIndex < 0) offsetIndex = -currentDragIndex
    //拿到这首歌
    const track = nowPlaying[currentDragIndex]
    //添加新位置
    if (offsetIndex > 0) offsetIndex += 1
    player.playlist.splice(currentDragIndex + offsetIndex, 0, track)
    if (offsetIndex < 0) currentDragIndex += 1
    player.playlist.splice(currentDragIndex, 1)
    //更新列表
    currentIndex.value = nowPlaying.findIndex((item) => item.id === currentTrack.value.id)
  }
  function FDragEnd(event: DragEvent) {
    endTop = event.offsetY
    const target = event.target as HTMLElement
    offsetIndex = parseInt(((endTop - startTop) / target.offsetHeight).toString())
    FChangeIndex()
    if (scrollID) {
      window.clearTimeout(scrollID)
      scrollID = undefined
    }
  }
  function FDragStart(event: DragEvent) {
    startTop = event.offsetY
    let target = event.target as HTMLElement
    currentDragIndex = parseInt(target.getAttribute('track-index') as string)
  }
  function FDrag(event: DragEvent) {
    const scrollContainer = document.querySelector('.current-scroll')
    if (!scrollContainer) return
    const clientY = event.clientY
    const boxContainer = scrollContainer.getBoundingClientRect()
    const top = boxContainer?.top as number
    const bottom = boxContainer?.bottom as number
    let dis = 0
    if (clientY < top) {
      dis = -10
    } else if (clientY > bottom) {
      dis = 10
    } else {
      //清除滚动
      if (scrollID) {
        window.clearTimeout(scrollID)
        scrollID = undefined
      }
      return
    }
    //如果没有滚动，就开始滚动
    if (!scrollID && clientY !== 0) {
      scrollID = setInterval(() => {
        const scrollContainer = document.querySelector('.current-scroll')
        if (!scrollContainer) return
        scrollContainer.scrollBy(0, dis)
      }, 10)
    }
  }
  //歌词销毁，重置状态
  window.electron.ipcRenderer.on('close-lyric', () => {
    stateStore.openLyric = false
    stateStore.lockLyric = false
  })
  //歌词锁定
  window.electron.ipcRenderer.on('lyric-window-lock-lyric', (_e, lock: boolean) => {
    if (stateStore.lockLyric !== lock) stateStore.lockLyric = lock
  })
  onBeforeUnmount(() => {
    window.electron.ipcRenderer.removeAllListeners('close-lyric')
    window.electron.ipcRenderer.removeAllListeners('lyric-window-lock-lyric')
  })
  function FOpenLyric() {
    //之前是显示，现在要关闭
    if (stateStore.openLyric) {
      window.electron.ipcRenderer.send('close-lyric')
      stateStore.openLyric = false
      stateStore.lockLyric = false
    } else {
      window.electron.ipcRenderer.send('open-lyric')
      window.electron.ipcRenderer.once('lyric-ready', () => {
        stateStore.openLyric = true
      })
    }
  }
  function FLockLyric() {
    if (!stateStore.openLyric) return
    stateStore.lockLyric = !stateStore.lockLyric
    window.electron.ipcRenderer.send('lock-lyric', stateStore.lockLyric)
  }
  function FDownloadPage() {
    router.push({ name: 'download' })
  }
</script>

<style lang="scss" scoped>
  .current-playlist {
    width: 100%;
    height: 100%;
    display: flex;
  }
  .options {
    height: 100%;
    border-bottom-right-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    backdrop-filter: blur(50px);
    color: rgb(var(--v-theme-on-surface));
  }
  .scroll-container {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .current-scroll {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .infinite-scroll-container {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  :deep(.v-card-title) {
    font-size: 1rem;
  }
  :deep(.v-card-item) {
    padding: 5px;
  }
  // :deep(.song-info) {
  //   // margin: 2.5px 0px;
  // }
  .cover:hover {
    cursor: pointer;
    filter: blur(2px);
  }
  .cover-container {
    position: relative;
    &:hover .play-cover {
      opacity: 1;
    }
  }
  .song-container {
    display: flex;
    width: 100%;
  }
  .current-song {
    margin: 0px 5px;
    border-radius: 5px;
  }
  .local-track {
    font-size: 0.8rem;
    opacity: 0.8;
  }
</style>
