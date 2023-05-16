<template>
	<van-tabbar v-if="pageConf.tabBarSetting" v-model="activeNav" class="bottom-nav" :fixed="true"  @change="tabChange"
		:inactive-color="pageConf.tabBarSetting.color"
		:active-color="pageConf.tabBarSetting.selectedColor">
		<van-tabbar-item :name="item.name+''" icon="item.icon" v-for="(item,i) of pageConf.tabBarSetting.list" :key="i">
			<span>{{item.text}}</span>
			<template #icon="props">
				<img v-if="item.iconPath.startsWith('http')" :src="props.active ? item.selectedIconPath : item.iconPath" />
				<i v-else :class="props.active ? item.selectedIconPath : item.iconPath" />
			</template>
		</van-tabbar-item>
	</van-tabbar>
	<!-- <van-tabbar v-else v-model="activeNav" class="bottom-nav" :fixed="true"  active-color="#1989fa" inactive-color="#7d7e80" @change="tabChange">
		<van-tabbar-item name="home">
			<span>首页</span>
			<template #icon="props">
				<i class="el-icon-s-home" />
			</template>
		</van-tabbar-item>
		<van-tabbar-item name="mine">
			<span>我的</span>
			<template #icon="props">
				<i class="el-icon-s-custom" />
			</template>
		</van-tabbar-item>
	</van-tabbar> -->
</template>
<script>
import { GET_HOME_PAGE } from '../api/index'
import { Tabbar, TabbarItem } from 'vant';
import common from '../mixin/common' // 包含组件样式、点击事件跳转
export default {
	components:{
		[Tabbar.name]:Tabbar,
		[TabbarItem.name]:TabbarItem
	},
	props:['pageConf', 'isHomePage', 'appId'],
	mixins: [common],
	data(){
		return {
			activeNav:'home'
		}
	},
	watch: {
		pageConf: {
			handler(v) {
				if (v.tabBarSetting && v.tabBarSetting.list.length > 0) {
					v.tabBarSetting.list.forEach(item => {
						if (item.defaultAction) {
							this.activeNav = item.name
						}
					})
				}
			},
			deep:true,
			immediate: true
		}
	},
	methods:{
		tabChange(active){
      if (this.pageConf.tabBarSetting) {
        let item = this.pageConf.tabBarSetting.list.find(it=>it.name==active)
        let onClick = item ? item.onClick : null;
        if (!onClick || !onClick.type || onClick.type==='none') {
					if (item.name == 'home') {
						if (!this.isHomePage) {
							this.$authRequest.post_auto(GET_HOME_PAGE, {appId:this.appId}).then(res => {
								if (res.errcode === 0) {
									this.$router.push('/diy-home/' + res.data.id)
								}
							})
						}
					} else if (item.name == 'mine') {
						if (!item.itemId) {
							window.Toast('未绑定栏目，请联系管理员！')
							return
						}
						if (!item.dataType.length) {
							window.Toast('未选择数据类型，请联系管理员！')
							return
						}
						this.$router.push('/publicity-collect?itemIds=' + item.itemId + '&type=' + item.dataType.join())
					}
          return;
        }
        this.toLink(onClick)
      }
    }
			
	}
}
</script>

<style lang="stylus" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
}
</style>
