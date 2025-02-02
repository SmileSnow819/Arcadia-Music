<template>
  <div class="account-view">
    <div class="account-info">
      <v-card variant="text" v-intersect="onIntersect">
        <template #prepend>
          <v-avatar :image="user.netEaseCloud.profile.avatarUrl" size="256"></v-avatar>
        </template>
        <template #title>
          <h1>{{ user.netEaseCloud.profile.nickname }}</h1>
        </template>
        <template #subtitle>
          <h2>{{ user.netEaseCloud.profile.signature }}</h2>
        </template>
        <template #actions>
          <v-tabs v-model="tab" color="pink">
            <v-tab value="created-playlists"> 创建的歌单 </v-tab>
            <v-tab value="playlists"> 收藏的歌单 </v-tab>
            <v-tab value="albums"> 收藏的专辑 </v-tab>
            <v-tab value="artists"> 收藏的歌手 </v-tab>
          </v-tabs>
        </template>
      </v-card>
      <v-divider thickness="2px" opacity="100" color="pink"></v-divider>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="created-playlists" class="tab-window">
          <div class="created-playlists" @click="FClickPlaylist">
            <div
              v-for="playlist in user.netEaseCloud.playlists"
              :key="
                playlist.id + '+' + playlist.trackUpdateTime + '+' + playlist.trackNumberUpdateTime
              "
            >
              <PlaylistCard
                v-if="playlist.creator.userId === user.netEaseCloud.profile.userId"
                :playlist="playlist"
              >
                <v-btn variant="text" icon size="x-large" @click="FPlayThisPlaylist(playlist.id)">
                  <v-icon icon="mdi-play" size="x-large"> </v-icon>
                </v-btn>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn variant="text" :ripple="false" icon v-bind="props">
                      <v-icon icon="mdi-dots-vertical" size="x-large"> </v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item>
                      <v-list-item-title>
                        <v-icon :icon="items[0].icon"></v-icon>
                        {{ items[0].title }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="FDeletePlaylist(playlist.id)">
                      <v-list-item-title>
                        <v-icon :icon="items[1].icon"></v-icon>
                        {{ items[1].title }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </PlaylistCard>
            </div>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="playlists" class="tab-window">
          <div class="playlists" @click="FClickPlaylist">
            <div
              v-for="playlist in user.netEaseCloud.playlists"
              :key="
                playlist.id + '+' + playlist.trackUpdateTime + '+' + playlist.trackNumberUpdateTime
              "
            >
              <PlaylistCard
                v-if="playlist.creator.userId !== user.netEaseCloud.profile.userId"
                :playlist="playlist"
              >
                <v-btn variant="text" icon size="x-large" @click="FPlayThisPlaylist(playlist.id)">
                  <v-icon icon="mdi-play" size="x-large"> </v-icon>
                </v-btn>
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn variant="text" :ripple="false" icon v-bind="props">
                      <v-icon icon="mdi-dots-vertical" size="x-large"> </v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item>
                      <v-list-item-title>
                        <v-icon :icon="items[0].icon"></v-icon>
                        {{ items[0].title }}
                      </v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="FDeletePlaylist(playlist.id)">
                      <v-list-item-title>
                        <v-icon :icon="items[1].icon"></v-icon>
                        {{ items[1].title }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </PlaylistCard>
            </div>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="albums" class="tab-window">
          <div class="albums" @click="FClickAlbum">
            <AlbumCard v-for="album in albumSubList" :key="album.id" :album="album"></AlbumCard>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="artists" class="tab-window">
          <div class="artists" @click="FClickArtist">
            <ArtistCard
              v-for="artist in artistSubList"
              :key="artist.id"
              :artist="artist"
            ></ArtistCard>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <v-fab
      transition="fab-transition"
      :active="!fab"
      class="fab"
      icon="mdi-arrow-up"
      size="large"
      absolute
      color="secondary"
      @click="goTo(0, { container: '.user-info', duration: 500 })"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
  import { ref, inject, shallowRef } from 'vue'
  import { useUserStore } from '@renderer/store/userStore'
  import PlaylistCard from '@renderer/components/publicComponents/PlaylistCard.vue'
  import type Player from '@renderer/utils/player'
  import AlbumCard from '@renderer/components/publicComponents/AlbumCard.vue'
  import ArtistCard from '@renderer/components/publicComponents/ArtistCard.vue'
  import { useRouter } from 'vue-router'
  const player = inject('player') as Player
  const router = useRouter()
  const user = useUserStore()
  const fab = ref(true)
  const tab = ref('created-playlists')
  const items = [
    { title: '更新', icon: 'mdi-update' },
    { title: '删除', icon: 'mdi-delete' }
  ]
  const albumSubList = shallowRef([]) as any
  const artistSubList = shallowRef([]) as any
  function onIntersect(isIntersecting) {
    fab.value = isIntersecting
  }
  window.api.netEaseCloud.album_subList().then((res) => {
    albumSubList.value = res.data
  })
  window.api.netEaseCloud.artist_subList().then((res) => {
    artistSubList.value = res.data
  })
  function FPlayThisPlaylist(id) {
    if (player.listID === `playlist-${id}`) return
    window.api.netEaseCloud.playlist_detail({ id, limit: 1000, offset: 0 }).then((res) => {
      const tracks = res.playlist.tracks
      player.loadList(tracks, `playlist-${id}`)
      player.play(tracks[0].id)
    })
  }
  function FDeletePlaylist(id: number) {
    window.api.netEaseCloud.playlist_delete(id).then(() => {
      user.getNetEaseCloudPlaylist()
    })
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
  function goTo(offset = 0, options) {
    const scrollContainer = document.querySelector(options.container) as HTMLElement
    setTimeout(
      () =>
        scrollContainer.scrollTo({
          top: offset,
          behavior: 'smooth'
        }),
      options.duration
    )
  }
</script>

<style lang="scss" scoped>
  h1,
  h2 {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }
  .account-view {
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .account-info {
    width: 100%;
    height: 100%;
    padding: 8%;
    position: absolute;
    overflow: auto;
  }
  .fab {
    right: 5%;
    bottom: 5%;
  }
  .tab-window {
    width: 90%;
    margin: 0 auto;
  }
</style>
