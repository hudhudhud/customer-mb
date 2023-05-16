<template>
  <section :comp-type="itemDef.type" class="page-favor-list" :class="{'page-favor-list--card': itemDef.style && itemDef.style.styleType == '卡片式'}" :style="compStyle">
    <page-title v-if="itemDef.title.show" :itemDef="itemDef.title" :slot-data="slotData" style="margin:0;background-color: transparent;" />

    <div class="list-box" v-if="itemDef.showList && itemDef.dataType.length > 0">
      <template v-for="(item, index) of list">
        <ArticleItem :key="index" :item="item.info" v-if="item.info" class="item" style="margin-left:0;padding-right:0;"/>
        <question-item :key="index" :item="item.faq" v-if="item.faq" class="item" style="padding-left:0;padding-right:0;" />
        <video-item :key="index" :item="item.video" mode="list" v-if="item.video" class="item" style="padding-bottom: 15px;" />
      </template>
    </div>
    
  </section>
</template>

<script>
import { COLLECT_LIST } from '@/api/index'
import common from '../../../mixin/common'
import ArticleItem from '../../article/articleItem.vue'
import QuestionItem from '../../question/questionItem.vue'
import VideoItem from '../../video/videoItem.vue'
import PageTitle from './page-title.vue'
export default {
  props: ["itemDef" ,"slotData"],
  components: { ArticleItem, QuestionItem, VideoItem, PageTitle },
  mixins: [common],
  data(){
    return {
      list:[]
    }
  },
  computed:{
    classes() {
      if (this.itemDef && this.itemDef.dataType && Array.isArray(this.itemDef.dataType)) {
        let arr = []
        this.itemDef.dataType.forEach(item => {
          if (item == 'article') {
            arr.push(1)
          }
          if (item == 'question') {
            arr.push(2)
          }
          if (item == 'video') {
            arr.push(3)
          }
        })
        return arr.join()
      }
      return ''
    }
  },
  watch: {
    itemDef: {
      handler(val) {
        this.getList()
      },
      immediate: true,
      deep: true
    }
  },
  methods:{
    getList() {
      if (!this.itemDef.itemId || !this.itemDef.showList) return
      this.$authRequest.post(COLLECT_LIST, {
        itemIds: this.itemDef.itemId,
        pageSize: this.itemDef.count,
        classes: this.classes
      }).then(res => {
        if (res.errcode == 0) {
          this.list = res.data.list
        }
      })
    }
  }
}
</script>
<style scoped>
.page-favor-list {
  min-height: 60px;
  margin: 5px 0;
  background-color: #fff;
  border-style: solid;
  border-width: 0;
}
.page-favor-list--card {
  margin: 5px 10px;
  border-radius: 8px;
  overflow: hidden;
}

.list-box--video {
  align-content:flex-start;
  display:flex;
  flex-wrap:wrap;
  padding:0 15px;
  padding-bottom: 15px;
}
.list-box {
  padding:0 15px;
  
}
.item {
  border-bottom:1px solid #eee;
}
.item:last-child {
  border-bottom:none;
}
</style>