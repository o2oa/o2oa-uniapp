
var o2 = {
	config: {
		tokenKey: 'o2-token',
		userKey : 'o2-user',
		distributeKey: '02-distribute'
	},
	toast: function(message) {
		uni.showToast({
			title: message,
			icon: 'none'
		})
	},
	showLoading: function() {
		uni.showLoading({
			title: 'Loading...'
		})
	},
	hideLoading: function() {
		uni.hideLoading()
	},
	Actions : {
		/**
		 * 用Promise封装 request请求
		 * @param {Object} o2Req 
		 * 	{url: '', method: '', data: {}, header: {}}
		 */
		o2Request: function(o2Req) {
			return new Promise(function(resolve, reject) {
				uni.request({
					url: o2Req.url,
					method: o2Req.method,
					data: o2Req.data,
					header: o2Req.header,
					success: (res) => {
						if (o2Req.debug) {
							console.log(res)
						}
						if (res.statusCode === 500) {
							if (res.data && res.data.message) {
								o2.toast(res.data.message)
							}
							reject(res.data)
						}else {
							resolve(res.data)
						}
					},
					fail: (err) => {
						console.log(err)
						reject(err)
					}
				})
			})
		},
		/**
		 * 用Promise封装 上传文件的请求
		 * @param {Object} o2FileReq 
		 * 	{url: '', method: '',name: '', filePath: {}, data: {} }
		 */
		o2Upload: function(o2FileReq) {
			return new Promise(function(resolve, reject) {
				let token = uni.getStorageSync(o2.config.tokenKey);
				var header = {}
				if (token) {
					header['x-token'] = token
				}
				if (o2FileReq.method) {
					if (o2FileReq.method.toLowerCase() === 'put') {
						header['X-HTTP-Method-Override'] = 'PUT'
					}
					if (o2FileReq.method.toLowerCase() === 'delete') {
						header['X-HTTP-Method-Override'] = 'DELETE'
					}
				}
				console.log(header)
				uni.uploadFile({
					url: o2FileReq.url,
					filePath: o2FileReq.filePath,
					name: 'file', // o2FileReq.name todo目前都是file
					formData: o2FileReq.data,
					success: (res) => {
						if (o2FileReq.debug) {
							console.log(res)
						}
						if (res.statusCode === 500) {
							if (res.data && res.data.message) {
								o2.toast(res.data.message)
							}
							reject(res.data)
						}else {
							resolve(res.data)
						}
					},
					fail: (err) => {
						console.log(err)
						reject(err)
					}
				})
			})
		},
		o2Download: function(url) {
			let token = uni.getStorageSync(o2.config.tokenKey);
			var header = {}
			if (token) {
				header = {'x-token': token}
			}
			return new Promise(function(resolve, reject) {
				uni.downloadFile({
					url: url,
					header: header,
					success: (res) => {
						if (res.statusCode === 200) {
							resolve(res.tempFilePath)
						}else {
							reject(res.data? res.data : null)
						}
					},
					fail: (err) => {
						console.log(err)
						reject(err)
					}
				})
			})
		},
		'loadO2Distribute': function() {
			return new Promise(function(resolve, reject) {
				var o2req = {
					url : o2.Actions.getCenterUrl(),
					method: 'GET',
					header: {},
					data: {}
				}
				o2.Actions.o2Request(o2req).then(res => {
					if (res.data) {
						getApp().globalData.o2Distribute = res.data
						uni.setStorageSync(o2.config.distributeKey, res.data)
						resolve(true)
					}else {
						console.log('没有返回 distribute 数据！')
						reject('没有返回 distribute 数据！')
					}
				}).catch(err => {
					console.log(err)
					reject(err)
				})
			})
		},
		'loadedActions': {},
		'load': function(root) {
			return new Promise(function(resolve, reject) {
				if (o2.Actions.loadedActions[root]) {
					resolve(o2.Actions.loadedActions[root])
				}else {
					var moduleUrlBase = o2.Actions.getModuleHost(root)
					var url = moduleUrlBase + '/describe/api.json';
					var o2req = {
						url : url,
						method: 'GET',
						header: {},
						data: {},
						debug: false
					}
					o2.Actions.o2Request(o2req).then(json => {
						var jaxrs = json.jaxrs
						if (jaxrs) {
							var actionObj = {};
							for (var i = 0; i < jaxrs.length; i++) {
								var action = jaxrs[i]
								var methods = action.methods
								var actions = {};
								if (methods && methods.length){
									for (var j = 0; j < methods.length; j++) {
										var m = methods[j]
										var a = {'uri': moduleUrlBase + '/' + m.uri};
										if (m.method) a.method = m.method;
										if (m.enctype) a.enctype = m.enctype;
										// 创建一个可执行的方法，根据后台API名称执行后台api
										actions[m.name] = o2.Actions._createMethod(a);
									}
								}
								actionObj[action.name] = actions;
							}
							o2.Actions.loadedActions[root] = actionObj;
							resolve(actionObj)
						}else {
							console.log('load fail')
							reject('获取不到api 服务，' + root)
						}
					}).catch(err => {
						reject(err)
					})					
				}
			})
		},
		'getModuleHost': function(root) {
			var module = null
			if (getApp().globalData.o2Distribute) {
				module = getApp().globalData.o2Distribute.assembles[root]
			}else {
				var o2Distribute= uni.getStorageSync(o2.config.distributeKey)
				if (o2Distribute) {
					getApp().globalData.o2Distribute = o2Distribute
					module = o2Distribute.assembles[root]
				}
			}
			if (module) {
				var o2server = getApp().globalData.o2server
				return o2server.httpProtocol + '://' + module['host'] + ':' + module['port']+ module['context'];	
			}else {
				return null
			}
		},
		getWebBaseUrl: function () {
			if (getApp().globalData.o2Distribute) {
				let o2server = getApp().globalData.o2server
				let webServer = getApp().globalData.o2Distribute.webServer
				return o2server.httpProtocol + "://" + webServer["host"] + ":" + webServer["port"]
			} else {
				return null
			}
		},
		'getCenterUrl' : function() {
			var o2server = getApp().globalData.o2server
			return o2server.httpProtocol + '://' + o2server.centerHost + ':' + o2server.centerPort + o2server.centerContext + '/jaxrs/distribute/webserver/assemble/source/' + o2server.centerHost;
		},
		_createMethod: function(service){
			var jaxrsUri = service.uri;
			var re = new RegExp('\{.+?\}', 'g');
			var replaceWords = jaxrsUri.match(re);
			var parameters = [];
			if (replaceWords) parameters = replaceWords.map(function(s){
				return s.substring(1,s.length-1);
			});
	
			return o2.Actions._invokeFunction(service, parameters);
		},
		// 执行后台api的函数， 如：actions.AttachmentAction.get(id) 返回Promise 
		// 参数顺序 path参数、data参数、file参数、debug
		_invokeFunction: function(service, parameters) {
			return function() {
				var i = parameters.length-1;
				// arguments 传入的参数，参数有多个 由uri中path参数，form表单参数，file文件参数等
				var n = arguments.length; // 参数个数
				var functionArguments = arguments;
				var parameter = {};
				var data = {};
				var file = null;
				var debug = false
				// if (typeOf(functionArguments[0])==="function"){ //第一个参数是否是function ？
				// 	i=-1;
				// 	success = (n>++i) ? functionArguments[i] : null;
				// 	failure = (n>++i) ? functionArguments[i] : null;
				// 	parameters.each(function(p, x){
				// 		parameter[p] = (n>++i) ? functionArguments[i] : null;
				// 	});
				// 	if (service.method && (service.method.toLowerCase()==="post" || service.method.toLowerCase()==="put")){
				// 		if ((!service.enctype) || service.enctype.toLowerCase()!=="formdata"){
				// 			data = (n>++i) ? functionArguments[i] : null;
				// 		}else{
				// 			data = (n>++i) ? functionArguments[i] : null;
				// 			file = (n>++i) ? functionArguments[i] : null;
				// 		}
				// 	}
				// 	debug = (n>++i) ? functionArguments[i] : false;
				// }else{
					for (var pi = 0; pi < parameters.length; pi++) {
						parameter[parameters[pi]] = (n>pi) ? functionArguments[pi] : null;
					}
					// parameters.each(function(p, x){
					// 	parameter[p] = (n>x) ? functionArguments[x] : null;
					// });
					if (service.method && (service.method.toLowerCase()==='post' || service.method.toLowerCase()==='put')){
						if ((!service.enctype) || service.enctype.toLowerCase()!=='formdata'){
							data = (n>++i) ? functionArguments[i] : null;
						}else{
							data = (n>++i) ? functionArguments[i] : null;
							file = (n>++i) ? functionArguments[i] : null;
						}
					}
					// success = (n>++i) ? functionArguments[i] : null;
					// failure = (n>++i) ? functionArguments[i] : null;
					debug = (n>++i) ? functionArguments[i] : false;
				// }
				// 返回一个Promise对象
				var url = service.uri
				if (parameter){
					for (var key in parameter) {
						var reg = new RegExp('{'+key+'}', 'g');
						url = url.replace(reg, encodeURI(parameter[key]));
					}
				}
				if (file) { //有file 表示是上传文件类型的请求
					console.log('上传文件')
					console.log(file)
					var o2FileReq = {
						url : url,
						method: service.method,
						data: data,
						filePath: file, //文件路径
						debug: debug
					}
					return o2.Actions.o2Upload(o2FileReq)
				}else {
					// 当前登录用户的token 需要在登录成功后设置
					let token = uni.getStorageSync(o2.config.tokenKey);
					var header = {}
					if (token) {
						header = {'x-token': token}
					}
					var o2req = {
						url : url,
						method: service.method,
						header: header,
						data: data,
						debug: debug
					}
					return o2.Actions.o2Request(o2req)
				}
			}
		}
		
	}
};


module.exports = {
	o2: o2
}