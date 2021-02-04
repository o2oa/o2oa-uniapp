<template>
	<view>
		<web-view :src="url"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: '',
				url: ''
			}
		},
		onLoad(options) {
			var id = options.id
			this.id = id
			var title = options.title
			uni.setNavigationBarTitle({
				title: title
			})
			let token = uni.getStorageSync(this.o2.config.tokenKey);
			this.url = this.o2.Actions.getWebBaseUrl() + '/x_desktop/cmsdocMobile.html?id='+id+'&x-token='+token
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
