import Vue from 'vue'
import VueRouter from 'vue-router'
import { my_store } from '../my_store.js'
import FileManager from '../components/FileManager.vue'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'file_manager',
    component: FileManager,
    meta: { 
        requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (my_store.getters.is_logged_in) {
      next()
      return
    }
    next('/login') 
  } else {
    next() 
  }
})

export default router
