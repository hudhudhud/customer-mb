<template>
  <section :comp-type="itemDef.type" class="page-question-list" :class="{'page-question-list--card': itemDef.style && itemDef.style.styleType == '卡片式'}" :style="compStyle">
    <page-title
      v-if="itemDef.title.show"
      :itemDef="itemDef.title"
      :custom-more="true"
      :slot-data="slotData"
      style="margin:0;background-color: transparent;"
      @more="goMore"
    />
    <div class="list-box">
      <Question v-for="(item, index) of list" :key="index" :item="item" :showBtns="false" @click.native="goDetail(item)" />
    </div>
  </section>
</template>

<script>
import { questionNew, questionHot } from '../../../../../api/questionApi'
import common from '../../../mixin/common' // 包含组件样式、点击事件跳转
import PageTitle from './page-title.vue'
import Question from '../../question/questionItem.vue'
export default {
  props: ["itemDef","slotData"],
  components: {
    PageTitle,
    Question,
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
        return questionNew
      }
      if (this.itemDef && this.itemDef.showParams == 'hot') {
        return questionHot
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
      if (!this.getData) return
      this.getData({
        itemId: this.itemDef.itemId,
        pageSize: this.itemDef.count
      }).then(res => {
        if (res.errcode === 0) {
          this.list = res.data.list
        }
      })
    },
    goDetail(item) {
      this.$router.push('/question-detail/' + item.id)
    },
    goMore(onClick) {
      if (onClick.type == 'question') {
        const route = { name: 'question-list', params: {itemId: onClick.action}, query: { type: this.itemDef.showParams, pageTitle: this.itemDef.title.value } }
        if (onClick.extend && onClick.extend.typeId) {
          route.query.typeId = onClick.extend.typeId
        }
        if (onClick.isReplace) {
          this.$router.replace(route)
        } else {
          this.$router.push(route)
        }
      } else {
        this.toLink(onClick)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.page-question-list {
  min-height: 60px;
  margin: 5px 0;
  background-color: #fff;
  border-style: solid;
  border-width: 0;
}
.page-question-list--card {
  margin: 5px 10px;
  border-radius: 8px;
  overflow hidden
}
</style>