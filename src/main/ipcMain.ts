import { ipcMain, type BrowserWindow, dialog, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'
import type Store from './store'
import axios from 'axios'
import NodeID3, { TagConstants } from 'node-id3'
import { FlacTagMap, writeFlacTags } from 'flac-tagger'
export function browserICP(mainWindow: BrowserWindow, store: Store) {
  ipcMain.on('close-window', () => {
    mainWindow.close()
  })
  ipcMain.on('minimize-window', () => {
    mainWindow.minimize()
  })
  ipcMain.on('hide-window', () => {
    mainWindow.hide()
  })
  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })
  //打开本地文件
  ipcMain.handle('custom-img-background', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'image', extensions: ['jpg', 'png', 'jpeg'] }]
    })
    if (result.canceled) return
    const filePath = result.filePaths[0]
    return filePath
  })
  //从本地读取图像,返回blob
  ipcMain.handle('read-img', async (_event, dir: string) => {
    const data = await fs.promises.readFile(dir)
    return data
  })
  //选择本地音乐文件夹
  ipcMain.handle('choose-dir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (result.canceled) return
    const filePath = result.filePaths[0]
    return filePath
  })
  //返回所有本地音乐文件
  ipcMain.handle('read-music-dir', async (_event, dir: string) => {
    const files = await fs.promises.readdir(dir)
    return files.filter((item) => item.endsWith('.mp3') || item.endsWith('.flac'))
  })
  ipcMain.handle('read-json-dir', async (_event, dir: string) => {
    const jsonPath = path.join(app.getPath('userData'), dir)
    if (!fs.existsSync(jsonPath)) return []
    const files = await fs.promises.readdir(jsonPath)
    return files.filter((item) => item.endsWith('.json')).map((item) => item.slice(0, -5))
  })
  ipcMain.handle('read-file', async (_event, dir: string) => {
    const data = fs.readFileSync(dir)
    return data
  })
  ipcMain.handle(
    'download-music',
    async (_event, track: any, downloadUrl: string, baseDir: string, fileType = 'mp3') => {
      //首先获得cookie
      const cookieObj = await mainWindow.webContents.session.cookies.get({ domain: 'localhost' })
      let cookie = cookieObj.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
      //拿到歌曲数据
      const musicData = axios({
        url: downloadUrl,
        responseType: 'arraybuffer',
        method: 'GET',
        headers: {
          cookie
        }
      })
      //拿到封面数据
      const cover = axios({
        url: track.al.picUrl,
        method: 'GET',
        responseType: 'arraybuffer',
        headers: {
          cookie
        }
      })
      //拿到歌词数据
      const lyric = axios({
        url: 'http:localhost:25976/netEaseCloud/lyric',
        method: 'POST',
        headers: {
          cookie,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          id: track.id
        })
      })
      const [musicDataRes, coverRes, lyricRes] = await Promise.all([musicData, cover, lyric])
      // const fileName = `${new Date().getTime()} - ${track.ar.map((item: any) => item.name.replace(/\//g, ' ')).join(',')} - ${track.name.replace(/\//g, ' ')}.${fileType}`
      const fileName = `${new Date().getTime()} - ${track.ar.map((item: any) => item.name.replace(/[/:\\*?<>|"]/g, ' ')).join(',')} - ${track.name.replace(/[/:\\*?<>|"]/g, ' ')}.${fileType}`
      if (fileType === 'flac') {
        //先写入数据
        await fs.promises.writeFile(path.join(baseDir, fileName), musicDataRes.data)
        const tagMap: FlacTagMap = {
          title: track.name,
          artist: track.ar.map((item: any) => item.name),
          album: track.al.name,
          lyrics: JSON.stringify({
            lrc: lyricRes.data.lrc.lyric,
            tlyric: lyricRes.data.tlyric ? lyricRes.data.tlyric.lyric : ''
          })
        }
        await writeFlacTags(
          {
            tagMap,
            picture: {
              buffer: coverRes.data
            }
          },
          path.join(baseDir, fileName)
        )
      } else {
        const tags = {
          title: track.name,
          artist: track.ar.map((item: any) => item.name).join('/'),
          album: track.al.name,
          unsynchronisedLyrics: {
            language: 'zh-en',
            text: JSON.stringify({
              lrc: lyricRes.data.lrc.lyric,
              tlyric: lyricRes.data.tlyric ? lyricRes.data.tlyric.lyric : ''
            })
          },
          image: {
            mime: 'image/jpeg',
            type: {
              id: TagConstants.AttachedPicture.PictureType.FRONT_COVER
            },
            description: '',
            imageBuffer: Buffer.from(coverRes.data)
          }
        }
        const music = NodeID3.write(tags, musicDataRes.data)
        await fs.promises.writeFile(path.join(baseDir, fileName), music)
      }

      return fileName
    }
  )
  //从本地读取音乐文件名
  ipcMain.handle('read-music-metaData', async (_event, baseDir: string, dir: string[]) => {
    const data = [] as any[]
    for (const musicDir of dir) {
      const musicPath = path.join(baseDir, musicDir)
      const musicMetaData = (await parseFile(musicPath)) as any
      data.push(musicMetaData)
    }
    return data
  })
  ipcMain.handle(
    'read-music-data',
    async (_event, baseDir: string, dir: string[], cover = true) => {
      const data = [] as any[]
      for (const musicDir of dir) {
        const musicPath = path.join(baseDir, musicDir)
        const musicMetaData = (await parseFile(musicPath)) as any
        const metaData = musicMetaData.common as any
        const artist = metaData.artists ? metaData.artists : ['未知艺术家']
        const albumID = metaData.album ? metaData.album.replace(/[/:\\*?<>|"]/g, ' ') : '未知专辑'
        const picUrl = cover
          ? metaData.picture
            ? [metaData.picture[0].data]
            : undefined
          : musicDir
        const trackInfo = {
          name: metaData.title,
          dt: musicMetaData.format.duration * 1000,
          id: musicPath,
          ar: artist.map((name: any) => {
            return {
              id: name.replace(/[/:\\*?<>|"]/g, ' '),
              name: name
            }
          }),
          al: {
            id: albumID,
            name: metaData.album || '未知专辑',
            picUrl: picUrl
          },
          local: true,
          path: musicDir,
          lyric: metaData.lyrics
            ? JSON.parse(metaData.lyrics[0].text || metaData.lyrics[0])
            : undefined
        }
        data.push(trackInfo)
      }
      return data
    }
  )
  ipcMain.handle('store-set', (_event, key: string, value: any, path?: string) => {
    store.set(key, value, path)
    return true
  })
  ipcMain.handle('store-test', (_event, key: string, path?: string) => {
    return store.test(key, path)
  })
  ipcMain.handle('store-get', (_event, key: string, path?: string) => {
    return store.get(key, path)
  })
  ipcMain.handle('store-del', (_event, key: string, path?: string) => {
    store.del(key, path)
    return true
  })
}
