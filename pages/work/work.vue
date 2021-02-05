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
			var title = options.title
			uni.setNavigationBarTitle({
				title: title
			})
			let token = uni.getStorageSync(this.o2.config.tokenKey);
			this.url = this.o2.Actions.getWebBaseUrl() + '/x_desktop/workmobilewithaction.html?workid='+workid+'&x-token='+token+'#wechat_redirect';
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
