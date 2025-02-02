<template>
  <div class="home-page-view">
    <div class="home-page">
      <div class="home-page-title">
        <h1>Hi! {{ userStore.profile.nickname }}, 今天想听些什么？</h1>
      </div>
      <div>
        <h2>每日推荐</h2>
        <div class="recommend-songs">
          <v-sheet
            class="recommend-songs-icon personal"
            v-intersect="onIntersect"
            @click="FLookRecommendSongs"
          >
            <div class="recommend-songs-name">日推</div>
            <div class="date">{{ date.month }}/{{ date.day }}</div>
          </v-sheet>
          <div class="recommend-songs-tracks" @click="FClickTrack">
            <SongCard
              v-for="track in recommendSongs.slice(0, 9)"
              :key="track.id"
              :song="track"
              :img-size="64"
              :show-album="false"
              :show-time="false"
            ></SongCard>
          </div>
        </div>
      </div>
      <div>
        <h2>私人定制</h2>
        <div class="fm-and-heart">
          <div class="fm-model">
            <v-icon class="personal" icon="mdi-radio" size="128" @click="Ffm"></v-icon>
            <v-icon icon="mdi-radio-fm" size="128"></v-icon>
          </div>
          <div class="heart-model">
            <v-icon
              class="personal"
              icon="mdi-heart-pulse"
              size="128"
              @click="$router.push({ name: 'playlist', params: { id: 3136952023 } })"
            ></v-icon>
            <div class="heart-text">私人雷达</div>
          </div>
        </div>
      </div>
      <div>
        <h2>推荐歌单</h2>
        <div class="recommend-playlist" @click="FClickPlaylist">
          <PlaylistCard
            v-for="playlist in recommendPlaylist.slice(0, 6)"
            :key="playlist.id"
            :playlist="playlist"
            class="playlist"
          >
          </PlaylistCard>
        </div>
      </div>
    </div>
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
  import { shallowRef, ref, inject } from 'vue'
  import { useUserStore } from '@renderer/store/userStore'
  import { useStateStore } from '@renderer/store/stateStore'
  import SongCard from '@renderer/components/publicComponents/SongCard.vue'
  import { useRouter } from 'vue-router'
  import Player from '@renderer/utils/player'
   import { goTo } from '@renderer/hooks/toolHook'
  const fab = ref(true)
  const userStore = useUserStore().netEaseCloud as any
  const stateStore = useStateStore()
  const router = useRouter()
  const recommendSongs = shallowRef([]) as any
  const recommendPlaylist = shallowRef([]) as any

  const player = inject('player') as Player
  window.api.netEaseCloud.recommend_songs().then((res) => {
    recommendSongs.value = res.data.dailySongs
  })
  window.api.netEaseCloud.recommend_playlist().then((res) => {
    res.recommend = res.recommend.filter((item) => item.id !== 3136952023)
    recommendPlaylist.value = res.recommend
  })

  function FGetDate() {
    const date = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return { month, day }
  }
  const date = FGetDate()
  function FLookRecommendSongs() {
    router.push({ name: 'recommendSongs' })
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
  function FClickTrack(event) {
    if (event.target.hasAttribute('artist-id')) {
      router.push({ name: 'artist', params: { id: event.target.getAttribute('artist-id') } })
    } else if (event.target.hasAttribute('album-id')) {
      router.push({ name: 'album', params: { id: event.target.getAttribute('album-id') } })
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = parseInt(event.target.getAttribute('img-id') as string)
      player.prependTrack(recommendSongs.value.find((item) => item.id == trackID))
      // //播放这首歌
      player.play(trackID)
    } else {
      const trackID = FHasAtt(event.target, 'track-id')
      if (trackID) {
        // //把这首歌添加到播放列表第一项
        player.prependTrack(recommendSongs.value.find((item) => item.id == trackID))
        // //播放这首歌
        player.play(trackID)
      }
    }
  }
  function Ffm() {
    player.modelChange(3)
    stateStore.tip = 'FM模式'
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
  .home-page-title {
    display: flex;
    :deep(.v-btn__overlay) {
      display: none;
    }
    :deep(.v-btn) {
      &:hover {
        transform: scale(1.2);
      }
    }
  }
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
  .recommend-songs {
    width: 100%;
    display: flex;
  }
  .recommend-songs-icon {
    min-width: 256px;
    min-height: 256px;
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
  .recommend-songs-tracks {
    width: 70%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 5px;
  }
  .fab {
    right: 5%;
    bottom: 5%;
  }
  .recommend-songs-btn {
    position: absolute;
    right: 5%;
    bottom: 5%;
  }
  .date {
    position: absolute;
    left: 5%;
    top: 5%;
    color: rgb(var(--v-theme-on-primary));
    font-size: 2rem;
  }
  .recommend-playlist {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 5px;
    align-items: center;
    justify-content: center;
  }
  .playlist {
    place-self: center;
  }
  .fm-and-heart {
    display: flex;
    width: 100%;
    gap: 10px;
  }
  .fm-model,
  .heart-model {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    place-self: center;
    border-radius: 20px;
  }
  .fm-model {
    align-items: end;
    background-color: rgb(var(--v-theme-secondary));
    color: rgb(var(--v-theme-on-secondary));
  }
  .heart-model {
    background-color: rgb(239, 79, 79);
    color: rgb(var(--v-theme-on-secondary));
  }
  .heart-text {
    font-size: 3rem;
  }
  :deep(.v-btn__overlay) {
    display: none;
  }
  .personal {
    transition: all 0.3s;
    &:hover {
      transform: scale(1.1);
      cursor: pointer;
    }
  }
</style>
