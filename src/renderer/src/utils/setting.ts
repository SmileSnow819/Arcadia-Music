import initSettings from './initSettings.json'
interface IColor {
  background: string
  surface: string
  primary: string
  secondary: string
  'on-background': string
  'on-surface': string
}
interface ITheme {
  name: string
  colors: IColor
}
interface ISetting {
  volume: number
  playMode: number
  imgDir: string
  tracksDir: string
  downloadQuality: string
  playQuality: string
  homePage: string
  behaviorWhenClose: string
  theme: {
    darkMode: boolean
    autoColor: boolean
    deskLyricAutoColor: boolean
    deskLyricFontColor: string
    deskLyricSize: number
    colors: IColor
    customThemes: ITheme[]
    presetThemes: ITheme[]
  }
}

class Setting {
  public _settings: ISetting
  public settings: ISetting
  constructor() {
    this._settings = Object.assign(
      { ...initSettings },
      { ...(JSON.parse(localStorage.getItem('settings') as string) || {}) }
    )
    localStorage.setItem('settings', JSON.stringify(this._settings))
    //代理settings,每次更改其中的值自动保存
    this.settings = new Proxy(this._settings, {
      set: (target, key, value) => {
        Reflect.set(target, key, value)
        localStorage.setItem('settings', JSON.stringify(this._settings))
        return true
      },
      get: (target, key: keyof ISetting) => {
        return Reflect.get(target, key)
      }
    })
    this.settings.theme = new Proxy(this.settings.theme, {
      set: (target, key, value) => {
        Reflect.set(target, key, value)
        localStorage.setItem('settings', JSON.stringify(this._settings))
        return true
      },
      get: (target, key: keyof ISetting) => {
        return Reflect.get(target, key)
      }
    })
  }
}
export { Setting }
export type { ISetting }
