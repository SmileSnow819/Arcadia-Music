<template>
  <div class="album-view">
    <div class="infinite-scroll">
      <v-card v-intersect="onIntersect" class="album-card" variant="text">
        <template #prepend>
          <div class="album-cover-container">
            <div class="album-icon">
              <div class="album-icon-inner"></div>
            </div>
            <v-img
              width="300"
              rounded="lg"
              aspect-ratio="1"
              cover
              :src="album.picUrl"
              class="album-cover"
            ></v-img>
          </div>
        </template>
        <template #title>
          <div class="album-name-container">
            <h1 class="album-name">{{ album.name }}</h1>
            <h2 v-if="album.transNames" class="album-tns">({{ album.transNames[0] }})</h2>
          </div>
        </template>
        <template #subtitle>
          <div class="album-desc-container">
            发行时间：{{ convertTime(album.publishTime) }}
            <div>
              <div class="album-artist" @click="FLookArtist(artist.id)">
                艺术家：{{ artist.name }}
              </div>
            </div>
            <div class="album-desc">专辑描述：{{ album.description }}</div>
          </div>
        </template>
        <template #actions>
          <v-spacer></v-spacer>
          <v-btn variant="elevated" icon size="large" @click="FPlayAll(0)">
            <v-icon icon="mdi-play" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="播放全部"></v-tooltip>
          </v-btn>

          <v-btn variant="elevated" icon size="large" @click="FStar">
            <v-icon :icon="statState[isStar ? 1 : 0]" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="收藏"></v-tooltip>
          </v-btn>
          <v-btn variant="elevated" icon size="large" @click="downloadTrack([...tracks], baseDir)">
            <v-icon icon="mdi-download" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="下载全部"></v-tooltip>
          </v-btn>
        </template>
      </v-card>
      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>
      <v-virtual-scroll
        :items="tracks"
        @click="FClickTrack"
        @dblclick="FPlayAll"
        @contextmenu.prevent="FCopy"
        class="infinite-scroll-container"
      >
        <template #default="{ item, index }">
          <SongCard :song="item" :heart="FIsHeart(item.id)" :index="index" draggable="true">
            <template #index>
              <div class="song-index">
                <span class="song-index-text">{{ index + 1 }}</span>
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
                <v-list-item @click="downloadTrack([item], baseDir)">
                  <v-list-item-title>
                    <v-icon :icon="items[1].icon"></v-icon>
                    {{ items[1].title }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </SongCard>
        </template>
      </v-virtual-scroll>
    </div>
    <v-progress-circular
      v-if="loading"
      color="on-background"
      indeterminate
      class="loading"
    ></v-progress-circular>
    <CollectDialogs
      v-if="collect"
      :track="collectTrack"
      @close-dialog="collect = false"
    ></CollectDialogs>
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
  import SongCard from '@renderer/components/publicComponents/SongCard.vue'
  import { shallowRef, ref, inject, type ShallowRef, watch, nextTick } from 'vue'
  import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { useUserStore } from '@renderer/store/userStore'
  import { downloadTrack } from '@renderer/hooks/localTrackHook'
  import { goTo } from '@renderer/hooks/toolHook'
  const globalSetting = inject('setting') as any
  const baseDir = globalSetting.settings.tracksDir
  const stateStore = useStateStore()
  const userStore = useUserStore()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const route = useRoute()
  const router = useRouter()
  const id = parseInt(route.params.id as string)
  const tracks = shallowRef([]) as ShallowRef<Array<any>>
  const album = shallowRef({}) as any
  const artist = shallowRef({}) as any
  const heartMap = ref({}) as any
  const fab = ref(false)
  const items = [
    { title: '收藏', icon: 'mdi-star-outline' },
    { title: '下载', icon: 'mdi-download' }
  ]
  const statState = ['mdi-star-outline', 'mdi-star']
  const isStar = ref(userStore.netEaseCloud.collectedAlbums.some((album) => album.id === id))
  const loading = ref(true)
  const collect = ref(false)
  let collectTrack = {}
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
  }

  function FCheckHeart(ids: number[] | string[]): Promise<any> {
    ids.forEach((id) => {
      heartMap.value[id.toString()] = {
        showHeart: true,
        isHeart: false
      }
    })
    return window.api.netEaseCloud.song_like_check(ids).then((res: any) => {
      res.ids.forEach((id) => {
        heartMap.value[id.toString()].isHeart = true
      })
    })
  }
  function FIsHeart(id) {
    return heartMap.value[id.toString()]
  }

  window.api.netEaseCloud.album_detail({ id }).then((res) => {
    const ids = res.songs.map((item: any) => item.id)
    //必须等到红心检测完成才能显示
    FCheckHeart(ids).then(() => {
      album.value = res.album
      tracks.value = res.songs
      artist.value = res.album.artist
      loading.value = false
    })
  })
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
  }
  function convertTime(time: number): string {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份从0开始，需要加1，并且确保是两位数
    const day = date.getDate().toString().padStart(2, '0') // 确保是两位数
    return `${year}-${month}-${day}`
  }
  function FLookArtist(id: string | number) {
    router.push({ name: 'artist', params: { id } })
  }
  function FPlayAll(event: any) {
    if (player.listID !== `album-${id}`) stateStore.tip = '播放专辑'
    player.loadList(tracks.value, `album-${id}`)
    if (event === 0) {
      player.play(tracks.value[0].id)
    } else if (event.target?.hasAttribute('track-id')) {
      const trackID = event.target?.getAttribute('track-id')
      player.play(trackID)
    }
  }
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
      return parseInt(trackIDElement.getAttribute(att) as string)
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
    if (event.target.hasAttribute('artist-id')) {
      router.push({ name: 'artist', params: { id: event.target.getAttribute('artist-id') } })
    } else if (event.target.hasAttribute('album-id')) {
      router.push({ name: 'album', params: { id: event.target.getAttribute('album-id') } })
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = parseInt(event.target.getAttribute('img-id') as string)
      player.prependTrack(tracks.value.find((item) => item.id == trackID))
      // //播放这首歌
      player.play(trackID)
    } else {
      const trackID = FHasAtt(event.target, 'is-heart')
      if (trackID) {
        const isHeart = !heartMap.value[trackID].isHeart
        heartMap.value[trackID].isHeart = isHeart
        window.api.netEaseCloud.song_like(trackID, isHeart).then(() => {
          setTimeout(() => {
            userStore.getNetEaseCloudPlaylist()
          }, 1000)
        })
        //如果更改的歌曲就是当前的歌曲
        if (currentTrack.value && trackID.toString() === currentTrack.value.id.toString()) {
          //修改全局的状态
          stateStore.isHeart = isHeart
        }
        stateStore.tip =
          (isHeart ? '添加喜欢: ' : '取消喜欢: ') +
          tracks.value.find((item) => item.id == trackID).name
      }
    }
  }
  watch(
    () => stateStore.isHeart,
    () => {
      if (heartMap.value[currentTrack.value.id.toString()])
        heartMap.value[currentTrack.value.id.toString()].isHeart = stateStore.isHeart
    }
  )
  function FStar() {
    isStar.value = !isStar.value
    window.api.netEaseCloud.album_sub(id, isStar.value ? 'sub' : 'unsub').then(() => {
      userStore.getNetEaseCloudSubList()
    })
  }
  function FScrollToPrePosition() {
    const scrollContainer = document.querySelector('.infinite-scroll')
    if (!scrollContainer) return
    //拿到自己的滚动条位置
    const scrollTop = stateStore.scrollTopMap[route.path]
    //倒数第二个必须是自己的路由才能滚动
    if (scrollTop) {
      stateStore.tip = '回到上次滚动位置'
      nextTick(() => {
        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      })
    } else return
  }
  watch(tracks, FScrollToPrePosition, { once: true })
  //每次离开时保存该路径的滚动条位置
  onBeforeRouteLeave((_to, _from) => {
    const scrollContainer = document.querySelector('.infinite-scroll')
    if (!scrollContainer) return
    stateStore.scrollTopMap[route.path] = scrollContainer.scrollTop
    return true
  })
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
  }
  .song-index-text {
    opacity: 0.6;
  }
  .album-view {
    height: 100%;
    width: 100%;
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
  .album-songs {
    width: 90%;
    margin: 0 auto;
  }
  .album-cover-container {
    position: relative;
  }
  .album-icon {
    position: absolute;
    border-radius: 100%;
    background-color: rgb(10, 10, 10);
    border: 5px solid rgb(0, 0, 0);
    width: 300px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .album-icon-inner {
    border-radius: 100%;
    background-color: red;
    width: 200px;
    height: 200px;
    border: 30px solid rgb(0, 0, 0);
  }
  .album-cover {
    margin-left: 100px;
  }
  .album-artist {
    &:hover {
      cursor: pointer;
      color: rgb(var(--v-theme-secondary));
    }
  }
  .album-name-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  h1,
  h2 {
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
  .album-name {
    font-size: 3rem;
  }
  .album-tns {
    font-size: 3rem;
    color: rgb(165, 165, 165);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .album-desc-container {
    margin: 10px;
  }
  .album-desc {
    text-wrap: wrap;
    white-space: wrap;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4; /* 限制显示的行数 */
    overflow: hidden;
    text-overflow: ellipsis; /* 在最后一行使用省略号 */
    word-wrap: break-word; /* 确保长单词或URL可以断开换行 */
  }
</style>
