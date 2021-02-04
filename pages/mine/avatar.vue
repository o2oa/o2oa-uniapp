<!-- 
思路:
	1.整体分三个canvas(画布),通过绝对定位相互重叠.
	2.裁剪框画布: 在最上层,通过坐标位置绘制一个方形框.因为框的外边事半透明的,可以分成4快矩形区,分别通过坐标在4个区域画上半透明的矩形.
	3.原图画布: 在裁剪框画布的下层,根据大小直接在画布上绘制图片.
	4.裁剪后的预览图画布: 在最下层和最上层之间切换.
	一.通过手指在选框上坐标的相对变化,修改原图画布中图片的大小,坐标和角度.
	二.每次变换保证原图画布中的原点在图片的中心.


-->
<template >
	<view>
		<!-- 原图 -->
		<canvas canvas-id="avatar-canvas" class="my-canvas" :style="{ height: csH + 'px'}" disable-scroll="false"></canvas>
		<!-- 选框 -->
		<canvas canvas-id="oper-canvas" class="oper-canvas" :style="{height: csH + 'px'}" disable-scroll="false" @touchstart="fStart" @touchmove="fMove" @touchend="fEnd"></canvas>
		<!-- 预览画布 -->
		<canvas canvas-id="prv-canvas" class="prv-canvas " :class="{'zin': iszin}" :style="{height: csH + 'px'}" disable-scroll="false" @touchstart="fHideImg" ></canvas>

		<view class="oper-wrapper" >
			<button v-if="sO" @click="fPreview()" size="mini"><text>裁剪</text></button>
			<button v-if="!sO" @click="fPrvUpload()" type="warn" size="mini">提交<text></text></button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				iszin: false,
				sO: true,//按钮切换
				mnScale: 0.3,//缩放允许的最小比例，默认0.3
				mxScale: 4,
				fType: 'png',//报错图片格式，jpg或png，默认png。
				qlty: 1,//生成图片质量，取值范围0~1，默认1
				wW: 0,
				wH: 0,
				csH: 0,//画布高度
				cc: null,
				cco: null,
				ccp: null,
				imgWidth: 0,//传入图片当前的宽度
				imgHeight: 0,//传入图片当前高
				imgPath: '',//图片地址
				imgRadio: 1,//图片宽高比例(宽/高)
				sS: {//裁剪框参数
					width: 200,//裁剪框大小
					height: 200,//裁剪框大小
					top: 0,//裁剪框屏幕中的位置
					left: 0//裁剪框屏幕中的位置
				},
				posHeight: 0,//原点位置
				posWidth: 0,//原点位置
				scaleSize: 1,//当前缩放比例
				rotateDeg: 0,//当前旋转角度
				prvX: 0,//预览图坐标
				prvY: 0,//预览图坐标
				prvWidth: 0,//预览图大小
				prvHeight: 0,//预览图大小
				touch0: {},//触摸移动参数
				touch1: {},//触摸移动参数(两个都有值的话是)
				fgDistance: 1,//两指间距
				prvImgData:[]//预览图的像素点的rgba
			};
		},
		onLoad: function (options) {
			//初始化参数
			var width = options.width || 100
			var height = options.height || 100
			this.imgPath = options.imgPath;
			this.imgRadio = width / height;
			this.wW = uni.getSystemInfoSync().windowWidth;
			this.wH = uni.getSystemInfoSync().windowHeight;
			this.csH = uni.getSystemInfoSync().windowHeight - 50;
			this.sS.top = (uni.getSystemInfoSync().windowHeight - this.sS.width - 50) / 2;
			this.sS.left = (uni.getSystemInfoSync().windowWidth - this.sS.height) / 2;
			if (this.imgRadio < 1) {
				this.imgWidth = this.sS.width;
				this.imgHeight = this.sS.width / this.imgRadio;
			}else{
				this.imgHeight = this.sS.height;
				this.imgWidth = this.sS.height * this.imgRadio;
			}
			this.posWidth = this.sS.left+this.sS.width/2;
			this.posHeight = this.sS.top+this.sS.height/2;
			this.cc = uni.createCanvasContext('avatar-canvas')
			this.cco = uni.createCanvasContext('oper-canvas')
			this.ccp = uni.createCanvasContext('prv-canvas')
		},
		onReady: function(){
			this.tailoringBox();
			this.fDrawImage();
		},
		methods: {
			//绘图(放裁剪框的那一层)
			tailoringBox: function(){
				//开始
				this.cco.beginPath();//开始创建一个路径，需要调用fill或者stroke才会使用路径进行填充或描边。
				//画裁剪框
				this.cco.setLineWidth(1);//设置线条的宽度。
				this.cco.setGlobalAlpha(0.5);//设置全局画笔透明度。
				this.cco.setStrokeStyle('white');//设置边框颜色。如果没有设置 fillStyle，默认颜色为 black。
				this.cco.strokeRect(this.sS.left, this.sS.top, this.sS.width, this.sS.height);//画一个矩形(非填充),
				//填充裁剪框外边
				this.cco.setFillStyle('black');//设置填充色，如果没有设置 fillStyle，默认颜色为 black。
				this.cco.setGlobalAlpha(0.5);
				this.cco.fillRect(0, 0, this.wW, this.sS.top);//填充一个矩形。
				this.cco.fillRect(0, this.sS.top, this.sS.left, this.sS.height);
				this.cco.fillRect(0, this.sS.top + this.sS.height, this.wW, this.csH - this.sS.height - this.sS.top);
				this.cco.fillRect(this.sS.left + this.sS.width, this.sS.top, this.wW - this.sS.width - this.sS.left, this.sS.height);
				//关闭一个路径。
				this.cco.closePath()
				//画圆
				// this.cco.beginPath();
				// this.cco.arc(this.sS.width/2 + this.sS.left, this.sS.top + this.sS.height/2, this.sS.width/2, 0, 2 * Math.PI)
				// this.cco.setFillStyle('#EEEEEE')
				//画出当前路径的边框。默认颜色色为黑色。
				this.cco.stroke();
				//将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中。
				this.cco.draw(false);
			},
			//绘图(放传如图片的那一层)
			fDrawImage: function() {
				//填充一个矩形。
				this.cc.fillRect(0, 0, this.wW, this.csH);
				//将原点设为图片的中心
				this.cc.translate(
					this.posWidth , 
					this.posHeight 
				);//对当前坐标系的原点(0, 0)进行变换，默认的坐标系原点为页面左上角。
				this.cc.rotate(this.rotateDeg * Math.PI / 180);//以原点为中心，原点可以用 translate方法修改。顺时针旋转当前坐标轴。多次调用rotate，旋转的角度会叠加。
				this.cc.drawImage(
					this.imgPath, 
					-this.imgWidth/2 * this.scaleSize, 
					-this.imgHeight/2 * this.scaleSize,
					this.imgWidth * this.scaleSize, 
					this.imgHeight * this.scaleSize
				);//绘制图像到画布。
				this.cc.draw(false);
			},
			//点击预览(绘制预览的图)
			fPreview: function() {
				let _this = this;
				uni.canvasToTempFilePath({
					x: this.sS.left,
					y: this.sS.top,
					width: this.sS.width,
					height: this.sS.height,
					canvasId: 'avatar-canvas',
					fileType: this.fType,
					quality: this.qlty,
					success: (r) => {
						this.sO = false; 
						this.iszin = true;
						
						this.ccp.fillRect(0, 0, this.wW, this.csH);
						this.prvX = 0,//预览图坐标
						this.prvY = (this.csH - this.wW/(this.sS.width/this.sS.height))/2,//预览图坐标
						this.prvWidth = this.wW,//预览图大小
						this.prvHeight = this.wW/(this.sS.width/this.sS.height),//预览图大小
						this.ccp.drawImage(r.tempFilePath, this.prvX, this.prvY, this.prvWidth, this.prvHeight);
						this.ccp.draw(false,() => {
							// this.fGetImgData();
						});
					}
				});
			},
			//手指触摸动作开始
			fStart: function(e) {
				let touch0 = this.touch0 = e.touches[0];
				let	touch1 = this.touch1 = e.touches[1];
				if (touch1) {//双指(放大)
					let x = touch1.x - touch0.x;
					let	y = touch1.y - touch0.y;
					this.fgDistance = Math.sqrt(x * x + y * y);//平方根计算(两指间距离)
				}
			},
			//手指触摸后移动
			fMove: function(e) {
				let touch0 = e.touches[0];
				let touch1 = e.touches[1];
				if (touch1) {//双指(放大)
					let x = touch1.x - touch0.x;
					let y = touch1.y - touch0.y;
					let newfgDistance = Math.sqrt(x * x + y * y);
					let newscaleSize = 0.005 * (newfgDistance - this.fgDistance);
					let beScaleSize = this.scaleSize + newscaleSize;
					if (beScaleSize < this.mnScale) return;
					if (beScaleSize > this.mxScale) return;
					this.scaleSize = beScaleSize;
					this.fgDistance = newfgDistance;
					if (touch1.x !== touch0.x ) {
						x = (this.touch1.y - this.touch0.y) / (this.touch1.x - this.touch0.x);
						y = (touch1.y - touch0.y) / (touch1.x - touch0.x);
						this.rotateDeg += Math.atan((y - x) / (1 + x * y)) * 180 / Math.PI;
						this.touch0 = touch0;
						this.touch1 = touch1;
					}
				}else{//单指(平移)
					let x = touch0.x - this.touch0.x;
					let y = touch0.y - this.touch0.y;
					if(Math.abs(x) < 100) {
						this.posWidth = this.posWidth + x
					};
					if(Math.abs(y) < 100) {
						this.posHeight = this.posHeight + y
					};
					this.touch0 = touch0;
				}
				//重画
				this.fDrawImage();
			},
			//手指触摸动作结束
			fEnd: function(e) {
				let touch0 = e.touches && e.touches[0];
				let	touch1 = e.touches && e.touches[1];
				if (touch0) {
					this.touch0 = touch0;
				} else {
					this.touch0 = null;
					this.touch1 = null;
				}
			},
			//预览后剪切
			fPrvUpload: function() {
				uni.canvasToTempFilePath({
					x: this.prvX,
					y: this.prvY,
					width: this.prvWidth,
					height: this.prvHeight,
					canvasId: 'prv-canvas',
					fileType: this.fType,
					quality: this.qlty,
					success: (r) => {
						console.log(r.tempFilePath)
						this.o2.showLoading()
						this.o2.Actions.load('x_organization_assemble_personal').then(actions => {
							return actions.PersonAction.setIcon({}, r.tempFilePath, true)
						}).then(res => {
							this.o2.hideLoading()
							uni.$emit("upAvatar",{url:r.tempFilePath})
							uni.navigateBack();
						})
						//请求更新头像接口
						// uni.uploadFile({
						// 	url: 'https://www.example.com/upload', //仅为示例，非真实的接口地址
						// 	filePath: r.tempFilePath,
						// 	name: 'file',
						// 	formData: {
						// 		'user': 'test'
						// 	},
						// 	success: (uploadFileRes) => {
								
						// 	}
						// });
					}
				});
			},
			//隐藏预览画布
			fHideImg: function() {
				this.sO = true;
				this.iszin = false;
			},
			
			fGetImgData: function() {
				let _this = this;
				uni.canvasGetImageData({
					canvasId: 'prv-canvas',
					x: this.prvX,
					y: this.prvY,
					width: this.prvWidth,
					height: this.prvHeight,
					success(res) {
						_this.prvImgData = new Uint8ClampedArray(res.data);
					}
				});
			},
			/**
			 * 素描效果
			 * 1.原图取色,得A图
			 * 2.A图取相反色,得B图
			 * 3.B图高斯模糊，得C图
			 * 4.A图C图进行颜色减淡
			 * （js中数组操作，通过路劲映射，改变的是原值，需要拷贝）
			 */
			sketch: function(pixes){
				let discolorDate = this.discolor(pixes);//去色
				let invertDate = this.invert(discolorDate);//相反
				let gaussBlurDate = this.gaussBlur(invertDate,this.prvWidth,this.prvHeight,3.0,3/3);
				let newImgDate = this.dodgeColor(discolorDate,gaussBlurDate);
				return newImgDate;
			},
			/**
			 * 把图像变成黑白色
			 * 去色只要把每个像素的R、G、B设为亮度（Y）的值就行了。公式：Y = 0.299R + 0.587G + 0.114B。
			 */
			discolor: function(pixes) {
				let newPixes = new Uint8ClampedArray(pixes);
				let grayscale;
				for (let i = 0, len = newPixes.length; i < len; i += 4) {
					grayscale = newPixes[i] * 0.299 + newPixes[i + 1] * 0.587 + newPixes[i + 2] * 0.114;
					newPixes[i] = newPixes[i + 1] = newPixes[i + 2] = grayscale;
				}
				return newPixes;
			},
			/**
			 * 把图片反相, 即将某个颜色换成它的补色(补色就是用255（8位通道模式下，255即2的8次方，16位要用65535去减，即2的16次方）减去它本身得到的值：R(补) = 255 – R。)
			 */
			invert: function(pixes) {
				let newPixes = new Uint8ClampedArray(pixes);
				for (let i = 0, len = newPixes.length; i < len; i += 4) {
					newPixes[i] = 255 - newPixes[i]; //r
					newPixes[i + 1] = 255 - newPixes[i + 1]; //g
					newPixes[i + 2] = 255 - newPixes[i + 2]; //b
				}
				return newPixes;
			},
			/**
			 * 颜色减淡,
			 * 结果色 = 基色 + (混合色 * 基色) / (255 - 混合色)
			 */
			dodgeColor: function(basePixes, mixPixes) {
				let newPixes = new Uint8ClampedArray(basePixes);
				
				for (let i = 0, len = newPixes.length; i < len; i += 4) {
					newPixes[i] = newPixes[i] + (newPixes[i] * mixPixes[i]) / (255 - mixPixes[i]);
					newPixes[i + 1] = newPixes[i + 1] + (newPixes[i + 1] * mixPixes[i + 1]) / (255 - mixPixes[i + 1]);
					newPixes[i + 2] = newPixes[i + 2] + (newPixes[i + 2] * mixPixes[i + 2]) / (255 - mixPixes[i + 2]);
				}
				return newPixes;
			},
			/**
			 * 高斯模糊
			 * @param  {Array} pixes  pix array
			 * @param  {Number} width 图片的宽度
			 * @param  {Number} height 图片的高度
			 * @param  {Number} radius 取样区域半径, 正数, 可选, 默认为 3.0
			 * @param  {Number} sigma 标准方差, 可选, 默认取值为 radius / 3
			 * @return {Array}
			 */
			gaussBlur: function(pixes, width, height, radius, sigma) {
				let newPixes = new Uint8ClampedArray(pixes);
				let gaussMatrix = [],
					gaussSum = 0,
					x, y,
					r, g, b, a,
					i, j, k, len;
				radius = Math.floor(radius) || 3;
				sigma = sigma || radius / 3;
				
				a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
				b = -1 / (2 * sigma * sigma);
				//生成高斯矩阵
				for (i = 0, x = -radius; x <= radius; x++, i++){
					g = a * Math.exp(b * x * x);
					gaussMatrix[i] = g;
					gaussSum += g;
				
				}
				//归一化, 保证高斯矩阵的值在[0,1]之间
				for (i = 0, len = gaussMatrix.length; i < len; i++) {
					gaussMatrix[i] /= gaussSum;
				}
				//x 方向一维高斯运算
				for (y = 0; y < height; y++) {
					for (x = 0; x < width; x++) {
						r = g = b = a = 0;
						gaussSum = 0;
						for(j = -radius; j <= radius; j++){
							k = x + j;
							if(k >= 0 && k < width){//确保 k 没超出 x 的范围
								//r,g,b,a 四个一组
								i = (y * width + k) * 4;
								r += newPixes[i] * gaussMatrix[j + radius];
								g += newPixes[i + 1] * gaussMatrix[j + radius];
								b += newPixes[i + 2] * gaussMatrix[j + radius];
								gaussSum += gaussMatrix[j + radius];
							}
						}
						i = (y * width + x) * 4;
						// 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
						// console.log(gaussSum)
						newPixes[i] = r / gaussSum;
						newPixes[i + 1] = g / gaussSum;
						newPixes[i + 2] = b / gaussSum;
					}
				}
				//y 方向一维高斯运算
				for (x = 0; x < width; x++) {
					for (y = 0; y < height; y++) {
						r = g = b = a = 0;
						gaussSum = 0;
						for(j = -radius; j <= radius; j++){
							k = y + j;
							if(k >= 0 && k < height){//确保 k 没超出 y 的范围
								i = (k * width + x) * 4;
								r += newPixes[i] * gaussMatrix[j + radius];
								g += newPixes[i + 1] * gaussMatrix[j + radius];
								b += newPixes[i + 2] * gaussMatrix[j + radius];
								// a += pixes[i + 3] * gaussMatrix[j];
								gaussSum += gaussMatrix[j + radius];
							}
						}
						i = (y * width + x) * 4;
						newPixes[i] = r / gaussSum;
						newPixes[i + 1] = g / gaussSum;
						newPixes[i + 2] = b / gaussSum;
					}
				}
				return newPixes;
			},			
			/**
			 * 黑白效果(灰度图)
			 */
			grayScale: function(pixes) {
				let newPixes = new Uint8ClampedArray(pixes);
				for(let i = 0, len = newPixes.length; i < len; i += 4){
				    /*加权平均数
				    var average = (newPixes[i]*0.3+newPixes[i+1]*0.6+newPixes[i+2]*0.1)/3;
				    */
				    let average = (newPixes[i]+newPixes[i+1]+newPixes[i+2])/3;
				    newPixes[i] = average;
				    newPixes[i+1] = average;
				    newPixes[i+2] = average;
				}
				return newPixes;
			},
			/**
			 * 调亮度
			 */
			brightness: function(pixes,x) {
				for(let i = 0, len = pixes.length; i < len; i += 4){
				    var x = 20;
				    pixes[i] += x;
				    pixes[i+1] += x;
				    pixes[i+2] += x;
				}
				return pixes;
			},						
			/**
			 * 透明效果
			 */
			transparent: function(pixes,x) {
				for(let i = 0, len = pixes.length; i < len; i += 4){
				    pixes[i+3] = pixes[i+3]*x;
				}
			},                
			
			
			//直接剪切
			// fUpload() {
			// 	uni.canvasToTempFilePath({//把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径
			// 		x: this.sS.left,//画布x轴起点（默认0）
			// 		y: this.sS.top,//画布y轴起点（默认0）
			// 		width: this.sS.width,//画布宽度（默认为canvas宽度-x）
			// 		height: this.sS.height,//画布高度（默认为canvas高度-y）
			// 		// destWidth: expWidth,//输出图片宽度（默认为 width * 屏幕像素密度）
			// 		// destHeight: expHeight,//输出图片宽度（默认为 width * 屏幕像素密度）
			// 		canvasId: 'avatar-canvas',//画布标识，传入 <canvas/> 的 canvas-id（支付宝小程序是id、其他平台是canvas-id）
			// 		fileType: this.fType,//目标文件的类型，只支持 'jpg' 或 'png'。默认为 'png'
			// 		quality: this.qlty,//图片的质量，取值范围为 (0, 1]，不在范围内时当作1.0处理
			// 		success: (r) => {
			// 			console.log(r.tempFilePath)
			// 		}
			// 	});
			// },
			
		}
	}
</script>

<style>
	.my-canvas {
		bottom: 50px;
		position: fixed;
		left: 0;
		z-index: 2;
		width: 100%;
	}
	.oper-canvas {
		bottom: 50px;
		position: fixed;
		left: 0;
		z-index: 3;
		width: 100%;
	}
	.prv-canvas {
		bottom: 50px;
		position: fixed;
		left: 0;
		z-index: 1;
		width: 100%;
	}
	.zin{
		z-index: 4;
	}
	.oper-wrapper {
		position: fixed;
		display: flex;
		flex-direction: row;
		/* justify-content: flex-start; */
		align-items: center;
		/* padding: 10rpx 20rpx; */
		/* padding-left: 20rpx;
		padding-right: 20rpx; */
		height: 50px;
		background: #fffbed;
		width: 100%;
		left: 0;
		bottom: 0;
		z-index: 5;
	}
	.btn-wrapper {
		/* display: flex;
		flex-direction: row;
		flex-grow: 1;
		justify-content: space-between; */
	}

</style>
