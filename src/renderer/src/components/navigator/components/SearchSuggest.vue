<template>
  <v-sheet class="search-suggest-container" elevation="10">
    <div class="search-suggest">
      <v-divider thickness="2px" opacity="100" color="primary">歌曲</v-divider>
      <v-card
        v-for="(track, index) in tracks"
        :key="index"
        variant="text"
        @click="FPlayTrack(track)"
      >
        <template #title>
          <div class="tittle text">{{ track.name }}</div>
        </template>
        <template #subtitle>
          <div class="subtitle text">{{ track.artists[0].name }} - {{ track.album.name }}</div>
        </template>
      </v-card>
    </div>
    <div class="search-suggest">
      <v-divider thickness="2px" opacity="100" color="primary">歌手</v-divider>
      <v-card
        v-for="(artist, index) in artists"
        :key="index"
        variant="text"
        @click="FLookArtist(artist.id)"
      >
        <template #title>
          <div class="tittle text">{{ artist.name }}</div>
        </template>
      </v-card>
    </div>
    <div class="search-suggest">
      <v-divider thickness="2px" opacity="100" color="primary">专辑</v-divider>
      <v-card
        v-for="(album, index) in albums"
        :key="index"
        variant="text"
        @click="FLookAlbum(album.id)"
      >
        <template #title>
          <div class="tittle text">{{ album.name }}</div>
        </template>
      </v-card>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
  import { ref, defineProps, type Ref, watch, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import type Player from '@renderer/utils/player'
  const player = inject('player') as Player
  const router = useRouter()
  const props = defineProps({
    keyword: {
      type: Function,
      required: true
    }
  })
  const keyword = props.keyword() as Ref<string>
  const albums = ref([]) as Ref<any>
  const artists = ref([]) as Ref<any>
  const tracks = ref([]) as Ref<any>
  watch(
    keyword,
    () => {
      if (keyword.value === '') return
      window.api.netEaseCloud.search_suggest(keyword.value).then((res) => {
        albums.value = res.result.albums
        artists.value = res.result.artists
        tracks.value = res.result.songs
      })
    },
    { immediate: true }
  )
  function FPlayTrack(track: any) {
    window.api.netEaseCloud.song_detail({ ids: [{ id: track.id }] }).then((res) => {
      const track = res.songs[0]
      player.prependTrack(track)
      player.play(track.id)
    })
  }
  function FLookAlbum(albumID: number) {
    router.push({ name: 'album', params: { id: albumID } })
  }
  function FLookArtist(artistID: number) {
    router.push({ name: 'artist', params: { id: artistID } })
  }
</script>

<style lang="scss" scoped>
  .search-suggest-container {
    position: absolute;
    width: 200px;
    top: 100%;
    border-radius: 4px;
    padding: 4px;
  }
  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tittle {
    font-size: 0.8rem;
  }
  .subtitle {
    font-size: 0.6rem;
  }
  :deep(.v-card-item) {
    padding: 2px;
  }
</style>
