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
			var workCompleted = options.workCompleted
			var title = options.title
			uni.setNavigationBarTitle({
				title: title
			})
			let token = uni.getStorageSync(this.o2.config.tokenKey);
			if (!workCompleted) {
				this.url = this.o2.Actions.getWebBaseUrl() + '/x_desktop/workmobilewithaction.html?workid='+workid+'&x-token='+token+'#wechat_redirect';
			}else {
				this.url = this.o2.Actions.getWebBaseUrl() + '/x_desktop/workmobilewithaction.html?workcompletedid='+workCompleted+'&x-token='+token+'#wechat_redirect';
			}
			
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
