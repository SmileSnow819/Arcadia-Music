<template>
  <div class="album-list-view">
    <div class="infinite-scroll">
      <v-card variant="text" v-intersect="onIntersect">
        <template #prepend>
          <v-img
            width="300"
            rounded="lg"
            aspect-ratio="1"
            cover
            :src="currentPageAlbums[0] ? currentPageAlbums[0].picUrl : defaultImg"
          ></v-img>
        </template>
        <template #title>
          <h1>本地专辑</h1>
        </template>
        <template #subtitle>
          <div class="playlist-desc-container">描述：本地的全部专辑分类</div>
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
        :items="currentPageAlbums"
        @click="FClickAlbum"
        class="infinite-scroll-container"
      >
        <template #default="{ item }">
          <AlbumCard :key="item.id" :album="item"></AlbumCard>
        </template>
      </v-virtual-scroll>
      <v-pagination
        v-if="totalAlbums.length > increment"
        v-model="page"
        :length="pageLength"
        rounded="lg"
      ></v-pagination>
    </div>
    <v-progress-circular v-if="!pageChange" color="on-background" indeterminate class="loading">{{
      '加载中...'
    }}</v-progress-circular>
    <SearchAlbumDialogs v-if="search" @close-dialog="search = false"></SearchAlbumDialogs>
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
  import AlbumCard from '@renderer/components/publicComponents/AlbumCard.vue'
  import SearchAlbumDialogs from '@renderer/components/publicComponents/SearchAlbumDialogs.vue'
  import { goTo } from '@renderer/hooks/toolHook'
  import defaultImg from '@renderer/public/test.png'
  const stateStore = useStateStore()
  const route = useRoute()
  const router = useRouter()
  const globalSetting = inject('setting') as Setting
  const currentPageAlbums = shallowReactive([]) as ShallowReactive<Array<any>>
  let totalAlbums = [] as Array<any>
  let albumsPath = [] as Array<any>
  const fab = ref(true)
  const page = ref(1)
  const realPage = ref(1)
  let pageLength = 1
  const pageChange = ref(false)
  const search = ref(false)
  const increment = 50
  const baseDir = globalSetting.settings.tracksDir
  //获得一页歌手数据
  async function FGetPageAlbum(newPage: number): Promise<void> {
    const offset = (page.value - 1) * increment
    //如果之前没加载过，就加载
    if (albumsPath.length === 0) return
    if (!totalAlbums[offset].id) {
      const pagePath = albumsPath.slice(offset, offset + increment)
      const albumsData = [] as Array<any>
      for (let i = 0; i < pagePath.length; i++) {
        const path = pagePath[i]
        const album = await window.electron.ipcRenderer.invoke('store-get', path, 'albums', true)
        const firstTrack = (
          await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [album.picUrl])
        )[0]
        album.picUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
        totalAlbums[i + offset] = album
        albumsData.push(album)
      }

      currentPageAlbums.splice(0, currentPageAlbums.length, ...albumsData)
    } else {
      //如果之前加载过，就直接拿来用
      const albumData = totalAlbums.slice(offset, offset + increment)
      currentPageAlbums.splice(0, currentPageAlbums.length, ...albumData)
    }

    nextTick(() => {
      pageChange.value = true
      realPage.value = newPage
    })
  }
  async function init() {
    if (baseDir) {
      albumsPath = await window.electron.ipcRenderer.invoke('read-json-dir', 'albums')

      if (albumsPath.length > 0) {
        totalAlbums = new Array(albumsPath.length).fill({})
        await FGetPageAlbum(1)
      }

      pageLength = Math.ceil(albumsPath.length / increment)
      nextTick(() => {
        pageChange.value = true
        realPage.value = 1
      })
    } else {
      router.push({ name: 'local' })
    }
  }
  init()
  //加载新的一页数据
  watch(page, (newPage) => {
    //如果之前加载过，就不用加载了
    pageChange.value = false
    FGetPageAlbum(newPage)
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
  function FClickAlbum(event) {
    const albumID = FHasAtt(event.target, 'album-id')
    if (albumID) {
      router.push({ name: 'localAlbum', params: { id: albumID } })
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
        await FGetPageAlbum(prePage)
      }
      FScrollToPrePosition()
    })
  }

  //进行一次监听
  watch(currentPageAlbums, FWaitUntilCanScroll, { once: true })
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
  .album-list-view {
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
