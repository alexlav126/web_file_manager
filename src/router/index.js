import Vue from 'vue'
import VueRouter from 'vue-router'
import FileManager from '../components/FileManager.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/file_manager',
    name: 'file_manager',
    component: FileManager
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
