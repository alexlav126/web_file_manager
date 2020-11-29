import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'

Vue.use(Vuex)
Vue.config.productionTip = false

const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment (state) {
            state.count++
        }
    }
})

new Vue({
  router,
  store: store,
  render: h => h(App)
}).$mount('#app')
