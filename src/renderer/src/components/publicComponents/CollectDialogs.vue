<template>
  <v-dialog v-model="dialog" width="40%" max-height="50%" persistent @after-leave="FClose">
    <v-sheet rounded="lg" class="dialog">
      <div class="options">
        <SongCard :song="track" :img-size="64" :show-time="false" :show-album="false"></SongCard>
        <div class="divider"></div>
        <v-tooltip location="bottom" text="创建歌单">
          <template v-slot:activator="{ props }">
            <v-btn icon @click="FAddNewPlaylist" v-bind="props">
              <v-icon icon="mdi-plus" size="x-large"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip location="bottom" text="关闭">
          <template v-slot:activator="{ props }">
            <v-btn icon @click="dialog = false" v-bind="props">
              <v-icon icon="mdi-close" size="x-large"></v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      <v-divider thickness="2px" opacity="100" class="divider" color="primary">{{
        local ? '本地歌曲，想收藏到哪儿？' : '想收藏到哪儿？'
      }}</v-divider>
      <div v-if="!local">
        <div
          v-for="playlist in userStore.netEaseCloud.playlists"
          :key="playlist.id"
          class="playlist"
        >
          <PlaylistCard
            v-if="playlist.creator.userId === userStore.netEaseCloud.profile.userId"
            :playlist="playlist"
            :img-size="64"
          >
            <v-btn variant="text" icon @click="FCollectTrack(playlist.id)">
              <v-icon icon="mdi-star-plus-outline" size="x-large"></v-icon>
            </v-btn>
          </PlaylistCard>
        </div>
      </div>

      <div v-else>
        <div v-for="playlist in localPlaylists" :key="playlist.id" class="playlist">
          <PlaylistCard v-if="playlist.id !== 'localTracks'" :playlist="playlist" :img-size="64">
            <v-btn variant="text" icon @click="FCollectTrack(playlist.id)">
              <v-icon icon="mdi-star-plus-outline" size="x-large"></v-icon>
            </v-btn>
          </PlaylistCard>
        </div>
      </div>
    </v-sheet>
    <NewPlaylistDialogs
      v-if="addNewPlaylist"
      @close-dialog="addNewPlaylist = false"
      :local="local"
    />
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, defineProps, defineEmits, inject, shallowReactive, type ShallowReactive } from 'vue'
  import { useUserStore } from '@renderer/store/userStore'
  import PlaylistCard from './PlaylistCard.vue'
  import SongCard from './SongCard.vue'
  import defaultImg from '@renderer/public/test.png'
  import type { Setting } from '@renderer/utils/setting'
  import { preTrack } from '@renderer/hooks/localTrackHook'
  const globalSetting = inject('setting') as Setting
  const baseURL = globalSetting.settings.tracksDir
  const localPlaylists = shallowReactive([]) as ShallowReactive<Array<any>>
  const props = defineProps({
    track: {
      type: Object,
      required: true
    },
    local: {
      type: Boolean,
      default: false
    }
  })

  const local = props.local
  const track = props.track
  const emit = defineEmits(['close-dialog'])
  const userStore = useUserStore()
  const dialog = ref(true)
  const addNewPlaylist = ref(false)
  let localPlaylistsList = {} as any
  async function FGetLocalList() {
    localPlaylistsList = await window.electron.ipcRenderer.invoke('store-get', 'localPlaylists')
    //对于每个id,获取数据
    for (const playlistInfo of localPlaylistsList.playlists) {
      if (playlistInfo.cover) {
        const firstTrack = (
          await window.electron.ipcRenderer.invoke('read-music-data', baseURL, [playlistInfo.cover])
        )[0]
        playlistInfo.coverImgUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
      } else {
        playlistInfo.coverImgUrl = defaultImg
      }
      localPlaylists.push(playlistInfo)
    }
  }
  if (local) {
    FGetLocalList()
  }

  // window.api.netEaseCloud.tra
  function FClose() {
    emit('close-dialog')
  }
  function FAddNewPlaylist() {
    addNewPlaylist.value = true
  }

  async function FCollectTrack(id: number | string) {
    if (local) {
      preTrack(id as string, [track])
    } else {
      window.api.netEaseCloud.playlist_track('add', id, [track.id]).then(() => {
        setTimeout(() => {
          userStore.getNetEaseCloudPlaylist()
        }, 1000)
      })
    }

    dialog.value = false
  }
</script>

<style lang="scss" scoped>
  .dialog {
    padding: 2%;
    display: flex;
    flex-direction: column;
  }
  ::-webkit-scrollbar {
    width: 5px;
  }
  .close-btn {
    align-self: end;
  }
  .playlist {
    width: 100%;
  }
  .divider {
    width: 10%;
  }
  .options {
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
  }
</style>
