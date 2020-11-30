import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { my_store } from './my_store.js'

Vue.config.productionTip = false

new Vue({
  router,
  store: my_store,
  render: h => h(App)
}).$mount('#app')
