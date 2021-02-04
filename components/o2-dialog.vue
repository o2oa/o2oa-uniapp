<template>
	<view class="o2-dialog" v-if="show">
		<view class="o2-dialog-window" >
			<image src="../static/close.png" class="iconfont" @click="show=false" v-if="show"></image>
			<slot></slot>
		</view>
		<view class="o2-dialog-mask" v-if="mask" @touchmove.prevent :hidden="!show" @click="show=false"></view>
	</view>
</template>

<script>
	export default {
		props: {
			show: {
				type: Boolean,
				default: true
			},
			mask: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				
			};
		},
		methods:{
			open() {
				this.show = true
			},
			close() {
				this.show = false
			}
		}
	}
</script>

<style lang="scss" scoped>
view {
	box-sizing: border-box;
}
.o2-dialog {
	display: flex;
	align-items: center;
	justify-content: center;
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
}
.o2-dialog-window {
	position: fixed;
	background-color: #fff;
	z-index: 77;
	border-radius: 15rpx;
	padding: 50rpx 30rpx;
	transition: all .3s cubic-bezier(.25, .5, .5, .9);
	-webkit-transition: all .3s cubic-bezier(.25, .5, .5, .9);
}
.o2-dialog-window .iconfont {
	position: fixed;
	right: 30rpx;
	top: 20rpx;
	font-size: 35rpx;
	color: #8a8a8a;
	width: 50rpx;
	height: 50rpx;
}
.o2-dialog-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #000;
	opacity: .5;
	z-index: 5;
}

</style>
