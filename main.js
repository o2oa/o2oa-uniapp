import Vue from 'vue'
import App from './App'
import { o2 } from './common/o2.js'

Vue.config.productionTip = false
// O2OA 服务器地址端口配置
o2.o2server = {
		httpProtocol: 'https',
		centerHost: 'sample.o2oa.net',
		centerPort: 40030,//中心服务器端口
		centerContext: '/x_program_center', //中心服务器上下文
	}
	
Vue.prototype.o2 = o2


App.mpType = "app"

const app = new Vue({
    ...App
})
app.$mount()
