<template>
  <div :comp-type="itemDef.type" class="page-imgtextnav" :style="compStyle">
    <page-title v-if="itemDef.title.show" :itemDef="itemDef.title" :slot-data="slotData" style="margin:0;background-color: transparent;" />
    <div class="nav-list" :class="{'nav-list--textcenter':itemDef.mode==='imgText'||itemDef.mode==='imgNone','nav-list--imgNone':itemDef.mode==='imgNone','nav-list--leftRight':itemDef.mode==='imgLeft'||itemDef.mode==='imgRight'}">
      <div v-for="(nav,i) of list" :key="i" class="list-item-wrapper" :style="listItemWrapperStyle" @click="navClick($event,nav)">
        <div class="list-item" :style="listItemStyle">
          <template v-if="itemDef.mode!=='imgNone'">
            <!-- 没图片或者图片显示圆形或方形，用背景图设置同百分比高度 -->
            <div v-if="!nav.src" class="nav-img-bg" :class="{'no-img-height':itemDef.mode==='imgTop','keep-img':itemDef.imgShape === 'keepImg'}" :style="imgStyle"></div>
            <div v-else-if="(itemDef.mode==='imgTop' && itemDef.imgShape !== 'keepImg')" class="nav-img-bg" :style="{'background-image':`url(${nav.src})`,...imgStyle}"></div>
            <img v-else class="nav-img" :src="nav.src" alt="" :style="imgStyle">
          </template>
          <div v-else ref="nav-img" class="nav-img" :style="imgStyle"></div>
          <p class="nav-title" :style="fontStyle">{{nav.title}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import common from '../../../mixin/common'
import PageTitle from './page-title.vue'
export default {
  props: ["itemDef", "slotData"],
  mixins: [common],
  components:{
    PageTitle,
  },
  watch:{
  },
  computed: {
    list(){
      if (this.itemDef.isSlot) {
        let val = this.slotData[this.itemDef.slotKey]
        if(Array.isArray(val)){
          val = val.map(it=>{
            return {
              title: it[this.itemDef.slotKeyTitle],
              img: it[this.itemDef.slotKeyImg]
            }
          })
          return val
        }
        return []
      } else {
        return this.itemDef.options
      }
    },
    listItemWrapperStyle(){
      let styleObj = {}
      styleObj.width = 100 / this.itemDef.columnCount +'%'
      if (this.itemDef.gap) {
        styleObj.padding = `${this.itemDef.gap.marginTop}px ${this.itemDef.gap.marginRight}px ${this.itemDef.gap.marginBottom}px ${this.itemDef.gap.marginLeft}px`
      }
      return styleObj
    },
    listItemStyle() {
      let styleObj = {}
      if (this.itemDef.mode !== 'imgTop') {
        styleObj.height = this.itemDef.navHeight + 'px'
      }
      if (this.itemDef.mode === 'imgTop') {
        styleObj['flex-direction'] = "column"
        styleObj['justify-content'] = "center"
        styleObj['align-items'] = "unset"
      } else if (this.itemDef.mode === 'imgLeft') {
        styleObj['flex-direction'] = "row"
        styleObj['justify-content'] = "flex-start"
        styleObj['align-items'] = "center"
      } else if (this.itemDef.mode === 'imgRight') {
        styleObj['flex-direction'] = "row-reverse"
        styleObj['justify-content'] = "flex-start"
        styleObj['align-items'] = "center"
      } else {
        styleObj['flex-direction'] = "row"
        styleObj['justify-content'] = "center"
        styleObj['align-items'] = "center"
      }
      return styleObj
    },
    imgStyle() {
      let styleObj = {}
      if(this.itemDef.mode==='imgTop'){
        if (this.itemDef.imgShape === 'keepImg') {
          styleObj.height = 'auto'
          // styleObj['min-height'] = '60px'
          styleObj['border-radius'] = this.itemDef.imgBorderRadio + 'px'
          styleObj.width = this.itemDef.imgSize + '%'
          styleObj['align-self'] = "center"
        } else {
          styleObj['padding-bottom'] = this.itemDef.imgSize + '%'
          if (this.itemDef.imgShape === 'circle') {
            styleObj['border-radius'] = '50%'
          }
          else{
            styleObj['border-radius'] = this.itemDef.imgBorderRadio + 'px'
          }
          styleObj.width = this.itemDef.imgSize + '%'
          styleObj['align-self'] = "center"
        }
      } else if (this.itemDef.mode=="imgLeft" || this.itemDef.mode=='imgRight') {
         if (this.itemDef.imgShape === 'keepImg') {
          styleObj.width = '50%'
          styleObj.height = this.itemDef.imgHeight + 'px'
          styleObj['min-height'] = 'unset'
          styleObj['border-radius'] = this.itemDef.imgBorderRadio + 'px'
        }
        else{
          styleObj.width = this.itemDef.imgHeight + 'px'
          styleObj.height = this.itemDef.imgHeight + 'px'
          if (this.itemDef.imgShape === 'circle') {
            styleObj['border-radius'] = '50%'
          }
          else{
            styleObj['border-radius'] = this.itemDef.imgBorderRadio + 'px'
          }
        }
      } else {
        styleObj.height = this.itemDef.navHeight + 'px'
      }
        
      if (this.itemDef.mode === 'imgText') {
        styleObj['border-radius'] = this.itemDef.imgBorderRadio + 'px'
        styleObj['width'] = 'auto'
      }
      return styleObj
    },
    fontStyle(){
      let styleObj = {}
      styleObj['font-size'] = this.itemDef.fontSize.fontSize + 'px'
      styleObj['font-weight'] = this.itemDef.fontSize.fontWeight?'bold':'normal'
      styleObj['color'] = this.itemDef.fontColor
      // styleObj['text-align'] = this.itemDef.fontAlign
      if(this.itemDef.mode==="imgTop"){
        styleObj['padding-top'] = '8px'
      } else if (this.itemDef.mode=="imgLeft") {
        styleObj['text-align'] = 'left'
        styleObj['padding-left'] = '8px'
      } else if (this.itemDef.mode=="imgRight") {
        styleObj['text-align'] = 'right'
        styleObj['padding-right'] = '8px'
      } else {
        styleObj['padding'] = "0"
        styleObj['text-align'] = 'center'
      }
      return styleObj
    }
  },
  data(){
    return {
    }
  },
  methods:{
    navClick(e,item){
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
<style lang="stylus" scoped>
.page-imgtextnav {
  background-color:#fff;
}
.nav-list{
  width:100%;
  padding:10px 10px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
}
.list-item-wrapper{
  width:25%;
  box-sizing: border-box;
  padding:5px;
  display:flex;
  justify-content: center;
  align-items: center;
  .list-item{
    display:flex;
    flex-direction: column;
    // justify-content: center;
    // align-items: center;
    width:100%;
    height:100%;
    box-sizing: border-box;
    .nav-img{
      width:100%;
      height:60px;
      background-color:#E6E6E6;
      border-radius: 4px;
      object-fit:cover;
      flex-shrink:0;
      box-sizing: border-box;
    }
    .nav-img-bg{
      width:100%;
      flex-shrink:0;
      box-sizing: border-box;
      background-color:#E6E6E6;
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      &.no-img-height{
        padding-bottom:100%;
        &.keep-img{
          padding-bottom:60px;
        }
      }
    }
    .nav-title{
      font-size:13px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      text-align: center;
      // max-width: 100%;
      flex-grow: 1;
    }
  }
}
.nav-list--textcenter{
  .list-item{
    position:relative;
    overflow: hidden;
    .nav-title{
      position:absolute;
      max-width:70%;
      left:50%;
      top:50%;
      transform: translate(-50%,-50%);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .nav-img{
      margin-bottom:0;
    }
  }
}
.nav-list--imgNone{
  .list-item .nav-img{
    border-radius: 4px;
    border:1px solid rgb(235, 235, 235);
    background-color: transparent;
  }
}
.nav-list--leftRight{
  .list-item{
    padding:10px;
    box-sizing: border-box;
    border-radius: 4px;
    border:1px solid rgb(235, 235, 235);
    background-color: transparent;
    .nav-img{
      margin-bottom:0;
    }
    .nav-title{
      padding:0 3px;
    }
  }
}
</style>