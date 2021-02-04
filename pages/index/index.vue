<template>
		<view class="content">
			<swiper class="swiper" indicator-dots="true" indicator-color="rgb(255,255,255)" autoplay="true" interval="2000" duration="500" v-if="bannerList.length>0">
				<swiper-item v-for="(item, index) in bannerList" :key="index">
					<view class="banner" @click="openHotNews(index)">
						<image mode="scaleToFill" class="banner-img" :src="item.url"></image>
						<view class="banner-title">{{item.title}}</view>
					  </view>
				</swiper-item>
			</swiper>
			<image v-if="bannerList.length==0" mode="scaleToFill" style="width: 100%;height: 50vw;" src="../../static/img/banner_default.png"></image>
			<view class="app-list">
				<view class="app-item" >
					<image src="../../static/img/icon_task.png" class="app-item-img"></image>
					<text class="app-item-title">待办</text>
				</view>
				<view class="app-item" >
					<image src="../../static/img/icon_task_completed.png" class="app-item-img"></image>
					<text class="app-item-title">已办</text>
				</view>
				<view class="app-item" >
					<image src="../../static/img/icon_read.png" class="app-item-img"></image>
					<text class="app-item-title">待阅</text>
				</view>
				<view class="app-item" >
					<image src="../../static/img/icon_read_completed.png" class="app-item-img"></image>
					<text class="app-item-title">已阅</text>
				</view>
			</view>
			<scroll-view scroll-x class="bg-white nav">
			  <view class="flex text-center">
			    <view :class="0==currentTab? 'cu-item flex-sub text-red cur':'cu-item flex-sub'" @click="changeTab(0)">
			      信息中心
			    </view>
				<view :class="1==currentTab? 'cu-item flex-sub text-red cur':'cu-item flex-sub'" @click="changeTab(1)">
				  办公中心
				</view>
			  </view>
			</scroll-view>
			<view class="work-area">
				<uni-list>
					<uni-list-item  v-for="(item, index) in itemList" :key="index"  clickable  @click="openWebview(item.id, index)" :title="item.title" :note="item.type" :rightText="item.date" />
					<!-- <uni-list-item  v-for="(item, index) in itemList" :key="index"  clickable  @click="openWebview(item.id, index)" >
						<template v-slot:body>
							<view class="work-item">
								<view class="work-title">
									{{item.title}}
								</view>
								<view class="work-sub">
									<view class="work-sub-type">{{item.type}}</view>
									<view class="work-sub-time">{{item.date}}</view>
								</view>
							</view>
						</template>
					</uni-list-item> -->
				</uni-list>
			</view>
		</view>
</template>

<script>
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	export default {
		components: {
			uniList,
			uniListItem
		},
		data() {
			return {
				title: '我的待办',
				refreshing: false,
				bannerList: [],
				currentTab: 0, //当前列表是信息中心还是办公中心： 0 | 1
				itemCount: 15,
				firstId: '(0)',
				lastId: '(0)',
				//文章列表，信息中心和办公中心的数据
				/**
				{
					id: '',
					title: '这里是一个新闻标题',
					type: '【新闻通知】',
					date: '2020-09-10',
					tag: 'news'
				  }
				**/
				itemList:[]
			}
		},
		onLoad() {
			this.onRefresh()
		},
		onPullDownRefresh() {
			console.log('refresh');
			this.loadList(true)
			this.loadBannerList()
		},
		onReachBottom() {
			console.log('上拉加载。。。')
			this.loadList(false)
		},
		methods: {
			onRefresh() {
				uni.startPullDownRefresh()
				this.loadList(true)
				this.loadBannerList()
			},
			loadList(isRefresh) {
				this.o2.showLoading()
				if (this.currentTab === 0) {
					this.loadNewsList(isRefresh)
				}else {
					this.loadWorkList(isRefresh)
				}
			},
			changeTab(tab) {
				if (tab === 0) {
					this.currentTab = 0
				}else {
					this.currentTab = 1
				}
				this.loadList(true)
			},
			// 获取待办数据列表
			loadWorkList(isRefresh) {
				if (isRefresh) {
				  this.lastId = this.firstId
				}
				this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
					//参数 page， count ， data
					return actions.TaskAction.	V2ListNext(this.lastId, this.itemCount, {})
				}).then(res => {
					let list = res.data
					var items = []
					for (var i = 0; i < list.length; i++) {
						var item = list[i]
						items.push({
							id: item.work,
							title: item.title == '' ? '无标题' : item.title,
							type: '【'+item.processName+'】',
							date: item.startTime.length > 9 ? item.startTime.substring(0, 10) : item.startTime,
							tag: 'tasks'
						})
					}
					if (isRefresh) {
						this.itemList = items
					}else {
						for (var i = 0; i < items.length; i++) {
							this.itemList.push(items[i])
						}
					}
					if (list && list.length>0) {
						this.lastId = list[list.length-1].id
					}
					uni.stopPullDownRefresh()
					this.o2.hideLoading()
				}).catch(err => {
					console.log(err)
					uni.stopPullDownRefresh()
					this.o2.hideLoading()
				})
			},
			// 获取信息中心列表数据
			loadNewsList(isRefresh) {
				if (isRefresh) {
				  this.lastId = this.firstId
				}
				this.o2.Actions.load('x_cms_assemble_control').then(actions => {
					return actions.DocumentAction.query_listNextWithFilter(this.lastId, this.itemCount, {})
				}).then(res => {
					let list = res.data
					var items = []
					for (var i = 0; i < list.length; i++) {
						var item = list[i]
						items.push({
							id: item.id,
							title: item.title == '' ? '无标题' : item.title,
							type: '【'+item.categoryName+'】',
							date: item.publishTime.length > 9 ? item.publishTime.substring(0, 10) : item.publishTime,
							tag: 'news'
						})
					}
					if (isRefresh) {
						this.itemList = items
					}else {
						for (var i = 0; i < items.length; i++) {
							this.itemList.push(items[i])
						}
					}
					if (list && list.length>0) {
						this.lastId = list[list.length-1].id
					}
					uni.stopPullDownRefresh()
					this.o2.hideLoading()
				}).catch(err => {
					console.log(err)
					uni.stopPullDownRefresh()
					this.o2.hideLoading()
				})
			},
			loadBannerList() {
				this.o2.Actions.load('x_hotpic_assemble_control').then(actions => {
					return actions.HotPictureInfoAction.listForPage(1, 5, {})
				}).then(res => {
					this.bannerList = res.data
				})
			},
			openHotNews(index) {
				console.log('banner '+index)
				let b = this.bannerList[index]
				if (b.application  === 'CMS') {
					uni.navigateTo({
						url: '../cms/cms?id='+b.infoId+'&title='+b.title
					})
				}else if(b.application === 'BBS') {
					
				}
			},
			openWebview(workid, index) {
				let item = this.itemList[index]
				if (item.tag === 'news') {
					uni.navigateTo({
						url: '../cms/cms?id='+workid+'&title='+item.title
					})
				}else if (item.tag === 'tasks'){
					uni.navigateTo({
						url: '../work/work?workid='+workid+'&title='+item.title
					})
				}
				
			},
		}
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.swiper {
		width: 100%;
	}
	.banner {
		height: 50vw;
		width: 100%;
	}
	.banner-img {
	  width: 100%;
	  height: 100%;
	}
	.banner-title {
	  height: 60rpx;
	  width: 100%;
	  line-height: 60rpx;
	  padding-left: 20rpx;
	  background: rgba(0, 0, 0, 0.4);
	  position: absolute;
	  bottom: 0;
	  color: white;
	  font-size: 28rpx;
	}
	.app-list {
		background-color: white;
		display: flex;
		flex-direction: row;
		width: 100%;
		padding: 20rpx 30rpx;
	}
	.app-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.app-item-img {
		width: 84rpx;
	    height: 84rpx;
	    margin-bottom: 20rpx;
	}
	.app-item-title {
		font-size: 24rpx;
		color: #2c2c2c;
	}
	.work-area {
		width: 100%;
	}
	.work-item {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.work-title {
		font-size: 32rpx;
		color: #333333;
		margin-left: 10rpx;
	}
	.uni-list-item__content-title {
		font-size: $uni-font-size-base;
		color: #3b4144;
		overflow: hidden;
		margin-left: 10rpx;
	}
	.work-sub {
		display: flex;
		flex-direction: row;
		margin-top: 10rpx;
	}
	.work-sub-type {
		flex: 1;
		font-size: 24rpx;
		color: #999999;
	}
	.work-sub-time {
		width: 150rpx;
		font-size: 24rpx;
		color: #999999;
	}
</style>
