import Vue from 'vue'
import App from './App'
import { o2 } from './common/o2.js'

Vue.config.productionTip = false
Vue.prototype.o2 = o2

App.mpType = "app"

const app = new Vue({
    ...App
})
app.$mount()
