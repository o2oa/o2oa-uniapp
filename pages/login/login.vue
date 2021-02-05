<template>
	<view class="content">
		<!-- #ifndef H5 -->
			<view class="status_bar">
			  <!-- 这里是状态栏 -->
			</view>
		<!-- #endif -->
		 
		<view class="logo">
			<image src="../../static/logo.png" mode="aspectFill"></image>
		</view>
		<view class="form" v-if="needLogin">
			<view class="login-mode">
				<text :class="loginMode == 'code' ? 'mode-text mode-active' : 'mode-text'" @click="changeMode">短信验证登录</text>
				<text class="mode-sp">|</text>
				<text :class="loginMode == 'password' ? 'mode-text mode-active' : 'mode-text'" @click="changeMode">密码登录</text>
			</view>
			<input type="text" placeholder="手机号/用户名" :class="usernameFocus?'input input-active':'input'" @focus="bindUserNameFocus" v-model="username"/>
			<input v-if="loginMode == 'password'" type="password" placeholder="密码" :class="passwordFocus?'input input-active':'input'" @focus="bindPasswordFocus" v-model="password"/>
			<view class="code-input" v-if="loginMode == 'code'">
				<input  type="text" placeholder="验证码" :class="codeFocus?'input-active':''" @focus="bindCodeFocus" v-model="code"/>
				<button :class="sending? 'code-btn-sending':'code-btn'" @click="getCode()">{{getCodeText}}</button>
			</view>
			<button class="login-btn" @click="login">登录</button>
			<view class="login-demo-area" v-if="isSample">
			     <view >体验账号：</view>
			     <view class="demo-people-link" @click="demoLogin(1)">开发人员1</view>
			     <view class="demo-people-link" @click="demoLogin(2)">办公室机要</view>
			     <view class="demo-people-link" @click="demoLogin(3)">办公室初核</view>
			     <view class="demo-people-link" @click="demoLogin(4)">办公室主任</view>
			 </view>
		</view>
		 
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'O2OA',
				needLogin: false,
				loginMode: 'code', // code 短信验证登录 password 密码登录
				username: '', // 用户名
				password: '', // 密码
				code: "", // 验证码
				usernameFocus: false, 
				passwordFocus: false,
				codeFocus: false,
				sending: false, // 是否正在发送
				countDownTime: 60,
				getCodeText: '获取验证码',
				countDownFun: null,
				isSample: false // 是否是sample.o2oa.net服务器
			}
		},
		onLoad: function() {
			let o2server = this.o2.o2server
			if (o2server && o2server.centerHost === 'sample.o2oa.net') {
				this.isSample = true
			}else {
				this.isSample = false
			}
			this.o2.Actions.loadO2Distribute().then(res=> {
				console.log('加载distribute。。。。')
				// 检查登录情况
				let token = uni.getStorageSync(this.o2.config.tokenKey);
				if (token) {
					this.o2.Actions.load("x_organization_assemble_authentication").then(actions=> {
						var authentication = actions.AuthenticationAction
						return authentication.who()
					}).then(res => {
						if (res.data) {
							if (res.data.name === 'anonymous') {
								console.log('token过期')
								uni.removeStorageSync(this.o2.config.userKey)
								uni.removeStorageSync(this.o2.config.tokenKey)
								this.needLogin = true
							}else {
								uni.setStorageSync(this.o2.config.userKey, res.data)
								uni.setStorageSync(this.o2.config.tokenKey, res.data.token)
								this.gotoMain()
							}
						}else {
							console.log('无法获取认证信息！')
							this.needLogin = true
						}
					}).catch(err => {
						console.log(err)
						this.needLogin = true
					})
				}else {
					console.log('未登录')
					this.needLogin = true
				}
			}).catch(err => {
				console.log(err)
				// this.o2.toast('连接服务器失败！')
				uni.showModal({
				    title: '提示',
				    content: '连接服务器失败！',
					showCancel: false,
				    success: function (res) {
				        if (res.confirm) {
				            console.log('用户点击确定');
				        }
				    }
				});
			})
			
		},
		methods: {
			// 切换登录方式
			changeMode() {
				if (this.loginMode == 'code') {
					this.loginMode = 'password'
				}else {
					this.loginMode = 'code'
				}
			},
			// 获取验证码
			getCode() {
				let username = this.username;
				if (!username || username === '') {
					this.o2.toast('请先输入用户名或手机号码！')
					return
				}
				this.sending = true
				this.countDownTime--
				this.getCodeText = this.countDownTime + '秒后可重新获取'
				this.countDownFun = setInterval(()=> {
					this.countDownSendCode()
				}, 1000)
				this.o2.Actions.load("x_organization_assemble_authentication").then(actions => {
					return actions.AuthenticationAction.code(username)
				}).then(res => {
					this.o2.toast('验证码已经发送，请注意查收！')
				}).catch(err => {
					console.log(err)
					this.o2.toast('发送验证码失败！')
				})
			},
			// 验证码发送倒计时
			countDownSendCode() {
				if (this.countDownTime === 0) {
					this.countDownFun
					this.getCodeText = '获取验证码'
					this.countDownTime = 60
					this.sending = false
					if (this.countDownFun) {
						clearInterval(this.countDownFun)
						this.countDownFun = null
					}
				}else {
					this.sending = true
					this.countDownTime--
					this.getCodeText = this.countDownTime + '秒后可重新获取'
				}
			},
			// 点击登录
			login() {
				let username = this.username
				if (!username || username === '') {
					this.o2.toast('请先输入用户名或手机号码！')
					return
				}
				if (this.loginMode === 'code') {
					let code = this.code
					if (!code || code === '') {
						this.o2.toast('请先输入验证码！')
						return
					}
					this.o2.showLoading()
					this.o2.Actions.load("x_organization_assemble_authentication").then(actions => {
						let data = {
							credential: username,
							codeAnswer: code
						}
						return actions.AuthenticationAction.codeLogin(data)
					}).then(res => {
						this.o2.hideLoading()
						let user = res.data
						if (user.token && user.token != '') {
							uni.setStorageSync(this.o2.config.userKey, user)
							uni.setStorageSync(this.o2.config.tokenKey, user.token)
							this.gotoMain()
						}else {
							this.o2.toast('登录失败！')
						}
					}).catch(err => {
						console.log(err)
						this.o2.hideLoading()
					})
				}else {
					let password = this.password
					if (!password || password === '') {
						this.o2.toast('请先输入密码！')
						return
					}
					this.o2.showLoading()
					this.o2.Actions.load("x_organization_assemble_authentication").then(actions => {
						let data = {
							credential: username,
							password: password
						}
						return actions.AuthenticationAction.login(data)
					}).then(res => {
						this.o2.hideLoading()
						let user = res.data
						if (user && user.token && user.token != '') {
							uni.setStorageSync(this.o2.config.userKey, user)
							uni.setStorageSync(this.o2.config.tokenKey, user.token)
							this.gotoMain()
						}else {
							this.o2.toast(res.message || '登录失败！')
						}
					}).catch(err => {
						console.log(err)
						this.o2.hideLoading()
					})
				}
			},
			demoLogin(index) {
				var param = {};
				switch(index) {
					case 1:
					param = {
						credential: 'kf1',
						password: 'o2'
					  }
					  break
					case 2:
					param = {
						credential:'办公室机要',
						        password: 'o2'
					  }
					  break
					case 3:
					param = {
						credential:'办公室初核',
						        password: 'o2'
					  }
					  break
					case 4:
					param = {
						credential:'办公室主任',
						        password: 'o2'
					  }
					  break
				}
				this.o2.showLoading()
				this.o2.Actions.load("x_organization_assemble_authentication").then(actions => {
					let data = param
					return actions.AuthenticationAction.login(data)
				}).then(res => {
					this.o2.hideLoading()
					let user = res.data
					if (user && user.token && user.token != '') {
						uni.setStorageSync(this.o2.config.userKey, user)
						uni.setStorageSync(this.o2.config.tokenKey, user.token)
						this.gotoMain()
					}else {
						this.o2.toast(res.message || '登录失败！')
					}
				}).catch(err => {
					console.log(err)
					this.o2.hideLoading()
				})
			},
			gotoMain() {
				uni.reLaunch({
					url: '../index/index'
				})
			},
			bindUserNameFocus() {
				this.usernameFocus = true
				this.passwordFocus = false
				this.codeFocus = false
			},
			bindPasswordFocus() {
				this.usernameFocus = false
				this.passwordFocus = true
				this.codeFocus = false
			},
			bindCodeFocus() {
				this.usernameFocus = false
				this.passwordFocus = false
				this.codeFocus = true
			}
		}
	}
</script>

<style>
page {
	background-color: white;
	height: 100%;
}
button:after {  
	border: none;  
}
.status_bar {
	  height: var(--status-bar-height);
	  width: 100%;
  }
.content {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-left: 60rpx;
	padding-right: 60rpx;
}
.logo {
	margin-top: 200rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
	font-size: 36rpx;
}
.logo image {
	width: 156rpx;
	height: 156rpx;
}
.login-mode {
	height: 42rpx;
}
.login-mode .mode-sp {
	margin: 0 10rpx;
	font-size: 42rpx;
	line-height: 46rpx;
}
.login-mode .mode-text {
	color: #999999;
	font-size: 36rpx;
	line-height: 42rpx;
	cursor: pointer;
}
.login-mode .mode-active {
	color: #333333;
}
.form {
	margin: 36rpx;
	width: 100%;
}
.input {
	width: 100%;
	height: 50rpx;
	margin-top: 60rpx;
	border-bottom: 1rpx #EEEEEE solid;
	padding-bottom: 10rpx;
	font-size: 32rpx;
}
.code-input {
	width: 100%;
	height: 50rpx;
	margin-top: 60rpx;
}
.code-input input {
	border-bottom: 1rpx #EEEEEE solid;
	padding-bottom: 10rpx;
	height: 50rpx;
	font-size: 32rpx;
	width: 40%;
	float: left;
}
.code-input .code-btn {
	width: 50%;
	height: 60rpx;
	line-height: 60rpx;
	background-color: #fb4747;
	float: right;
	margin-top: 5rpx;
	margin-left: 30rpx;
	color: white;
	font-size: 32rpx;
}
.code-input .code-btn-sending {
	width: 50%;
	height: 60rpx;
	line-height: 60rpx;
	background-color: #c8c8c8;
	float: right;
	margin-top: 5rpx;
	margin-left: 30rpx;
	color: white;
	font-size: 32rpx;
}
.form .input-active {
  border-bottom: 1rpx #fb4747 solid;
}
.login-btn {
	width: 100%;
	height: 80rpx;
	line-height: 80rpx;
	background-color: #fb4747;
	color: white;
	font-size: 32rpx;
	border-radius: 20rpx;
	margin-top: 100rpx;
	text-align: center;
}
.login-demo-area {
	margin-top: 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.demo-people-link {
	color: #00c0fa;
    text-decoration: underline;
	margin-top: 20rpx;
}
</style>
