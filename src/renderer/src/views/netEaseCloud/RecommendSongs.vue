<template>
  <div class="daily-songs">
    <div class="infinite-scroll">
      <v-card variant="text" v-intersect="onIntersect">
        <template #prepend>
          <div class="recommend-songs-icon">
            <div class="recommend-songs-name">日推</div>
            <div class="date">{{ date.month }}/{{ date.day }}</div>
          </div>
        </template>
        <template #title>
          <h1>每日推荐歌曲</h1>
        </template>
        <template #subtitle>
          <h2>根据算法为你智能推荐</h2>
        </template>
        <template #actions>
          <v-spacer></v-spacer>
          <v-btn variant="elevated" icon size="large" @click="FPlayAll(0)">
            <v-icon icon="mdi-play" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="播放全部"></v-tooltip>
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
          <SongCard :song="item" :heart="FIsHeart(item.id)" :index="index">
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
                <v-list-item @click="FCollect(item)">
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
      absolute
      color="secondary"
      @click="goTo(0, { container: '.infinite-scroll', duration: 100 })"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
  import { shallowRef, ref, inject, watch, nextTick, type ShallowRef } from 'vue'
  import SongCard from '@renderer/components/publicComponents/SongCard.vue'
  import type Player from '@renderer/utils/player'
  import CollectDialogs from '@renderer/components/publicComponents/CollectDialogs.vue'
  import { useStateStore } from '@renderer/store/stateStore'
  import { useUserStore } from '@renderer/store/userStore'
  import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
  import { downloadTrack } from '@renderer/hooks/localTrackHook'
  import { goTo } from '@renderer/hooks/toolHook'
  const globalSetting = inject('setting') as any
  const baseDir = globalSetting.settings.tracksDir
  const userStore = useUserStore()
  const router = useRouter()
  const stateStore = useStateStore()
  const route = useRoute()
  const player = inject('player') as Player
  const tracks = shallowRef([]) as ShallowRef<Array<any>>
  const fab = ref(true)
  const heartMap = ref({}) as any
  const collect = ref(false)
  let collectTrack = {}
  const items = [
    { title: '收藏', icon: 'mdi-star-outline' },
    { title: '下载', icon: 'mdi-download' }
  ]
  const currentTrack = player.currentTrack
  const loading = ref(true)
  async function FCheckHeart(ids: number[] | string[]): Promise<any> {
    ids.forEach((id) => {
      heartMap.value[id.toString()] = {
        showHeart: true,
        isHeart: false
      }
    })
    const res = await window.api.netEaseCloud.song_like_check(ids)
    res.ids.forEach((id) => {
      heartMap.value[id.toString()].isHeart = true
    })
  }
  function FIsHeart(id) {
    return heartMap.value[id.toString()]
  }
  window.api.netEaseCloud.recommend_songs().then((res) => {
    const ids = res.data.dailySongs.map((item: any) => item.id)
    //必须等到红心检测完成才能显示
    FCheckHeart(ids).then(() => {
      tracks.value = res.data.dailySongs
      loading.value = false
    })
  })
  function FPlayAll(event: any) {
    if (player.listID !== 'recommend-songs') stateStore.tip = '播放每日推荐'
    player.loadList(tracks.value, 'recommend-songs')

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
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
  }
  function FGetDate() {
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return { month, day }
  }
  const date = FGetDate()
  function FCollect(track: any) {
    collect.value = true
    collectTrack = track
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
  h1,
  h2 {
    text-align: center;
  }
  .daily-songs {
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
  .recommend-songs-icon {
    width: 256px;
    height: 256px;
    flex: 1;
    position: relative;
    border-radius: 20px;
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .recommend-songs-name {
    font-size: 4rem;
  }
  .date {
    position: absolute;
    left: 5%;
    top: 5%;
    color: rgb(var(--v-theme-on-primary));
    font-size: 2rem;
  }
  .recommend-songs-tracks {
    width: 90%;
    margin: 0 auto;
  }
</style>
