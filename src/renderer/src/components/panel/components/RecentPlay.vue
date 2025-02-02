<template>
  <div class="recent-play">
    <div>
      <h1 class="title">最近播放100首</h1>
      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>
    </div>
    <div class="scroll-container">
      <v-virtual-scroll
        :items="stateStore.recentPlay"
        class="recent-play-scroll"
        @click="FClickTrack"
        @contextmenu.prevent="FCopy"
      >
        <template #default="{ item, index }">
          <div class="song-container">
            <SongCard
              :key="item.id"
              :song="item"
              :index="index"
              :img-size="imgSize"
              :show-album="false"
              :show-time="false"
            >
              <div v-if="item.local" class="local-track">本地</div>
            </SongCard>
          </div>
        </template>
      </v-virtual-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { inject } from 'vue'
  import SongCard from '@renderer/components/publicComponents/SongCard.vue'
  import type Player from '@renderer/utils/player'
  import { useStateStore } from '@renderer/store/stateStore'
  import { useRouter } from 'vue-router'
  const player = inject('player') as Player
  const router = useRouter()
  const imgSize = 52
  const stateStore = useStateStore()
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector('.recent-play-scroll')
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
  function FClickTrack(event) {
    const index = parseInt(FHasAtt(event.target, 'track-index') as string)
    const local = stateStore.recentPlay[index].local
    player.prependTrack(stateStore.recentPlay[index])
    if (event.target.hasAttribute('artist-id')) {
      if (local) {
        router.push({ name: 'localArtist', params: { id: event.target.getAttribute('artist-id') } })
      } else {
        router.push({ name: 'artist', params: { id: event.target.getAttribute('artist-id') } })
      }
    } else if (event.target.hasAttribute('album-id')) {
      if (local) {
        router.push({ name: 'localAlbum', params: { id: event.target.getAttribute('album-id') } })
      } else {
        router.push({ name: 'album', params: { id: event.target.getAttribute('album-id') } })
      }
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = event.target.getAttribute('img-id')
      player.play(trackID)
    } else {
      const trackID = FHasAtt(event.target, 'track-id')
      if (trackID) {
        // //播放这首歌
        player.play(trackID)
      }
    }
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
</script>

<style lang="scss" scoped>
  .recent-play {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .title {
    font-size: 1rem;
    width: 100%;
    text-align: center;
    margin: 5px 0px;
  }
  .scroll-container {
    width: 100%;
    flex: 1;
    position: relative;
  }
  .recent-play-scroll {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .song-container {
    display: flex;
    width: 100%;
  }
  .local-track {
    font-size: 0.8rem;
    opacity: 0.8;
  }
</style>
