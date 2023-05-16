<template>
  <section :comp-type="itemDef.type" class="page-article-list" :class="{'page-article-list--card': itemDef.style && itemDef.style.styleType == '卡片式'}" :style="compStyle">
    <page-title
      v-if="itemDef.title.show"
      :itemDef="itemDef.title"
      style="margin:0;background-color: transparent;"
      :slot-data="slotData"
      :custom-more="true"
      @more="goMore"
    />
    <div class="list-box">
      <Article v-for="(item, index) of list" :key="index" :item="item" />
    </div>
  </section>
</template>

<script>
import { articleHot, articleNew, articleStar } from '@/api/articleApi.js'
import common from '../../../mixin/common' // 包含组件样式、点击事件跳转
import PageTitle from './page-title.vue'
import Article from '../../article/articleItem.vue'
export default {
  props: ["itemDef","slotData"],
  components: {
    PageTitle,
    Article,
  },
  mixins: [common],
  data() {
    return {
      list: []
    }
  },
  computed: {
    getData() {
      if (this.itemDef && this.itemDef.showParams == 'new') {
        return articleNew
      }
      if (this.itemDef && this.itemDef.showParams == 'hot') {
        return articleHot
      }
      if (this.itemDef && this.itemDef.showParams == 'star') {
        return articleStar
      }
      return ''
    }
  },
  watch: {
    itemDef: {
      handler(val) {
        if (val.showParams == 'custom') {
          this.list = val.dataList
        } else {
          this.getList()
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getList() {
      this.getData && this.getData({
        itemId: this.itemDef.itemId,
        pageSize: this.itemDef.count
      }).then(res => {
        if (res.errcode === 0) {
          this.list = res.data.list
        }
      })
    },
    goMore(onClick) {
      this.toLink(onClick, {
        pageTitle: this.itemDef.title.value
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.page-article-list {
  min-height: 60px;
  margin: 5px 0;
  background-color: #fff;
  border-style: solid;
  border-width: 0;
}
.page-article-list--card {
  margin: 5px 10px;
  border-radius: 8px;
  overflow hidden
}
.list-box {
  // padding: 0 15px;
}


</style>