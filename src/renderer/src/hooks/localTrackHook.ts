import { useStateStore } from '@renderer/store/stateStore'
const preTrack = async (playlistID: string, tracks: any[], isNew = false) => {
  //拿到本地全部歌曲歌单
  const localTracks = await window.electron.ipcRenderer.invoke('store-get', playlistID)
  const localTracksIndex = await window.electron.ipcRenderer.invoke(
    'store-get',
    `${playlistID}Index`
  )
  //更新播放列表封面和总数
  const localPlaylists = await window.electron.ipcRenderer.invoke('store-get', 'localPlaylists')
  const playlistInfo = localPlaylists.playlists.find((playlist) => playlist.id === playlistID)
  for (const track of tracks) {
    if (!localTracks.tracks.includes(track.path)) {
      localTracks.tracks.unshift(track.path)
      localTracksIndex.index.unshift({
        path: track.path,
        infoMap: (track.name + track.ar.map((ar: any) => ar.name).join(' ')).toLowerCase()
      })
    }
  }
  //更新总数
  localTracks.info.trackCount = localTracks.tracks.length
  //更新索引
  playlistInfo.cover = tracks[0].path
  playlistInfo.trackCount = localTracks.tracks.length

  await window.electron.ipcRenderer.invoke('store-set', playlistID, localTracks)
  await window.electron.ipcRenderer.invoke('store-set', 'localPlaylists', localPlaylists)
  await window.electron.ipcRenderer.invoke('store-set', `${playlistID}Index`, localTracksIndex)
  //如果是新添加的，更新专辑和歌手的索引
  if (isNew) {
    const albumsMap = {} as object
    const artistMap = {} as object
    for (const track of tracks) {
      //更新专辑索引
      //如果当前map里没有，就尝试读取
      if (!albumsMap[track.al.id]) {
        let albumStore = await window.electron.ipcRenderer.invoke(
          'store-get',
          track.al.id,
          'albums',
          true
        )
        //如果读到了，就追加
        if (albumStore) albumsMap[track.al.id] = albumStore
        //没读到，就创建
        else
          albumsMap[track.al.id] = {
            name: track.al.name,
            id: track.al.id,
            picUrl: track.path,
            tracks: [],
            artists: []
          }
      }
      //追加这首歌
      albumsMap[track.al.id].tracks.push(track)

      //对于这首歌的每个艺术家，查找这个艺术家是不是已经存在了
      for (const artist of track.ar) {
        const hasThisArtist = albumsMap[track.al.id].artists.findIndex(
          (ar: any) => ar.id === artist.id
        )
        //如果不存在，就添加
        if (hasThisArtist === -1) albumsMap[track.al.id].artists.push(artist)
      }
      //构建歌手索引
      //对于专辑的每个歌手
      for (const artist of track.ar) {
        //如果不存在，尝试读取
        if (!artistMap[artist.id]) {
          let artistStore = await window.electron.ipcRenderer.invoke(
            'store-get',
            artist.id,
            'artists',
            true
          )
          //读到了，就添加
          if (artistStore) artistMap[artist.id] = artistStore
          //没读到，就创建
          else
            artistMap[artist.id] = {
              name: artist.name,
              id: artist.id,
              picUrl: track.path,
              tracks: [],
              albums: []
            }
        }
        //添加歌曲信息
        artistMap[artist.id].tracks.push(track)
        //查找专辑对于这个歌手是不是已经存在了
        const hasThisAlbum = artistMap[artist.id].albums.findIndex(
          (album: any) => album.id === track.al.id
        )
        //如果不存在，就添加
        if (hasThisAlbum === -1) artistMap[artist.id].albums.push(track.al)
      }
    }
    //存储数据
    for (const artistInfo of Object.values(artistMap)) {
      await window.electron.ipcRenderer.invoke(
        'store-set',
        artistInfo.id,
        artistInfo,
        'artists',
        true
      )
    }
    for (const albumInfo of Object.values(albumsMap)) {
      await window.electron.ipcRenderer.invoke('store-set', albumInfo.id, albumInfo, 'albums', true)
    }
  }
}
const downloadTrack = async (tracks: any[], baseDir: string) => {
  const stateStore = useStateStore()
  const downloadBuffer = stateStore.downloadBuffer
  const firstTrack = tracks[0]
  //添加到缓冲区
  downloadBuffer.unshift(...tracks)
  let info = ''
  if (tracks.length === 1) {
    info = firstTrack.name
  } else {
    info = firstTrack.name + `等${tracks.length}首歌曲`
  }
  stateStore.tip = '开始下载：' + info
  //先下载并储存歌曲
  const options = {
    ids: tracks.map((item: any) => item.id),
    level: JSON.parse(localStorage.getItem('settings') as string).downloadQuality || 'lossless'
  }
  const res = await window.api.netEaseCloud.song_url(options)
  //一首一首下载
  const fileNames = [] as string[]
  for (const track of tracks) {
    //如果取消下载，立即退出
    if (stateStore.cancelDownload) break
    //如果是取消下载的歌曲，就跳过
    if (stateStore.cancelList.includes(track.id)) continue
    //下载完成拿到文件名
    const urlData = res.data.find((item: any) => item.id === track.id)
    const fileName = await window.electron.ipcRenderer.invoke(
      'download-music',
      track,
      urlData.url,
      baseDir,
      urlData.type
    )
    fileNames.push(fileName)
    //从本地读取这首歌
    const localTrack = (
      await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [fileName])
    )[0]
    localTrack.al.picUrl = URL.createObjectURL(new Blob(localTrack.al.picUrl))
    //替换缓冲区内的歌曲信息
    const index = downloadBuffer.findIndex((item: any) => item.id === track.id)
    downloadBuffer.splice(index, 1, localTrack)
  }
  //然后更新播放列表
  const trackInfos = await window.electron.ipcRenderer.invoke(
    'read-music-data',
    baseDir,
    fileNames,
    false
  )
  //添加进本地全部歌曲里
  await preTrack('localTracks', trackInfos, true)
  stateStore.tip = '下载完成：' + info
}
const newPlaylist = async (name: string, description: string, playlistID?: string) => {
  const playlistInfo = {
    id: playlistID ? playlistID : new Date().getTime().toString(),
    name,
    trackCount: 0,
    description: description,
    cover: ''
  }
  const playlistData = {
    info: playlistInfo,
    tracks: []
  }
  //添加歌单索引信息
  const totalPlaylists = await window.electron.ipcRenderer.invoke('store-get', 'localPlaylists')
  totalPlaylists.playlists.push(playlistInfo)
  await window.electron.ipcRenderer.invoke('store-set', 'localPlaylists', totalPlaylists)
  //添加歌单数据信息
  await window.electron.ipcRenderer.invoke('store-set', playlistInfo.id, playlistData)
  //添加歌单索引信息
  await window.electron.ipcRenderer.invoke('store-set', playlistInfo.id + 'Index', { index: [] })
}
const checkHeart = async (tracks: any[]) => {
  const heartIndex = await window.electron.ipcRenderer.invoke('store-get', 'heartIndex')
  const heartMap = {}
  for (const trackIndex of heartIndex.index) {
    heartMap[trackIndex.path] = true
  }
  return { ids: tracks.filter((track) => heartMap[track.path]).map((track) => track.id) }
}
const removeTrack = async (playlistID: string, trackPath: string) => {
  const playlistData = await window.electron.ipcRenderer.invoke('store-get', playlistID)
  const trackIndex = playlistData.tracks.findIndex((track) => track === trackPath)

  playlistData.tracks.splice(trackIndex, 1)
  playlistData.info.trackCount = playlistData.tracks.length

  const localPlaylists = await window.electron.ipcRenderer.invoke('store-get', 'localPlaylists')
  const playlistInfo = localPlaylists.playlists.find((playlist) => playlist.id === playlistID)
  playlistInfo.trackCount = playlistData.tracks.length
  playlistInfo.cover = playlistData.tracks[0]

  const playlistIndex = await window.electron.ipcRenderer.invoke('store-get', playlistID + 'Index')
  const playlistTrackIndex = playlistIndex.index.findIndex((track) => track.path === trackPath)
  playlistIndex.index.splice(playlistTrackIndex, 1)
  window.electron.ipcRenderer.invoke('store-set', playlistID + 'Index', playlistIndex)
  window.electron.ipcRenderer.invoke('store-set', playlistID, playlistData)
  window.electron.ipcRenderer.invoke('store-set', 'localPlaylists', localPlaylists)
}
const heartTrack = async (track: any, state: boolean) => {
  if (state) {
    preTrack('heart', [track])
  } else {
    removeTrack('heart', track.path)
  }
}
const init = async (baseDir: string) => {
  //初始化歌单

  const id = 'localTracks'
  await window.electron.ipcRenderer.invoke('store-del', '*', 'albums')
  await window.electron.ipcRenderer.invoke('store-del', '*', 'artists')
  await window.electron.ipcRenderer.invoke('store-del', '*', 'playlists')
  const musicDir = await window.electron.ipcRenderer.invoke('read-music-dir', baseDir)
  let playlistInfo = {} as any
  let playlistData = {} as any
  let tracksIndex = [] as Array<any>
  const albumsMap = {} as object
  const artistMap = {} as object
  if (musicDir.length === 0) {
    //如果没有歌曲数据，只创建两个列表
    playlistInfo = {
      id: id,
      name: '全部歌曲',
      trackCount: 0,
      description: '本地全部歌曲',
      cover: ''
    }
    playlistData = {
      info: playlistInfo,
      tracks: []
    }
    tracksIndex = []
  } else {
    //存储数据
    playlistInfo = {
      id: id,
      name: '全部歌曲',
      trackCount: musicDir.length,
      description: '本地全部歌曲',
      cover: musicDir[0]
    }
    playlistData = {
      info: playlistInfo,
      tracks: musicDir
    }
    //对于每一首歌
    for (const trackDir of musicDir) {
      //读取这个歌曲
      const track = (
        await window.electron.ipcRenderer.invoke('read-music-data', baseDir, [trackDir], false)
      )[0]
      //构建搜索索引
      tracksIndex.push({
        path: track.path,
        infoMap: (track.name + track.ar.map((ar: any) => ar.name).join(' ')).toLowerCase()
      })
      //建立专辑索引
      //如果不存在这个专辑索引，先创建
      if (!albumsMap[track.al.id]) {
        albumsMap[track.al.id] = {
          name: track.al.name,
          id: track.al.id,
          picUrl: track.path,
          tracks: [],
          artists: []
        }
      }
      albumsMap[track.al.id].tracks.push(track)
      //对于这首歌的每个艺术家，查找这个艺术家是不是已经存在了
      for (const artist of track.ar) {
        const hasThisArtist = albumsMap[track.al.id].artists.findIndex(
          (ar: any) => ar.id === artist.id
        )
        //如果不存在，就添加
        if (hasThisArtist === -1) albumsMap[track.al.id].artists.push(artist)
      }
      //构建歌手索引
      //对于专辑的每个歌手
      for (const artist of track.ar) {
        //如果不存在，初始化
        if (!artistMap[artist.id]) {
          artistMap[artist.id] = {
            name: artist.name,
            id: artist.id,
            picUrl: track.path,
            tracks: [],
            albums: []
          }
        }
        //添加歌曲信息
        artistMap[artist.id].tracks.push(track)

        //查找专辑对于这个歌手是不是已经存在了
        const hasThisAlbum = artistMap[artist.id].albums.findIndex(
          (album: any) => album.id === track.al.id
        )
        //如果不存在，就添加
        if (hasThisAlbum === -1) artistMap[artist.id].albums.push(track.al)
      }
    }
  }

  await window.electron.ipcRenderer.invoke('store-set', 'localPlaylists', {
    playlists: [playlistInfo]
  })
  await window.electron.ipcRenderer.invoke('store-set', 'recentPlay', [])
  await window.electron.ipcRenderer.invoke('store-set', id, playlistData)
  await window.electron.ipcRenderer.invoke('store-set', 'localTracksIndex.index', tracksIndex)
  for (const artistInfo of Object.values(artistMap)) {
    await window.electron.ipcRenderer.invoke(
      'store-set',
      artistInfo.id,
      artistInfo,
      'artists',
      true
    )
  }
  for (const albumInfo of Object.values(albumsMap)) {
    await window.electron.ipcRenderer.invoke('store-set', albumInfo.id, albumInfo, 'albums')
  }
  await newPlaylist('我喜欢的音乐', '我喜欢的音乐', 'heart')
}
export { preTrack, downloadTrack, init, newPlaylist, checkHeart, removeTrack, heartTrack }
