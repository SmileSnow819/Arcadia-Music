import { app } from 'electron'
import fs from 'fs'
import path from 'path'
class Store {
  private basePath: string
  constructor() {
    this.basePath = app.getPath('userData')
  }
  async test(name: string, folder = 'playlists') {
    const nameParts = name.split('.')
    if (!fs.existsSync(path.join(this.basePath, folder))) return false
    const baseDir = path.join(this.basePath, folder, `${nameParts[0]}.json`)

    return fs.existsSync(baseDir)
  }
  async get(name: string, folder = 'playlists') {
    let nameParts = name.split('.')
    if (folder !== 'playlists') nameParts = [name]
    const baseDir = path.join(this.basePath, folder, `${nameParts[0]}.json`)

    if (!fs.existsSync(baseDir)) {
      return undefined
    }
    let rowUTF = ''
    rowUTF = await fs.promises.readFile(baseDir, 'utf8')
    const data = JSON.parse(rowUTF)
    if (nameParts.length === 1) return data
    let obj = data
    const lastPart = nameParts[nameParts.length - 1]
    const middleParts = nameParts.slice(1, -1)
    for (const part of middleParts) {
      if (!obj[part]) {
        obj[part] = {}
      }
      obj = obj[part]
    }
    return obj[lastPart]
  }
  async set(name: string, value: any, folder: string = 'playlists') {
    let nameParts = name.split('.')
    if (folder !== 'playlists') nameParts = [name]
    const baseDir = path.join(this.basePath, folder, `${nameParts[0]}.json`)
    //如果不存在，就创建
    if (!fs.existsSync(path.join(this.basePath, folder))) {
      fs.mkdirSync(path.join(this.basePath, folder))
    }

    //如果不存在，就创建
    if (!fs.existsSync(baseDir)) {
      fs.writeFileSync(baseDir, '{}', 'utf8')
    }
    //读取
    let dataObj = JSON.parse(await fs.promises.readFile(baseDir, 'utf8'))
    //检查后续成员是否存在，不存在就创建
    let obj = dataObj
    //直到最后一个之前，都应该是对象
    if (nameParts.length === 1) {
      dataObj = value
    } else {
      const lastPart = nameParts[nameParts.length - 1]
      const middleParts = nameParts.slice(1, -1)
      for (const part of middleParts) {
        if (!obj[part]) {
          obj[part] = {}
        }
        obj = obj[part]
      }
      //最后一个成员赋值
      obj[lastPart] = value
      //写入
    }
    await fs.promises.writeFile(baseDir, JSON.stringify(dataObj), 'utf8')
  }
  async del(name: string, folder = 'playlists') {
    const nameParts = name.split('.')
    const baseDir = path.join(this.basePath, folder)
    if (!fs.existsSync(baseDir)) return
    if (name === '*') {
      const dirs = fs.readdirSync(baseDir)
      for (const dir of dirs) {
        if (dir.endsWith('.json')) fs.unlinkSync(path.join(baseDir, dir))
      }
    } else {
      fs.unlinkSync(path.join(baseDir, `${nameParts[0]}.json`))
    }
  }
}
export default Store
