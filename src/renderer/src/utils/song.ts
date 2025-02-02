
class Song {
  public audio: HTMLAudioElement
  constructor() {
    this.audio = new Audio()
  }
  public loadSong(track: any) {
    if (!track.local) {
      this.loadSongByUrl(track.id)
    } else {
      this.loadSongByFile(track.id)
    }
  }
  private loadSongByFile(path: string) {
    window.electron.ipcRenderer.invoke('read-file', path).then((res: any) => {
      this.audio.src = URL.createObjectURL(new Blob([res]))
      this.audio.play()
    })
  }
  private async loadSongByUrl(id: number | string) {
    const options = {
      ids: [id],
      level: JSON.parse(localStorage.getItem('settings') as string).playQuality || 'lossless'
    }
    const res = await window.api.netEaseCloud.song_url(options)
    const src = res.data[0].url
    this.audio.src = src
    this.audio.play()
  }
}

export { Song }
