import { defineStore } from 'pinia'
interface IProfile {
  userId: number
  nickname: string
  avatarUrl: string
  signature: string
}
interface IPlaylist {
  id: number
  userId: number
  name: string
  coverImgUrl: string
  trackCount: number
  trackNumberUpdateTime: number
  trackUpdateTime: number
  privacy: number
  description: string
  creator: {
    avatarUrl: string
    nickname: string
    signature: string
    userId: number
    backgroundUrl: string
  }
}
interface IAlbum {
  id: number
  songs: []
  artist: {
    id: number
    name: string
  }
  picUrl: string
}
interface IArtist {
  id: number
  name: string
  trans: string
  briefDesc: string
  picUrl: string
  alias: string[]
}
export const useUserStore = defineStore('user', {
  state: () => ({
    netEaseCloud: {
      login: document.cookie.includes('__csrf'),
      account: {},
      profile: {} as IProfile,
      playlists: [] as IPlaylist[],
      collectedAlbums: [] as IAlbum[],
      collectedArtists: [] as IArtist[]
    },
    bilibili: {
      login: false
    }
  }),
  actions: {
    async getNetEaseCloudAccount() {
      if (document.cookie.includes('__csrf')) {
        const res = await window.api.netEaseCloud.user_account()
        this.netEaseCloud.login = true
        this.netEaseCloud.account = res.account
        this.netEaseCloud.profile = res.profile as IProfile
        this.getNetEaseCloudPlaylist()
        this.getNetEaseCloudSubList()
      }
    },
    async getNetEaseCloudPlaylist() {
      const playlist = await window.api.netEaseCloud.user_playlist({
        uid: this.netEaseCloud.profile.userId,
        limit: 100,
        offset: 0
      })
      this.netEaseCloud.playlists = playlist.playlist as IPlaylist[]
    },
    async getNetEaseCloudSubList() {
      const [albumSubList, artistSubList] = await Promise.all([
        window.api.netEaseCloud.album_subList(),
        window.api.netEaseCloud.artist_subList()
      ])
      this.netEaseCloud.collectedAlbums = albumSubList.data
      this.netEaseCloud.collectedArtists = artistSubList.data
    }
  }
})
export type { IPlaylist }
