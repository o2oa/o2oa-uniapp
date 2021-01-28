<template>
		<view class="content">
			<image class="logo" src="/static/logo.png"></image>
			<view class="text-area">
				<text class="title">{{title}}</text>
			</view>
			<view class="work-area">
				<uni-list>
					<uni-list-item  v-for="item in workList" :title="item.title == '' ? item.processName : item.title" clickable  @click="openWebview(item.work)" ></uni-list-item>
				</uni-list>
			</view>
		</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '我的待办',
				refreshing: false,
				workList: []
			}
		},
		onLoad() {
			this.onRefresh()
		},
		onPullDownRefresh() {
			console.log('refresh');
			this.loadList()
		},
		methods: {
			onRefresh() {
				console.log('on refresh/////')
				uni.startPullDownRefresh()
				this.loadList()
			},
			openWebview(workid) {
				console.log(workid)
				uni.navigateTo({
					url: '../work/work?workid='+workid
				})
			},
			loadList() {
				this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
					//参数 page， count ， data
					return actions.TaskAction.V2ListPaging(1, 15, {})
				}).then(res => {
					this.workList = res.data
					uni.stopPullDownRefresh()
				}).catch(err => {
					console.log(err)
					uni.stopPullDownRefresh()
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		margin-top: 200rpx;
		font-size: 36rpx;
		color: #8f8f94;
	}
	.work-area {
		margin: 20rpx 30rpx 20rpx;
	}
</style>
