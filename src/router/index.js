import Vue from 'vue'
import VueRouter from 'vue-router'
import MyComponent from '../components/MyComponent.vue'
import FileManager from '../components/FileManager.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/mycomponent',
    name: 'MyComponent',
    component: MyComponent
  },
  {
    path: '/test',
    name: 'test',
    component: FileManager
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
