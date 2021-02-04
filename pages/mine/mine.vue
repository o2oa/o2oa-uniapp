<template>
	<view class="mine">
		<view class="head">
			<view class="avatar round" @click="uploadAvatar">
				<image :src="avatarUrl" mode="aspectFill" class="image round"></image>
			</view>
		</view>
		<view class="cu-form-group margin-top-xl">
			<view class="title">姓名</view>
			<view>{{user.name}}</view>
		</view>
		<view class="cu-form-group">
			<view class="title">工号</view>
			<view >{{user.employee}}</view>
		</view>
		<view class="cu-form-group" @click="updateEmail">
			<view class="title">邮件地址</view>
			<view class="o2-can-click">
				<view class="picker">
					{{user.mail}}
				</view>
			</view>
		</view>
		<view class="cu-form-group" v-if="!user.hiddenMobile" @click="updateMobile">
			<view class="title">手机号码</view>
			<view class="o2-can-click">
				<view class="picker">
					{{user.mobile}}
				</view>
			</view>
		</view>
		<view class="cu-form-group" @click="updateOfficePhone">
			<view class="title">办公电话</view>
			<view class="o2-can-click">
				<view class="picker">{{user.officePhone}}</view>
			</view>
		</view>
		<view class="cu-form-group" @click="updateSinature">
			<view class="title">个人签名</view>
			<view class="o2-can-click">
				<view class="picker">
					{{user.signature}}
				</view>
			</view>
		</view>
		
		<view class="margin-top padding flex flex-direction">
			<button class="cu-btn bg-o2-red margin-tb-sm lg" @click="logout">退出登录</button>
		</view>
		
		<!--  -->
		 <!-- 提交信息 -->
		 <uni-popup id="dialogInput" ref="dialogInput" type="dialog">
		 	<uni-popup-dialog mode="input" :title="dialogTitle" :value="dialogValue" placeholder="" @confirm="dialogInputConfirm"></uni-popup-dialog>
		 </uni-popup>
		
		 
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	export default {
		components:{
			uniPopup,
			uniPopupDialog
		},
		data() {
			return {
				user: {},
				avatarUrl: '../../static/logo.png',
				dialogTitle: '',
				dialogValue: '',
				dialogType: '', // mail mobile officePhone sinature
			}
		},
		onLoad() {
			uni.$on('upAvatar', res => {
				console.log('接收到头像更新')
				if (res && res.url) {
					this.avatarUrl = res.url
				}
			})
			this.getMyInfo()
			this.loadAvatar()
		},
		onUnload() {
			uni.$off('upAvatar')
		},
		methods: {
			getMyInfo() {
				this.o2.Actions.load('x_organization_assemble_personal').then(actions => {
					return actions.PersonAction.get()
				}).then(res => {
					let user = res.data
					if (!user.hiddenMobile) {
						user.hiddenMobile = false
					}
					this.user = user
				})
			},
			loadAvatar() {
				var personalModule = this.o2.Actions.getModuleHost("x_organization_assemble_personal")
				var avatarUrl = personalModule + '/jaxrs/person/icon'
				// #ifdef H5
				this.avatarUrl = avatarUrl
				// #endif
				// #ifndef H5
				this.o2.Actions.o2Download(avatarUrl).then(localUrl=>{
					this.avatarUrl = localUrl
				}).catch(err => {
					this.avatarUrl = '../../static/logo.png'
				})
				// #endif
			},
			// 选择头像 进行裁剪和上传
			uploadAvatar() {
				//TODO 无法 PUT 。。。。
				// uni.chooseImage({
				// 	count:1,
				// 	success: res => {
				// 		if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				// 			let filePath = res.tempFilePaths[0]
				// 			console.log(filePath)
				// 			// #ifdef H5
				// 			this.postAvatar2Server(filePath)
				// 			// #endif
				// 			// #ifndef H5
				// 			//获取图片的信息
				// 			uni.getImageInfo({
				// 				src:filePath,
				// 				success: (info) => {
				// 					console.log(info)
				// 					uni.navigateTo({
				// 						url: './avatar?imgPath='+filePath+'&width='+info.width+'&height='+info.height
				// 					})
				// 				}
				// 			})
				// 			// #endif
				// 		}
				// 	}
				// })
			},
			postAvatar2Server(tempFilePath) {
				this.o2.showLoading()
				this.o2.Actions.load('x_organization_assemble_personal').then(actions => {
					return actions.PersonAction.setIcon({}, tempFilePath, true)
				}).then(res => {
					this.o2.hideLoading()
					this.avatarUrl = res.url
				})
			},
			updateEmail() {
				this.dialogTitle = '修改邮件地址'
				this.dialogValue = this.user.mail
				this.dialogType = 'mail'
				this.$refs.dialogInput.open()
			},
			updateMobile() {
				this.dialogTitle = '修改手机号码'
				this.dialogValue = this.user.mobile
				this.dialogType = 'mobile'
				this.$refs.dialogInput.open()
			},
			updateOfficePhone() {
				this.dialogTitle = '修改办公电话'
				this.dialogValue = this.user.officePhone
				this.dialogType = 'officePhone'
				this.$refs.dialogInput.open()
			},
			updateSinature() {
				this.dialogTitle = '修改个人签名'
				this.dialogValue = this.user.signature
				this.dialogType = 'signature'
				this.$refs.dialogInput.open()
			},
			// 弹出窗确定的返回数据
			dialogInputConfirm(done, val) {
				console.log(val);
				done()
				switch(this.dialogType) {
					case 'officePhone':
						var person = this.user
						person.officePhone = val
						this.updatePerson(person)
						break
					case 'mail':
						var person = this.user
						person.mail = val
						this.updatePerson(person)
						break
					case 'mobile':
						var person = this.user
						person.mobile = val
						this.updatePerson(person)
						break
					case 'signature':
						var person = this.user
						person.signature = val
						this.updatePerson(person)
						break
				}
			},
			// 更新用户数据
			updatePerson(person) {
				console.log(person)
				this.o2.showLoading()
				this.o2.Actions.load('x_organization_assemble_personal').then(actions => {
					return actions.PersonAction.edit(person)
				}).then(res => {
					this.o2.hideLoading()
					this.user = person
				})
				
			},
			// 退出登录
			logout() {
				uni.showModal({
				    title: '提示',
				    content: '确定要退出当前用户的登录状态吗？',
				    success: function (res) {
				        if (res.confirm) {
				            this.o2.Actions.load("x_organization_assemble_authentication").then(actions=> {
				            	var authentication = actions.AuthenticationAction
				            	return authentication.logout()
				            }).then(res => {
								console.log('退出登录成功！')
								this.cleanUserAndToLogin()
							}).catch(err => {
								console.log(err)
								this.o2.toast('退出登录失败')
								this.cleanUserAndToLogin()
							})
				        } else if (res.cancel) {
				            console.log('用户点击取消');
				        }
				    }.bind(this)
				});
			},
			// 清空用户信息
			cleanUserAndToLogin() {
				uni.removeStorageSync(this.o2.config.userKey)
				uni.removeStorageSync(this.o2.config.tokenKey)
				uni.reLaunch({
					url: '../login/login'
				})
			}
		}
	}
</script>

<style>
.mine {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	background-color: #efefef;
}
.head {
	height: 200rpx;
	background-color: #fb4747;
	display: flex;
	justify-content: center; /* 水平居中 */
	align-items: center;     /* 垂直居中 */
}

.head .avatar {
	width: 132rpx;
	height: 132rpx;
	background-color: white;
	display: flex;
	justify-content: center; /* 水平居中 */
	align-items: center;     /* 垂直居中 */
}
.head .image {
	width: 128rpx;
	height: 128rpx;
}

</style>
