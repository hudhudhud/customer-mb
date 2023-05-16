<template>
	<section class="swiper-wrapper" :style="{...compStyle,'height':height}" ref="swiper-wrapper" v-if="list&&list.length">
		<swiper :options="swiperOption" :key="swiperKeyReal">
			<swiper-slide class="swiperchild" v-for='(item,index) in list' :key='index'>
				<template v-if='item!==null && typeof item == "object"'>
					<img v-if="item.src" :src='item.src' :id="index"/>
					<div v-else :class="`default-img${index%3} default-img`" />
					<div v-if="item.title" class="swiper-title-wrapper">
						<span class="swiper-title">{{item.title}}</span>
					</div>
				</template>
				<img v-else :src='item'/>
			</swiper-slide>	
		</swiper>
		<div :class="`swiper-pagination swiper-pagination-${swiperKeyReal}`"></div>
	</section>
</template>
<script>
import common from '../../../mixin/common'
import "swiper/dist/css/swiper.css";
import { swiper, swiperSlide } from "vue-awesome-swiper";
export default {
	components:{
		swiper,
		swiperSlide
	},
	props: ["itemDef", "slotData"],
	mixins: [common],
	watch:{
		list:{
			handler(){
				this.$nextTick(()=>{
					if (this.$refs['swiper-wrapper']) {
						this.height =  (this.$refs['swiper-wrapper'].clientWidth * this.itemDef.imgHeight / 375) +'px' //按比例缩放
					}
				})
				//轮播循环模式，第一个切换到最后一个事件失效
				let _this = this
				this.swiperOption.on = {
					click(e){
						if(e.target.id){
							let index = e.target.id
							_this.clickHandler(e, _this.list[index])
						}
					}
				}
			},
			deep:true,
			immediate:true,
		},
		swiperKey:{
			handler(val){
				this.swiperOption.pagination.el = '.swiper-pagination-' + val
				this.swiperKeyReal = val
			},
			immediate:true,
		}
	},
	computed:{
		list(){
			let res = []
			if (this.itemDef.isSlot) {
        res = this.slotData[this.itemDef.slotKey]
				// 对象数组
        if(res && res.length && this.$utils.isObject(res[0])){
					res = res.map(it=>{
						return {
							title: it[this.itemDef.slotKeyTitle],
							src: it[this.itemDef.slotKeyImg]
						}
					})
        }
      } else {
        res = this.itemDef.options
      }
			return res
		}
	},
	data(){
		return {
			swiperKey: Date.now().toString(),/*随机的key,用于swiper重新渲染*/
			swiperKeyReal:'',
			swiperOption:{
				direction: "horizontal",
				autoplay: this.itemDef.autoplay ? {delay:this.itemDef.delay*1000} : this.itemDef.autoplay,
				loop: typeof this.itemDef.loop == "boolean" ? this.itemDef.loop : false, // 循环模式选项
				speed:this.itemDef.speed ? this.itemDef.speed : 300,
				slidesPerView:1,//slider容器能够同时显示的slides数量，'auto'则自动根据slides的宽度来设定数量
				centeredSlides: true, //居中显示，默认居左
				// spaceBetween: 8, //list之间的间隔
				observer: true, //修改swiper自己或子元素时，自动初始化swiper
				observeParents: false ,//修改swiper的父元素时，自动初始化swiper
				pagination: {
					el: '.swiper-pagination-' + this.swiperKeyReal,
					type:'custom',
					renderCustom: function (swiper, current, total) {
						var customPaginationHtml = "";
						for(var i = 0; i < total; i++) {
							// 判断哪个分页器此刻应该被激活
							if(i == (current - 1)) {
								customPaginationHtml += '<span class="swiper-pagination-customs swiper-pagination-customs-active"></span>';
							} else {
								customPaginationHtml += '<span class="swiper-pagination-customs"></span>';
							}
						}
						return customPaginationHtml;
					}
				}
			},
			height:this.itemDef.imgHeight + 'px'
		}
	},
	methods:{
    clickHandler(e,item){
      if (this.itemDef.isSlot && this.itemDef.onClick) {
        this.toLink(this.itemDef.onClick, {item})
      }
      else if (item.onClick) {
        this.toLink(item.onClick, {item})
      }
    }
	}
}
</script>
<style scoped lang='stylus'>
.swiper-wrapper{
	width:auto;
	.swiper-container{
		border-radius:inherit;
		width:100%;
		height:100%;
		/deep/.swiperchild{
			width:100%;
			height:100%;
		}
		img,video{
			border-radius:inherit;
			width:100%;
			height:100%;
			// border-radius:11px;
			user-select:none;
		}
		video{object-fit:cover;}
	}
	.swiper-pagination{
		position:absolute;
		bottom:5px;
		left: 50%;
		transform: translateX(-50%);
		z-index:999;
		&.swiper-pagination-custom{
			width:unset;
		}
		/deep/.swiper-pagination-customs{
			margin-right:8px;
			width:4px;
			height:4px;
			opacity:0.55;
			display:inline-block;
			background-color:#fff;
			border-radius:50%;
		}
		/deep/.swiper-pagination-customs-active{
			width:10px;
			opacity:1;
			border-radius:2px;
		}
	}
}
.swiper-slide{
	position: relative;
}
.swiper-title-wrapper{
	position:absolute;
	bottom:0;
	left:0;
	right:0;
	z-index: 1;
	padding: 15px 15px;
	background-image: linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,.6) 99%);
	display:flex;
	align-items: center;
}
.swiper-title{
	font-size:14px;
	color:#fff;
	white-space: pre-wrap;
	word-break: break-all;
	line-height: 20px;
}
.default-img0{
	background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAF8BAMAAABidSMsAAAAIVBMVEUAAAD////////////////////////////////////////PIev5AAAAC3RSTlMAMzQGLTAhDCgTGhHaTtAAAAPlSURBVHja7NgxaxRBGMfhhRTHlTOg/QwepLxCBVPGynReIZIuRbg21fbGKp1lev2ggqxuyOWWicxsyOV5mkB4r/kxHMe/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeqg/rjifw7lz4OS2Gv2/zl6uOuSwu/3ZP8bXwc1l+W/3rHuLxj445LK/Tq7G78DM5OU1hdad7iG9+drQzZr/bXfhZ9JsU7ncPcbXtaKmPKex2DzEJ39JtDOFe90G66WjlNod93UMWvpkY9ncP+cxm0MjnB7oL316c7B6MNY1sprsHY81g3vduMxg1f+/Ct7Mue+82g7ref59478K30m8+FnY31lTUx1Da3VhTdZKJpd2NNTUnmfLuxppKjn7lUN7dZlA1+3R34atbXObwqO7GmhoWFyk8rruxpoIx6m73MNl9/Bj/0z3s6x6PS7oH3eu+93H8GrtH771l9+GLe/fka9S9Zffhh8ruSR91b9k9n189fNJvku7Nuuez9b6Tk9Oke6Pu+dN638mf8Lo36Z5vJk+W10n3Bt3zduJkCK97/e7byZNhW9C9XveikyF81n3W7oOjC91n7T7+T3fdnyHdy+h+GHQvo/th0L2M7odB99/s3bFKAmAUhuGxOSH3hPaGCrqNRvf2LsfLjQb9hp/kgB6Fw/NcwouDfsJ/anSfQfca3WfQvUb3GXSv0X0G3Wt0n0H3Gt1n0L1G9xl0r9F9Bt1rdJ9B9xrdZ9C9RvcZdK/RfQbda3SfQfca3WfQvUb3GXSv0X0G3Wt0n0H3Gt1n0L1G9xl0r9F9Bt1rdJ9B9xrdZ9C9RvcZ8qj+9tU7hv3W7rvtj3c72yXqcpvGO7WNEnW9Z+td5kaJuob3DnmnRF3v2Xp3v1WiJvz57h9f7kw0dM8923/uqmzcVblq9ziGd0eoUaKu92zdzWqU7mt4d+L6vJ25Z+suYoOzUXf7v/DugHbJb/7IWOPubZfceY4Edee5S+6aRzYDd80j+sO749/ssHuMWLovXze5zGHzGMV78s+yX+y4u1S6Z8fhYjkkXOu+eZH9KrKrn++euZim8Okue6P8gbd2X7/a0xY+3WXvk7Fm7W6S6ZOxZu1ukumTzWDtbhvok/Brd9n7ZaxJd5NMv4w16W6S6ZexJt1NMv0y1qS7SaZfNoN0tw30S/h0l71fNoOnU3fbQL+Ez+dd9ht6+D51N8nc0sOxu0nmLt73toF7+JQdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+G0PDgQAAAAABPlbLzBCBQAAAAAAAAAAAAAAAAAAAAAAAADAC4cC3OTCEuBYAAAAAElFTkSuQmCC"), linear-gradient(90deg, rgb(112, 250, 177) 0%, rgb(87, 235, 205) 100%)
}
.default-img1{
	background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAF8BAMAAABidSMsAAAAIVBMVEUAAAD////////////////////////////////////////PIev5AAAAC3RSTlMAMzQGLTAhDCgTGhHaTtAAAAPlSURBVHja7NgxaxRBGMfhhRTHlTOg/QwepLxCBVPGynReIZIuRbg21fbGKp1lev2ggqxuyOWWicxsyOV5mkB4r/kxHMe/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeqg/rjifw7lz4OS2Gv2/zl6uOuSwu/3ZP8bXwc1l+W/3rHuLxj445LK/Tq7G78DM5OU1hdad7iG9+drQzZr/bXfhZ9JsU7ncPcbXtaKmPKex2DzEJ39JtDOFe90G66WjlNod93UMWvpkY9ncP+cxm0MjnB7oL316c7B6MNY1sprsHY81g3vduMxg1f+/Ct7Mue+82g7ref59478K30m8+FnY31lTUx1Da3VhTdZKJpd2NNTUnmfLuxppKjn7lUN7dZlA1+3R34atbXObwqO7GmhoWFyk8rruxpoIx6m73MNl9/Bj/0z3s6x6PS7oH3eu+93H8GrtH771l9+GLe/fka9S9Zffhh8ruSR91b9k9n189fNJvku7Nuuez9b6Tk9Oke6Pu+dN638mf8Lo36Z5vJk+W10n3Bt3zduJkCK97/e7byZNhW9C9XveikyF81n3W7oOjC91n7T7+T3fdnyHdy+h+GHQvo/th0L2M7odB99/s3bFKAmAUhuGxOSH3hPaGCrqNRvf2LsfLjQb9hp/kgB6Fw/NcwouDfsJ/anSfQfca3WfQvUb3GXSv0X0G3Wt0n0H3Gt1n0L1G9xl0r9F9Bt1rdJ9B9xrdZ9C9RvcZdK/RfQbda3SfQfca3WfQvUb3GXSv0X0G3Wt0n0H3Gt1n0L1G9xl0r9F9Bt1rdJ9B9xrdZ9C9RvcZ8qj+9tU7hv3W7rvtj3c72yXqcpvGO7WNEnW9Z+td5kaJuob3DnmnRF3v2Xp3v1WiJvz57h9f7kw0dM8923/uqmzcVblq9ziGd0eoUaKu92zdzWqU7mt4d+L6vJ25Z+suYoOzUXf7v/DugHbJb/7IWOPubZfceY4Edee5S+6aRzYDd80j+sO749/ssHuMWLovXze5zGHzGMV78s+yX+y4u1S6Z8fhYjkkXOu+eZH9KrKrn++euZim8Okue6P8gbd2X7/a0xY+3WXvk7Fm7W6S6ZOxZu1ukumTzWDtbhvok/Brd9n7ZaxJd5NMv4w16W6S6ZexJt1NMv0y1qS7SaZfNoN0tw30S/h0l71fNoOnU3fbQL+Ez+dd9ht6+D51N8nc0sOxu0nmLt73toF7+JQdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+G0PDgQAAAAABPlbLzBCBQAAAAAAAAAAAAAAAAAAAAAAAADAC4cC3OTCEuBYAAAAAElFTkSuQmCC"), linear-gradient(92deg, rgb(83, 231, 245) 0%, rgb(82, 180, 255) 100%);
}
.default-img2{
	background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAF8BAMAAABidSMsAAAAIVBMVEUAAAD////////////////////////////////////////PIev5AAAAC3RSTlMAMzQGLTAhDCgTGhHaTtAAAAPlSURBVHja7NgxaxRBGMfhhRTHlTOg/QwepLxCBVPGynReIZIuRbg21fbGKp1lev2ggqxuyOWWicxsyOV5mkB4r/kxHMe/AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeqg/rjifw7lz4OS2Gv2/zl6uOuSwu/3ZP8bXwc1l+W/3rHuLxj445LK/Tq7G78DM5OU1hdad7iG9+drQzZr/bXfhZ9JsU7ncPcbXtaKmPKex2DzEJ39JtDOFe90G66WjlNod93UMWvpkY9ncP+cxm0MjnB7oL316c7B6MNY1sprsHY81g3vduMxg1f+/Ct7Mue+82g7ref59478K30m8+FnY31lTUx1Da3VhTdZKJpd2NNTUnmfLuxppKjn7lUN7dZlA1+3R34atbXObwqO7GmhoWFyk8rruxpoIx6m73MNl9/Bj/0z3s6x6PS7oH3eu+93H8GrtH771l9+GLe/fka9S9Zffhh8ruSR91b9k9n189fNJvku7Nuuez9b6Tk9Oke6Pu+dN638mf8Lo36Z5vJk+W10n3Bt3zduJkCK97/e7byZNhW9C9XveikyF81n3W7oOjC91n7T7+T3fdnyHdy+h+GHQvo/th0L2M7odB99/s3bFKAmAUhuGxOSH3hPaGCrqNRvf2LsfLjQb9hp/kgB6Fw/NcwouDfsJ/anSfQfca3WfQvUb3GXSv0X0G3Wt0n0H3Gt1n0L1G9xl0r9F9Bt1rdJ9B9xrdZ9C9RvcZdK/RfQbda3SfQfca3WfQvUb3GXSv0X0G3Wt0n0H3Gt1n0L1G9xl0r9F9Bt1rdJ9B9xrdZ9C9RvcZ8qj+9tU7hv3W7rvtj3c72yXqcpvGO7WNEnW9Z+td5kaJuob3DnmnRF3v2Xp3v1WiJvz57h9f7kw0dM8923/uqmzcVblq9ziGd0eoUaKu92zdzWqU7mt4d+L6vJ25Z+suYoOzUXf7v/DugHbJb/7IWOPubZfceY4Edee5S+6aRzYDd80j+sO749/ssHuMWLovXze5zGHzGMV78s+yX+y4u1S6Z8fhYjkkXOu+eZH9KrKrn++euZim8Okue6P8gbd2X7/a0xY+3WXvk7Fm7W6S6ZOxZu1ukumTzWDtbhvok/Brd9n7ZaxJd5NMv4w16W6S6ZexJt1NMv0y1qS7SaZfNoN0tw30S/h0l71fNoOnU3fbQL+Ez+dd9ht6+D51N8nc0sOxu0nmLt73toF7+JQdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+G0PDgQAAAAABPlbLzBCBQAAAAAAAAAAAAAAAAAAAAAAAADAC4cC3OTCEuBYAAAAAElFTkSuQmCC"), linear-gradient(270deg, rgb(255, 194, 102) 0%, rgb(255, 226, 112) 100%, rgb(255, 228, 122) 100%)
}

.default-img{
	width: 100%;
	background-position: center;
	background-size: cover;
	background-repeat: no-repeat;
	height:100%;
}
</style>