<template>
  <div class="home-page-view">
    <div class="home-page">
      <div class="content">
        <div class="home-page-title">
          <h2>本地歌单</h2>
          <v-sheet v-intersect="onIntersect"></v-sheet>
        </div>
        <div class="local-content" @click="FClickPlaylist">
          <div class="content-card" v-for="playlist in playlists">
            <PlaylistCard :playlist="playlist" :imgSize="200"></PlaylistCard>
          </div>
          <div>
            <v-card variant="text">
              <template #prepend>
                <v-btn variant="text" :size="200" class="playlist-add" @click="addPlaylist = true">
                  <v-icon icon="mdi-plus" :size="200"></v-icon>
                </v-btn>
              </template>
              <template #title> <div class="text">添加</div> </template>
            </v-card>
          </div>
          <div>
            <v-card variant="text">
              <template #prepend>
                <v-btn
                  variant="text"
                  :size="200"
                  class="playlist-add"
                  @click="$router.push({ name: 'download' })"
                >
                  <v-icon icon="mdi-download" :size="150"></v-icon>
                </v-btn>
              </template>
              <template #title> <div class="text">已下载</div> </template>
            </v-card>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="content">
          <div class="home-page-title">
            <h2>本地艺术家</h2>
          </div>
          <div class="local-content" @click="FClickArtist">
            <div class="content-card" v-for="artist in artists">
              <ArtistCard :artist="artist" :imgSize="200"></ArtistCard>
            </div>
            <div>
              <v-card variant="text">
                <template #prepend>
                  <v-btn
                    variant="text"
                    :size="150"
                    :ripple="false"
                    @click="$router.push({ name: 'localArtistList' })"
                  >
                    <v-icon icon="mdi-more" :size="150"></v-icon>
                  </v-btn>
                </template>
                <template #title> <div class="text">全部</div> </template>
              </v-card>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="content">
          <div class="home-page-title">
            <h2>本地专辑</h2>
          </div>
          <div class="local-content" @click="FClickAlbum">
            <div class="content-card" v-for="album in albums">
              <AlbumCard :album="album" :imgSize="200"></AlbumCard>
            </div>
            <div>
              <v-card variant="text">
                <template #prepend>
                  <v-btn
                    variant="text"
                    :size="150"
                    :ripple="false"
                    @click="$router.push({ name: 'localAlbumList' })"
                  >
                    <v-icon icon="mdi-more" :size="150"></v-icon>
                  </v-btn>
                </template>
                <template #title> <div class="text">全部</div> </template>
              </v-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    <v-progress-circular v-if="loading" color="on-background" indeterminate class="loading">{{
      initState ? '建立索引中，这可能要花些时间....:' : '加载中...'
    }}</v-progress-circular>

    <NewPlaylistDialogs v-if="addPlaylist" @close-dialog="FGetNewPlaylist" :local="true" />
    <v-fab
      transition="fab-transition"
      :active="!fab"
      class="fab"
      icon="mdi-arrow-up"
      size="large"
      absolute
      color="primary"
      @click="goTo(0, { container: '.home-page', duration: 100 })"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
  // import { useRouter } from 'vue-router'
  import { shallowReactive, ref, inject, type ShallowReactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { type Setting } from '@renderer/utils/setting'
  import PlaylistCard from '@renderer/components/publicComponents/PlaylistCard.vue'
  import NewPlaylistDialogs from '@renderer/components/publicComponents/NewPlaylistDialogs.vue'
  import { init } from '@renderer/hooks/localTrackHook'
  import { goTo } from '@renderer/hooks/toolHook'
  //从public里引入默认png图像
  import defaultImg from '@renderer/public/test.png'
  const globalSetting = inject('setting') as Setting
  const fab = ref(true)
  const router = useRouter()
  const playlists = shallowReactive([]) as ShallowReactive<Array<any>>
  let baseDir = globalSetting.settings.tracksDir

  const addPlaylist = ref(false)
  const loading = ref(true)
  const initState = ref(false)
  async function FGetPlaylist() {
    if (!baseDir) {
      router.push({ name: 'local' })
      loading.value = false
      return
    }
    playlists.splice(0, playlists.length)
    //初始化本地歌单列表
    const exists = await window.electron.ipcRenderer.invoke('store-test', 'localPlaylists')
    if (!exists) {
      //初始化歌单
      initState.value = true
      await init(baseDir)
      initState.value = false
    }
    //读取所有的歌单
    const res = await window.electron.ipcRenderer.invoke('store-get', 'localPlaylists')
    //对于每个id,获取数据
    for (const playlistInfo of res.playlists) {
      if (playlistInfo.cover) {
        const firstTrack = (
          await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [playlistInfo.cover])
        )[0]
        playlistInfo.coverImgUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
      } else {
        playlistInfo.coverImgUrl = defaultImg
      }
      playlists.push(playlistInfo)
    }
    loading.value = false
  }
  const artists = shallowReactive([]) as Array<any>
  async function FGetArtist() {
    if (!baseDir) return
    const artistsPath = await window.electron.ipcRenderer.invoke('read-json-dir', 'artists')
    if (artistsPath.length === 0) return
    const indexes = [] as number[]
    let paths = [] as string[]
    //随即生成三个索引
    if (artistsPath.length >= 3) {
      for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * artistsPath.length)
        while (indexes.includes(index)) {
          index = Math.floor(Math.random() * artistsPath.length)
        }
        indexes.push(index)
      }
      paths = [artistsPath[indexes[0]], artistsPath[indexes[1]], artistsPath[indexes[2]]]
    } else {
      paths = artistsPath
    }
    const artistsData = [] as Array<any>
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const artist = await window.electron.ipcRenderer.invoke('store-get', path, 'artists', true)
      const firstTrack = (
        await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [artist.picUrl])
      )[0]
      artist.picUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
      artists.push(artist)
      artistsData.push(artist)
    }
  }
  const albums = shallowReactive([]) as Array<any>
  async function FGetAlbums() {
    if (!baseDir) return

    const albumsPath = await window.electron.ipcRenderer.invoke('read-json-dir', 'albums')
    if (albumsPath.length === 0) return
    const indexes = [] as number[]
    let paths = [] as string[]
    //随即生成三个索引
    if (albumsPath.length >= 3) {
      for (let i = 0; i < 3; i++) {
        let index = Math.floor(Math.random() * albumsPath.length)
        while (indexes.includes(index)) {
          index = Math.floor(Math.random() * albumsPath.length)
        }
        indexes.push(index)
      }
      paths = [albumsPath[indexes[0]], albumsPath[indexes[1]], albumsPath[indexes[2]]]
    } else {
      paths = albumsPath
    }

    const albumsData = [] as Array<any>
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const album = await window.electron.ipcRenderer.invoke('store-get', path, 'albums', true)
      const firstTrack = (
        await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [album.picUrl])
      )[0]
      album.picUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
      albums.push(album)
      albumsData.push(album)
    }
  }
  async function initHomePage() {
    await FGetPlaylist()
    await FGetArtist()
    await FGetAlbums()
  }
  initHomePage()
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector('.home-page')
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
      return trackIDElement.getAttribute(att)
    }
    return 0
  }

  function FClickPlaylist(event) {
    let playlistID = FHasAtt(event.target, 'playlist-id')
    if (playlistID) {
      if (playlistID !== 'download')
        router.push({ name: 'localPlaylist', params: { id: playlistID } })
      else router.push({ name: 'download' })
    }
  }
  function FClickArtist(event) {
    const artistID = FHasAtt(event.target, 'artist-id')
    if (artistID) {
      router.push({ name: 'localArtist', params: { id: artistID } })
    }
  }
  function FClickAlbum(event) {
    const albumID = FHasAtt(event.target, 'album-id')
    if (albumID) {
      router.push({ name: 'localAlbum', params: { id: albumID } })
    } else {
      const artistID = FHasAtt(event.target, 'artist-id')
      if (artistID) {
        router.push({ name: 'localArtist', params: { id: artistID } })
      }
    }
  }
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
  }
  function FGetNewPlaylist(state: boolean) {
    if (state) {
      FGetPlaylist()
    }
    addPlaylist.value = false
  }
</script>

<style lang="scss" scoped>
  h1,
  h2 {
    font-size: 2rem;
    width: 100%;
    margin: 10px 0px;
  }
  .home-page-view {
    height: 100%;
    width: 100%;
    position: absolute;
  }
  .home-page {
    width: 100%;
    height: 100%;
    padding: 8%;
    padding-bottom: 0;
    overflow: auto;
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .fab {
    right: 5%;
    bottom: 5%;
  }
  .local-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .content-card {
    width: 100%;
    position: relative;
  }
  .playlist-info {
    margin: 5px;
    border-radius: 15px;
    &:hover {
      background-color: rgb(var(--v-theme-surface));
    }
  }
  .playlist-cover:hover {
    cursor: pointer;
    filter: blur(2px);
  }
  .playlist-cover-container {
    position: relative;
    &:hover .play-icon {
      opacity: 1;
    }
  }
  .play-icon {
    opacity: 0;
    position: absolute;
    z-index: 1000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .playlist-name,
  .playlist-length {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .playlist-name {
    font-size: 1.3rem;
  }
  .playlist-length {
    font-size: 1rem;
  }
  .playlist-add {
    width: 100%;
    height: 100%;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      cursor: pointer;
    }
  }

  .loading {
    width: 10%;
    height: 10%;
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
  }
  .text {
    font-size: 1.5rem;
  }
</style>
