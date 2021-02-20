<template>
	<view>
		<uni-list>
			<uni-list-item  v-for="(item, index) in itemList" :key="index"  clickable  
			@click="openWebview(index)" :title="item.title" :note="item.type" :rightText="item.date" />
		</uni-list>
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
				type: 'task', //task | taskCompleted | read | readCompleted
				itemCount: 15,
				firstId: '(0)',
				lastId: '(0)',
				itemList:[]
			}
		},
		onLoad(options) {
			var type = options.type
			if (!type) {
				type = 'task'
			}
			this.type = type
			if (this.type === 'task') {
				uni.setNavigationBarTitle({
					title: '待办列表'
				})
			} else if(this.type === 'taskCompleted') {
				uni.setNavigationBarTitle({
					title: '已办列表'
				})
			} else if(this.type === 'read') {
				uni.setNavigationBarTitle({
					title: '待阅列表'
				})
			} else if(this.type === 'readCompleted') {
				uni.setNavigationBarTitle({
					title: '已阅列表'
				})
			}
			uni.startPullDownRefresh()
			this.loadList(true)
		},
		onPullDownRefresh() {
			console.log('下拉刷新');
			this.loadList(true)
		},
		onReachBottom() {
			console.log('上拉加载。。。')
			this.loadList(false)
		},
		methods: {
			// 获取待办数据列表
			loadList(isRefresh) {
				if (isRefresh) {
				  this.lastId = this.firstId
				}
				var pAction = null
				if (this.type === 'task') {
					pAction = this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
						//参数 page， count ， data
						return actions.TaskAction.V2ListNext(this.lastId, this.itemCount, {})
					})
				} else if (this.type === 'taskCompleted') {
					pAction = this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
						//参数 page， count ， data
						return actions.TaskCompletedAction.V2ListNext(this.lastId, this.itemCount, {})
					})
				} else if (this.type === 'read') {
					pAction = this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
						//参数 page， count ， data
						return actions.ReadAction.V2ListNext(this.lastId, this.itemCount, {})
					})
				} else if (this.type === 'readCompleted') {
					pAction = this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
						//参数 page， count ， data
						return actions.ReadCompletedAction.V2ListNext(this.lastId, this.itemCount, {})
					})
				}
				if (pAction) {
					pAction.then(res => {
						let list = res.data
						var items = []
						for (var i = 0; i < list.length; i++) {
							var item = list[i]
							var obj = {
										work: item.work,
										workCompleted: item.workCompleted,
										title: item.title == '' ? '无标题' : item.title,
										type: '【'+item.processName+'】',
										date: item.startTime.length > 9 ? item.startTime.substring(0, 10) : item.startTime
									  };
							items.push(obj)
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
				}
			},
			openWebview(index) {
				let item = this.itemList[index]
				if (!item.workCompleted) {
					uni.navigateTo({
						url: '../work/work?workid='+item.work+'&title='+item.title
					})
				}else {
					uni.navigateTo({
						url: '../work/work?workCompleted='+item.workCompleted+'&title='+item.title
					})
				}				
			},
		}
	}
</script>

<style>

</style>
