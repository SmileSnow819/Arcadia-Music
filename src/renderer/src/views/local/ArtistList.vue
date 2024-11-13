<template>
  <div class="artist-list-view">
    <div class="infinite-scroll">
      <v-card variant="text" v-intersect="onIntersect">
        <template #prepend>
          <v-img
            width="300"
            rounded="lg"
            aspect-ratio="1"
            cover
            :src="currentPageArtists[0] ? currentPageArtists[0].picUrl : defaultImg"
          ></v-img>
        </template>
        <template #subtitle>
          <div class="playlist-desc-container">描述：本地的全部艺术家分类</div>
        </template>
        <template #title>
          <h1>本地艺术家</h1>
        </template>
        <template #actions>
          <v-spacer></v-spacer>
          <v-btn variant="elevated" icon size="large" @click="search = true">
            <v-icon icon="mdi-magnify" size="x-large"> </v-icon>
            <v-tooltip activator="parent" location="top" text="搜索"></v-tooltip>
          </v-btn>
        </template>
      </v-card>

      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>
      <v-virtual-scroll
        :items="currentPageArtists"
        @click="FClickArtist"
        class="infinite-scroll-container"
      >
        <template #default="{ item }">
          <ArtistCard :key="item.id" :artist="item"></ArtistCard>
        </template>
      </v-virtual-scroll>
      <v-pagination
        v-if="totalArtists.length > increment"
        v-model="page"
        :length="pageLength"
        rounded="lg"
      ></v-pagination>
    </div>
    <v-progress-circular v-if="!pageChange" color="on-background" indeterminate class="loading">{{
      '加载中...'
    }}</v-progress-circular>
    <SearchArtistDialogs v-if="search" @close-dialog="search = false"></SearchArtistDialogs>
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
  import { inject, ref, shallowReactive, type ShallowReactive, watch, nextTick } from 'vue'
  import type { Setting } from '@renderer/utils/setting'
  import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
  import { useStateStore } from '@renderer/store/stateStore'
  import ArtistCard from '@renderer/components/publicComponents/ArtistCard.vue'
  import SearchArtistDialogs from '@renderer/components/publicComponents/SearchArtistDialogs.vue'
  import { goTo } from '@renderer/hooks/toolHook'
  import defaultImg from '@renderer/public/test.png'
  const stateStore = useStateStore()
  const route = useRoute()
  const router = useRouter()
  const globalSetting = inject('setting') as Setting
  const currentPageArtists = shallowReactive([]) as ShallowReactive<Array<any>>
  let totalArtists = [] as Array<any>
  let ArtistsPath = [] as Array<any>
  const fab = ref(true)
  const page = ref(1)
  const realPage = ref(1)
  let pageLength = 1
  const pageChange = ref(false)
  const search = ref(false)
  const increment = 50
  const baseDir = globalSetting.settings.tracksDir
  //获得一页歌手数据
  async function FGetPageArtist(newPage: number): Promise<void> {
    const offset = (page.value - 1) * increment
    //如果之前没加载过，就加载
    if (ArtistsPath.length === 0) return
    if (!totalArtists[offset].id) {
      const pagePath = ArtistsPath.slice(offset, offset + increment)
      const artistsData = [] as Array<any>
      for (let i = 0; i < pagePath.length; i++) {
        const path = pagePath[i]
        const artist = await window.electron.ipcRenderer.invoke('store-get', path, 'artists', true)
        const firstTrack = (
          await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [artist.picUrl])
        )[0]
        artist.picUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
        totalArtists[i + offset] = artist
        artistsData.push(artist)
      }

      currentPageArtists.splice(0, currentPageArtists.length, ...artistsData)
    } else {
      //如果之前加载过，就直接拿来用
      const artistData = totalArtists.slice(offset, offset + increment)
      currentPageArtists.splice(0, currentPageArtists.length, ...artistData)
    }

    nextTick(() => {
      pageChange.value = true
      realPage.value = newPage
    })
  }
  async function init() {
    ArtistsPath = await window.electron.ipcRenderer.invoke('read-json-dir', 'artists')

    if (baseDir && ArtistsPath.length > 0) {
      totalArtists = new Array(ArtistsPath.length).fill({})
      await FGetPageArtist(1)
    }
    pageLength = Math.ceil(ArtistsPath.length / increment)
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
    FGetPageArtist(newPage)
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
  //单击事件
  function FClickArtist(event) {
    const artistID = FHasAtt(event.target, 'artist-id')
    if (artistID) {
      router.push({ name: 'localArtist', params: { id: artistID } })
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
        await FGetPageArtist(prePage)
      }
      FScrollToPrePosition()
    })
  }

  //进行一次监听
  watch(currentPageArtists, FWaitUntilCanScroll, { once: true })
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
</script>

<style lang="scss" scoped>
  h1 {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
  .local-artist-head {
    width: 100%;
    background: none;
    display: flex;
    justify-content: space-between;
  }
  .artist-list-view {
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

  .search-track {
    transition: all 0.3s;
  }
</style>
