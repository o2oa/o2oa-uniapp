<template>
	<view class="process">
		<view class="application-list">
			<view v-for="(item, index) in applicationList" :class="currentAppId == item.id ? 'application-item  application-item-active':'application-item'" :key="index" @click="chooseApplication(item)">
			  <image class="application-icon" :src="item.icon ? 'data:image/png;base64,'+item.icon : '../../../static/img/icon_main_index_logo.png'" mode="scaleToFill"  />
			  <text class="application-name">{{item.name}}</text>
			</view>
		</view>
		<view class="process-list">
			<view class="process-item" v-for="(item, index) in processList" :key="index" @click="clickProcess(item)">
			  <text class="process-name">{{item.name}}</text>
			</view>
		</view>
		<!-- 身份选中-->
		<uni-popup id="dialogIdentity" ref="dialogIdentity" type="dialog">
			<view class="identity-selector">
				<view class="identity-title">
					选择身份
				</view>
				<view class="identity-list">
					<radio-group @change="radioChange">
						<label class="identity-list-cell identity-list-cell-pd" v-for="(item, index) in identityList" :key="item.distinguishedName">
							<view>
								<radio :value="item.distinguishedName" :checked="index === currentIdentityIndex" />
							</view>
							<view>{{item.name}}({{item.unitName}})</view>
						</label>
					</radio-group>
				</view>
				<view class="identity-dialog-button-group">
					<view class="identity-dialog-button" @click="closeIdentityDialog">
						<text class="identity-dialog-button-text">取消</text>
					</view>
					<view class="identity-dialog-button identity-border-left" @click="okIdentityDialog">
						<text class="identity-dialog-button-text identity-button-color">确定</text>
					</view>
				</view>
			</view>
			
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	export default {
		components:{
			uniPopup
		},
		data() {
			return {
				applicationList: [], //应用列表
				processList: [], //流程列表
				currentAppId: '', //选中的应用
				identityList: [], //身份列表
				currentIdentityIndex: 0,
				currentProcess: null
			}
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: '启动流程'
			})
			this.loadApplicatin()
		},
		methods: {
			loadApplicatin() {
				this.o2.showLoading()
				this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
					// 根据当前用户所有可见的Application,并绑定其可见的Porcess
					return actions.ApplicationAction.listWithPersonComplex()
				}).then(res => {
					this.o2.hideLoading()
					let list = res.data
					var pList = []
				    var cid = ''
					if (list && list.length > 0) {
						pList = list[0].processList
						cid = list[0].id
					}
					this.applicationList = list
					this.processList = pList
					this.currentAppId = cid
				}).catch(err => {
					console.log(err)
					this.o2.hideLoading()
				})
			},
			// 选中一个应用
			chooseApplication(app) {
				this.processList = app.processList
				this.currentAppId = app.id
			},
			// 点击启动流程
			clickProcess(process) {
				console.log(process)
				this.currentProcess = process
				this.loadIdentityListWithProcess(process.id)
			},
			// 查询身份列表
			loadIdentityListWithProcess(processId) {
				this.o2.showLoading()
				this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
					// 根据流程id获取身份列表
					return actions.ProcessAction.listAvailableIdentityWithProcess(processId)
				}).then(res => {
					this.o2.hideLoading()
					this.showIdentityDialog(res.data)
				}).catch(err => {
					console.log(err)
					this.o2.hideLoading()
				})
			},
			// 启动流程打开工作
			startProcess(identity) {
				console.log(identity)
				// if(this.currentProcess && this.currentProcess.defaultStartMode && this.currentProcess.defaultStartMode === 'draft')  //草稿模式
				this.o2.showLoading()
				this.o2.Actions.load("x_processplatform_assemble_surface").then(actions => {
					let body = {"identity": identity}
					return actions.WorkAction.create(this.currentProcess.id, body)
				}).then(res => {
					var result = res.data
					this.o2.hideLoading()
					let work = result[0].taskList[0].work
					let activityName = result[0].taskList[0].activityName
					uni.navigateTo({
						url: '../../work/work?workid='+work+'&title='+activityName
					})
				}).catch(err => {
					console.log(err)
					this.o2.hideLoading()
				})
			},
			// 显示身份选中器
			showIdentityDialog(list) {
				if(list && list.length > 0) {
					if (list.length > 1) {
						this.currentIdentityIndex = 0
						this.identityList = list
						this.$refs.dialogIdentity.open()
					} else {
						this.startProcess(list[0].distinguishedName)
					}
				}else {
					this.o2.toast('没有查询到身份，无法启动流程！')
				}
			},
			//选中身份
			radioChange(e) {
				console.log(e)
				for (let i = 0; i < this.identityList.length; i++) {
					if(e.detail.value === this.identityList[i].distinguishedName){
						this.currentIdentityIndex = i
					}
				}
			},
			//
			closeIdentityDialog() {
				this.$refs.dialogIdentity.close()
			},
			okIdentityDialog() {
				this.$refs.dialogIdentity.close()
				let identity = this.identityList[this.currentIdentityIndex]
				console.log(identity)
				this.startProcess(identity.distinguishedName)
			}
			
		}
	}
</script>

<style>
.process {
	display: flex;
	flex-direction: row;
	background-color: #EEEEEE;
}
.application-list {
	height: 100vh;
	width: 50vw;
	overflow: scroll;
}
.application-item {
  height: 84rpx;
  padding-left: 24rpx;
  border-bottom: 1px solid #ffffff;
}
.application-item-active {
  background-color: #ffffff;
}
.application-icon {
  width: 64rpx;
  height: 64rpx;
  margin-top: 10rpx;
  float: left;
}
.application-name {
  line-height: 84rpx;
  font-size: 24rpx;
  margin-left: 12rpx;
}
.process-list {
	height: 100vh;
	width: 50vw;
	overflow: scroll;
	background-color: #FFFFFF;
}
.process-item {
  height: 84rpx;
  margin-left: 24rpx;
}
.process-name {
  line-height: 84rpx;
  font-size: 20rpx;
}
.identity-selector {
	width: 70vw;
	background-color: #FFFFFF;
	border-radius: 8rpx;
	display: flex;
	flex-direction: column;
	padding: 20rpx 30rpx;
}
.identity-title {
	font-size: 32rpx;
	text-align: center;
	margin: 20rpx;
	font-weight: bold;
}
.identity-list {
	background-color: #FFFFFF;
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
}
.identity-list-cell {
	position: relative;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}
.identity-list-cell-pd {
	padding: 22rpx 30rpx;
}
.identity-dialog-button-group {
	display: flex;
	flex-direction: row;
	border-top-color: #f5f5f5;
	border-top-style: solid;
	border-top-width: 1px;
}

.identity-dialog-button {
	display: flex;
	flex: 1;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	height: 45px;
}
.identity-border-left {
	border-left-color: #f0f0f0;
	border-left-style: solid;
	border-left-width: 1px;
}
.identity-dialog-button-text {
	font-size: 14px;
}
.identity-button-color {
	color: #0081FF;
}
</style>
