import { defineStore } from 'pinia'
import { type ShallowReactive, shallowReactive } from 'vue'
export const useStateStore = defineStore('state', {
  state: () => ({
    isHeart: false,
    scrollTopMap: {},
    maximize: false,
    tip: '',
    buffer: 0,
    openLyric: false,
    lockLyric: false,
    cancelDownload: false,
    cancelList: [] as number[],
    downloadBuffer: shallowReactive([]) as ShallowReactive<Array<any>>,
    trackMainColor: { color: 'white' },
    background: {
      background: 'rgb(var(--v-theme-surface))'
    },
    backgroundImage: {
      backgroundImage: '',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  })
})
