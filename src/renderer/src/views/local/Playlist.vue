<template>
  <div class="playlist-view">
    <div class="infinite-scroll">
      <v-card variant="text" v-intersect="onIntersect">
        <template #prepend>
          <v-img width="300" rounded="lg" aspect-ratio="1" cover :src="cover"></v-img>
        </template>
        <template #title>
          <h1>{{ playlist.name }}</h1>
        </template>
        <template #subtitle>
          <div class="playlist-desc-container">
            <h2>{{ playlist.trackCount }}首歌</h2>
            <div>
              <span>创建者：本地用户</span>
              <span class="playlist-desc">
                歌单描述：{{ playlist.description || '这个人很懒没写描述' }}
              </span>
            </div>
          </div>
        </template>
        <template #actions>
          <v-spacer></v-spacer>
          <v-btn variant="elevated" icon size="large" @click="search = true">
            <v-icon icon="mdi-magnify" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="搜索"></v-tooltip>
          </v-btn>
          <v-btn variant="elevated" icon size="large" @click="FPlayAll(0)">
            <v-icon icon="mdi-play" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="播放全部"></v-tooltip>
          </v-btn>
          <v-btn
            v-if="!['localTracks', 'heart'].includes(playlistId)"
            variant="elevated"
            icon
            size="large"
            @click="FDelete"
          >
            <v-icon icon="mdi-delete" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="删除歌单"></v-tooltip>
          </v-btn>
        </template>
      </v-card>
      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>
      <v-virtual-scroll
        :items="currentPageTracks"
        @click="FClickTrack"
        @dblclick="FPlayAll"
        @dragstart="FDragStart"
        @dragend="FDragEnd"
        @drag="FDrag"
        @contextmenu.prevent="FCopy"
        class="infinite-scroll-container"
      >
        <template #default="{ item, index }">
          <SongCard
            :key="currentPageTracks[index].id"
            :song="item"
            :index="index"
            draggable="true"
            :heart="FIsHeart(item.id)"
          >
            <template #index>
              <div class="song-index">
                <span class="song-index-text">{{ index + 1 + (realPage - 1) * increment }}</span>
              </div>
            </template>
            <v-menu>
              <template #activator="{ props }">
                <v-btn variant="text" :ripple="false" icon v-bind="props">
                  <v-icon icon="mdi-dots-vertical" size="large"> </v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="FCollectTrack(item)">
                  <v-list-item-title>
                    <v-icon :icon="items[0].icon"></v-icon>
                    {{ items[0].title }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="FDeleteTrack(item)">
                  <v-list-item-title>
                    <v-icon :icon="items[1].icon"></v-icon>
                    {{ items[1].title }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="FMoveTrack(item.id)">
                  <v-list-item-title>
                    <v-icon :icon="items[2].icon"></v-icon>
                    {{ items[2].title }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </SongCard>
        </template>
      </v-virtual-scroll>
      <v-pagination
        v-if="totalTracks.length > increment"
        v-model="page"
        :length="pageLength"
        rounded="lg"
      ></v-pagination>
    </div>
    <v-progress-circular v-if="!pageChange" color="on-background" indeterminate class="loading">{{
      '加载中...'
    }}</v-progress-circular>
    <CollectDialogs
      v-if="collect"
      :track="collectTrack"
      :local="true"
      @close-dialog="collect = false"
    ></CollectDialogs>
    <SearchTrackDialogs
      v-if="search"
      :id="playlistId"
      :local="true"
      @close-dialog="search = false"
    ></SearchTrackDialogs>
    <v-fab
      transition="fab-transition"
      :active="!fab"
      class="fab"
      icon="mdi-arrow-up"
      size="large"
      color="secondary"
      @click="goTo(0, { container: '.infinite-scroll', duration: 100 })"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
  import SongCard from '@components/publicComponents/SongCard.vue'
  import {
    inject,
    ref,
    shallowRef,
    shallowReactive,
    type ShallowReactive,
    watch,
    nextTick
  } from 'vue'
  import type Player from '@renderer/utils/player'
  import type { Setting } from '@renderer/utils/setting'
  import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
  import { useStateStore } from '@renderer/store/stateStore'
  import CollectDialogs from '@renderer/components/publicComponents/CollectDialogs.vue'
  import SearchTrackDialogs from '@renderer/components/publicComponents/SearchTrackDialogs.vue'
  import defaultImg from '@renderer/public/test.png'
  import { checkHeart, removeTrack, heartTrack } from '@renderer/hooks/localTrackHook'
  import { goTo } from '@renderer/hooks/toolHook'
  const stateStore = useStateStore()
  const route = useRoute()
  const router = useRouter()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const globalSetting = inject('setting') as Setting
  const playlistId = route.params.id as string
  const playlist = shallowRef({}) as any
  const currentPageTracks = shallowReactive([]) as ShallowReactive<Array<any>>
  let totalTracks = [] as Array<any>
  let tracksPath = [] as Array<any>
  const fab = ref(true)
  const page = ref(1)
  const realPage = ref(1)
  let pageLength = 1
  const pageChange = ref(false)
  const collect = ref(false)
  const search = ref(false)
  let collectTrack = {}
  //如果是自己喜欢的音乐，不显示红心
  const increment = 200
  const items = [
    { title: '收藏', icon: 'mdi-star-outline' },
    { title: '删除', icon: 'mdi-delete' },
    { title: '传送至顶部', icon: 'mdi-file-move' }
  ]
  const baseURL = globalSetting.settings.tracksDir
  let cover = ref('')
  const heartMap = ref({}) as any
  const showHeart = 'heart' !== playlistId
  async function FCheckHeart(tracks: any[]): Promise<any> {
    if (!showHeart) {
      return true
    }
    const ids = tracks.map((item) => item.id)
    ids.forEach((id) => {
      heartMap.value[id] = {
        showHeart: showHeart,
        isHeart: false
      }
    })
    const res = await checkHeart(tracks)
    res.ids.forEach((id) => {
      heartMap.value[id].isHeart = true
    })
  }
  function FIsHeart(id) {
    return heartMap.value[id.toString()]
  }
  //获得一页歌词数据
  async function FGetPageTrack(newPage: number): Promise<void> {
    const start = (page.value - 1) * increment
    const end = start + increment
    // goTo(0, { container: '.infinite-scroll' })
    //如果之前没加载过，就加载
    if (tracksPath.length === 0) return
    if (!totalTracks[start].common) {
      const tracks = (await window.electron.ipcRenderer.invoke(
        'read-music-data',
        baseURL,
        tracksPath.slice(start, end)
      )) as Array<any>
      tracks.forEach((track: any) => {
        track.al.picUrl = URL.createObjectURL(new Blob(track.al.picUrl))
      })
      await FCheckHeart(tracks)
      currentPageTracks.splice(0, currentPageTracks.length, ...tracks)
      totalTracks.splice(start, increment, ...tracks)
    } else {
      //如果之前加载过，就直接拿来用
      const tracks = totalTracks.slice(start, end)
      currentPageTracks.splice(0, currentPageTracks.length, ...tracks)
    }

    nextTick(() => {
      pageChange.value = true
      realPage.value = newPage
    })
  }
  async function init() {
    if (baseURL) {
      const playlistData = await window.electron.ipcRenderer.invoke('store-get', playlistId)
      playlist.value = playlistData.info
      tracksPath = playlistData.tracks
      totalTracks = new Array(tracksPath.length).fill({})
      await FGetPageTrack(1)
      if (tracksPath.length === 0) {
        cover.value = defaultImg
      } else {
        cover.value = currentPageTracks[0].al.picUrl
      }
      pageLength = Math.ceil(tracksPath.length / increment)

      nextTick(() => {
        pageChange.value = true
        realPage.value = 1
      })
    }
  }
  init()
  //加载新的一页数据
  watch(page, (newPage) => {
    //如果之前加载过，就不用加载了
    pageChange.value = false
    FGetPageTrack(newPage)
  })
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector('.infinite-scroll')
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
  //双击事件
  function FPlayAll(event: any) {
    if (player.listID !== `playlistLocal-${playlistId}`)
      stateStore.tip = '播放本地歌单:' + playlist.value.name
    player.loadList(currentPageTracks, `playlistLocal-${playlistId}`)
    if (event === 0) {
      player.play(currentPageTracks[0].id)
    } else {
      const trackID = FHasAtt(event.target, 'track-id')
      if (trackID) player.play(trackID)
    }
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
  //歌曲的单击事件
  function FClickTrack(event) {
    if (event.target.hasAttribute('artist-id')) {
      router.push({ name: 'localArtist', params: { id: event.target.getAttribute('artist-id') } })
    } else if (event.target.hasAttribute('album-id')) {
      router.push({ name: 'localAlbum', params: { id: event.target.getAttribute('album-id') } })
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = event.target.getAttribute('img-id') as string
      player.prependTrack(currentPageTracks.find((item) => item.id == trackID))
      // //播放这首歌
      player.play(trackID)
    } else {
      const trackID = FHasAtt(event.target, 'is-heart')
      if (trackID) {
        const isHeart = !heartMap.value[trackID].isHeart
        heartMap.value[trackID].isHeart = isHeart
        const track = totalTracks.find((item) => item.id == trackID)
        heartTrack(track, isHeart)
        //如果更改的歌曲就是当前的歌曲
        if (currentTrack.value && trackID === currentTrack.value.id) {
          //修改全局的状态
          stateStore.isHeart = isHeart
        }
        stateStore.tip =
          (isHeart ? '添加喜欢: ' : '取消喜欢: ') +
          totalTracks.find((item) => item.id == trackID).name
      }
    }
  }
  if (showHeart) {
    watch(
      () => stateStore.isHeart,
      () => {
        if (heartMap.value[currentTrack.value.id.toString()]) {
          heartMap.value[currentTrack.value.id.toString()].isHeart = stateStore.isHeart
        }
      }
    )
  }
  async function FDelete() {
    const localPlaylists = await window.electron.ipcRenderer.invoke('store-get', 'localPlaylists')
    const index = localPlaylists.playlists.findIndex((playlist) => playlist.id === playlistId)
    localPlaylists.playlists.splice(index, 1)
    window.electron.ipcRenderer.invoke('store-set', 'localPlaylists', localPlaylists)
    router.push({ name: 'local' })
  }
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
  }
  function FScrollToPrePosition() {
    stateStore.tip = '回到上次滚动位置'
    nextTick(() => {
      const scrollContainer = document.querySelector('.infinite-scroll') as HTMLElement
      if (!scrollContainer) return
      //拿到自己的滚动条位置
      const [scrollTop, _prePage] = stateStore.scrollTopMap[route.path]
        .split('+')
        .map((item) => parseInt(item))
      //倒数第二个必须是自己的路由才能滚动
      if (scrollContainer.scrollTop !== scrollTop) {
        setTimeout(() => {
          scrollContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          })
        }, 500)
      } else return
    })
  }

  function FWaitUntilCanScroll() {
    nextTick(async () => {
      const scrollContainer = document.querySelector('.infinite-scroll')
      if (!stateStore.scrollTopMap[route.path]) return
      if (!scrollContainer) return
      const [scrollTop, prePage] = stateStore.scrollTopMap[route.path]
        .split('+')
        .map((item) => parseInt(item))
      //没有记录，中断滚动
      if (!scrollTop) return
      //不是第一页，就加载那一页然后滚动
      if (prePage !== realPage.value) {
        pageChange.value = false
        realPage.value = prePage
        page.value = prePage
        await FGetPageTrack(prePage)
      }
      FScrollToPrePosition()
    })
  }

  //进行一次监听
  watch(currentPageTracks, FWaitUntilCanScroll, { once: true })
  let startTop = 0
  let endTop = 0
  let currentIndex = -1
  let offsetIndex = 0
  let scrollID: NodeJS.Timeout | undefined = undefined
  //更改这首歌在队列的位置
  function FChangeIndex() {
    if (offsetIndex === 0) {
      currentIndex = -1
      return
    }
    const trackOffset = (realPage.value - 1) * increment
    if (offsetIndex + currentIndex > currentPageTracks.length)
      offsetIndex = currentPageTracks.length - 1 - currentIndex
    if (offsetIndex + currentIndex < 0)
      offsetIndex = -currentIndex
      //交换位置tracksPath
    ;[tracksPath[currentIndex], tracksPath[currentIndex + offsetIndex]] = [
      tracksPath[currentIndex + offsetIndex],
      tracksPath[currentIndex]
    ]
    const track = currentPageTracks[currentIndex]
    //添加新位置
    if (offsetIndex > 0) offsetIndex += 1
    currentPageTracks.splice(currentIndex + offsetIndex, 0, track)
    totalTracks.splice(currentIndex + trackOffset + offsetIndex, track)
    if (offsetIndex < 0) currentIndex += 1
    currentPageTracks.splice(currentIndex, 1)
    totalTracks.splice(currentIndex + trackOffset, 0, 1)
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
    currentIndex = parseInt(target.getAttribute('track-index') as string)
  }
  function FDrag(event: DragEvent) {
    const scrollContainer = document.querySelector('.infinite-scroll')
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
        const scrollContainer = document.querySelector('.infinite-scroll')
        if (!scrollContainer) return
        scrollContainer.scrollBy(0, dis)
      }, 10)
    }
  }
  function FOrderUpdate() {
    if (currentIndex === -1) return
    window.electron.ipcRenderer.invoke('store-get', 'localPlaylists').then((res: any) => {
      const index = res.playlists.findIndex((playlist) => playlist.id === playlistId)
      res.playlists[index].cover = tracksPath[0]
      window.electron.ipcRenderer.invoke('store-set', 'localPlaylists', res)
    })
    window.electron.ipcRenderer.invoke('store-set', playlistId + '.tracks', tracksPath)
  }
  //每次离开时保存该路径的滚动条位置
  onBeforeRouteLeave((_to, _from) => {
    const scrollContainer = document.querySelector('.infinite-scroll')
    if (!scrollContainer) return
    stateStore.scrollTopMap[route.path] = `${scrollContainer.scrollTop} + ${realPage.value}`
    FOrderUpdate()
    return true
  })
  //更新时保存该路径的滚动条位置
  onBeforeRouteUpdate((_to, _from) => {
    const scrollContainer = document.querySelector('.infinite-scroll')
    if (!scrollContainer) return
    stateStore.scrollTopMap[route.path] = `${scrollContainer.scrollTop} + ${realPage.value}`
    FOrderUpdate()
    return true
  })
  //收藏歌曲
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
  }
  //删除歌曲
  async function FDeleteTrack(trackInfo: any) {
    // 从歌单里删除这首歌
    currentPageTracks.splice(
      currentPageTracks.findIndex((track) => track.id === trackInfo.id),
      1
    )
    // 从总歌单里删除这首歌
    const index = totalTracks.findIndex((track) => track.id === trackInfo.id)
    totalTracks.splice(index, 1)
    tracksPath.splice(index, 1)
    //修改歌单的索引

    removeTrack(playlistId, trackInfo.path)
  }
  function FMoveTrack(id: number) {
    const index = totalTracks.findIndex((track) => track.id === id)
    currentIndex = index
    // 交换位置
    const track = totalTracks.splice(index, 1)[0]
    totalTracks.unshift(track)
    const path = tracksPath.splice(index, 1)[0]
    tracksPath.unshift(path)

    //重新获取
    FGetPageTrack(realPage.value)
  }
</script>

<style lang="scss" scoped>
  .song-index {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 100%;
    transform: translate(-100%, 0%);
    z-index: 100;
  }
  .song-index-text {
    opacity: 0.6;
  }
  h1 {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
  .playlist-view {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .infinite-scroll {
    width: 100%;
    height: 100%;
    padding: 8%;
    padding-bottom: 0%;
    overflow: auto;
  }
  .infinite-scroll-container {
    width: 90%;
    margin: 0 auto;
    overflow: visible;
  }
  .loading {
    width: 10%;
    height: 10%;
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }
  .fab {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    z-index: 1000;
  }
  :deep(.v-fab__container) {
    right: 5%;
    bottom: 5%;
  }
  .playlist-songs {
    width: 90%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .playlist-desc-container {
    margin: 10px;
  }
  .playlist-desc {
    text-wrap: wrap;
    white-space: wrap;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4; /* 限制显示的行数 */
    overflow: hidden;
    text-overflow: ellipsis; /* 在最后一行使用省略号 */
    word-wrap: break-word; /* 确保长单词或URL可以断开换行 */
  }
  .search-track {
    transition: all 0.3s;
  }
</style>
