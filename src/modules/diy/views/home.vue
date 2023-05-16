<template>
	<section class="customer-home-page" :style="`background-color:${jsonStruct.backgroundColor};padding-bottom:${jsonStruct.showTabBar ? '50px' : '0px'}`">
		<Renderer v-for='(comp,i) of jsonStruct.params' :comp="comp" :key="'comp_'+i" :slot-data="slotData" :jsCompleted="jsCompleted"></Renderer>	
		<div class="safe-area-inset"></div>
		<TabBar v-if="jsonStruct.showTabBar" :pageConf="jsonStruct" :is-home-page="pageInfo.isHomePage" :appId="pageInfo.appId" />
	</section>
</template>
<script>
import Renderer from '../components/home-page-design/Renderer'
import TabBar from '../components/TabBar.vue'
import { GET_PAGE_CONFIG } from '../api'
export default {
	components:{
		Renderer,
		TabBar
	},
	beforeRouteEnter(to,from,next){
		next(vm=>{
			vm.pageId = to.params.id
			vm.dataInit()
		})
	},
	beforeRouteUpdate (to, from, next) {
		this.pageId = to.params.id
		this.dataInit()
		next()
	},
	data(){
		return {
			pageId:'',
			slotData:{},
			jsonStruct:{},
			jsCode:'',
			cssCode:'',
			elements:{},
			initCompleted:false,
			jsCompleted:false,
		}
	},
	mounted(){
		this.miniappInit()
	},
	methods:{
		async dataInit(){
			this.initCompleted=false
			this.jsonStruct={}
			this.elements={}

			let htmlJson = {}
			
			this.$toast.loading()
			try{
				let res = await this.$requestJson.post(GET_PAGE_CONFIG,{id:this.pageId})
				if (res.data.htmlJson) {
					htmlJson = JSON.parse(res.data.htmlJson)
					this.jsonStruct = htmlJson
					console.log(this.jsonStruct)
				}
				this.jsCode = res.data.js
				this.cssCode = res.data.css
				this.pageInfo = res.data
				document.title = this.pageInfo.pageName
			}
			finally{
				setTimeout(() => {
					this.$toast.clear()    
				}, 0)
			}            
			
			this.initCompleted=true
			//让界面先渲染再加载js，否则js有问题会影响整个界面渲染失败，白屏
			if(this.cssCode){
				let ele = document.createElement('style')
				ele.type = "text/css"
				ele.innerHTML = this.cssCode
				document.documentElement.appendChild(ele)
				this.elements.css = ele
			}
			if(this.jsCode){
				//默认加载jquery
				let eleJq = document.createElement('script')
				eleJq.src = 'jquery-3.1.0.js'
				document.documentElement.appendChild(eleJq)
				await (new Promise((res,rej)=>{
					eleJq.onload=()=>{
						this.elements.jquery=eleJq
						res()
					}
				}))
				//jquery加载成功才加载js
				let ele = document.createElement('script')
				ele.type = "text/javascript";
				ele.innerHTML = this.jsCode
				document.documentElement.appendChild(ele)
				this.jsCompleted = true
				this.elements.js = ele
				

				

				if (this.jsonStruct.initFunc && typeof window[this.jsonStruct.initFunc] === "function") {
					let userInfo = this.$store.state.userInfo
					let userId = userInfo ?userInfo.userId:''
					let code = userInfo ?userInfo.userTicket:''
					let state = this.$utils.getQueryByName('state')
					let payload = {userId:userId,state,code:code}
					window[this.jsonStruct.initFunc](res => { this.slotData = res }, payload)
				}
				
			}
		},
		miniappInit(){
			let _this = this
			window.miniapp={}
			miniapp.toast = function(message,duration=3000){
				_this.$toast({message,duration})
			}
			miniapp.showLoading = function(forbidClick = false){
				_this.$toast.loading({
					duration: 0,
					forbidClick
				})
			}
			miniapp.hideLoading = function(){
				_this.$toast.clear()
			}
			miniapp.pushPage = function(pageUrl){
				if(pageUrl&&pageUrl.startsWith("/")){
					_this.$router.push(pageUrl)
				}
			}
			miniapp.goHomePage = function(pageId,query,isReplace=false){
				if(!isReplace){
					_this.$router.push({name:'diy-home',params:{id:pageId},query})
				}
				else{
					_this.$router.replace({name:'diy-home',params:{id:pageId},query})
				}
			}
			miniapp.replacePage = function(pageUrl){
				if(pageUrl&&pageUrl.startsWith("/")){
					_this.$router.replace(pageUrl)
				}
			}
			miniapp.location = function(){
				return { params:_this.$route.params,query:_this.$route.query}
			}
			miniapp.setData = function(key, val){
				_this.slotData[key] = val
			}
		}
	},
	beforeRouteLeave(to,from,next){
		//移除所有动态添加的元素
		Object.keys(this.elements).forEach(key=>{
			if(this.elements[key]){
				this.elements[key].remove()
			}
		})
		next()
	}
}
</script>
<style scoped lang='stylus'>
.customer-home-page{
  width:100%;
  min-height:100%;
	box-sizing: border-box;
}
</style>