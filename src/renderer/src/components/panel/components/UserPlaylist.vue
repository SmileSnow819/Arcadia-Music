<template>
  <div class="user-playlist">
    <div v-if="userStore.netEaseCloud.login" class="playlist-scroll" @click="FClickPlaylist">
      <h1 class="playlist-title">{{ userStore.netEaseCloud.profile.nickname }}的歌单</h1>
      <v-divider thickness="2px" opacity="100" color="secondary"></v-divider>
      <div v-for="playlist in userStore.netEaseCloud.playlists">
        <PlaylistCard
          v-if="playlist.creator.userId === userStore.netEaseCloud.profile.userId"
          :key="playlist.id + '+' + playlist.trackUpdateTime + '+' + playlist.trackNumberUpdateTime"
          :playlist="playlist"
          :img-size="64"
        >
        </PlaylistCard>
      </div>
      <v-card variant="text">
        <template #prepend>
          <v-btn variant="text" icon @click="createPlaylist = true">
            <v-icon icon="mdi-plus" size="x-large"></v-icon>
          </v-btn>
        </template>
        <template #title> <span style="font-size: 1rem"> 创建新歌单 </span></template>
      </v-card>
      <NewPlaylistDialogs v-if="createPlaylist" @close-dialog="createPlaylist = false" />
    </div>
    <div v-else>
      <v-divider color="error" thickness="2px">你还没有登陆哦</v-divider>
    </div>
  </div>
</template>

<script setup lang="ts">
  import NewPlaylistDialogs from '@renderer/components/publicComponents/NewPlaylistDialogs.vue'
  import { useUserStore } from '@renderer/store/userStore'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  const createPlaylist = ref(false)
  const userStore = useUserStore()
  const router = useRouter()
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector('.playlist-scroll')
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
  function FClickPlaylist(event) {
    let playlistID = FHasAtt(event.target, 'playlist-id')
    if (playlistID) {
      router.push({ name: 'playlist', params: { id: playlistID } })
    }
  }
</script>

<style lang="scss" scoped>
  .user-playlist {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .playlist-title {
    font-size: 1rem;
    width: 100%;
    text-align: center;
    margin: 5px 0px;
  }
  .playlist-scroll {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: auto;
  }
  :deep(.playlist-name) {
    font-size: 1rem;
  }
</style>
