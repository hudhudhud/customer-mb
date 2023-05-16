<template>
	<section>
	{{itemDef.type}} error components
	</section>
</template>
<script>
export default {
	name:'error',
	props:['itemDef']
}
</script>

<style scoped>
section{
	color:red  !important;
	height:30px !important;
	line-height:30px !important;
	border:1px dashed red;
}
</style>