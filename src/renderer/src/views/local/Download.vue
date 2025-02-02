<template>
  <div class="playlist-view">
    <div class="infinite-scroll">
      <v-card variant="text" v-intersect="onIntersect">
        <template #prepend>
          <v-img width="300" rounded="lg" aspect-ratio="1" cover :src="cover"></v-img>
        </template>
        <template #title>
          <h1>已下载</h1>
        </template>
        <template #subtitle>
          <div class="playlist-desc-container">
            <h2>{{ totalTracks.length }}首歌</h2>
            <div>
              <span class="playlist-desc"> 描述：本次使用中下载的全部歌曲 </span>
            </div>
          </div>
        </template>
        <template #actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="elevated"
            icon
            size="large"
            @click="totalTracks.splice(0, totalTracks.length)"
          >
            <v-icon icon="mdi-delete" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="清空"></v-tooltip>
          </v-btn>
        </template>
      </v-card>
      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>
      <v-virtual-scroll
        :items="totalTracks.slice(start, end)"
        @click="FClickTrack"
        @contextmenu.prevent="FCopy"
        class="infinite-scroll-container"
      >
        <template #default="{ item, index }">
          <SongCard :key="totalTracks.slice(start, end)[index].id" :song="item" :index="index">
            <template #index>
              <div class="song-index">
                <span class="song-index-text">{{ index + 1 + (realPage - 1) * increment }}</span>
              </div>
            </template>
            <v-btn variant="text" :ripple="false" @click="FCollectTrack(item)">
              <v-icon :icon="items[0].icon" size="x-large"></v-icon>
            </v-btn>
            <v-progress-circular
              v-if="!item.local"
              color="primary"
              indeterminate
            ></v-progress-circular>
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
      :local="collectTrack.local || false"
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
  import SongCard from '@components/publicComponents/SongCard.vue'
  import { inject, ref, shallowReactive, type ShallowReactive, watch, nextTick } from 'vue'
  import type Player from '@renderer/utils/player'
  import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
  import { useStateStore } from '@renderer/store/stateStore'
  import CollectDialogs from '@renderer/components/publicComponents/CollectDialogs.vue'
  import defaultImg from '@renderer/public/test.png'
  import { goTo } from '@renderer/hooks/toolHook'
  const stateStore = useStateStore()
  const route = useRoute()
  const router = useRouter()
  const player = inject('player') as Player
  const currentPageTracks = shallowReactive([]) as ShallowReactive<Array<any>>
  let totalTracks = [] as Array<any>
  const fab = ref(true)
  const page = ref(1)
  const realPage = ref(1)
  let pageLength = 1
  const pageChange = ref(false)
  const collect = ref(false)
  let collectTrack = {} as any
  //如果是自己喜欢的音乐，不显示红心
  const increment = 200
  const items = [{ title: '收藏', icon: 'mdi-star-outline' }]
  let cover = ref('')
  const start = ref(0)
  const end = ref(increment)

  async function init() {
    totalTracks = stateStore.downloadBuffer
    // 加入下载缓冲区里的歌曲
    if (totalTracks.length === 0) {
      cover.value = defaultImg
    } else {
      cover.value = totalTracks[0].al.picUrl
    }
    //计算总页数
    pageLength = Math.ceil(totalTracks.length / increment)
    nextTick(() => {
      pageChange.value = true
      realPage.value = 1
    })
  }
  init()
  //加载新的一页数据
  watch(page, (newPage) => {
    //如果之前加载过，就不用加载了
    pageChange.value = false
    start.value = (page.value - 1) * increment
    end.value = start.value + increment
    nextTick(() => {
      pageChange.value = true
      realPage.value = newPage
    })
  })

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
      player.prependTrack(totalTracks.find((item) => item.id == trackID))
      // //播放这首歌
      player.play(trackID)
    }
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
      }
      FScrollToPrePosition()
    })
  }

  //进行一次监听
  watch(currentPageTracks, FWaitUntilCanScroll, { once: true })

  //每次离开时保存该路径的滚动条位置
  onBeforeRouteLeave((_to, _from) => {
    const scrollContainer = document.querySelector('.infinite-scroll')
    if (!scrollContainer) return
    stateStore.scrollTopMap[route.path] = `${scrollContainer.scrollTop} + ${realPage.value}`
    return true
  })
  //更新时保存该路径的滚动条位置
  onBeforeRouteUpdate((_to, _from) => {
    const scrollContainer = document.querySelector('.infinite-scroll')
    if (!scrollContainer) return
    stateStore.scrollTopMap[route.path] = `${scrollContainer.scrollTop} + ${realPage.value}`
    return true
  })
  //收藏歌曲
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
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
