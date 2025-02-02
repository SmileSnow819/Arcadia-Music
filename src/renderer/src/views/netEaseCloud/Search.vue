<template>
  <div class="search-view">
    <div class="result-container">
      <v-card variant="text" v-intersect="onIntersect">
        <template #title> 搜索结果 </template>
        <template #subtitle> 关键词：{{ keywords }} </template>
      </v-card>
      <v-tabs v-model="tab" color="primary" fixed-tabs>
        <v-tab value="songs"> 歌曲 </v-tab>
        <v-tab value="albums"> 专辑 </v-tab>
        <v-tab value="artists"> 歌手 </v-tab>
        <v-tab value="playlists"> 歌单 </v-tab>
        <!-- <v-tab value="userprofiles"> 用户 </v-tab> -->
      </v-tabs>
      <!-- <v-divider thickness="2px" opacity="100" color="primary" class="divider"></v-divider> -->
      <v-window v-model="tab">
        <v-window-item value="songs">
          <div class="infinite-scroll-container songs" @click="FClickTrack">
            <v-virtual-scroll :items="tracks" class="infinite-scroll" @contextmenu.prevent="FCopy">
              <template #default="{ item, index }">
                <SongCard :key="item.id" :song="item">
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
            <v-divider v-if="tracks.length === 0" opacity="0"
              >什么也没有找到QwQ，换个词试试？</v-divider
            >
          </div>
        </v-window-item>
        <v-window-item value="albums">
          <div class="infinite-scroll-container albums" @click="FClickAlbum">
            <v-virtual-scroll :items="albums" class="infinite-scroll">
              <template #default="{ item }">
                <AlbumCard :key="item.id" :album="item"></AlbumCard>
              </template>
            </v-virtual-scroll>
            <v-divider v-if="albums.length === 0" opacity="0"
              >什么也没有找到QwQ，换个词试试？</v-divider
            >
          </div>
        </v-window-item>
        <v-window-item value="artists">
          <div class="infinite-scroll-container artists" @click="FClickArtist">
            <v-virtual-scroll :items="artists" class="infinite-scroll">
              <template #default="{ item }">
                <ArtistCard :key="item.id" :artist="item"></ArtistCard>
              </template>
            </v-virtual-scroll>
            <v-divider v-if="artists.length === 0" opacity="0"
              >什么也没有找到QwQ，换个词试试？</v-divider
            >
          </div>
        </v-window-item>
        <v-window-item value="playlists">
          <div class="infinite-scroll-container playlists" @click="FClickPlaylist">
            <v-virtual-scroll :items="playlists" class="infinite-scroll">
              <template #default="{ item }">
                <PlaylistCard :key="item.id" :playlist="item"></PlaylistCard>
              </template>
            </v-virtual-scroll>
            <v-divider v-if="playlists.length === 0" opacity="0"
              >什么也没有找到QwQ，换个词试试？</v-divider
            >
          </div>
        </v-window-item>
        <!-- <v-window-item value="userprofiles"> </v-window-item> -->
      </v-window>
    </div>
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
      @click="goTo(0, { container: '.result-container', duration: 500 })"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, shallowRef, watch, type ShallowRef } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { downloadTrack } from '@renderer/hooks/localTrackHook'
  import { goTo } from '@renderer/hooks/toolHook'
  const globalSetting = inject('setting') as any
  const baseDir = globalSetting.settings.tracksDir
  const stateStore = useStateStore()
  const player = inject('player') as Player
  const route = useRoute()
  const router = useRouter()
  const keywords = route.params.keywords as string
  const tab = ref('songs')
  const fab = ref(false)
  const tracks = shallowRef([]) as ShallowRef<Array<any>>
  const albums = shallowRef([]) as ShallowRef<Array<any>>
  const artists = shallowRef([]) as ShallowRef<Array<any>>
  const playlists = shallowRef([]) as ShallowRef<Array<any>>
  const userprofiles = shallowRef([]) as ShallowRef<Array<any>>
  const mv = shallowRef([]) as ShallowRef<Array<any>>
  const collect = ref(false)
  let collectTrack = {} as any
  const items = [
    { title: '收藏', icon: 'mdi-star-outline' },
    { title: '下载', icon: 'mdi-download' }
  ]
  const result = {
    songs: tracks,
    albums,
    artists,
    playlists,
    userprofiles,
    mv
  }
  const searchMap = {
    songs: 1,
    albums: 10,
    artists: 100,
    playlists: 1000,
    userprofiles: 1002,
    mv: 1004
  }
  async function FGetData() {
    const type = searchMap[tab.value]
    const options = {
      keywords,
      type,
      limit: 100,
      offset: 0
    }
    const res = await window.api.netEaseCloud.search(options)
    const resResult = res.result[tab.value]
    if (tab.value === 'songs') {
      const ids = resResult.map((item: any) => {
        return { id: item.id }
      })
      const songRes = await window.api.netEaseCloud.song_detail({ ids })
      result[tab.value].value = songRes.songs
    } else {
      result[tab.value].value = resResult
    }
  }
  watch(tab, FGetData, { immediate: true })
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
  }
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector(`.${tab.value}`)
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
  //歌曲的单击事件
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
      let trackID = FHasAtt(event.target, 'track-id')
      if (trackID) {
        // //把这首歌添加到播放列表第一项
        player.prependTrack(tracks.value.find((item) => item.id == trackID))
        // //播放这首歌
        player.play(trackID)
      }
    }
  }
  function FClickArtist(event) {
    let artistID = FHasAtt(event.target, 'artist-id')
    if (artistID) {
      router.push({ name: 'artist', params: { id: artistID } })
    }
  }
  function FClickAlbum(event) {
    let albumID = FHasAtt(event.target, 'album-id')
    if (albumID) {
      router.push({ name: 'album', params: { id: albumID } })
    } else {
      let artistID = FHasAtt(event.target, 'artist-id')
      if (artistID) {
        router.push({ name: 'artist', params: { id: artistID } })
      }
    }
  }
  function FClickPlaylist(event) {
    let playlistID = FHasAtt(event.target, 'playlist-id')
    if (playlistID) {
      router.push({ name: 'playlist', params: { id: playlistID } })
    }
  }
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
  }
</script>

<style lang="scss" scoped>
  .search-view {
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .result-container {
    height: 100%;
    width: 100%;
    padding: 8%;
    padding-bottom: 0%;
    overflow: auto;
  }
  .divider {
    margin: 5px 0px;
  }
  .song-index {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 100%;
    transform: translate(-100%, 0%);
    z-index: 1500;
  }
  .song-index-text {
    opacity: 0.6;
  }
  .infinite-scroll-container {
    width: 100%;
    height: 100%;
  }
  .infinite-scroll {
    width: 90%;
    margin: 0 auto;
    height: 100%;
    overflow: visible;
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
</style>
