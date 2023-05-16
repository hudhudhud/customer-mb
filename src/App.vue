<template>
	<div id="app">
		<keep-alive>
			<router-view v-if="$route.meta.keepalive" />
		</keep-alive>
		<router-view v-if="!$route.meta.keepalive" />
	</div>
</template>
<script>
	export default {
		name: 'App',
		mounted() {
			//判断是否需要水印
			this.doWaterMark()

			//链接中带vcon 开启vconsole
			if(this.$utils.getQueryByName('vcon')){                
				this.addVconsole()
			}
		},
		watch: {
			$route(to, from) {
				document.title = to.meta.title
				//判断是否需要水印
				this.doWaterMark()
			}
		},
		methods: {
			waterMark(mark) {
				if (document.getElementById('shuiyin')) {
						return
				}

				function textBecomeImg(text, fontsize, fontcolor) {
						var canvas = document.createElement("canvas");
						var a = 0;
						if (fontsize <= 32) {
								a = 99;
						} else if (fontsize > 32 && fontsize <= 60) {
								a = 2;
						} else if (fontsize > 60 && fontsize <= 80) {
								a = 4;
						} else if (fontsize > 80 && fontsize <= 100) {
								a = 6;
						} else if (fontsize > 100) {
								a = 10;
						}
						canvas.height = fontsize + a;
						canvas.padding = 30;
						var context = canvas.getContext("2d");
						context.clearRect(0, 0, canvas.width * 2, canvas.height);
						context.fillStyle = fontcolor;
						context.font = "100 " + fontsize + "px PingFangSC-Light, sans-serif"; //Arial
						context.textAlign = "center";
						context.textBaseline = "middle";
						context.fillText(text, 0, fontsize / 2);
						var canvasWidth = canvas.width / 99;
						canvasWidth = context.measureText(text).width;
						canvas.width = 200;
						canvas.height = 120;
						context.fillStyle = fontcolor;
						context.font = "100 " + fontsize + "px PingFangSC-Light, sans-serif";
						context.textBaseline = "middle";
						context.fillText(text, 0, fontsize / 2);
						var dataUrl = canvas.toDataURL("image/png");
						return dataUrl;
				}
				var text = mark;
				var shuiyinDiv = document.createElement("div");
				var style = shuiyinDiv.style;
				shuiyinDiv.setAttribute('id', 'shuiyin')
				style.position = "fixed";
				style.left = 0;
				style.top = 0;
				style.width = "100%";
				style.height = "100%";
				style.opacity = "0.5";
				style.background = "url(" + textBecomeImg(text, 14, "#C2C2C7") + ")"; //#C2C2C7
				style.zIndex = 9999999991;
				style.transform = "rotate(-30deg)";
				style.pointerEvents = "none";
				document.body.appendChild(shuiyinDiv);
			},
			doWaterMark() {
				if (this.$route.meta.waterMark) {
					let user = this.$store.state.userInfo
					if (user) {
							this.waterMark((user.userName ? user.userName + ' ' : ' ') + user.userId)
					}
				} else {
					let ele = document.getElementById('shuiyin')
					if (ele) {
							ele.remove()
					}
				}
			},
			//开放vconsole
			addVconsole(){
				try{
					if(window.vConsole)return
					let ele = document.createElement('script')
					ele.setAttribute ('type','text/javascript')
					ele.onload=function(){
							window.vConsole = new window.VConsole();
					}
					ele.setAttribute('src','vconsole.min.js')
					if(typeof document.body.append == 'function'){
							document.body.append(ele)
					}
				}
				catch(e){}
			}
		}
	}
</script>

<style lang="stylus">
	@import "./stylus/index.styl"
	// 安全区域距离底部边界距离，大约高度为34px
	.safe-area-inset {
		display: block;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		background-color inherit;
	}
	#app,
	html,
	body {
		height: 100%;
	}
</style>