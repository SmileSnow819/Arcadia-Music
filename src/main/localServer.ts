import express from 'express'
import expressProxy from 'express-http-proxy'
import { join } from 'path'
const localServer = express()
localServer.use('/', express.static(join(__dirname, '../renderer')))
localServer.use('/lyric', express.static(join(__dirname, '../../resources/lyric')))
localServer.use('/wyyAPI', expressProxy('http://localhost:25976'))
export { localServer }
