<template>
	<div class="module-list">
		<div
		class="module"
		v-for="(item,index) in modules"
		:key="index"
		@click="$router.pushPage(`${item.route}`)"
		>
			{{item.name}}
		</div>
	</div>
</template>

<script>
export default {
	name: 'entrance',
	data() {
		return {
			modules: [
				{
					name: 'diy',
					route: 'diy-login'
				},
				{
					name: '宣传专栏',
					route: 'publicity-login'
				}
			]
		}
	}
}
</script>

<style scoped lang="stylus">
.module-list {
	display flex
	flex-wrap wrap
}

.module {
	height 120px
	display flex
	justify-content center
	align-items center
	border 1px solid $border-color-light
	width:33.3%;
	box-sizing border-box
}
</style>
