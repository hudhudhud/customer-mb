<template>
  <section class="page-img-list" :comp-type="itemDef.type" :class="{'page-img-list--card': itemDef.style && itemDef.style.styleType == '卡片式'}" :style="compStyle">
    <page-title v-if="itemDef.title.show" :itemDef="itemDef.title" :slot-data="slotData" style="margin:0;background-color: transparent;" />
    <div class="img-box" v-for="(item,i) of imgList" :key="i" :style="imgStyle(item)">
      <img :src="item.src" @click="onClickImg(item)" />
      <div class="area-list" v-if="itemDef.mode == 'hotArea'">
        <div
          v-for="(area, index) of item.areas"
          :key="index"
          class="hot-area"
          :style="{width:area.width + '%',height:area.height + '%',top:area.top + '%',left:area.left + '%'}"
          @click="handleClick(area)"
        ></div>
      </div>
    </div>
    
  </section>
</template>

<script>
import common from '../../../mixin/common'
import PageTitle from './page-title.vue'
export default {
  props: ["itemDef","slotData"],
  components: { PageTitle },
  mixins: [common],
  computed: {
    imgList () {
      return (this.itemDef.isSlot && this.slotData) ? (this.slotData[this.itemDef.slotKey]) : (this.itemDef.imageList)
    },
    attr() {
      if (this.itemDef && this.itemDef.attributes) {
        let obj = {}
        this.itemDef.attributes.forEach((item) => {
          if (item.name) {
            obj[item.name] = item.value
          }
        })
        return obj
      }
      return {}
    },
  },
  methods: {
    handleClick(area) {
      this.toLink(area.onClick)
    },
    imgStyle(item) {
      let style = {}
      if (item.gap) {
        style={'padding': `${item.gap.marginTop}px ${item.gap.marginRight}px ${item.gap.marginBottom}px ${item.gap.marginLeft}px`}
      }
      return style
    },
    onClickImg(item) {
      if (this.itemDef.mode !== 'hotArea') {
        this.toLink(item.onClick)
      }
    }
  }
}
</script>
<style scoped lang='stylus'>
.page-img-list {
  margin: 5px 0;
  background-color: #fff;
  border-style: solid;
  border-width: 0;
}
.page-img-list--card {
  margin: 5px 10px;
  border-radius: 8px;
  overflow hidden
}
.img-box {
  position: relative;
  img{
    display: block;
    width:100%;
  }
}
.area-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .hot-area {
    position: absolute;
    // border: 1px solid #000;
  }
}
</style>