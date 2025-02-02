const netEaseCloud = {
  baseUrl: '/wyyAPI',

  async request(url: string, data: object): Promise<any> {
    const options: RequestInit = {
      credentials: 'include',
      body: JSON.stringify(data),
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    return await (await fetch(url, options)).json()
  },
  async login_qr_key(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/login/qr/key', {})
  },
  async login_qr_create(unikey: string): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/login/qr/create', { unikey })
  },
  async login_qr_check(key: string): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/login/qr/check', { key })
  },
  async playlist_detail(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/playlist/detail', options)
  },
  async playlist_create(name: string, isPrivate: boolean): Promise<any> {
    const options = {
      name,
      privacy: isPrivate ? 10 : 0 //0 为普通歌单，10 为隐私歌单
    }
    return await this.request(this.baseUrl + '/netEaseCloud/playlist/create', options)
  },
  //op:del or add
  async playlist_track(op: string, pid: number | string, tracks: number | string[]): Promise<any> {
    const options = {
      op,
      pid,
      tracks
    }
    return await this.request(this.baseUrl + '/netEaseCloud/playlist/tracks', options)
  },
  async playlist_delete(id: number): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/playlist/delete', { id })
  },
  async song_url(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/song/url', options)
  },
  async song_order_update(pid: number, ids: number[]): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/song/order/update', { pid, ids })
  },
  async song_lyric(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/lyric', options)
  },
  async song_like_check(ids: number[] | string[]): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/song/likeCheck', { ids })
  },
  async song_like(id: number | string, like: boolean): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/song/like', { id, like })
  },
  async song_detail(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/song/detail', options)
  },
  async song_comments(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/song/comments', options)
  },
  async artist_detail(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/artist', options)
  },
  async artist_albums(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/artist/albums', options)
  },
  async artist_songs(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/artist/songs', options)
  },
  async artist_subList(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/artist/sublist', {})
  },
  async artist_sub(id: number, type: 'sub' | 'unsub'): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/artist/sub', { id, type })
  },
  async album_detail(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/album/detail', options)
  },
  async album_subList(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/album/sublist', {})
  },
  async album_sub(id: number, type: 'sub' | 'unsub'): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/album/sub', { id, type })
  },
  async recommend_songs(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/recommend/songs', {})
  },
  async recommend_playlist(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/recommend/playlists', {})
  },
  async user_account(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/user/account', {})
  },
  async user_playlist(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/user/playlist', options)
  },
  async logout(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/logout', {})
  },
  async search_suggest(keywords: string): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/search/suggest', { keywords })
  },
  async search(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/search', options)
  },
  async fm(): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/fm', {})
  },
  async comments(options: object): Promise<any> {
    return await this.request(this.baseUrl + '/netEaseCloud/comments', options)
  }
}
export const api = {
  netEaseCloud
}
