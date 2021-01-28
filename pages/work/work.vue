<template>
	<view>
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				workid: '',
				url: ''
			}
		},
		onLoad(options) {
			var workid = options.workid
			this.url = 'http://dd.o2oa.net/x_desktop/workmobilewithaction.html?workid='+workid+'&x-token=_VNbzrEcyo6aM8OODAMLB-txnDxs6qDvVEsphuubX4NwqcODaJr1poQX6xqTOfBJAJ6ET2siCDg'
		},
		methods: {
			create() {
				let mei = '北京'
			}
			
		}
	}
</script>

<style>

</style>
