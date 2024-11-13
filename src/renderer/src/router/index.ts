import { createRouter, createWebHashHistory } from 'vue-router'
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@renderer/pages/Home.vue'),
    children: [
      {
        path: 'local',
        name: 'local',
        component: () => import('@renderer/views/Local.vue'),
        redirect: { name: 'localHomePage' },
        children: [
          {
            path: 'localHomePage',
            name: 'localHomePage',
            component: () => import('@renderer/views/local/HomePage.vue')
          },
          {
            path: 'localPlaylist/:id',
            name: 'localPlaylist',
            component: () => import('@renderer/views/local/Playlist.vue')
          },
          {
            path: 'localArtist/:id',
            name: 'localArtist',
            component: () => import('@renderer/views/local/Artist.vue')
          },
          {
            path: 'localAlbum/:id',
            name: 'localAlbum',
            component: () => import('@renderer/views/local/Album.vue')
          },
          {
            path: 'localAlbumList',
            name: 'localAlbumList',
            component: () => import('@renderer/views/local/AlbumList.vue')
          },
          {
            path: 'localArtistList',
            name: 'localArtistList',
            component: () => import('@renderer/views/local/ArtistList.vue')
          },
          {
            path: 'download',
            name: 'download',
            component: () => import('@renderer/views/local/Download.vue')
          }
        ]
      },
      {
        path: 'netEaseCloud',
        name: 'netEaseCloud',
        component: () => import('@renderer/views/NetEaseCloud.vue'),
        redirect: { name: 'WYYHomePage' },
        children: [
          {
            path: 'WYYHomePage',
            name: 'WYYHomePage',
            component: () => import('@renderer/views/netEaseCloud/HomePage.vue')
          },
          {
            path: 'artist/:id',
            name: 'artist',
            component: () => import('@renderer/views/netEaseCloud/Artist.vue')
          },
          {
            path: 'album/:id',
            name: 'album',
            component: () => import('@renderer/views/netEaseCloud/Album.vue')
          },
          {
            //可选page ,默认为1
            path: 'playlist/:id',
            name: 'playlist',
            component: () => import('@renderer/views/netEaseCloud/PlayList.vue')
          },
          {
            path: 'recommendSongs',
            name: 'recommendSongs',
            component: () => import('@renderer/views/netEaseCloud/RecommendSongs.vue')
          },
          {
            path: 'account',
            name: 'account',
            component: () => import('@renderer/views/netEaseCloud/Account.vue')
          },
          {
            path: 'search/:keywords',
            name: 'search',
            component: () => import('@renderer/views/netEaseCloud/Search.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/playPage',
    name: 'playPage',
    component: () => import('@renderer/pages/PlayPage.vue')
  },
  {
    path: '/Setting',
    name: 'setting',
    component: () => import('@renderer/pages/Setting.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
