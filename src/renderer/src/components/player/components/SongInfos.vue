<template>
  <div class="song-info">
    <v-card class="card" variant="text">
      <template #prepend>
        <v-img
          v-if="currentTrack.al"
          width="54"
          rounded="lg"
          aspect-ratio="1"
          cover
          :src="coverImg"
          class="cover"
          @click="FGotoLyric"
        ></v-img>
      </template>
      <template #title>
        <span
          v-if="currentTrack.name"
          class="song-album"
          @click="FLookAlbum"
          @contextmenu.prevent="FCopy"
        >
          {{ currentTrack.name || '' }}
        </span>
      </template>
      <template #subtitle>
        <span
          v-if="currentTrack.ar"
          class="song-artist"
          @click="FLookArtist"
          @contextmenu.prevent="FCopy"
          >{{ currentTrack.ar[0].name || '' }}
        </span>
      </template>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { inject, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useStateStore } from '@renderer/store/stateStore'
  const stateStore = useStateStore()
  const router = useRouter()
  const player = inject('player') as any
  const currentTrack = player.currentTrack
  const imgSize = 64
  const coverImg = computed(() => {
    if (currentTrack.value.local) {
      return currentTrack.value.al.picUrl
    } else {
      return currentTrack.value.al.picUrl + `?param=${imgSize}y${imgSize}`
    }
  })
  function FCopy(event: MouseEvent) {
    const target = event.target as HTMLElement
    navigator.clipboard.writeText(target.textContent as string)
    stateStore.tip = ('复制：' + target.textContent) as string
  }
  function FLookArtist() {
    if (!currentTrack.value.local)
      router.push({ name: 'artist', params: { id: currentTrack.value.ar[0].id } })
    else {
      router.push({ name: 'localArtist', params: { id: currentTrack.value.ar[0].id } })
    }
  }
  function FLookAlbum() {
    if (!currentTrack.value.al.id) return
    if (!currentTrack.value.local)
      router.push({ name: 'album', params: { id: currentTrack.value.al.id } })
    else {
      router.push({ name: 'localAlbum', params: { id: currentTrack.value.al.id } })
    }
  }
  function FGotoLyric() {
    if (currentTrack.value.id) router.push({ name: 'playPage' })
  }
</script>

<style lang="scss" scoped>
  :deep(.v-card-item) {
    padding: 0;
  }
  .song-info {
    height: 64px;
    padding-left: 10px;
    display: flex;
    align-items: center;
    position: relative;
  }
  .song-album,
  .song-artist,
  .cover {
    transition: all 0.3s;
    cursor: pointer;
  }
  .song-album {
    font-size: 1.2rem;
    &:hover {
      color: rgb(var(--v-theme-secondary));
    }
  }
  .song-artist {
    font-size: 1rem;
    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }
  .cover {
    &:hover {
      filter: blur(1px);
    }
  }
</style>
