import Vue from 'vue'
import MobileApp from './App.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(MobileApp)
}).$mount('#mobile-app')
