<template>
  <div class="page-video-list" :comp-type="itemDef.type" :class="{'card':itemDef.mode==='card'}" :style="compStyle">
    <page-title v-if="itemDef.title.show" :itemDef="itemDef.title" :slot-data="slotData" style="margin:0;background-color: transparent;" :custom-more="true" @more="goMore" />
    <div class="list">
      <VideoItem v-for='(item,i) of list' :key='i' :item="item" :mode='itemDef.mode'/>
    </div>
  </div>
</template>

<script>
import common from '../../../mixin/common'
import PageTitle from './page-title.vue'
import VideoItem from '../../video/videoItem'
import {videoLatest, videoPopular } from '@/api/videoApi'
export default {
  props: ["itemDef", "slotData"],
  mixins: [common],
  components:{
    PageTitle,
    VideoItem,
  },
  watch: {
    "itemDef.showParams":{
      handler(val){
        this.getList()
      },
      immediate: true
    },
    "itemDef.itemId":{
      handler(val){
        this.getList()
      },
      immediate: true
    },
    "itemDef.count":{
      handler(val){
       this.getList()
      },
      immediate: true
    },
  },
  computed:{
    getDataFunc() {
      if (this.itemDef && this.itemDef.showParams == 'new') {
        return videoLatest
      }
      if (this.itemDef && this.itemDef.showParams == 'hot') {
        return videoPopular
      }
      return ''
    },
    list(){
      if (this.itemDef.showParams == 'custom') {
        return this.itemDef.dataList.slice(0, this.itemDef.count)
      } else {
        return this.romoteList
      }
    }
  },
  data(){
    return {
      romoteList:[]
    }
  },
  methods:{
    getList() {
      if (this.itemDef.showParams==='custom') {
        return 
      }
      this.getDataFunc && this.getDataFunc({
        itemId: this.itemDef.itemId,
        pageSize: this.itemDef.count
      }).then(res => {
        if (res.errcode == 0) {
          this.romoteList = res.data.list
        }
      })
    },
    goMore(onClick) {
      this.toLink(onClick, {
        pageTitle: this.itemDef.title.value
      })
    }
  },
}
</script>
<style lang="stylus" scoped>
.page-video-list {
  background-color:#fff;
  box-sizing border-box;
}
.list{
  align-content:flex-start;
  display:flex;
  flex-wrap:wrap;
  padding:0 15px;
  padding-bottom:15px;
}
//一行两个
.page-video-list.card{
  .list{
    padding:0 7.5px;
    padding-bottom:15px;
  }
}
</style>