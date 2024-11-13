import { Tray, Menu, nativeImage, type BrowserWindow } from 'electron'
import iconPath from '../../resources/icon.png?asset'
export function createTray(mainWindow: BrowserWindow) {
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      type: 'normal',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: '上一首',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('pre-song')
      }
    },
    {
      label: '播放/暂停',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('play')
      }
    },
    {
      label: '下一首',
      type: 'normal',
      click: () => {
        mainWindow.webContents.send('next-song')
      }
    },
    {
      label: '退出',
      type: 'normal',
      click: () => {
        mainWindow.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
  return tray
}
