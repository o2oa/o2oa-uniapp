<script>
	
	export default {
		globalData: {  
			o2server: {
				httpProtocol: 'http',
				centerHost: 'dd.o2oa.net',
				centerPort: 20030,
				centerContext: '/x_program_center',
			},
			//webServer assembles
			// o2Distribute: {
			// }
		},
	    onLaunch() {
			console.log('App onLaunch')
			this.o2.Actions.loadO2Distribute().then(res=> {
				console.log('加载distribute。。。。')
			}).catch(err => {
				console.log(err)
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
