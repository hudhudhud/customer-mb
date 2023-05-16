<template>
  <!-- <div :comp-type="itemDef.type" class="page-title" :style='`height:${itemDef.height}px`'>
    <div class="left">
      <i v-if="itemDef.titleIcon&&itemDef.titleIcon.icon" :class="itemDef.titleIcon.icon" :style="'color:'+itemDef.titleIcon.color"></i>
      <span>{{value}}</span>
    </div>
    <div v-if="itemDef.more" @click="click">
      <span>{{itemDef.more}}</span>
      <span v-if="itemDef.isShowIcon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
    </div>
  </div> -->
  <div :comp-type="itemDef.type" class="page-title" :class="{'page-title--card': itemDef.style && itemDef.style.styleType == '卡片式'}"  :style="compStyle">
    <div class="left" :style="align">
      <i v-if="itemDef.titleIcon&&itemDef.titleIcon.icon" :class="itemDef.titleIcon.icon" :style="'color:'+itemDef.titleIcon.color"></i>
      <span class="title" :style="titleStyle">{{value}}</span>
      
    </div>
    <div class="right" v-if="itemDef.more || itemDef.isShowIcon" @click="onMore">
      <span ref="more">{{itemDef.more}}</span>
      <span v-if="itemDef.isShowIcon"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
    </div>
  </div>
</template>
<script>
import common from '../../../mixin/common' // 包含组件样式、点击事件跳转
export default {
  props: ["itemDef","slotData", "customMore"],
  mixins: [common],
  data() {
    return {
      moreWidth: 0
    }
  },
  computed: {
		value () {
			return (this.itemDef.isSlot && this.slotData) ? (this.slotData[this.itemDef.slotKey]) : (this.itemDef.value)
		},
    align() {
      if (this.itemDef && this.itemDef.fontSize) {
        let styleObj = {}
        if (this.itemDef.textAlign == 'center') {
          let left = this.moreWidth
          if (this.itemDef.isShowIcon) {
            left += 12
          }
          if (this.itemDef.more || this.itemDef.isShowIcon) {
            left += 20
          }
          styleObj['padding-left'] = left + 'px'
          styleObj['justify-content'] = 'center'
        }
        return styleObj
      }
      return {}
    },
    titleStyle() {
      if (this.itemDef && this.itemDef.fontSize) {
        let styleObj = {
          'font-size': this.itemDef.fontSize.fontSize, 
          'font-weight': this.itemDef.fontSize.fontWeight ? 'bold' : '400',
          'color': this.itemDef.fontColor
        }
        return styleObj
      }
      return {}
    },
    compStyle() {
      let styleObj = {}
      if (this.itemDef) {
        if (this.itemDef.style) {
          const style = this.itemDef.style
          styleObj = {
            margin: `${style.marginTop}px ${style.marginRight}px ${style.marginBottom}px ${style.marginLeft}px`,
            'border-width': style.borderWidth,
            'border-color': style.borderColor,
            'box-shadow': `${style.boxShadowColor} ${style.boxShadow}`,
            'background-color': style.backgroundColor,
            'border-radius': style.borderRadius + 'px'
          }
        }
        if (this.itemDef.showBorder) {
          styleObj['border-bottom'] = '1px solid #eee'
        }
        styleObj.height = this.itemDef.height + 'px'
      }
      return styleObj
    },
  },
  mounted() {
    if (this.$refs.more) {
      this.moreWidth = this.$refs.more.offsetWidth
    } else {
      this.moreWidth = 0
    }
    
  },
  updated() {
    if (this.$refs.more) {
      this.moreWidth = this.$refs.more.offsetWidth
    } else {
      this.moreWidth = 0
    }
  },
  methods:{
    click(e){
      this.$emit('clickHandler', e, this.itemDef)
    },
    onMore() {
      if (this.customMore) {
        this.$emit('more', this.itemDef.onClick)
      } else {
        this.toLink(this.itemDef.onClick)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.page-title {
  font-size: 14px;
  height:60px;
  background-color:#fff;
  display:flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  margin: 5px 0;
  border-style: solid;
  border-width: 0px;
  border-color: transparent;
}
.page-title--card {
  margin: 5px 10px;
  border-radius: 8px;
}
.left {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  line-height:1;
  color: rgb(51, 51, 51);
  font-size: 18px;
  font-weight: bold;
  text-align: left;
  margin-left: 0px;

  .title {
    max-width: calc(100% - 30px);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  i {
    color: #008DFC;
    font-size: 20px;
    margin-right: 5px;
    &.fa-minus{
      transform: rotate(90deg);
    }
  }
}
.right {
  flex-shrink: 0;
  display: flex;
  margin-left: 20px;
  align-items: center;
  font-size: 14px;
  color: #999;
  i {
    margin-left: 5px;
    font-size: 18px;
  }
}
.custom-icon--line {
  display: inline-block;
  width: 3px;
  height: 16px;
  background-color: #008DFC;
}
</style>