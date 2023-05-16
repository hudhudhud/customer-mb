<template>
	<!-- 解决组件间上下边距重叠问题，如不设置overflow:hidden组件间上下间距取最大值 -->
	<div style="overflow:hidden;">
		<component :is="compType" :itemDef="comp" :style="comp.style" :slot-data="slotData" :jsCompleted="jsCompletedIn" v-bind="attrs">
		</component>
	</div>
</template>
<script>
import components from './page-components'
// import PagePop from './page-components/page-pop'
import {GET_HOME_PAGE} from '../../api'
export default {
	name:"Renderer",
	components:{
		...components,
	},
	props:{
		comp:{
			type:Object,
			require:true,
		},
		slotData: {},
		jsCompleted:{
			type:Boolean,
			defalut:false
		},
	},
	watch:{
		jsCompleted:{
			handler(val){
				this.jsCompletedIn = val
			},
			immediate:true,
			deep:true
		}
	},
	computed:{
		compType() { //组件type统一转小写
			let tagName = this.comp.type.toLocaleLowerCase()
			if(Object.keys(components).indexOf(tagName)==-1){
				tagName='page-error'
			}
			return tagName
		},
		attrs() {
			let attr = {}
			if (this.comp && this.comp.attributes) {
				this.comp.attributes.forEach(item => {
					attr[item.name] = item.value
				})
			}
			return attr
		}
	},
	data(){
		return {
			jsCompletedIn:false,
		}
	},
	methods:{
	}
}
</script>
<style scoped lang='stylus'>
.customer-render{

}
</style>