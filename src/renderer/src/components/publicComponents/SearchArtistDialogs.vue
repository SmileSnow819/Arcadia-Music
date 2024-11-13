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
        @click="FClickArtist"
      >
        <template #default="{ item, index }">
          <ArtistCard :key="index" :artist="item" :img-size="64"></ArtistCard>
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
  import { ref, defineEmits, shallowReactive, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import type { Setting } from '@renderer/utils/setting'
  import ArtistCard from './ArtistCard.vue'
  const globalSetting = inject('setting') as Setting
  const router = useRouter()
  const emit = defineEmits(['close-dialog'])
  const dialog = ref(true)
  const keyWord = ref('')
  const collect = ref(false)
  let collectTrack = {} as any
  const findResult = ref(true)
  const isInit = ref(true)
  const baseDir = globalSetting.settings.tracksDir
  let totalArtists = [] as Array<any>
  let ArtistsPath = [] as Array<any>
  async function FGetAllArtist(): Promise<void> {
    if (ArtistsPath.length === 0) return
    for (let i = 0; i < ArtistsPath.length; i++) {
      const path = ArtistsPath[i]
      const artist = await window.electron.ipcRenderer.invoke('store-get', path, 'artists', true)
      const firstTrack = (
        await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [artist.picUrl])
      )[0]
      artist.picUrl = URL.createObjectURL(new Blob(firstTrack.al.picUrl))
      totalArtists[i] = artist
    }
    isInit.value = false
  }
  async function init() {
    if (baseDir) {
      ArtistsPath = await window.electron.ipcRenderer.invoke('read-json-dir', 'artists')
      totalArtists = new Array(ArtistsPath.length).fill({})
      FGetAllArtist()
    }
  }
  init()
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
    let result = totalArtists.filter((artist: any) =>
      artist.name.toLowerCase().includes(keyWord.value)
    )
    searchResult.push(...result)
    if (searchResult.length === 0) findResult.value = false
    else findResult.value = true
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
  //单击事件
  function FClickArtist(event) {
    const artistID = FHasAtt(event.target, 'artist-id')
    if (artistID) {
      router.push({ name: 'localArtist', params: { id: artistID } })
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
