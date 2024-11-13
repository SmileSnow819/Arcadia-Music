<template>
  <v-dialog v-model="dialog" width="30%" max-height="80%" @after-leave="FClose">
    <v-sheet rounded="lg" class="dialog">
      <div class="options">
        <v-text-field
          label="关键词"
          prepend-icon="mdi-magnify"
          v-model="keyWord"
          density="compact"
          variant="solo"
          hide-details
          :disabled="isInit"
          @keydown.enter="FSearch"
        ></v-text-field>
        <v-btn v-if="!isInit" icon @click="FSearch">
          <v-icon icon="mdi-check" size="x-large"></v-icon>
        </v-btn>
        <v-progress-circular
          v-else
          size="large"
          color="secondary"
          indeterminate
        ></v-progress-circular>
        <v-btn icon @click="dialog = false">
          <v-icon icon="mdi-close" size="x-large"></v-icon>
        </v-btn>
      </div>
      <v-divider thickness="2px" opacity="100" class="divider" color="primary"></v-divider>
      <v-virtual-scroll
        :items="searchResult"
        class="infinite-scroll-container"
        @click="FClickTrack"
      >
        <template #default="{ item, index }">
          <SongCard
            :song="item"
            :key="searchResult[index].id"
            :img-size="64"
            :show-time="false"
            :show-album="false"
          >
            <v-btn variant="text" icon @click="FCollectTrack(item)">
              <v-icon icon="mdi-plus" size="x-large"> </v-icon>
            </v-btn>
          </SongCard>
        </template>
      </v-virtual-scroll>
      <div v-if="!findResult" class="no-result">什么也没有找到，空空如也</div>
    </v-sheet>
    <CollectDialogs
      v-if="collect"
      :track="collectTrack"
      :local="collectTrack.local || false"
      @close-dialog="collect = false"
    ></CollectDialogs>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, shallowReactive, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import type Player from '@renderer/utils/player'
  import type { Setting } from '@renderer/utils/setting'
  const player = inject('player') as Player
  const globalSetting = inject('setting') as Setting
  const router = useRouter()
  const emit = defineEmits(['close-dialog'])
  const dialog = ref(true)
  const keyWord = ref('')
  const collect = ref(false)
  let collectTrack = {} as any
  const findResult = ref(true)
  const props = defineProps({
    id: {
      type: String
    },
    local: {
      type: Boolean,
      default: false
    }
  })
  const isInit = ref(true)
  const baseURL = globalSetting.settings.tracksDir
  let tracks = [] as any[]
  if (props.local) {
    window.electron.ipcRenderer.invoke('store-get', props.id + 'Index').then(async (res: any) => {
      tracks = res.index
      isInit.value = false
    })
  } else {
    window.api.netEaseCloud
      .playlist_detail({ id: props.id, limit: 1000, offset: 0 })
      .then((res) => {
        tracks = res.playlist.tracks
        tracks.forEach((track: any) => {
          track.infoMap = (track.name + track.ar.map((ar: any) => ar.name).join('')).toLowerCase()
        })
        isInit.value = false
      })
  }
  const searchResult = shallowReactive([]) as Array<any>
  function FClose() {
    emit('close-dialog')
  }
  async function FSearch() {
    if (keyWord.value === '') return
    //清除上次的结果
    searchResult.splice(0, searchResult.length)
    //在infoMap中搜索
    keyWord.value = keyWord.value.toLowerCase()
    let result = tracks.filter((track: any) => track.infoMap.includes(keyWord.value))
    if (props.local) {
      const paths = result.map((track: any) => track.path)
      result = await window.electron.ipcRenderer.invoke('read-music-data', baseURL, paths)
      result.forEach((track: any) => {
        track.al.picUrl = URL.createObjectURL(new Blob(track.al.picUrl))
      })
    }
    searchResult.push(...result)
    if (searchResult.length === 0) findResult.value = false
    else findResult.value = true
  }
  function FCollectTrack(track: any) {
    collect.value = true
    collectTrack = track
  }
  function FGetAllElement(target: HTMLElement) {
    let currentTarget = target
    const scrollContainer = document.querySelector('.track')
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
  //歌曲的单击事件
  function FClickTrack(event) {
    if (event.target.hasAttribute('artist-id')) {
      if (props.local) {
        router.push({ name: 'localArtist', params: { id: event.target.getAttribute('artist-id') } })
      } else {
        router.push({ name: 'artist', params: { id: event.target.getAttribute('artist-id') } })
      }
    } else if (event.target.hasAttribute('album-id')) {
      if (props.local) {
        router.push({ name: 'localAlbum', params: { id: event.target.getAttribute('album-id') } })
      } else {
        router.push({ name: 'album', params: { id: event.target.getAttribute('album-id') } })
      }
    } else if (event.target.hasAttribute('img-id')) {
      const trackID = event.target.getAttribute('img-id') as string
      player.prependTrack(searchResult.find((item) => item.id == trackID))
      // //播放这首歌
      player.play(trackID)
    } else {
      let trackID = FHasAtt(event.target, 'track-id')
      if (trackID) {
        // //把这首歌添加到播放列表第一项
        player.prependTrack(searchResult.find((item) => item.id == trackID))
        // //播放这首歌
        player.play(trackID)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .dialog {
    padding: 5% 5% 0% 5%;
    display: flex;
    flex-direction: column;
  }
  ::-webkit-scrollbar {
    width: 5px;
  }
  .close-btn {
    align-self: end;
  }
  .divider {
    margin: 5px 0px;
  }
  .options {
    display: flex;
    gap: 5px;
  }
  .playlist-info {
    margin: 5px 0px;
  }
  .no-result {
    margin: 0 auto;
    color: rgb(var(--v-theme-error));
  }
</style>
