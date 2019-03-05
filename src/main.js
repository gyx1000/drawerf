import Vue from 'vue'
import App from './App.vue'
import store from './store'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faPlus, faMinus, faPalette } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import VueKonva from 'vue-konva'

library.add(faBars)
library.add(faPlus)
library.add(faMinus)
library.add(faPalette)

Vue.config.productionTip = false
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(VueKonva)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
