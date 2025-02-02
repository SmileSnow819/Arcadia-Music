/*global __dirname */
const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()
const catchErr = require('../controllers/catchErr.cjs')
// const dir = path.join(__dirname, "./netEaseCloudAPI");
// fs.readdirSync(dir).forEach((file) => {
//   if (file === 'util') return
//   fs.readdirSync(path.join(dir, file)).forEach((jsFile) => {
//     // const api = require(path.join(dir, file, jsFile))
//     // const url = api.url
//     // const method = catchErr(api.fn)
//     // router.route(url).post(method)
//     import(path.join(dir, file, jsFile)).then((api) => {
//       const url = api.url
//       const method = catchErr(api.fn)
//       router.route(url).post(method)
//     })
//   })
// })
import('./netEaseCloudAPI/album/album.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/album/album_sub.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/album/album_sublist.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/artist/artist_album.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/artist/artist_mv.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/artist/artist_song.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/artist/artist_sublist.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/artist/artists.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/artist/artist_sub.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/login/login_qr_check.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/login/login_qr_create.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/login/login_qr_key.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/login/login_status.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/login/logout.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/other/homepage_block_page.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/lyric_new.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/mv_detail.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/mv_url.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/personal_fm.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/personal_fm_mode.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/recommend_resource.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/recommend_songs.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/ugc_album_get.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/other/vip_info_v2.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/playlist/playlist_create.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/playlist/playlist_delete.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/playlist/playlist_detail.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/playlist/playlist_order_update.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/playlist/playlist_tracks.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/playlist/playlist_update.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/search/search.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/search/search_suggest.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/song/song_detail.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_download_url.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_dynamic_cover.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_like.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_like_check.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_quality.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_url.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_wiki.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/song/song_order_update.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

import('./netEaseCloudAPI/user/user_account.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/user/user_detail.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/user/user_playlist.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/user/user_record.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})
import('./netEaseCloudAPI/user/user_subcount.cjs').then((api) => {
  const url = api.url
  const method = catchErr(api.fn)
  router.route(url).post(method)
})

module.exports = router
