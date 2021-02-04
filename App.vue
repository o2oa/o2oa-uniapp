<script>
	
	export default {
		globalData: {  
			o2server: {
				httpProtocol: 'https',
				centerHost: 'sample.o2oa.net',
				centerPort: 40030,
				centerContext: '/x_program_center',
			},
			//webServer assembles
			// o2Distribute: {
			// }
		},
	    onLaunch() {
			console.log('App onLaunch')
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
	@import "colorui/main.css";
	@import "colorui/icon.css";
	@import "static/app.css";
</style>
