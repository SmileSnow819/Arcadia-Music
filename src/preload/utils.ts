import { webFrame } from 'electron'

export const utils = {
  clearCache() {
    webFrame.clearCache()
  }
}
