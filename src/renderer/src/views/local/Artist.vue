<template>
  <div class="artist-view">
    <div class="infinite-scroll">
      <v-card v-intersect="onIntersect" variant="text">
        <template #prepend>
          <v-img width="300" rounded="lg" aspect-ratio="1" cover :src="cover"></v-img>
        </template>
        <template #title>
          <div class="artist-name-container">
            <h1 class="artist-name">{{ artistDetail.name }}</h1>
          </div>
        </template>
        <template #subtitle>
          <div class="artist-name-container">本地艺术家</div>
        </template>
        <template #actions>
          <v-tabs v-model="tab" color="secondary">
            <v-tab value="hotSongs"> 歌曲 </v-tab>
            <v-tab value="albums"> 专辑 </v-tab>
          </v-tabs>
          <v-spacer></v-spacer>
          <v-btn variant="elevated" icon size="large" @click="FPlayAll(0)">
            <v-icon icon="mdi-play" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="播放全部"></v-tooltip>
          </v-btn>
        </template>
      </v-card>
      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="hotSongs">
          <v-virtual-scroll :items="tracks" @click.stop="FClickTrack" @contextmenu.prevent="FCopy">
            <template #default="{ item, index }">
              <div @dblclick="FPlayAll" class="tab-window">
                <SongCard :song="item" :heart="FIsHeart(item.id)" :key="item.id">
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
                    </v-list>
                  </v-menu>
                </SongCard>
              </div>
            </template>
          </v-virtual-scroll>
        </v-tabs-window-item>

        <v-tabs-window-item value="albums">
          <v-timeline direction="vertical" @click="FClickAlbum">
            <v-timeline-item v-for="(item, index) in albums" :dot-color="color[index % 4]">
              <AlbumCard :album="item"></AlbumCard>
            </v-timeline-item>
          </v-timeline>
        </v-tabs-window-item>
      </v-tabs-window>
      <v-progress-circular
        v-if="loading"
        color="on-background"
        indeterminate
        class="loading"
      ></v-progress-circular>
      <CollectDialogs
        v-if="collect"
        :track="collectTrack"
        :local="collectTrack.local || false"
        @close-dialog="collect = false"
      ></CollectDialogs>
    </div>
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
  import AlbumCard from '@renderer/components/publicComponents/AlbumCard.vue'
  import SongCard from '@renderer/components/publicComponents/SongCard.vue'
  import { shallowRef, ref, inject, type ShallowRef, watch, nextTick } from 'vue'
  import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import type { Setting } from '@renderer/utils/setting'
  import { checkHeart, heartTrack } from '@renderer/hooks/localTrackHook'
  import { goTo } from '@renderer/hooks/toolHook'
  const globalSetting = inject('setting') as Setting
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const currentTrack = player.currentTrack
  const route = useRoute()
  const router = useRouter()
  const tracks = shallowRef([]) as ShallowRef<Array<any>>
  const albums = shallowRef([]) as ShallowRef<Array<any>>
  const artistDetail = shallowRef({}) as any
  const tab = ref('hotSongs')
  const fab = ref(false)
  const color = ['red-lighten-2', 'purple-lighten-2', 'green-lighten-2', 'indigo-lighten-2']
  const id = route.params.id as string
  const items = [{ title: '收藏', icon: 'mdi-star-outline' }]
  const collect = ref(false)
  const loading = ref(true)
  const baseURL = globalSetting.settings.tracksDir
  const cover = ref('')
  let collectTrack = {} as any
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
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
  const heartMap = ref({}) as any
  async function FCheckHeart(tracks: any[]): Promise<any> {
    const ids = tracks.map((item) => item.id)
    ids.forEach((id) => {
      heartMap.value[id] = {
        showHeart: true,
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
  async function init() {
    artistDetail.value = await window.electron.ipcRenderer.invoke('store-get', id, 'artists', true)
    //拿到歌曲信息
    const trackData = await window.electron.ipcRenderer.invoke(
      'read-music-data',
      baseURL,
      artistDetail.value.tracks.map((item: any) => item.path)
    )
    trackData.forEach((track: any) => {
      track.al.picUrl = URL.createObjectURL(new Blob(track.al.picUrl))
    })
    await FCheckHeart(trackData)
    tracks.value = trackData
    cover.value = tracks.value[0].al.picUrl
    const albumData = await window.electron.ipcRenderer.invoke(
      'read-music-data',
      baseURL,
      artistDetail.value.albums.map((item: any) => item.picUrl)
    )
    albums.value = artistDetail.value.albums.map((item: any, index: number) => {
      item.picUrl = URL.createObjectURL(new Blob(albumData[index].al.picUrl))
      return item
    })
    loading.value = false
  }
  init()
  //回到上次滚动的位置
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
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
      return trackIDElement.getAttribute(att) as string
    }
    return 0
  }
  //双击事件
  function FPlayAll(event: any) {
    if (player.listID !== `localArtist-${id}`) stateStore.tip = '播放艺术家曲目:' + id
    player.loadList(tracks.value, `localArtist-${id}`)
    if (event === 0) {
      player.play(tracks.value[0].id)
    } else {
      const trackID = FHasAtt(event.target, 'track-id')
      if (trackID) player.play(trackID)
    }
  }

  function FClickTrack(event) {
    if (event.target.hasAttribute('artist-id')) {
      router.push({ name: 'localArtist', params: { id: event.target.getAttribute('artist-id') } })
    } else if (event.target.hasAttribute('album-id')) {
      router.push({ name: 'localAlbum', params: { id: event.target.getAttribute('album-id') } })
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = event.target.getAttribute('img-id') as string
      player.prependTrack(tracks.value.find((item) => item.id == trackID))
      // //播放这首歌
      player.play(trackID)
    } else {
      const trackID = FHasAtt(event.target, 'is-heart')
      if (trackID) {
        const isHeart = !heartMap.value[trackID].isHeart
        heartMap.value[trackID].isHeart = isHeart
        const track = tracks.value.find((item) => item.id == trackID)
        heartTrack(track, isHeart)
        //如果更改的歌曲就是当前的歌曲
        if (currentTrack.value && trackID === currentTrack.value.id) {
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
      if (heartMap.value[currentTrack.value.id]) {
        heartMap.value[currentTrack.value.id].isHeart = stateStore.isHeart
      }
    }
  )

  function FClickAlbum(event) {
    let albumID = FHasAtt(event.target, 'album-id')
    if (albumID) {
      router.push({ name: 'localAlbum', params: { id: albumID } })
    }
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
  .artist-view {
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
  .tab-window {
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
  .artist-name-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .artist-name {
    font-size: 3rem;
  }
  .artist-alias {
    font-size: 3rem;
    color: rgb(165, 165, 165);
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .artist-desc {
    margin: 10px;
    white-space: wrap;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4; /* 限制显示的行数 */
    overflow: hidden;
    text-overflow: ellipsis; /* 在最后一行使用省略号 */
    word-wrap: break-word; /* 确保长单词或URL可以断开换行 */
  }
  :deep(.v-card-actions) {
    justify-content: flex-end;
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
  :deep(.song-card) {
    margin: 5px 0px;
    border-radius: 15px;
  }
  .tab-window {
    width: 90%;
    margin: 0 auto;
  }
  h1,
  h2 {
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
</style>
