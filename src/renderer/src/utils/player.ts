import { Song } from './song'
import { shallowReactive, ref, type ShallowReactive, type Ref } from 'vue'

enum PlayerMode {
  Normal,
  Loop,
  Shuffle,
  Fm,
  Heart
}
class Player {
  public volume: number
  public playMode: PlayerMode
  //private _state: PlayerState
  private _audioContext: AudioContext
  private _gainNode: GainNode
  //   private _songBufferSource: AudioBufferSourceNode
  private _audioElement: HTMLAudioElement
  private _mediaElementSource: MediaElementAudioSourceNode
  public duration: number
  private _song: Song
  private _mediaAnalyser: AnalyserNode
  private playlistCopy: Array<any>
  public playlist: ShallowReactive<Array<any>>
  public currentIndex: Ref<number>
  private _analyserBuffer: Uint8Array
  public currentTrack: any
  public listID: string
  copyListID: string
  fmBuffer: any[]
  // private _animeID: NodeJS.Timeout | undefined
  constructor() {
    this.volume = 100
    this.playMode = PlayerMode.Normal
    this._song = new Song()
    this._audioElement = this._song.audio
    this._audioContext = new AudioContext()

    this._gainNode = this._audioContext.createGain()
    this._gainNode.gain.value = this.volume / 100
    this._mediaElementSource = this._audioContext.createMediaElementSource(this._audioElement)
    this._mediaAnalyser = this._audioContext.createAnalyser()
    this._mediaElementSource.connect(this._gainNode)
    this._gainNode.connect(this._mediaAnalyser)
    this._mediaAnalyser.connect(this._audioContext.destination)
    this._mediaAnalyser.fftSize = 2048
    this._mediaAnalyser.maxDecibels = 20
    this._mediaAnalyser.minDecibels = -100
    // this._mediaAnalyser.smoothingTimeConstant = 0.85
    this._analyserBuffer = new Uint8Array(128)

    this.listID = ''
    this.copyListID = ''
    this.duration = 0
    this.currentIndex = ref(-1)
    this.playlist = shallowReactive([])
    this.currentTrack = ref({})
    this.playlistCopy = []
    this.fmBuffer = []
    // 播放结束选择播放模式
    this._audioElement.addEventListener('ended', () => {
      if (this._audioElement.currentTime > this.duration - 1) {
        //单曲循环模式重复播放
        if (this.playMode === PlayerMode.Loop) {
          this._audioElement.currentTime = 0
          this._audioElement.play()
          //私人fm模式
        } else if (this.playMode === PlayerMode.Fm) {
          this.getFmTrack()
        } else {
          //否则按照列表循环
          this.nextPlay()
        }
      } else {
        alert('VIP歌曲，登陆VIP帐号后继续播放')
      }
    })
    window.electron.ipcRenderer.on('play', (_event: any) => {
      const state = this.getPlayState()
      this.pause(state)
    })
    window.electron.ipcRenderer.on('next-song', (_event: any) => {
      if (this.playMode === PlayerMode.Fm && this.currentIndex.value == (this.playlist.length-1)) {
        this.getFmTrack()
      } else {
        this.nextPlay()
      }
    })
    window.electron.ipcRenderer.on('pre-song', (_event: any) => {
      this.prePlay()
    })
    window.electron.ipcRenderer.on('lyric-window-play-state', (_event: any, state: boolean) => {
      this.pause(!state)
    })
    this._audioElement.addEventListener('play', () => {
      window.electron.ipcRenderer.send('play-state', true)
    })
    this._audioElement.addEventListener('pause', () => {
      window.electron.ipcRenderer.send('play-state', false)
    })
  }
  public prePlay(): void {
    if (!this.currentTrack.value.id) return
    const index = this.currentIndex.value
    const preIndex = (index - 1 + this.playlist.length) % this.playlist.length
    this.play(this.playlist[preIndex].id)
  }
  public nextPlay(): void {
    if (!this.currentTrack.value.id) return
    this.currentIndex.value = (this.currentIndex.value + 1) % this.playlist.length
    this.play(this.playlist[this.currentIndex.value].id)
  }
  public async getBuffer() {
    const res = await window.api.netEaseCloud.fm()
    res.data.forEach((item: any) => {
      item.al = item.album
      item.ar = item.artists
    })
    this.fmBuffer = res.data
  }
  public async getFmTrack() {
    //如果没有缓存,先获取
    if (this.fmBuffer.length === 0) {
      await this.getBuffer()
    }
    const nextTrack = this.fmBuffer.splice(0, 1)[0]
    this.appendTrack(nextTrack)
    this.play(nextTrack.id)
  }
  public onFrequency(callback: (frequency: Uint8Array) => void, time = 50) {
    return setInterval(() => {
      this._mediaAnalyser.getByteFrequencyData(this._analyserBuffer)
      callback(this._analyserBuffer)
    }, time)
  }

  public pause(state: boolean | number): void {
    state ? this._audioElement.pause() : this._audioElement.play()
  }
  public loadList(tracks: any, id: string): boolean {
    if (this.listID === id) return false
    else {
      this.clearPlayList()
      this.listID = id
    }

    this.playlist.push(...tracks)
    this.currentIndex.value = -1
    this.currentTrack.value = {}
    return true
  }
  public removeTrack(id: string | number): void {
    const index = this.playlist.findIndex((item) => item.id == id)
    this.playlist.splice(index, 1)
    //如果删除的是当前播放的歌曲，那么清空播放状态
    if (this.currentIndex.value === index) {
      this._audioElement.load()
      this.currentIndex.value = -1
      this.currentTrack.value = {}
    }
    //如果删除的是上方的歌曲，当前索引-1
    if (this.currentIndex.value > index) {
      this.currentIndex.value--
    }
  }
  public prependTrack(track: any): void {
    const id = track.id
    //查找播放列表是否有这首歌
    const findTrack = this.playlist.find((item) => item.id == id)
    if (!findTrack) {
      //如果没有，添加到队列最前端,否则什么也不做
      this.playlist.unshift(track)
    }
  }
  public appendTrack(track: any): void {
    const id = track.id
    //查找播放列表是否有这首歌
    const findTrack = this.playlist.find((item) => item.id == id)
    if (!findTrack) {
      //如果没有，添加到队列最后端,否则什么也不做
      this.playlist.push(track)
    }
  }
  public play(id: string | number) {
    //查找当前歌曲的在当前播放列表中的索引
    if (this.playlist.length === 0) return

    this.currentIndex.value = this.playlist.findIndex((item) => item.id == id)
    //找不到这首歌，直接返回
    if (this.currentIndex.value === -1) return
    if (id === this.currentTrack.value.id) this._audioElement.currentTime = 0
    //加载歌曲
    this.currentTrack.value = this.playlist[this.currentIndex.value]
    const track = this.playlist[this.currentIndex.value]
    this.duration = track.dt / 1000 || track.duration / 1000
    this._song.loadSong(track)
  }
  public recoverPlayList(): void {
    this.playlist.splice(0, this.playlist.length, ...this.playlistCopy)
  }
  public backupPlayList(): void {
    this.playlistCopy = [...this.playlist]
    this.copyListID = this.listID
  }
  public modelChange(model: PlayerMode): void {
    function shuffle(list: Array<any>): void {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
      }
    }
    //如果要更改为fm模式
    if (model === PlayerMode.Fm) {
      // //备份现在的播放列表
      // this.backupPlayList()
      //先清空播放列表
      this.clearPlayList()
      this.getFmTrack()
    }
    if (this.playlist.length === 0) {
      this.playMode = model
      return
    }
    //如果之前是随即播放，恢复原来的播放列表
    if (this.playMode === PlayerMode.Shuffle) {
      //拿到当前播放歌曲的 id
      const id = this.currentTrack.value.id
      //恢复原来的播放列表
      this.recoverPlayList()
      this.currentIndex.value = this.playlist.findIndex((item) => item.id == id)
    }
    //如果要变为随即播放,
    if (model === PlayerMode.Shuffle) {
      //备份现在的播放列表
      this.backupPlayList()
      //拿到当前歌曲的id
      const id = this.currentTrack.value.id
      //随即置乱
      shuffle(this.playlist)
      //更正当前播放的位置索引
      this.currentIndex.value = this.playlist.findIndex((item) => item.id === id)
    }

    this.playMode = model
  }
  public clearPlayList(): void {
    this.playMode = PlayerMode.Normal
    this._audioElement.src = ''
    this._audioElement.load()
    this.playlist.splice(0, this.playlist.length)
    this.currentIndex.value = -1
    this.currentTrack.value = {}
    this.listID = ''
  }
  public onProgressUpdate(callback: (progress: number) => void) {
    const f = () => {
      callback((this._audioElement.currentTime / this.duration) * 100)
    }
    this._audioElement.addEventListener('timeupdate', f)
    return f
  }
  public onTimeUpdate(callback: (currentTime: number) => void) {
    const f = () => {
      callback(this._audioElement.currentTime)
    }
    this._audioElement.addEventListener('timeupdate', f)
    return f
  }
  public onBufferUpdate(callback: (progress: number) => void) {
    const f = () => {
      callback((this._audioElement.buffered.end(0) / this.duration) * 100)
    }
    this._audioElement.addEventListener('progress', f)
    return f
  }
  public removeOnPlay(ids: any[]): void {
    this._audioElement.removeEventListener('play', ids[0])
    this._audioElement.removeEventListener('pause', ids[1])
  }
  public onPlay(callback: (isPlaying: boolean) => void): [() => void, () => void] {
    const play = () => callback(true)
    const pause = () => callback(false)
    this._audioElement.addEventListener('play', play)
    this._audioElement.addEventListener('pause', pause)
    return [play, pause]
  }
  public removeProgressUpdate(f: () => void): void {
    this._audioElement.removeEventListener('timeupdate', f)
  }

  public removeTimeUpdate(f: () => void): void {
    this._audioElement.removeEventListener('timeupdate', f)
  }

  public removeBufferUpdate(f: () => void): void {
    this._audioElement.removeEventListener('progress', f)
  }
  public setProgress(progress: number): void {
    this._audioElement.currentTime = (progress / 100) * this.duration
  }
  public getCurrentTime(): number {
    return this._audioElement.currentTime
  }
  public getPlayState(): number {
    return this._audioElement.paused ? 0 : 1
  }
  public setCurrentTime(time: number): void {
    this._audioElement.currentTime = time
  }
  public setVolume(volume: number): void {
    this.volume = volume
    //设置音量
    this._gainNode.gain.setValueAtTime(this.volume / 100, this._audioContext.currentTime)
  }
}
export default Player
