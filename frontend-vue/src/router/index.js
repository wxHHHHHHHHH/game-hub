import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/videos', name: 'Videos', component: () => import('../views/Videos.vue') },
  { path: '/videos/:id', name: 'VideoDetail', component: () => import('../views/VideoDetail.vue') },
  { path: '/news', name: 'News', component: () => import('../views/News.vue') },
  { path: '/gallery', name: 'Gallery', component: () => import('../views/Gallery.vue') },
  { path: '/intro', name: 'Intro', component: () => import('../views/Intro.vue') },
  { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
  { path: '/admin', name: 'Admin', component: () => import('../views/Admin.vue'), meta: { admin: true } },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
]

export default createRouter({ history: createWebHashHistory(), routes })
